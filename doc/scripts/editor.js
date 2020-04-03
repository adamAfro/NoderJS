class NoderEditor extends Noder {

  constructor({ target, container = null }) {

    super({ tag: "section", classes: "editor", container });

    this.demo = target;

    this.tag = new Noder({ tag: "select", classes: "select heading", container: this, placeholder: "Tag" });

    // Wszystkie opcje: ["id", "classes", "styles", "text", "html", "alt", "data", "type", "disabled", "placeholder", "step", "scalable"]
    this.modes = [
      { tags: ["div", "section", "address", "p"], nodes: ["id", "classes", "styles", "text", "html"] },
      { tags: ["a"], nodes: ["id", "classes", "styles", "text", "html", "value"] },
      { tags: ["img"], nodes: ["id", "classes", "styles", "text", "html", "value", "placeholder"] },
    ];

    this.modes.forEach(mode => mode.tags
      .forEach(tagName => new Noder({ tag: "h3", text: tagName,
        container: new Noder({ tag: "option", container: this.tag, value: tagName }) })));

    this.tag.addTrigger("selfing", "change", () => this._selfUpdate());

    this._setFields();
    this._update();
    this._selfUpdate();
  }

  _setFields() {

    this.fields = new Map();

    this._addField("styles", { classes: "fullline", placeholder: "CSS" });
    this._addField("id", { prefix: "#", placeholder: "Id" });
    this._addField("classes", { prefix: ".", placeholder: "Klasy" });
    this._addField("text", { classes: "fullline", placeholder: "Tekst" });
    this._addField("html", { classes: "fullline", placeholder: "HTML" });
    this._addField("value", { placeholder: "Źródło" });
    this._addField("type", { placeholder: "Typ" });
    this._addField("disabled", { placeholder: "On/Off" });
    this._addField("placeholder", { placeholder: "Placeholder" });
    this._addField("step", { placeholder: "Stopień zmiany" });
    this._addField("scalable", { placeholder: "Skaluj (minimalny rozmiar)" });

    this.fields.forEach((node, property) => node.addTrigger("noding", "change", () => this._update()));
  }

  _addField(name, { prefix = "", placeholder = "", classes = "" }) {

    let container = new Noder({ tag: "label", text: prefix, classes, container: this });

    this.fields.set(name, new Noder({ tag: "input", classes: "field string", container, placeholder, scalable: 5 }));
  }

  /**
   * Ukrywa i odkrywa pola inputu
   */
  _selfUpdate() {

    let tag = this.tag.value;

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

  /**
   * Aktualizuje edytowany element
   */
  _update() {

    let properties = {
      container: this.demo.getContainer()
    };

    this.demo.remove();
    this.fields.forEach((node, property) => properties[property] = node.value);

    this.demo = new Noder(properties);
  }
}
