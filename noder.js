
'use strict';

/**
 * Robi rzeczy na elementach nie nodes
 */
var NoderBase = class {

	/**
	 * Tworzy nowy element html
	 */
	_create({

    element = null,

    tag = "div",
		id = null,
		classes = "",
		styles = {},

		html = null,
		text = null,
		href = null,
		src = null,
		data = null,

		previous = null,
		parent = null,

		type = null,
		disabled = false,
		value = null,
		placeholder = null,
		scalable = 0

	} = {}) {

    if (!element)
		  element = document.createElement(tag);

		if (previous)
			previous.parentElement.insertBefore(element, previous.nextSibling);
		else if (parent) {

			if (NoderBase.isElement(parent)) {
				parent.appendChild(element);
			} else if(parent instanceof Noder) {
				parent._self.appendChild(element);
			}

		}


    switch (tag) {

      case "input":

        if (scalable) {

    			this._scaleInput(element, scalable);

    			element.addEventListener("input", () => this._scaleInput(element, scalable));
    		}

        if (type)
          element.type = type;

        if (disabled)
          element.disabled = true;

        if (value)
          element.value = value;

        if (placeholder)
          element.placeholder = placeholder;

        break;

      case "img":
        if (src) {
          element.src = src;
          element.alt = ":(";
        }
        break;

      case "a":

        if (href)
          element.href = href;
        else
          element.href = "javascript:;";

      default:

        if (html)
          element.innerHTML = html;

        if (text)
          element.innerText = text;

    }

		if (id)
			element.id = id;

		if (classes)
      this._arrayClasses(classes).forEach((cls) => element.classList.add(cls));

		if (styles) {

      styles = this._objectStyles(styles);

      Object.keys(styles).forEach(key => element.style[key] = styles[key]);
    }

		if (data)
			Object.entries(data).forEach(entry => element.setAttribute("data-" + entry[0], entry[1]))


		return element;
	}

	/**
	 * Szkaluje papieża i element typu input
	 */
	_scaleInput(input, min = 5) {

		input.size = (input.value.length >= min) ? input.value.length : min;
	}

	/**
	 * TODO ogarnia eventy obiektami typu promise
	 */
	_handleEvent(e, resolve) {

		resolve(e);
	}

	/**
	 * Npdst argumetnu wydaje klasy w tablicy
	 */
  _arrayClasses(classes) {

    if (typeof classes == "string") {
			classes = classes.split(" ");
    }

    classes.filter(x => x == "");
    // filtry

    return classes;
  }

	/**
	 * Wydaje style w formie obiektu: nazwa css => styl
	 */
  _objectStyles(styles) {

    let objectStyles = {};

    if (typeof styles == "string") {

      styles = styles.split(";");

      for (var i = 0; i < styles.length; i++) {

				let
					name = styles[i].substring(0, styles[i].indexOf(":")),
					property = styles[i].substring(styles[i].indexOf(":") + 1);

        objectStyles[name] = property;
      }
    }

    return objectStyles;
  }

  /**
   * https://stackoverflow.com/a/384380
   *
   * Returns true if it is a DOM element
   */
  static isElement(o){
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
  }
}

/**
 * Nakładka na element
 */
var Noder = class extends NoderBase {

  constructor(element) {

    super();

		/**
		 * Element głowny
		 */
		this._self = null;
    this.self = element;

		/**
		 * Elementy pachołki
		 */
    this.menials = new Map();
  }

	/**
	 * Atrybut html elementu
	 */
	attribute(name, replacement) {

		if (replacement)
			this._self.setAttribute(name, replacement);

		return this._self.getAttribute(name);
	}

	/**
	 * Atrybut html typu data
	 */
	data(name, replacement) {

		if (replacement)
			this._self.setAttribute("data-" + name, replacement);

		return this._self.getAttribute("data-" + name);
	}

	/**
	 * Usuwa stary element główny i zmienia na nowy
	 */
  set self(element) {

    if (this._self)
      this._self.remove();

    if (!element) {

      throw "Noder: null";

    } else if (NoderBase.isElement(element)) {

      this._self = element;

    } else if (typeof element == "object") {

      this._self = this._create(element);

    } else {

      throw "Noder: type";

    }
  }

	/**
	 * Usuwa element i pachołków`
	 */
  remove() {

		this.menials.forEach(menial => menial.remove());

		this.menials = new Map();

    this._self.remove();
  }

	/**
	 * Zmienia rodzica elementu
	 */
	move(parent) {

		parent.appendChild(this._self);
	}


	/**
	 * Sprawdza czy jest pachołek
	 */
	has(name) {

    return this.menials.has(name)
	}

	/**
	 * Wydaje pachołka npdst nazwy
	 */
  get(name) {

    return this.menials.get(name);
  }

	/**
	 * Dodaje pachołka
	 */
  set(name, element) {

    if (this.menials.has(name))
      this.menials.get(name).remove();

    if (element && !(NoderBase.isElement(element) || element.parent))
      element.parent = this._self;

    this.menials.set(name, new Noder(element));

		return this.menials.get(name);
  }


	/**
	 * Dodaje styl css
	 */
  addStyles(styles) {

    styles = this._objectStyles(styles);

    Object.keys(styles).forEach(key => this._self.style[key] = styles[key]);
  }

	/**
	 * Zmienia style i usuwa stare
	 */
  set styles(styles) {

    this._self.removeAttribute("style");

    this.addStyles(styles);
  }


	/**
	 * Dodaje klasy
	 */
  addClasses(classes) {

    classes = this._arrayClasses(classes);

    this.classify({ present: [classes] });
  }

	/**
	 * Usuwa klasy i dodaje nowe
	 */
  set classes(present = "") {

    present = this._arrayClasses(present);

    let absent = Array.from(this._self.classList).filter(x => !present.includes(x));

    this.classify({ present, absent });
  }

	/**
	 * Dodaje klasy present i usuwa absent
	 */
	classify({ present = [], absent = [] }) {

    if (present && present.length) {

      present = this._arrayClasses(present);

  		present.forEach((cls) => {

  			if (!this._self.classList.contains(cls))
  				this._self.classList.add(cls);
  		});
    }

    if (absent && absent.length) {

      absent = this._arrayClasses(absent);

  		absent.forEach((cls) => {

  			if (this._self.classList.contains(cls))
  				this._self.classList.remove(cls);
  		});
    }
	}

	/**
	 * Obietnica eventu
	 */
	expectEvent(type) {

		return new Promise((resolve, reject) =>
			this._self.addEventListener(type, e => this._handleEvent(e, resolve))
		).then(e => {
			this._self.removeEventListener(type, e => this._handleEvent(e, resolve));

			return e;
		});
	}
}
