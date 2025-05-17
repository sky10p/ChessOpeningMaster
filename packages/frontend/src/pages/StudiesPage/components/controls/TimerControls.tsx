import React from "react";
import { formatDuration } from "../../utils";

interface TimerControlsProps {
  timerState: {
    running: boolean;
    start: Date | null;
    elapsed: number;
  };
  onStartTimer: () => void;
  onPauseTimer: () => void;
  onResumeTimer: () => void;
  onFinishTimer: () => void;
  onShowManualTime: () => void;
}

const TimerControls: React.FC<TimerControlsProps> = ({
  timerState,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onFinishTimer,
  onShowManualTime,
}) => {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-2">
      {!timerState.running && !timerState.start && (
        <button className="px-3 py-1 bg-blue-700 text-white rounded" onClick={onStartTimer}>
          Start Timer
        </button>
      )}
      {timerState.running && (
        <>
          <span className="font-mono text-lg text-green-400">{formatDuration(timerState.elapsed)}</span>
          <button className="px-2 py-1 bg-yellow-600 text-white rounded" onClick={onPauseTimer}>
            Pause
          </button>
          <button className="px-2 py-1 bg-red-700 text-white rounded" onClick={onFinishTimer}>
            End Session
          </button>
        </>
      )}
      {!timerState.running && timerState.start && (
        <>
          <span className="font-mono text-lg text-yellow-400">{formatDuration(timerState.elapsed)}</span>
          <button className="px-2 py-1 bg-blue-700 text-white rounded" onClick={onResumeTimer}>
            Resume
          </button>
          <button className="px-2 py-1 bg-red-700 text-white rounded" onClick={onFinishTimer}>
            End Session
          </button>
        </>
      )}
      <button className="px-3 py-1 bg-slate-700 text-white rounded" onClick={onShowManualTime}>
        + Add Time Manually
      </button>
    </div>
  );
};

export default TimerControls;
