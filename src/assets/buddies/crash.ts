import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";

export const crash: BuddyTemplate = {
  id: "crash",
  displayName: "Crash",
  description: "A spinning marsupial who survives null pointers and production outages alike.",
  width: 9,
  height: 4,
  frames: {
    idle: [
      `   ___
  /O O\\
 ( >∆< )
  \\___/`,
      `   ___
  /- -\\
 ( >∆< )
  \\___/`,
    ],
    happy: [
      `   ___
  /^O^\\
 ( >∆< )
  \\___/`,
      `   ___
  /^∆^\\
 ( >O< )
  \\___/`,
    ],
    sad: [
      `   ___
  /; ;\\
 ( >∆< )
  \\___/`,
    ],
    talking: [
      `   ___
  /O O\\
 ( >-< )
  \\___/`,
      `   ___
  /O O\\
 ( >o< )
  \\___/`,
    ],
    sleeping: [
      `   ___
  /- -\\
 ( >∆< )z
  \\___/`,
      `   ___
  /- -\\
 ( >∆< )
  \\___/ Z`,
    ],
  },
};
