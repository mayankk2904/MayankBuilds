// components/TargetCursor.tsx
"use client";

import React, { useEffect, useRef, useCallback, useMemo } from "react";
import { gsap } from "gsap";

export interface TargetCursorProps {
  targetSelector?: string;
  spinDuration?: number;
  hideDefaultCursor?: boolean;
  hoverDuration?: number;
  parallaxOn?: boolean;
}

const TargetCursor: React.FC<TargetCursorProps> = ({
  targetSelector = ".cursor-target",
  spinDuration = 2,
  hideDefaultCursor = true,
  hoverDuration = 0.2,
  parallaxOn = true,
}) => {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const cornersRef = useRef<NodeListOf<HTMLDivElement> | null>(null);
  const spinTl = useRef<gsap.core.Timeline | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);

  const isActiveRef = useRef(false);
  const targetCornerPositionsRef = useRef<{ x: number; y: number }[] | null>(null);
  const tickerFnRef = useRef<(() => void) | null>(null);
  const activeStrengthRef = useRef({ current: 0 });

  // Determine mobile conservatively (guard typeof window)
  const isMobile = useMemo(() => {
    if (typeof window === "undefined") return true;
    const hasTouchScreen = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = (navigator && navigator.userAgent) || "";
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    const isMobileUserAgent = mobileRegex.test(userAgent.toLowerCase());
    return (hasTouchScreen && isSmallScreen) || isMobileUserAgent;
  }, []);

  const constants = useMemo(() => ({ borderWidth: 3, cornerSize: 12 }), []);

  const moveCursor = useCallback((x: number, y: number) => {
    const el = cursorRef.current;
    if (!el) return;
    // use gsap.to for smooth movement
    gsap.to(el, { x, y, duration: 0.1, ease: "power3.out" });
  }, []);

  useEffect(() => {
    // don't run any of this on mobile or when cursor container is missing
    if (isMobile || !cursorRef.current) return;

    console.log("[TargetCursor] mounted (client)");

    const originalCursor = document.body.style.cursor;
    if (hideDefaultCursor) {
      document.body.style.cursor = "none";
    }

    const cursor = cursorRef.current!;
    cornersRef.current = cursor.querySelectorAll<HTMLDivElement>(".target-cursor-corner");

    let activeTarget: Element | null = null;
    let currentLeaveHandler: (() => void) | null = null;
    let resumeTimeout: ReturnType<typeof setTimeout> | null = null;

    const cleanupTarget = (target: Element) => {
      if (currentLeaveHandler) {
        try {
          target.removeEventListener("mouseleave", currentLeaveHandler);
        } catch (e) {
          // ignore if already removed
        }
      }
      currentLeaveHandler = null;
    };

    // initial cursor center
    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      rotation: 0,
      scale: 1,
    });

    const createSpinTimeline = () => {
      if (!cursorRef.current) return;
      if (spinTl.current) {
        spinTl.current.kill();
        spinTl.current = null;
      }
      spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, {
        rotation: "+=360",
        duration: spinDuration,
        ease: "none",
      });
    };

    createSpinTimeline();

    const tickerFn = () => {
      if (!targetCornerPositionsRef.current || !cursorRef.current || !cornersRef.current) return;
      const strength = activeStrengthRef.current.current;
      if (!strength) return;

      const cursorX = (gsap.getProperty(cursorRef.current, "x") as number) || 0;
      const cursorY = (gsap.getProperty(cursorRef.current, "y") as number) || 0;
      const corners = Array.from(cornersRef.current);
      corners.forEach((corner, i) => {
        const currentX = (gsap.getProperty(corner, "x") as number) || 0;
        const currentY = (gsap.getProperty(corner, "y") as number) || 0;
        const targetX = targetCornerPositionsRef.current![i].x - cursorX;
        const targetY = targetCornerPositionsRef.current![i].y - cursorY;
        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;
        const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;
        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration: duration,
          ease: duration === 0 ? "none" : "power1.out",
          overwrite: "auto",
        });
      });
    };

    tickerFnRef.current = tickerFn;

    // mouse move handler (global)
    const moveHandler = (e: MouseEvent) => moveCursor(e.clientX, e.clientY);
    window.addEventListener("mousemove", moveHandler);

    // scroll handler: if target moved out from under the cursor, simulate leave
    const scrollHandler = () => {
      if (!activeTarget || !cursorRef.current) return;
      const mouseX = (gsap.getProperty(cursorRef.current, "x") as number) || 0;
      const mouseY = (gsap.getProperty(cursorRef.current, "y") as number) || 0;
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === activeTarget || elementUnderMouse.closest(targetSelector) === activeTarget);
      if (!isStillOverTarget) {
        currentLeaveHandler?.();
      }
    };
    window.addEventListener("scroll", scrollHandler, { passive: true });

    const mouseDownHandler = () => {
      if (!dotRef.current || !cursorRef.current) return;
      gsap.to(dotRef.current, { scale: 0.7, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 0.9, duration: 0.2 });
    };

    const mouseUpHandler = () => {
      if (!dotRef.current || !cursorRef.current) return;
      gsap.to(dotRef.current, { scale: 1, duration: 0.3 });
      gsap.to(cursorRef.current, { scale: 1, duration: 0.2 });
    };

    window.addEventListener("mousedown", mouseDownHandler);
    window.addEventListener("mouseup", mouseUpHandler);

    // handler that detects entry to a target element through mouseover
    const enterHandler = (e: MouseEvent) => {
      const directTarget = e.target as Element | null;
      const allTargets: Element[] = [];
      let current: Element | null = directTarget;
      while (current && current !== document.body) {
        if (current.matches && current.matches(targetSelector)) {
          allTargets.push(current);
        }
        current = current.parentElement;
      }
      const target = allTargets[0] || null;
      if (!target || !cursorRef.current || !cornersRef.current) return;
      if (activeTarget === target) return;
      if (activeTarget) {
        cleanupTarget(activeTarget);
      }
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;
      const corners = Array.from(cornersRef.current);
      corners.forEach((corner) => gsap.killTweensOf(corner));
      gsap.killTweensOf(cursorRef.current, "rotation");
      spinTl.current?.pause();
      gsap.set(cursorRef.current, { rotation: 0 });

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const cursorX = (gsap.getProperty(cursorRef.current, "x") as number) || 0;
      const cursorY = (gsap.getProperty(cursorRef.current, "y") as number) || 0;

      targetCornerPositionsRef.current = [
        { x: rect.left - borderWidth, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.top - borderWidth },
        { x: rect.right + borderWidth - cornerSize, y: rect.bottom + borderWidth - cornerSize },
        { x: rect.left - borderWidth, y: rect.bottom + borderWidth - cornerSize },
      ];

      isActiveRef.current = true;
      if (tickerFnRef.current) gsap.ticker.add(tickerFnRef.current);

      // animate strength to 1
      gsap.to(activeStrengthRef.current, { current: 1, duration: hoverDuration, ease: "power2.out" });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositionsRef.current![i].x - cursorX,
          y: targetCornerPositionsRef.current![i].y - cursorY,
          duration: 0.2,
          ease: "power2.out",
        });
      });

      const leaveHandler = () => {
        if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);
        isActiveRef.current = false;
        targetCornerPositionsRef.current = null;
        gsap.set(activeStrengthRef.current, { current: 0, overwrite: true });
        activeTarget = null;
        if (cornersRef.current) {
          const corners = Array.from(cornersRef.current);
          gsap.killTweensOf(corners);
          const { cornerSize } = constants;
          const positions = [
            { x: -cornerSize * 1.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: -cornerSize * 1.5 },
            { x: cornerSize * 0.5, y: cornerSize * 0.5 },
            { x: -cornerSize * 1.5, y: cornerSize * 0.5 },
          ];
          const tl = gsap.timeline();
          corners.forEach((corner, index) => {
            tl.to(
              corner,
              { x: positions[index].x, y: positions[index].y, duration: 0.3, ease: "power3.out" },
              0
            );
          });
        }

        // resume spin after a short delay and smoothly handle rotation continuation
        resumeTimeout = setTimeout(() => {
          if (!activeTarget && cursorRef.current) {
            const currentRotation = (gsap.getProperty(cursorRef.current, "rotation") as number) || 0;
            const normalizedRotation = currentRotation % 360;
            if (spinTl.current) {
              spinTl.current.kill();
            }
            spinTl.current = gsap
              .timeline({ repeat: -1 })
              .to(cursorRef.current!, { rotation: "+=360", duration: spinDuration, ease: "none" });
            gsap.to(cursorRef.current!, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: "none",
              onComplete: () => {
                spinTl.current?.restart();
              },
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(target);
      };

      currentLeaveHandler = leaveHandler;
      target.addEventListener("mouseleave", leaveHandler);
    };

    window.addEventListener("mouseover", enterHandler as EventListener);

    return () => {
      // remove ticker
      if (tickerFnRef.current) gsap.ticker.remove(tickerFnRef.current);

      // clear resumeTimeout
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      window.removeEventListener("mousemove", moveHandler);
      window.removeEventListener("mouseover", enterHandler as EventListener);
      window.removeEventListener("scroll", scrollHandler);
      window.removeEventListener("mousedown", mouseDownHandler);
      window.removeEventListener("mouseup", mouseUpHandler);

      if (activeTarget) {
        cleanupTarget(activeTarget);
      }

      spinTl.current?.kill();
      spinTl.current = null;

      // restore original cursor style
      try {
        document.body.style.cursor = originalCursor || "";
      } catch (e) {
        // ignore if body not available
      }

      isActiveRef.current = false;
      targetCornerPositionsRef.current = null;
      activeStrengthRef.current.current = 0;
    };
  }, [targetSelector, spinDuration, moveCursor, constants, hideDefaultCursor, isMobile, hoverDuration, parallaxOn]);

  // if spinDuration changes while mounted, re-create timeline safely
  useEffect(() => {
    if (isMobile || !cursorRef.current) return;
    if (spinTl.current) {
      // recreate timeline with new duration
      spinTl.current.kill();
      spinTl.current = gsap.timeline({ repeat: -1 }).to(cursorRef.current, {
        rotation: "+=360",
        duration: spinDuration,
        ease: "none",
      });
    }
  }, [spinDuration, isMobile]);

  if (isMobile) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 w-0 h-0 pointer-events-none z-[9999]"
      style={{ willChange: "transform" }}
      aria-hidden
    >
      {/* Center dot */}
      <div
        ref={dotRef}
        className="absolute top-1/2 left-1/2 w-1 h-1 bg-[hsl(var(--accent))] rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ willChange: "transform" }}
      />

      {/* corners */}
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-[hsl(var(--accent))] -translate-x-[150%] -translate-y-[150%] border-r-0 border-b-0"
        style={{ willChange: "transform" }}
      />
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-[hsl(var(--accent))] translate-x-1/2 -translate-y-[150%] border-l-0 border-b-0"
        style={{ willChange: "transform" }}
      />
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-[hsl(var(--accent))] translate-x-1/2 translate-y-1/2 border-l-0 border-t-0"
        style={{ willChange: "transform" }}
      />
      <div
        className="target-cursor-corner absolute top-1/2 left-1/2 w-3 h-3 border-[3px] border-[hsl(var(--accent))] -translate-x-[150%] translate-y-1/2 border-r-0 border-t-0"
        style={{ willChange: "transform" }}
      />
    </div>
  );
};

export default TargetCursor;
