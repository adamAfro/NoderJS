import { Noder } from "./src/modules/noderjs/index.js";
import { NoderEditor } from "./src/modules/noderjs/editor.js";
import { Website, Timer } from "./src/modules/noderjs/snips.js";
import { Float } from "./src/modules/noderjs/float.js";

let panel = new Float({ tag: "section", classes: "panel", container: document.body }, { title: "Edytor" });

panel.handler = new Noder({ tag: "header", classes: "handler" });
new Noder({ tag: "h2", container: panel.handler , text: "Edytor" });
let editor = new NoderEditor({ target: Noder.select("body .demo > div"), container: panel });
