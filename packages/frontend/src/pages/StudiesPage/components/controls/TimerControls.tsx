import React from "react";
import { PlayIcon, PauseIcon, StopIcon, ClockIcon } from "@heroicons/react/24/outline";
import { Button } from "../../../../components/ui";
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
    <div className="space-y-3">
      <div className="rounded-xl border border-border-subtle bg-surface-raised px-4 py-3">
        <div className="text-xs font-semibold uppercase tracking-wide text-text-subtle">Current Timer</div>
        <div className="mt-1 font-mono text-2xl font-semibold text-text-base">
          {formatDuration(timerState.elapsed)}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {!timerState.running && !timerState.start && (
          <Button type="button" intent="primary" size="sm" onClick={onStartTimer}>
            <PlayIcon className="h-4 w-4" />
            Start Timer
          </Button>
        )}
        {timerState.running && (
          <>
            <Button type="button" intent="accent" size="sm" onClick={onPauseTimer}>
              <PauseIcon className="h-4 w-4" />
              Pause
            </Button>
            <Button type="button" intent="danger" size="sm" onClick={onFinishTimer}>
              <StopIcon className="h-4 w-4" />
              End Session
            </Button>
          </>
        )}
        {!timerState.running && timerState.start && (
          <>
            <Button type="button" intent="primary" size="sm" onClick={onResumeTimer}>
              <PlayIcon className="h-4 w-4" />
              Resume
            </Button>
            <Button type="button" intent="danger" size="sm" onClick={onFinishTimer}>
              <StopIcon className="h-4 w-4" />
              End Session
            </Button>
          </>
        )}
        <Button type="button" intent="secondary" size="sm" onClick={onShowManualTime}>
          <ClockIcon className="h-4 w-4" />
          Add Manual Time
        </Button>
      </div>
    </div>
  );
};

export default TimerControls;
