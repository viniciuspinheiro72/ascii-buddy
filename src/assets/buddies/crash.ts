import type { BuddyTemplate } from "@/domain/value-objects/buddy-template.js";

export const crash: BuddyTemplate = {
  id: "crash",
  displayName: "Crash",
  description: "A spinning marsupial who survives null pointers and production outages alike.",
  width: 11,
  height: 9,
  frames: {
    idle: [
      `   ___
  /O O\\
 ( >∆< )
  \\___/
  /| |\\
 /_| |_\\
   | |
  _|_|_
 (_/ \\_)`,
      `   ___
  /- -\\
 ( >∆< )
  \\___/
  /| |\\
 /_| |_\\
   | |
  _|_|_
 (_/ \\_)`,
    ],
    happy: [
      `   ___
  /^O^\\
 ( >∆< )
  \\___/
\\\\  |  //
 /| | |\\
   | |
  _|_|_
 (_/ \\_)`,
      `   ___
  /^∆^\\
 ( >O< )
  \\___/
\\\\\\  | ///
 /| | |\\
   | |
  _|_|_
 (_/ \\_)`,
    ],
    sad: [
      `   ___
  /; ;\\
 ( >∆< )
  \\___/
  \\| |/
 \\_| |_/
   | |
  _|_|_
 (_/ \\_)`,
    ],
    talking: [
      `   ___
  /O O\\
 ( >-< )
  \\___/
  /| |\\
 /_| |_\\
   | |
  _|_|_
 (_/ \\_)`,
      `   ___
  /O O\\
 ( >o< )
  \\___/
  /| |\\
 /_| |_\\
   | |
  _|_|_
 (_/ \\_)`,
    ],
    sleeping: [
      `   ___
  /- -\\
 ( >∆< )
  \\___/
  /| |\\
 /_| |_\\
   | |   z
  _|_|_  z
 (_/ \\_) Z`,
      `   ___
  /- -\\
 ( >∆< )
  \\___/
  /| |\\
 /_| |_\\
   | |    z
  _|_|_  z
 (_/ \\_)z  `,
    ],
  },
};
