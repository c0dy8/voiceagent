from langchain_openai import ChatOpenAI
from langchain.agents import create_openai_tools_agent, AgentExecutor
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage

from tools import recipe_search, nutritional_info
from rag import get_relevant_context

SYSTEM_PROMPT = """You are ChefBot, a friendly and expert culinary assistant.

1. ROLE: You are a professional chef and nutrition expert. Your name is ChefBot.
2. SCOPE: Only answer questions related to cooking, recipes, ingredients, nutrition, and food. Politely decline off-topic questions.
3. TONE: Always be warm, encouraging, and enthusiastic about food. Use a conversational and approachable style.
4. RECIPES: When suggesting recipes, always include a list of ingredients and clear step-by-step cooking instructions.
5. NUTRITION: When asked about calories, macros, or nutritional content, always use the nutritional_info tool to provide accurate data.
6. LANGUAGE: Respond in the same language the user writes in.
7. TOOLS: Use recipe_search when the user asks for a recipe or meal ideas. Use nutritional_info when asked about calories, macros, or health data.
8. FORMAT: Never use markdown symbols like **, ##, ###, or --. Instead write in plain text. For lists, use natural numbering like "1. 2. 3." or bullet points with words. Emphasize key concepts through capitalization or context, not formatting symbols.

{rag_context}"""

_sessions: dict[str, list] = {}

llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.7)
tools = [recipe_search, nutritional_info]

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
    MessagesPlaceholder("agent_scratchpad"),
])

agent = create_openai_tools_agent(llm, tools, prompt)
executor = AgentExecutor(agent=agent, tools=tools, return_intermediate_steps=True, verbose=False)


def get_session_history(session_id: str) -> list:
    if session_id not in _sessions:
        _sessions[session_id] = []
    return _sessions[session_id]


def update_session(session_id: str, human_msg: str, ai_msg: str) -> None:
    history = get_session_history(session_id)
    history.append(HumanMessage(content=human_msg))
    history.append(AIMessage(content=ai_msg))
    # Keep only the last 7 message pairs (14 messages total)
    if len(history) > 14:
        _sessions[session_id] = history[-14:]


def run_agent(message: str, session_id: str) -> dict:
    history = get_session_history(session_id)
    rag_context = get_relevant_context(message)

    result = executor.invoke({
        "input": message,
        "chat_history": history,
        "rag_context": rag_context,
    })

    response_text = result["output"]
    tool_used = None
    tool_name = None

    if result.get("intermediate_steps"):
        action = result["intermediate_steps"][0][0]
        tool_used = action.tool
        tool_name = {
            "recipe_search": "Recipe Search",
            "nutritional_info": "Nutritional Info",
        }.get(tool_used, tool_used)

    update_session(session_id, message, response_text)

    return {
        "response": response_text,
        "tool_used": tool_used,
        "tool_name": tool_name,
    }
