// Maps neo-blessed to @types/blessed — the two are API-compatible.
declare module "neo-blessed" {
  import blessed = require("blessed");
  export = blessed;
}
