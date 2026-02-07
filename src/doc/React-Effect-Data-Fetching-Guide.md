# React Effect and Data Fetching Guide

## Purpose

This guide is the day-to-day source of truth for `useEffect` decisions in this project.
Use this file directly during implementation and review without needing to open external docs each time.

Goal: reduce unnecessary effects, prevent async bugs, and improve maintainability.

## Optional External Reference

For occasional alignment only:
- https://react.dev/learn/you-might-not-need-an-effect#fetching-data

## Decision Rule Before Adding `useEffect`

Use this order:
1. Can this value be derived from props/state during render? Use plain variables or `useMemo`.
2. Is this caused by a user action? Run it in the event handler.
3. Is this synchronization with an external system (network, timers, subscriptions)? Use `useEffect`.

If the answer is not #3, do not add an effect.

## Data Fetching Policy

Preferred order in this codebase:
1. Fetch at page/route or shared hook level when possible.
2. Reuse existing repository and hook abstractions.
3. Use component-level fetch effects only when no higher-level abstraction fits.

## Required Pattern for Fetching in an Effect

```tsx
import { useEffect, useState } from "react";

type LoadState<T> =
  | { status: "idle"; data: null; error: null }
  | { status: "loading"; data: null; error: null }
  | { status: "success"; data: T; error: null }
  | { status: "error"; data: null; error: string };

export function useEntity(id: string) {
  const [state, setState] = useState<LoadState<unknown>>({
    status: "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    let ignore = false;

    setState({ status: "loading", data: null, error: null });

    void fetch(`/api/entity/${id}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (!ignore) {
          setState({ status: "success", data, error: null });
        }
      })
      .catch((error: Error) => {
        if (!ignore && error.name !== "AbortError") {
          setState({ status: "error", data: null, error: error.message });
        }
      });

    return () => {
      ignore = true;
      controller.abort();
    };
  }, [id]);

  return state;
}
```

## Checklist for Code Reviews

- Effect exists only for external synchronization.
- Dependency array is complete and intentional.
- Cleanup prevents stale updates.
- Loading, success, and error states are explicit.
- No fetch waterfall caused by parent-child sequential loading when calls are independent.

## Testing Checklist

- Verify `loading` -> `success` transition.
- Verify `loading` -> `error` transition.
- Verify stale response is ignored when dependency changes quickly.
- Verify cleanup runs on unmount (no late state update).
