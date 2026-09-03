'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { SIGN_COPY } from '@/lib/public/copy';
import {
  clearPad,
  padToPng,
  preparePad,
  strokeDot,
  strokeSegment,
} from '@/lib/public/signature-canvas';
import { padPoint, type Point } from '@/lib/public/signature-image';

interface SignaturePadProps {
  /** The cropped PNG data URL after each stroke; null once cleared. */
  onChange(dataUrl: string | null): void;
  disabled?: boolean;
}

/** A canvas to sign on with a finger, stylus, or mouse, and a Clear button. */
export function SignaturePad({ onChange, disabled }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const last = useRef<Point | null>(null);
  const moved = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) ctxRef.current = preparePad(canvas);
  }, []);

  const pointOf = (event: PointerEvent<HTMLCanvasElement>): Point =>
    padPoint(event.currentTarget.getBoundingClientRect(), event.clientX, event.clientY);

  const down = (event: PointerEvent<HTMLCanvasElement>) => {
    if (disabled) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    last.current = pointOf(event);
    moved.current = false;
  };

  const move = (event: PointerEvent<HTMLCanvasElement>) => {
    const ctx = ctxRef.current;
    if (!ctx || !last.current) return;
    const point = pointOf(event);
    strokeSegment(ctx, last.current, point);
    last.current = point;
    moved.current = true;
  };

  const up = () => {
    const ctx = ctxRef.current;
    const canvas = canvasRef.current;
    if (!ctx || !canvas || !last.current) return;
    if (!moved.current) strokeDot(ctx, last.current);
    last.current = null;
    setHasInk(true);
    onChange(padToPng(canvas));
  };

  const clear = () => {
    if (canvasRef.current) clearPad(canvasRef.current);
    setHasInk(false);
    onChange(null);
  };

  return (
    <div>
      <div className="sign-pad-frame">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label={SIGN_COPY.signature.padLabel}
          className="sign-pad"
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
        />
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p className="text-small text-ink-3">{SIGN_COPY.signature.drawHint}</p>
        <button
          type="button"
          onClick={clear}
          disabled={!hasInk || disabled}
          className="inline-flex h-11 items-center rounded-md border border-ink bg-white px-4 text-small font-semibold text-ink transition-colors hover:bg-sand disabled:cursor-not-allowed disabled:opacity-50"
        >
          {SIGN_COPY.signature.clear}
        </button>
      </div>
    </div>
  );
}
