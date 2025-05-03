import { renderHook, act } from '@testing-library/react';
import { useStudyTimer } from '../hooks/useStudyTimer';

describe('useStudyTimer', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  it('starts, increments, pauses, resumes and finishes timer correctly', () => {
    const { result } = renderHook(() => useStudyTimer());

    expect(result.current.timerRunning).toBe(false);
    expect(result.current.timerElapsed).toBe(0);
    expect(result.current.timerStart).toBeNull();

    act(() => {
      result.current.startTimer();
    });
    expect(result.current.timerRunning).toBe(true);
    expect(result.current.timerElapsed).toBe(0);
    expect(result.current.timerStart).toBeInstanceOf(Date);

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.timerElapsed).toBe(3);

    act(() => {
      result.current.pauseTimer();
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.timerRunning).toBe(false);
    expect(result.current.timerElapsed).toBe(3);

    act(() => {
      result.current.resumeTimer();
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.timerRunning).toBe(true);
    expect(result.current.timerElapsed).toBe(5);

    act(() => {
      result.current.finishTimer();
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.timerRunning).toBe(false);
    expect(result.current.timerElapsed).toBe(0);
    expect(result.current.timerStart).toBeNull();
  });
});