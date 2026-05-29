import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AnimationLoop } from "@/ui/components/animation-loop.js";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("AnimationLoop", () => {
  it("should call onFrame with the first frame immediately on start", () => {
    const onFrame = vi.fn();
    const loop = new AnimationLoop(onFrame);
    loop.start(["frame1", "frame2"], 1);

    expect(onFrame).toHaveBeenCalledOnce();
    expect(onFrame).toHaveBeenCalledWith("frame1");
    loop.stop();
  });

  it("should not set an interval for a single-frame animation", () => {
    const onFrame = vi.fn();
    const loop = new AnimationLoop(onFrame);
    loop.start(["only-frame"], 1);

    vi.advanceTimersByTime(5_000);

    expect(onFrame).toHaveBeenCalledOnce();
    loop.stop();
  });

  it("should advance to the next frame on each interval tick", () => {
    const onFrame = vi.fn();
    const loop = new AnimationLoop(onFrame);
    loop.start(["frame1", "frame2"], 1); // 1fps = 1000ms

    vi.advanceTimersByTime(1_000);

    expect(onFrame).toHaveBeenLastCalledWith("frame2");
    loop.stop();
  });

  it("should loop back to the first frame after the last", () => {
    const onFrame = vi.fn();
    const loop = new AnimationLoop(onFrame);
    loop.start(["frame1", "frame2"], 1);

    vi.advanceTimersByTime(2_000);

    expect(onFrame).toHaveBeenLastCalledWith("frame1");
    loop.stop();
  });

  it("should stop firing after stop() is called", () => {
    const onFrame = vi.fn();
    const loop = new AnimationLoop(onFrame);
    loop.start(["frame1", "frame2"], 1);
    loop.stop();

    vi.advanceTimersByTime(10_000);

    // Only the initial synchronous call
    expect(onFrame).toHaveBeenCalledOnce();
  });

  it("should restart from frame 0 when start() is called again", () => {
    const onFrame = vi.fn();
    const loop = new AnimationLoop(onFrame);

    loop.start(["frame1", "frame2"], 1);
    vi.advanceTimersByTime(1_000); // now on frame2

    loop.start(["frame1", "frame2"], 1); // restart
    expect(onFrame).toHaveBeenLastCalledWith("frame1");

    loop.stop();
  });

  it("should do nothing when started with no frames", () => {
    const onFrame = vi.fn();
    const loop = new AnimationLoop(onFrame);
    loop.start([], 1);

    vi.advanceTimersByTime(5_000);

    expect(onFrame).not.toHaveBeenCalled();
    loop.stop();
  });
});
