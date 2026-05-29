# UX Design

## Design Philosophy
Terminal-native minimalism: every pixel of ASCII art is intentional. The TUI feels alive but never intrusive — the buddy is a companion, not a distraction. Keyboard-first always. Color enhances but is never required (graceful mono fallback). The interface should feel like something that belongs in a developer's terminal, not a toy grafted onto it.

## Target Devices & Breakpoints
| Terminal Width | Mode | Priority |
|----------------|------|----------|
| ≥ 80 columns | Full mode: buddy + speech bubble side by side | P0 |
| 50–79 columns | Compact mode: buddy + speech bubble stacked | P0 |
| < 50 columns | Minimal mode: buddy only, no speech bubble | P0 |
| < 40 columns | Error state: "terminal too narrow" message | P1 |

## Design System
- **Component library:** neo-blessed primitives (Box, Text, Screen)
- **Typography:** monospace only (terminal font — user's choice)
- **Color tokens:**
  - `buddy.border`: cyan (`#00d7ff`)
  - `buddy.speech`: white on dark gray
  - `ui.selected`: black on cyan
  - `ui.dim`: gray (for secondary info)
  - `status.offline`: yellow
  - `status.error`: red
- **Spacing:** 1-cell padding inside boxes; 1-cell margin between components
- **Borders:** single-line blessed border style
- **Design files:** N/A — ASCII art is the design

## Key User Flows

### Flow 1 — Cold Start (no existing buddy)
```
run ascii-buddy
  └─► detect no data.json
      └─► show welcome screen + prompt for API key
          └─► call --new flow automatically
              └─► open CompanionScreen with new buddy
```

### Flow 2 — Normal Start (active buddy exists)
```
run ascii-buddy
  └─► read data.json
      └─► load active buddy
          └─► render CompanionScreen (< 3s)
              └─► idle animation starts
                  └─► phrase generated after 5s delay
```

### Flow 3 — Buddy Picker (--list flag)
```
run ascii-buddy --list
  └─► read all buddies from storage
      └─► open BuddyPickerScreen
          ├─► LEFT PANEL: scrollable list (name + talent)
          ├─► RIGHT PANEL: animated buddy preview
          └─► keyboard nav:
              ├─► ↑/↓: move selection → preview updates
              ├─► Enter: set as active → open CompanionScreen
              └─► ESC / q: exit without changing active buddy
```

### Flow 4 — Create New Buddy (--new flag)
```
run ascii-buddy --new
  └─► show "generating..." spinner
      └─► call AIProvider.generateBuddyMetadata()
          └─► assign random species template
              └─► save to storage, set as active
                  └─► open CompanionScreen with new buddy
```

### Flow 5 — Phrase Generation (within CompanionScreen)
```
idle animation running
  └─► timer fires (every 30s by default)
      └─► buddy transitions to "talking" mood
          └─► show "..." in speech bubble (thinking state)
              └─► call AIProvider.generatePhrase()
                  ├─► success: display phrase in bubble, clear after 8s
                  │           transition back to idle
                  └─► failure: show fallback phrase, show offline indicator
```

## Screen Layouts

### CompanionScreen (Full Mode ≥ 80 cols)
```
┌─────────────────────────────────────────────────────────────────┐
│  ascii-buddy  [buddyName] · [talent]            [q: quit]       │
├──────────────────────┬──────────────────────────────────────────┤
│                      │  ╭────────────────────────────────────╮  │
│   [ASCII BUDDY ART]  │  │  "Your type system is held         │  │
│                      │  │   together by hope and duct tape." │  │
│   (animation area)   │  ╰────────────────────────────────────╯  │
│                      │                                          │
│                      │  mood: idle  ·  last seen: just now      │
└──────────────────────┴──────────────────────────────────────────┘
  [n: new phrase]  [l: list buddies]  [q: quit]
```

### BuddyPickerScreen (--list)
```
┌─────────────────────────────────────────────────────────────────┐
│  ascii-buddy — Choose Your Companion           [ESC: cancel]    │
├────────────────────────────┬────────────────────────────────────┤
│  > Crash  · Bandicoot Wiz  │                                    │
│    Rex    · TypeScript God │      [ANIMATED BUDDY PREVIEW]      │
│    Glitch · Bug Whisperer  │                                    │
│    Nullref· GC Survivor    │      Name: Crash                   │
│                            │      Talent: Bandicoot Wiz         │
│                            │      "Spinning through null        │
│                            │       pointers since 1996."        │
└────────────────────────────┴────────────────────────────────────┘
  [↑/↓: navigate]  [Enter: select]  [d: delete]  [ESC: cancel]
```

## Accessibility Requirements
- **Keyboard navigation:** 100% — mouse never required
- **Color contrast:** text always readable in mono (no color-only information)
- **Screen reader:** not a target (terminal TUI has inherent limitations)
- **Minimum terminal size:** 40×20 with graceful degradation message

## Interaction Patterns
- **Loading / thinking state:** `...` pulses in speech bubble (3 dots cycling)
- **Empty state (no buddies):** welcome screen with auto-start of `--new` flow
- **Error state:** inline message in dim red; app continues running
- **Confirmation dialogs:** inline prompt "Delete Crash? [y/N]" — default is NO
- **Quit:** `q` or `Ctrl+C` — always restores terminal state before exit

## Animation States & Frame Timing
| State    | FPS | Loop |
|----------|-----|------|
| idle     | 1   | yes  |
| talking  | 4   | yes (while generating), then hold last frame |
| happy    | 3   | yes (for 3s then return to idle) |
| sad      | 1   | yes  |
| sleeping | 0.5 | yes  |

---

## ASCII Buddy Templates

### Species: Crash Bandicoot (`crash`)

All frames are 9 lines × 11 chars. The companion area is a fixed 11×9 Box in blessed.

#### idle — frame 1 (eyes open)
```
   ___
  /O O\
 ( >∆< )
  \___/
  /| |\
 /_| |_\
   | |
  _|_|_
 (_/ \_)
```

#### idle — frame 2 (blink)
```
   ___
  /- -\
 ( >∆< )
  \___/
  /| |\
 /_| |_\
   | |
  _|_|_
 (_/ \_)
```

#### happy — frame 1 (arms up)
```
   ___
  /^O^\
 ( >∆< )
  \___/
\\ /| |\ //
 \/_| |_\/
   | |
  _|_|_
 (_/ \_)
```

#### happy — frame 2 (arms higher)
```
   ___
  /^∆^\
 ( >O< )
  \___/
\\\\  |  ////
 \/_| |_\/
   | |
  _|_|_
 (_/ \_)
```

#### talking — frame 1 (mouth closed)
```
   ___
  /O O\
 ( >-< )
  \___/
  /| |\
 /_| |_\
   | |
  _|_|_
 (_/ \_)
```

#### talking — frame 2 (mouth open)
```
   ___
  /O O\
 ( >o< )
  \___/
  /| |\
 /_| |_\
   | |
  _|_|_
 (_/ \_)
```

#### sad — frame 1
```
   ___
  /; ;\
 ( >∆< )
  \___/
  \| |/
 \_| |_/
   | |
  _|_|_
 (_/ \_)
```

#### sleeping — frame 1
```
   ___
  /- -\
 ( >∆< )
  \___/
  /| |\
 /_| |_\
   | |   z
  _|_|_   z
 (_/ \_)   Z
```

#### sleeping — frame 2 (z shift)
```
   ___
  /- -\
 ( >∆< )
  \___/
  /| |\
 /_| |_\
   | |    z
  _|_|_  z
 (_/ \_) z
```

---

### Species: Generic Dev (`generic-dev`)

Minimalist hooded hacker silhouette. 9 lines × 11 chars.

#### idle — frame 1
```
  _____
 /     \
| ^   ^ |
|  \_/  |
 \_____/
  |   |
  |   |
 /|   |\
/_|___|_\
```

#### idle — frame 2 (cursor blink on screen in front)
```
  _____
 /     \
| ^   ^ |
|  \_/  |
 \_____/
  |   |
  |___|
 /|   |\
/_|___|_\
```

#### talking — frame 1
```
  _____
 /     \
| o   o |
|  ---  |
 \_____/
  |   |
  |   |
 /|   |\
/_|___|_\
```

#### talking — frame 2
```
  _____
 /     \
| o   o |
|  ~~~  |
 \_____/
  |   |
  |   |
 /|   |\
/_|___|_\
```

#### happy — frame 1
```
  _____
 /     \
| *   * |
|  \_/  |
 \_____/
\ |   | /
  |   |
 /|   |\
/_|___|_\
```

#### sad — frame 1
```
  _____
 /     \
| .   . |
|  /^\  |
 \_____/
  |   |
  |   |
 /|   |\
/_|___|_\
```

#### sleeping — frame 1
```
  _____
 /     \
| -   - |
|  ___  |
 \_____/
  |   |
  |   |  z
 /|   |\ z
/_|___|_\ Z
```

---

## Known UX Constraints
- Terminal font affects ASCII art appearance — tested on JetBrains Mono, Fira Code, and macOS default monospace
- Windows CMD is not supported; WSL2 is supported
- Some terminal emulators render box-drawing characters at different widths — use ASCII-only characters in buddy art (no Unicode box chars inside frames)
- Speech bubble width is capped at 40 chars to ensure it fits in compact mode
