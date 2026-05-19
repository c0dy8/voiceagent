import os
import requests
from bs4 import BeautifulSoup
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

CHROMA_DIR = "./chroma_db"
RAG_SOURCE_URL = os.getenv(
    "RAG_SOURCE_URL",
    "https://en.wikipedia.org/wiki/Cooking",
)

_vectorstore: Chroma | None = None


def _scrape_url(url: str) -> str:
    headers = {"User-Agent": "Mozilla/5.0 (compatible; ChefBot/1.0)"}
    response = requests.get(url, headers=headers, timeout=15)
    response.raise_for_status()
    soup = BeautifulSoup(response.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header"]):
        tag.decompose()
    return soup.get_text(separator="\n", strip=True)


def initialize_rag() -> str:
    global _vectorstore
    text = _scrape_url(RAG_SOURCE_URL)
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.create_documents([text])
    embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
    _vectorstore = Chroma.from_documents(
        documents=chunks,
        embedding=embeddings,
        persist_directory=CHROMA_DIR,
    )
    return f"RAG initialized with {len(chunks)} chunks from {RAG_SOURCE_URL}"


def get_relevant_context(query: str, k: int = 3) -> str:
    global _vectorstore
    if _vectorstore is None:
        try:
            embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
            _vectorstore = Chroma(
                persist_directory=CHROMA_DIR, embedding_function=embeddings
            )
        except Exception:
            return ""
    try:
        docs = _vectorstore.similarity_search(query, k=k)
        if not docs:
            return ""
        context = "\n\n".join(doc.page_content for doc in docs)
        return f"[Relevant cooking knowledge]\n{context}\n"
    except Exception:
        return ""
