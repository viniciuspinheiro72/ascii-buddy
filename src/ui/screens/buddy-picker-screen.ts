import blessed from "neo-blessed";
import type { Buddy } from "@/domain/entities/buddy.js";

const ACTIVE_MARKER = "★";
const INACTIVE_MARKER = " ";

function formatRow(buddy: Buddy, isActive: boolean): string {
  const marker = isActive ? ACTIVE_MARKER : INACTIVE_MARKER;
  return `${marker} ${buddy.name} (${buddy.species}) — ${buddy.talent}`;
}

export class BuddyPickerScreen {
  private screen!: blessed.Widgets.Screen;
  private list!: blessed.Widgets.ListElement;
  private confirmOpen = false;
  private destroyed = false;

  constructor(
    private buddies: Buddy[],
    private activeBuddyId: string | null,
    private readonly onDelete: (id: string) => Promise<{ newActiveBuddyId: string | null }>,
  ) {}

  /** Resolves with the selected buddy's id, or null if the user quit. */
  open(): Promise<string | null> {
    return new Promise((resolve) => {
      this.screen = blessed.screen({ smartCSR: true, title: "ascii-buddy — buddies" });

      // Register exit handlers before rendering (PITFALLS.md)
      process.on("exit", () => this.close());
      process.on("SIGINT", () => {
        this.close();
        process.exit(0);
      });
      process.on("SIGTERM", () => {
        this.close();
        process.exit(0);
      });

      this.buildLayout(resolve);
      this.screen.render();
    });
  }

  close(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.screen.destroy();
  }

  private buildLayout(resolve: (value: string | null) => void): void {
    blessed.box({
      parent: this.screen,
      top: 0,
      left: 0,
      width: "100%",
      height: 1,
      content: " ascii-buddy — your buddies",
      style: { fg: "cyan", bg: "black" },
      tags: false,
    });

    this.list = blessed.list({
      parent: this.screen,
      top: 1,
      left: 0,
      width: "100%",
      height: "100%-3",
      items: this.buddies.map((b) => formatRow(b, b.id === this.activeBuddyId)),
      keys: true,
      mouse: true,
      border: { type: "line" },
      style: {
        fg: "white",
        bg: "black",
        selected: { fg: "black", bg: "cyan" },
        border: { fg: "cyan" },
      },
    } as blessed.Widgets.ListOptions<blessed.Widgets.ListElementStyle>);

    blessed.box({
      parent: this.screen,
      bottom: 0,
      left: 0,
      width: "100%",
      height: 1,
      content: " [↑↓] navigate   [Enter] set active   [d] delete   [q] quit",
      style: { fg: "gray", bg: "black" },
      tags: false,
    });

    this.list.focus();

    this.screen.key(["q", "C-c"], () => {
      if (this.confirmOpen) return;
      this.close();
      resolve(null);
    });

    this.screen.key(["enter"], () => {
      if (this.confirmOpen) return;
      const idx = this.list.selected as number;
      const buddy = this.buddies[idx];
      if (buddy) {
        this.close();
        resolve(buddy.id);
      }
    });

    this.screen.key(["d"], () => {
      if (this.confirmOpen) return;
      const idx = this.list.selected as number;
      const buddy = this.buddies[idx];
      if (buddy) this.showConfirm(buddy, resolve);
    });
  }

  private showConfirm(target: Buddy, resolve: (value: string | null) => void): void {
    this.confirmOpen = true;

    const dialog = blessed.box({
      parent: this.screen,
      top: "center",
      left: "center",
      width: 52,
      height: 7,
      border: { type: "line" },
      style: { border: { fg: "red" }, fg: "white", bg: "black" },
      content: `\n  Delete "${target.name}"?\n\n  [y] Yes, delete   [n] Cancel`,
      tags: false,
    });

    dialog.focus();
    this.screen.render();

    const onKey = (ch: string) => {
      this.screen.removeListener("keypress", onKey);
      this.confirmOpen = false;
      dialog.destroy();

      if (ch === "y") {
        void this.onDelete(target.id).then(({ newActiveBuddyId }) => {
          this.activeBuddyId = newActiveBuddyId;
          this.buddies = this.buddies.filter((b) => b.id !== target.id);

          if (this.buddies.length === 0) {
            this.close();
            resolve(null);
            return;
          }

          this.list.setItems(
            this.buddies.map((b) => formatRow(b, b.id === this.activeBuddyId)),
          );
          this.list.focus();
          this.screen.render();
        });
      } else {
        this.list.focus();
        this.screen.render();
      }
    };

    this.screen.on("keypress", onKey);
  }
}
