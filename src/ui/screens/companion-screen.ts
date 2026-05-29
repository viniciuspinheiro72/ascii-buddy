import blessed from "neo-blessed";
import type { Buddy } from "@/domain/entities/buddy.js";
import { Mood } from "@/domain/value-objects/mood.js";
import { moodToState } from "@/domain/value-objects/mood.js";
import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";
import { AnimationLoop, MOOD_FPS } from "@/ui/components/animation-loop.js";
import { SpeechBubble } from "@/ui/components/speech-bubble.js";
import { StatusBar } from "@/ui/components/status-bar.js";
import { logger } from "@/infra/logger.js";
import type { GeneratePhraseResult } from "@/application/use-cases/generate-phrase.use-case.js";

const BUDDY_BOX_WIDTH = 17;
const THINKING_DELAY_MS = 500;
const MIN_WIDTH_FULL = 60;
const MIN_WIDTH_RENDER = 40;
const MOOD_LINGER_MS = 5_000;
const SLEEP_IDLE_MS = 10 * 60 * 1000;
const MOOD_CHECK_INTERVAL_MS = 60_000;

export class CompanionScreen {
  private screen!: blessed.Widgets.Screen;
  private buddyBox!: blessed.Widgets.BoxElement;
  private speechBubble!: SpeechBubble;
  private statusBar!: StatusBar;
  private animationLoop!: AnimationLoop;
  private phraseTimer: ReturnType<typeof setInterval> | null = null;
  private moodCheckTimer: ReturnType<typeof setInterval> | null = null;
  private currentMood: Mood;
  private isOffline = false;
  private destroyed = false;
  private lastActivityAt = new Date();

  constructor(
    private buddy: Buddy,
    private readonly template: BuddyTemplate,
    private readonly getPhrase: () => Promise<GeneratePhraseResult>,
    private readonly phraseIntervalMs: number = 30_000,
  ) {
    this.currentMood = buddy.mood;
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

    this.buildLayout();
    this.bindKeys();
    this.startAnimation();
    this.schedulePhraseLoop();
    this.startMoodCheckLoop();

    this.screen.render();

    // Show first phrase shortly after open
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

  private buildLayout(): void {
    const width = this.screen.width as number;
    const showSpeech = width >= MIN_WIDTH_FULL;

    if (width < MIN_WIDTH_RENDER) {
      this.buildMinimalLayout();
      return;
    }

    // Header
    blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: "100%",
      height: 1,
      content: ` ascii-buddy · ${this.buddy.name} — ${this.buddy.talent}   [n: phrase]  [q: quit]`,
      style: { fg: "cyan", bg: "black" },
      tags: false,
    });

    // Buddy art box
    this.buddyBox = blessed.box({
      parent: this.screen,
      top: 1,
      left: 0,
      width: BUDDY_BOX_WIDTH,
      height: 13,
      content: "",
      tags: false,
      border: { type: "line" },
      style: { border: { fg: "cyan" }, fg: "white", bg: "black" },
      padding: { left: 1, right: 0, top: 1, bottom: 0 },
    });

    // Speech bubble (right panel, full mode only)
    if (showSpeech) {
      this.speechBubble = new SpeechBubble(this.screen, {
        top: 2,
        left: BUDDY_BOX_WIDTH + 1,
        width: `100%-${BUDDY_BOX_WIDTH + 2}`,
        height: 6,
      });
    } else {
      // Compact mode: speech stacked below buddy
      this.speechBubble = new SpeechBubble(this.screen, {
        top: 15,
        left: 0,
        width: "100%",
        height: 5,
      });
    }

    // Status bar
    this.statusBar = new StatusBar(this.screen, {
      bottom: 1,
      left: showSpeech ? BUDDY_BOX_WIDTH + 1 : 0,
      width: showSpeech ? `100%-${BUDDY_BOX_WIDTH + 2}` : "100%",
    });

    // Footer key hints
    blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: "100%",
      height: 1,
      content: " [n] new phrase   [q] quit",
      style: { fg: "gray", bg: "black" },
      tags: false,
    });

    this.updateStatusBar();

    // Rebuild on resize (debounced 150ms — PITFALLS.md)
    this.screen.on("resize", () => {
      setTimeout(() => {
        if (!this.destroyed) {
          this.screen.destroy();
          this.destroyed = false;
          this.buildLayout();
          this.screen.render();
        }
      }, 150);
    });
  }

  private buildMinimalLayout(): void {
    blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: "100%",
      height: 1,
      content: " ascii-buddy  [q: quit]",
      style: { fg: "cyan" },
      tags: false,
    });

    this.buddyBox = blessed.box({
      parent: this.screen,
      top: 1,
      left: 0,
      width: "100%",
      height: 13,
      content: "",
      tags: false,
      border: { type: "line" },
      style: { border: { fg: "cyan" }, fg: "white", bg: "black" },
      padding: { left: 1, right: 0, top: 1, bottom: 0 },
    });

    // Stub implementations so class invariants hold
    this.speechBubble = new SpeechBubble(this.screen, {
      top: 15,
      left: 0,
      width: "100%",
      height: 3,
    });
    this.statusBar = new StatusBar(this.screen, { bottom: 0, left: 0, width: "100%" });
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

    // Any keypress resets the sleep idle timer
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
    this.updateStatusBar();
  }

  private async triggerPhrase(): Promise<void> {
    // Wake from sleep if needed
    if (this.currentMood === Mood.SLEEPING) {
      this.setMood(Mood.IDLE);
    }

    this.setMood(Mood.TALKING);
    this.speechBubble.showThinking();

    await sleep(THINKING_DELAY_MS);

    try {
      const { phrase, offline } = await this.getPhrase();
      this.isOffline = offline;
      this.speechBubble.show(phrase);
      this.updateStatusBar();

      // HAPPY after online phrase, SAD after offline — both linger then return to IDLE
      const nextMood = offline ? Mood.SAD : Mood.HAPPY;
      this.setMood(nextMood);
    } catch (err) {
      logger.error(`Failed to get phrase: ${String(err)}`);
      this.isOffline = true;
      this.speechBubble.show("...I got nothing. Try again.");
      this.updateStatusBar();
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

  private updateStatusBar(): void {
    this.statusBar.update(this.currentMood, this.buddy.name, this.buddy.lastSeenAt, this.isOffline);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
