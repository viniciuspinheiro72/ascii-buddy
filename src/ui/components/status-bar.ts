import blessed from "neo-blessed";
import { Mood } from "@/domain/value-objects/mood.js";

const MOOD_LABEL: Record<Mood, string> = {
  [Mood.IDLE]: "idle",
  [Mood.HAPPY]: "happy ♥",
  [Mood.SAD]: "sad",
  [Mood.TALKING]: "talking...",
  [Mood.SLEEPING]: "sleeping z",
};

export class StatusBar {
  private readonly box: blessed.Widgets.BoxElement;
  private readonly screen: blessed.Widgets.Screen;

  constructor(
    screen: blessed.Widgets.Screen,
    opts: { bottom: number; left: number | string; width: number | string },
  ) {
    this.screen = screen;
    this.box = blessed.box({
      parent: screen,
      bottom: opts.bottom,
      left: opts.left,
      width: opts.width,
      height: 1,
      content: "",
      tags: false,
      style: { fg: "gray", bg: "black" },
    });
  }

  reposition(opts: { bottom: number; left: number | string; width: number | string }): void {
    const pos = (this.box as any).position as Record<string, number | string | undefined>;
    pos["bottom"] = opts.bottom;
    pos["left"] = opts.left;
    pos["width"] = opts.width;
    pos["top"] = undefined;
    (this.box as any).lpos = null;
  }

  update(mood: Mood, buddyName: string, lastSeenAt: Date, offline: boolean): void {
    const moodLabel = MOOD_LABEL[mood];
    const elapsed = formatElapsed(lastSeenAt);
    const offlineTag = offline ? " [offline]" : "";
    this.box.setContent(
      ` ${buddyName}  mood: ${moodLabel}  last seen: ${elapsed}${offlineTag}`,
    );
    this.screen.render();
  }
}

function formatElapsed(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}
