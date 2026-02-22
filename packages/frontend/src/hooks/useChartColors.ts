import { useState, useEffect } from "react";

const readCSSVar = (name: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

export const useChartColors = () => {
  const [tickFill, setTickFill] = useState(() => readCSSVar("--color-text-muted"));

  useEffect(() => {
    const update = () => setTickFill(readCSSVar("--color-text-muted"));
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return { tickFill };
};
