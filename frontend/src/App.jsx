import { useEffect, useState } from "react";
import { Navbar } from "./landing/Navbar";
import { Hero } from "./landing/Hero";
import { Story } from "./landing/Story";
import { Features } from "./landing/Features";
import { HowItWorks } from "./landing/HowItWorks";
import { Mockups } from "./landing/Mockups";
import { UseCases } from "./landing/UseCases";
import { FinalCTA } from "./landing/FinalCTA";
import { Footer } from "./landing/Footer";
import { PageLoader } from "./landing/PageLoader";
import { ChatWidget } from "./widget/ChatWidget";
import "./landing/Landing.css";

export default function App() {
  const [widgetOpen, setWidgetOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const openWidget = () => {
    setWidgetOpen(true);
    setHasOpened(true);
  };
  const closeWidget = () => setWidgetOpen(false);
  const toggleWidget = () => (widgetOpen ? closeWidget() : openWidget());

  useEffect(() => {
    document.body.style.overflow = "";
  }, [widgetOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <PageLoader
        isLoading={isLoading}
        onLoadComplete={() => setIsLoading(false)}
      />
      <Navbar onOpenWidget={openWidget} />
      <main>
        <Hero onOpenWidget={openWidget} isReady={!isLoading} />
        <Story />
        <Features />
        <HowItWorks />
        <Mockups />
        <UseCases />
        <FinalCTA onOpenWidget={openWidget} />
      </main>
      <Footer />
      <ChatWidget
        open={widgetOpen}
        onClose={toggleWidget}
        firstOpen={!hasOpened}
      />
    </>
  );
}
