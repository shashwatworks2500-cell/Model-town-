"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { type CutName, cuts, framePath, loadOrder, prefersLessData } from "@/lib/film";

interface SequenceState {
  /** 0–1 across the priority tier. Drives the loader. */
  progress: number;
  ready: boolean;
  failed: boolean;
}

const CONCURRENCY = { priority: 8, background: 4 };

function loadImage(src: string, signal: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.src = src;

    const done = () => {
      cleanup();
      resolve(img);
    };
    const fail = () => {
      cleanup();
      reject(new Error(`frame failed: ${src}`));
    };
    const abort = () => {
      img.src = "";
      cleanup();
      reject(new Error("aborted"));
    };
    function cleanup() {
      img.removeEventListener("load", done);
      img.removeEventListener("error", fail);
      signal.removeEventListener("abort", abort);
    }

    img.addEventListener("load", done, { once: true });
    img.addEventListener("error", fail, { once: true });
    signal.addEventListener("abort", abort, { once: true });
  });
}

/** Runs `task` over `items` with a fixed number of workers. */
async function pool<T>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<void>,
  signal: AbortSignal,
) {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length && !signal.aborted) {
      const index = cursor;
      cursor += 1;
      const item = items[index];
      if (item === undefined) continue;
      await task(item);
    }
  });
  await Promise.all(workers);
}

/**
 * Loads a film cut into memory and hands back a frame getter.
 *
 * The getter never returns undefined once the sequence is ready: if the exact
 * frame has not arrived yet it walks outward to the nearest one that has, so
 * scrubbing stays continuous while the second tier is still streaming in.
 */
export function useFilmSequence(cut: CutName | null) {
  const framesRef = useRef<Array<HTMLImageElement | undefined>>([]);
  const [state, setState] = useState<SequenceState>({ progress: 0, ready: false, failed: false });

  // Resetting for a new cut happens during render rather than inside the load
  // effect, so the loader never shows a stale sequence's progress for a frame.
  const [loadedCut, setLoadedCut] = useState(cut);
  if (cut !== loadedCut) {
    setLoadedCut(cut);
    setState({ progress: 0, ready: false, failed: false });
  }

  useEffect(() => {
    if (!cut) return;

    const controller = new AbortController();
    const { signal } = controller;
    const { count } = cuts[cut];
    const frames: Array<HTMLImageElement | undefined> = new Array(count);
    framesRef.current = frames;

    const { priority, rest } = loadOrder(count);
    let loaded = 0;
    let failures = 0;

    const store = async (index: number, track: boolean) => {
      try {
        frames[index] = await loadImage(framePath(cut, index), signal);
      } catch {
        if (!signal.aborted) failures += 1;
      }
      if (track && !signal.aborted) {
        loaded += 1;
        setState((s) => (s.ready ? s : { ...s, progress: loaded / priority.length }));
      }
    };

    (async () => {
      await pool(priority, CONCURRENCY.priority, (i) => store(i, true), signal);
      if (signal.aborted) return;

      // Every frame in the priority tier failed: the sequence is unusable.
      if (failures >= priority.length) {
        setState({ progress: 1, ready: false, failed: true });
        return;
      }

      setState({ progress: 1, ready: true, failed: false });

      if (prefersLessData()) return;
      // A short yield so the first scrubbed frames paint before the remaining
      // requests compete for bandwidth.
      await new Promise((r) => setTimeout(r, 150));
      if (signal.aborted) return;
      await pool(rest, CONCURRENCY.background, (i) => store(i, false), signal);
    })();

    return () => {
      controller.abort();
      framesRef.current = [];
    };
  }, [cut]);

  const frameAt = useCallback((index: number): HTMLImageElement | undefined => {
    const frames = framesRef.current;
    if (frames.length === 0) return undefined;
    const clamped = Math.max(0, Math.min(frames.length - 1, index));
    const exact = frames[clamped];
    if (exact) return exact;
    for (let step = 1; step < frames.length; step += 1) {
      const before = frames[clamped - step];
      if (before) return before;
      const after = frames[clamped + step];
      if (after) return after;
    }
    return undefined;
  }, []);

  return { ...state, frameAt };
}
