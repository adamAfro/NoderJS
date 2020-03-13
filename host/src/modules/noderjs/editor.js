import { Noder } from "./index.js";

export class NoderEditor extends Noder {

  constructor({ target, parent = null }) {

    super({ tag: "section", classes: "editor", parent });

    this.demo = target;

    this.fields = new Map();
    this.fields.set("tag", new Noder({ tag: "select", classes: "select heading", parent: this, placeholder: "Tag" }));
    this.addField("styles", { classes: "fullline", placeholder: "CSS" });
    this.addField("id", { prefix: "#", placeholder: "Id" });
    this.addField("classes", { prefix: ".", placeholder: "Klasy" });
    this.addField("text", { classes: "fullline", placeholder: "Tekst" });
    this.addField("html", { classes: "fullline", placeholder: "HTML" });
    this.addField("value", { placeholder: "Źródło" });
    this.addField("type", { placeholder: "Typ" });
    this.addField("disabled", { placeholder: "On/Off" });
    this.addField("placeholder", { placeholder: "Placeholder" });
    this.addField("step", { placeholder: "Stopień zmiany" });
    this.addField("scalable", { placeholder: "Skaluj (minimalny rozmiar)" });


    // Wszystkie opcje: ["tag", "id", "classes", "styles", "text", "html", "alt", "data", "type", "disabled", "placeholder", "step", "scalable"]

    this.modes = [
      { tags: ["div", "section", "address", "p"], nodes: ["tag", "id", "classes", "styles", "text", "html"] },
      { tags: ["a"], nodes: ["tag", "id", "classes", "styles", "text", "html", "value"] },
      { tags: ["img"], nodes: ["tag", "id", "classes", "styles", "text", "html", "value", "placeholder"] },
    ];

    this.modes.forEach(mode => mode.tags
      .forEach(tagName => {

        let option = new Noder({ tag: "option", parent: this.fields.get("tag"), value: tagName });

        new Noder({ tag: "h3", parent: option, text: tagName });

      }));

    this.fields.get("tag").addTrigger("selfing", "change", () => this.selfUpdate());
    this.fields.forEach((node, property) => node.addTrigger("noding", "change", () => this.update()));

    this.update();
    this.selfUpdate();
  }

  addField(name, { prefix = "", placeholder = "", classes = "" }) {

    let parent = new Noder({ tag: "label", text: prefix, classes, parent: this });

    this.fields.set(name, new Noder({ tag: "input", classes: "field string", parent, placeholder, scalable: 5 }));
  }

  selfUpdate() {

    let tag = this.fields.get("tag").value;

    let j;
    if (this.modes.some((mode, i) => {

      if (mode.tags.includes(tag)) {
        j = i;
        return true;
      }

    })) {

      let
        all = Array.from(this.fields.keys()),
        visible = this.modes[j].nodes;

      let hidden = all.filter(node => !visible.includes(node));

      visible.forEach((nodeName => this.fields.get(nodeName).setStyles("display:initial")));
      hidden.forEach((nodeName => this.fields.get(nodeName).setStyles("display:none")));
    }
  }

  update() {

    let parent = this.demo.parent;
    this.demo.remove();

    let properties = {};
    properties.parent = parent;
    this.fields.forEach((node, property) => properties[property] = node.value);

    this.demo = new Noder(properties);
  }
}
