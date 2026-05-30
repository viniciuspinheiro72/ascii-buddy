import blessed from "neo-blessed";
import type { Buddy } from "@/domain/entities/buddy.js";
import { Mood } from "@/domain/value-objects/mood.js";
import { moodToState } from "@/domain/value-objects/mood.js";
import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";
import { AnimationLoop, MOOD_FPS } from "@/ui/components/animation-loop.js";
import { SpeechBubble } from "@/ui/components/speech-bubble.js";
import { logger } from "@/infra/logger.js";
import type { GeneratePhraseResult } from "@/application/use-cases/generate-phrase.use-case.js";

const THINKING_DELAY_MS = 500;
const MIN_WIDTH_FULL = 60;
const MIN_WIDTH_COMPACT = 40;
const MOOD_LINGER_MS = 5_000;
const SLEEP_IDLE_MS = 10 * 60 * 1000;
const MOOD_CHECK_INTERVAL_MS = 60_000;

type LayoutMode = "full" | "compact" | "minimal";

export class CompanionScreen {
  private screen!: blessed.Widgets.Screen;
  private buddyBox!: blessed.Widgets.BoxElement;
  private speechBubble!: SpeechBubble;
  private animationLoop!: AnimationLoop;
  private phraseTimer: ReturnType<typeof setInterval> | null = null;
  private moodCheckTimer: ReturnType<typeof setInterval> | null = null;
  private currentMood: Mood;
  private destroyed = false;
  private lastActivityAt = new Date();

  // frame dimensions (no border offset)
  private readonly boxW: number;
  private readonly boxH: number;

  constructor(
    buddy: Buddy,
    private readonly template: BuddyTemplate,
    private readonly getPhrase: () => Promise<GeneratePhraseResult>,
    private readonly phraseIntervalMs: number = 30_000,
  ) {
    this.currentMood = buddy.mood;
    this.boxW = template.width + 2; // 1 left padding + 1 right gap
    this.boxH = template.height;
  }

  open(): void {
    this.screen = blessed.screen({ smartCSR: true, title: "ascii-buddy" });

    // Register exit handlers BEFORE any rendering (CONSTITUTION requirement)
    process.on("exit", () => this.close());
    process.on("SIGINT", () => {
      this.close();
      process.exit(0);
    });
    process.on("SIGTERM", () => {
      this.close();
      process.exit(0);
    });

    this.createWidgets();
    this.applyLayout();
    this.bindKeys();
    this.startAnimation();
    this.schedulePhraseLoop();
    this.startMoodCheckLoop();

    this.screen.render();

    setTimeout(() => {
      void this.triggerPhrase();
    }, 3_000);
  }

  close(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.animationLoop.stop();
    if (this.phraseTimer !== null) {
      clearInterval(this.phraseTimer);
      this.phraseTimer = null;
    }
    if (this.moodCheckTimer !== null) {
      clearInterval(this.moodCheckTimer);
      this.moodCheckTimer = null;
    }
    this.screen.destroy();
  }

  private createWidgets(): void {
    this.buddyBox = blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: this.boxW,
      height: this.boxH,
      content: "",
      tags: false,
      style: { fg: "white" },
      padding: { left: 1, right: 0, top: 0, bottom: 0 },
    });

    this.speechBubble = new SpeechBubble(this.screen, {
      top: 1,
      left: this.boxW + 1,
      width: `100%-${this.boxW + 2}`,
      height: this.boxH,
    });

    blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: "100%",
      height: 1,
      content: " [n] phrase   [q] quit",
      tags: false,
      style: { fg: "gray" },
    });

    // Debounced resize — reposition in-place, no screen rebuild (PITFALLS.md)
    this.screen.on("resize", () => {
      setTimeout(() => {
        if (!this.destroyed) {
          this.applyLayout();
          this.screen.render();
        }
      }, 150);
    });
  }

  private applyLayout(): void {
    const width = this.screen.width as number;
    const mode = this.resolveLayoutMode(width);

    // Buddy box: fill width in minimal mode, fixed otherwise
    const buddyPos = (this.buddyBox as any).position as Record<string, number | string | undefined>;
    buddyPos["width"] = mode === "minimal" ? "100%" : this.boxW;
    (this.buddyBox as any).lpos = null;

    if (mode === "full") {
      // Speech to the right of buddy, vertically centred
      this.speechBubble.reposition({
        top: 1,
        left: this.boxW + 1,
        width: `100%-${this.boxW + 2}`,
        height: this.boxH,
      });
    } else if (mode === "compact") {
      // Speech stacked below buddy, anchored to bottom
      this.speechBubble.reposition({ bottom: 2, left: 0, width: "100%", height: 3 });
    } else {
      // Minimal: speech near bottom, footer stays
      this.speechBubble.reposition({ bottom: 1, left: 0, width: "100%", height: 2 });
    }
  }

  private resolveLayoutMode(width: number): LayoutMode {
    if (width >= MIN_WIDTH_FULL) return "full";
    if (width >= MIN_WIDTH_COMPACT) return "compact";
    return "minimal";
  }

  private bindKeys(): void {
    this.screen.key(["q", "C-c"], () => {
      this.close();
      process.exit(0);
    });

    this.screen.key(["n"], () => {
      this.recordActivity();
      void this.triggerPhrase();
    });

    this.screen.on("keypress", () => {
      this.recordActivity();
      if (this.currentMood === Mood.SLEEPING) {
        this.setMood(Mood.IDLE);
      }
    });
  }

  private startAnimation(): void {
    this.animationLoop = new AnimationLoop((frame) => {
      this.buddyBox.setContent(frame);
      this.screen.render();
    });

    this.setMood(this.currentMood);
  }

  private setMood(mood: Mood): void {
    this.currentMood = mood;
    const moodState = moodToState(mood);
    const frames = this.template.frames[moodState];
    const fps = MOOD_FPS[mood];
    this.animationLoop.start(frames, fps);
  }

  private async triggerPhrase(): Promise<void> {
    if (this.currentMood === Mood.SLEEPING) {
      this.setMood(Mood.IDLE);
    }

    this.setMood(Mood.TALKING);
    this.speechBubble.showThinking();

    await sleep(THINKING_DELAY_MS);

    try {
      const { phrase, offline } = await this.getPhrase();
      this.speechBubble.show(phrase);

      const nextMood = offline ? Mood.SAD : Mood.HAPPY;
      this.setMood(nextMood);
    } catch (err) {
      logger.error(`Failed to get phrase: ${String(err)}`);
      this.speechBubble.show("...I got nothing. Try again.");
      this.setMood(Mood.SAD);
    }

    setTimeout(() => {
      if (!this.destroyed && this.currentMood !== Mood.SLEEPING) {
        this.setMood(Mood.IDLE);
      }
    }, MOOD_LINGER_MS);
  }

  private schedulePhraseLoop(): void {
    this.phraseTimer = setInterval(() => {
      if (!this.destroyed) void this.triggerPhrase();
    }, this.phraseIntervalMs);
  }

  private startMoodCheckLoop(): void {
    this.moodCheckTimer = setInterval(() => {
      if (this.destroyed) return;
      if (this.currentMood !== Mood.IDLE) return;
      const idleMs = Date.now() - this.lastActivityAt.getTime();
      if (idleMs >= SLEEP_IDLE_MS) {
        this.setMood(Mood.SLEEPING);
      }
    }, MOOD_CHECK_INTERVAL_MS);
  }

  private recordActivity(): void {
    this.lastActivityAt = new Date();
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
