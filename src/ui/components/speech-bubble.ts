import blessed from "neo-blessed";

const AUTO_CLEAR_MS = 8_000;

export class SpeechBubble {
  private readonly box: blessed.Widgets.BoxElement;
  private readonly screen: blessed.Widgets.Screen;
  private clearTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    screen: blessed.Widgets.Screen,
    opts: {
      top: number;
      left: number | string;
      width: number | string;
      height: number;
    },
  ) {
    this.screen = screen;
    this.box = blessed.box({
      parent: screen,
      top: opts.top,
      left: opts.left,
      width: opts.width,
      height: opts.height,
      content: "",
      tags: false,
      border: { type: "line" },
      style: {
        border: { fg: "white" },
        fg: "white",
        bg: "black",
      },
      padding: { left: 1, right: 1, top: 0, bottom: 0 },
      wrap: true,
      hidden: true,
    });
  }

  show(text: string, autoClearMs = AUTO_CLEAR_MS): void {
    this.cancelClear();
    this.box.setContent(text);
    this.box.show();
    this.screen.render();

    this.clearTimer = setTimeout(() => {
      this.hide();
    }, autoClearMs);
  }

  showThinking(): void {
    this.cancelClear();
    this.box.setContent("...");
    this.box.show();
    this.screen.render();
  }

  hide(): void {
    this.cancelClear();
    this.box.hide();
    this.screen.render();
  }

  private cancelClear(): void {
    if (this.clearTimer !== null) {
      clearTimeout(this.clearTimer);
      this.clearTimer = null;
    }
  }
}
