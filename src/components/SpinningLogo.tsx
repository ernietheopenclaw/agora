"use client";
import { useRef, useCallback, useEffect } from "react";
import { AgoraLogo } from "./AgoraLogo";

export function SpinningLogo({ size = 24 }: { size?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const state = useRef({
    angle: 0,
    speed: 0, // degrees per frame
    hovering: false,
    animating: false,
  });

  const MAX_SPEED = 12; // degrees per frame (~720deg/s at 60fps)
  const ACCEL = 0.15; // acceleration per frame
  const DECEL = 0.08; // deceleration per frame

  const animate = useCallback(() => {
    const s = state.current;
    const el = ref.current;
    if (!el) return;

    if (s.hovering && s.speed < MAX_SPEED) {
      s.speed = Math.min(s.speed + ACCEL, MAX_SPEED);
    } else if (!s.hovering && s.speed > 0) {
      s.speed = Math.max(s.speed - DECEL, 0);
    }

    if (s.speed > 0) {
      s.angle = (s.angle + s.speed) % 360;
      el.style.transform = `rotate(${s.angle}deg)`;
      s.animating = true;
      requestAnimationFrame(animate);
    } else {
      s.animating = false;
      el.style.transform = `rotate(0deg)`;
    }
  }, []);

  const onEnter = useCallback(() => {
    state.current.hovering = true;
    if (!state.current.animating) {
      state.current.animating = true;
      requestAnimationFrame(animate);
    }
  }, [animate]);

  const onLeave = useCallback(() => {
    state.current.hovering = false;
  }, []);

  return (
    <span
      ref={ref}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      style={{ display: "inline-flex", willChange: "transform" }}
    >
      <AgoraLogo size={size} />
    </span>
  );
}
