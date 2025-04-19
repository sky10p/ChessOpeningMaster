import { useState } from "react";

export function useStudyTimer() {
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerStart, setTimerStart] = useState<Date | null>(null);
  const [timerElapsed, setTimerElapsed] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    setTimerRunning(true);
    setTimerStart(new Date());
    setTimerElapsed(0);
    const interval = setInterval(() => {
      setTimerElapsed((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };
  const pauseTimer = () => {
    setTimerRunning(false);
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
  };
  const resumeTimer = () => {
    setTimerRunning(true);
    const interval = setInterval(() => {
      setTimerElapsed((prev) => prev + 1);
    }, 1000);
    setTimerInterval(interval);
  };
  const finishTimer = () => {
    setTimerRunning(false);
    setTimerStart(null);
    setTimerElapsed(0);
    if (timerInterval) clearInterval(timerInterval);
    setTimerInterval(null);
  };

  return {
    timerRunning,
    timerStart,
    timerElapsed,
    startTimer,
    pauseTimer,
    resumeTimer,
    finishTimer,
  };
}
