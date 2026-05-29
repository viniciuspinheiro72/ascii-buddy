import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";

export const genericDev: BuddyTemplate = {
  id: "generic-dev",
  displayName: "Dev",
  description: "A hooded terminal hermit who has seen things. Many things. All of them at 3am.",
  width: 11,
  height: 9,
  frames: {
    idle: [
      `  _____
 /     \\
| ^   ^ |
|  \\_/  |
 \\_____/
  |   |
  |   |
 /|   |\\
/_|___|_\\`,
      `  _____
 /     \\
| -   - |
|  \\_/  |
 \\_____/
  |   |
  |___|
 /|   |\\
/_|___|_\\`,
    ],
    happy: [
      `  _____
 /     \\
| *   * |
|  \\∆/  |
 \\_____/
\\  |   | /
  \\|   |/
 /|   |\\
/_|___|_\\`,
      `  _____
 /     \\
| *   * |
|  /∆\\  |
 \\_____/
\\\\ |   |//
  \\|   |/
 /|   |\\
/_|___|_\\`,
    ],
    sad: [
      `  _____
 /     \\
| .   . |
|  /^\\  |
 \\_____/
  |   |
  |   |
 /|   |\\
/_|___|_\\`,
    ],
    talking: [
      `  _____
 /     \\
| o   o |
|  ---  |
 \\_____/
  |   |
  |   |
 /|   |\\
/_|___|_\\`,
      `  _____
 /     \\
| o   o |
|  ~~~  |
 \\_____/
  |   |
  |   |
 /|   |\\
/_|___|_\\`,
    ],
    sleeping: [
      `  _____
 /     \\
| -   - |
|  ___  |
 \\_____/
  |   |
  |   |  z
 /|   |\\ z
/_|___|_\\Z`,
      `  _____
 /     \\
| -   - |
|  ___  |
 \\_____/
  |   |
  |   | z
 /|   |\\z
/_|___|_\\ Z`,
    ],
  },
};
