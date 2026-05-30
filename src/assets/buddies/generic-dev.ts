import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";

export const genericDev: BuddyTemplate = {
  id: "generic-dev",
  displayName: "Dev",
  description: "A hooded terminal hermit who has seen things. Many things. All of them at 3am.",
  width: 9,
  height: 5,
  frames: {
    idle: [
      `  _____
 /     \\
| ^   ^ |
|  \\_/  |
 \\_____/`,
      `  _____
 /     \\
| -   - |
|  \\_/  |
 \\_____/`,
    ],
    happy: [
      `  _____
 /     \\
| *   * |
|  \\∆/  |
 \\_____/`,
      `  _____
 /     \\
| *   * |
|  /∆\\  |
 \\_____/`,
    ],
    sad: [
      `  _____
 /     \\
| .   . |
|  /^\\  |
 \\_____/`,
    ],
    talking: [
      `  _____
 /     \\
| o   o |
|  ---  |
 \\_____/`,
      `  _____
 /     \\
| o   o |
|  ~~~  |
 \\_____/`,
    ],
    sleeping: [
      `  _____
 /     \\
| -   - |
|  ___  |
 \\_____/z`,
      `  _____
 /     \\
| -   - |
|  ___  |
 \\_____/ Z`,
    ],
  },
};
