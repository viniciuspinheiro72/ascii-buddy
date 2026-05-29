import { Mood } from "@/domain/value-objects/mood.js";

export const MOOD_FPS: Record<Mood, number> = {
  [Mood.IDLE]: 1,
  [Mood.HAPPY]: 3,
  [Mood.SAD]: 1,
  [Mood.TALKING]: 4,
  [Mood.SLEEPING]: 0.5,
};

export class AnimationLoop {
  private timer: ReturnType<typeof setInterval> | null = null;
  private currentIndex = 0;

  constructor(private readonly onFrame: (frame: string) => void) {}

  start(frames: readonly string[], fps: number): void {
    this.stop();
    this.currentIndex = 0;

    if (frames.length === 0) return;

    const first = frames[0];
    if (first !== undefined) this.onFrame(first);
    if (frames.length === 1) return;

    const intervalMs = Math.floor(1000 / fps);
    this.timer = setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % frames.length;
      const frame = frames[this.currentIndex];
      if (frame !== undefined) this.onFrame(frame);
    }, intervalMs);
  }

  stop(): void {
    if (this.timer !== null) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}
