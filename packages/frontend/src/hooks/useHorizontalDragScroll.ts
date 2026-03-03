import React from "react";

export const useHorizontalDragScroll = () => {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const dragStateRef = React.useRef({
    pointerId: -1,
    startX: 0,
    startY: 0,
    startScrollLeft: 0,
    moved: false,
    active: false,
  });
  const suppressClickUntilRef = React.useRef(0);
  const [isDragging, setIsDragging] = React.useState(false);

  const handlePointerDown = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || event.button !== 0) {
      return;
    }
    const scroller = scrollerRef.current;
    if (!scroller) {
      return;
    }
    dragStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startScrollLeft: scroller.scrollLeft,
      moved: false,
      active: true,
    };
  }, []);

  const handlePointerMove = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const scroller = scrollerRef.current;
    if (!scroller || !dragStateRef.current.active) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;
    const deltaY = event.clientY - dragStateRef.current.startY;

    if (Math.abs(deltaX) > 4) {
      if (
        !dragStateRef.current.moved &&
        Math.abs(deltaX) > 6 &&
        Math.abs(deltaX) > Math.abs(deltaY)
      ) {
        if (!scroller.hasPointerCapture(event.pointerId)) {
          scroller.setPointerCapture(event.pointerId);
        }
        setIsDragging(true);
        dragStateRef.current.startScrollLeft = scroller.scrollLeft;
        dragStateRef.current.startX = event.clientX;
      }

      dragStateRef.current.moved =
        dragStateRef.current.moved ||
        (Math.abs(deltaX) > 6 && Math.abs(deltaX) > Math.abs(deltaY));
    }

    if (!dragStateRef.current.moved) {
      return;
    }

    const dragDeltaX = event.clientX - dragStateRef.current.startX;
    scroller.scrollLeft = dragStateRef.current.startScrollLeft - dragDeltaX;
    event.preventDefault();
  }, []);

  const handlePointerEnd = React.useCallback(() => {
    if (!dragStateRef.current.active) {
      return;
    }

    if (dragStateRef.current.moved) {
      suppressClickUntilRef.current = performance.now() + 180;
    }

    const scroller = scrollerRef.current;
    if (scroller && scroller.hasPointerCapture(dragStateRef.current.pointerId)) {
      scroller.releasePointerCapture(dragStateRef.current.pointerId);
    }

    dragStateRef.current.moved = false;
    dragStateRef.current.active = false;
    setIsDragging(false);
  }, []);

  const handleClickCapture = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    if (performance.now() > suppressClickUntilRef.current) {
      return;
    }
    event.preventDefault();
    event.stopPropagation();
  }, []);

  return {
    scrollerRef,
    isDragging,
    scrollerProps: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerEnd,
      onPointerCancel: handlePointerEnd,
      onClickCapture: handleClickCapture,
    },
  };
};
