/**
 *
 */
class NoderBase {

	constructor(element) {

		this.target = this._getTargetFrom(element);
  }

	/**
	 * Tworzy nowy element html
	 */
	_create({

    element = null,

    tag = "div",

		id = null, classes = "", styles = {},

		previous = null, parent = null, begining = false,

		html = null, text = null,

		data = null,

		type = null, disabled = false, value = null, placeholder = null, step = null, scalable = 0

	} = {}) {

    if (!element)
		  element = document.createElement(tag);

		if (previous)
			previous.parentElement.insertBefore(element, previous.nextSibling);
		else if (parent) {

			if(parent instanceof NoderBase)
				parent = parent.target;

			if (begining)
				parent.prepend(element)
			else
				parent.appendChild(element);

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

				if (step)
					element.step = step;

        break;

			case "textarea":

				if (value)
					element.value = value;

        if (scalable) {

    			this._scaleTextarea(element, scalable);

    			element.addEventListener("input", () => this._scaleTextarea(element, scalable));
    		}

				break;

      case "img":
        if (value) {
          element.src = value;
          element.alt = ":(";
        }
        break;

      case "a":

        if (value)
          element.href = value;
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

		if (styles)
			this._mapStyles(styles).forEach((property, name) => element.style[name] = property);

		if (data)
			Object.entries(data).forEach(entry => element.setAttribute("data-" + entry[0], entry[1]))


		return element;
	}

	/**
	 * Szkaluje element typu input
	 */
	_scaleInput(input, min = 5) {

		input.size = (input.value.length >= min) ? input.value.length : min;
	}

	_scaleTextarea(textarea, min = 3) {

		// TODO
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
  _mapStyles(styles) {

    let stylesMap = new Map();

    if (typeof styles == "string") {

      styles = styles.split(";");

      for (let i = 0; i < styles.length; i++) {

				let
					name = styles[i].substring(0, styles[i].indexOf(":")).replace(/\s/g, ''),
					property = styles[i].substring(styles[i].indexOf(":") + 1);

        stylesMap.set(name, property);
      }
    }

    return stylesMap;
  }

	/**
	 * Zwraca element html dla Noderów
	 */
	_getTargetFrom(element) {

		if (!element) {

      throw "Noder: null";

    } else if (element instanceof Noder) {

			return element.target;

		} else if (NoderBase.isHTMLElement(element)) {

      return element;

    } else if (typeof element == "object") {

      return this._create(element);

    } else {

      throw "Noder: type";

    }
	}

	_getTypeOf(element) {

		if (!element) {

      throw "Noder: null";

    } else if (element instanceof Noder) {

			return "noder";

		} else if (NoderBase.isHTMLElement(element)) {

      return "dom";

    } else if (typeof element == "object") {

      return "argument";

    } else {

      throw "Noder: type";

    }
	}

  /**
   * https://stackoverflow.com/a/384380
   *
   * Returns true if it is a DOM element
   */
  static isHTMLElement(o){
    return (
      typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
      o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
    );
  }
}


/**
 * Nakładka na element
 */
export class Noder extends NoderBase {

  constructor(element) {

    super(element);

		this.triggers = new Map();
  }

	/**
	 * Usuwa zawartość elementu
	 */
	clear() {

		this.target.innerHTML = "";
	}

	/**
	 * Usuwa element
	 */
  remove() {

    this.target.remove();
  }

	/**
	 * Sprawdza czy element należy do drzewa dom
	 */
	belongs() {

		return this.target.parentElement ? true : false;
	}

	/**
	 * Pozycja i wielkość elementu
	 */
	get offset() {

		return {
			top: this.target.offsetTop,
			left: this.target.offsetLeft,
			height: this.target.offsetHeight,
			width: this.target.offsetWidth,
			center: {
				top: this.target.offsetTop + this.target.offsetHeight / 2,
				left: this.target.offsetLeft + this.target.offsetWidth / 2,
			}
		}
	}

	/**
	 * Zwraca element-rodzica jako obiekt Noder
	 */
	get parent() {

		if (this.target.parentElement)
			return new Noder(this.target.parentElement);
	}

	/**
	 * Zmienia rodzica elementu
	 */
	moveTo(newParent) {

		this._getTargetFrom(newParent).appendChild(this.target);
	}


	/**
	 * Atrybut html elementu
	 */
	attr(name, { remove = false, replacement = null }) {

		let lastAttr = this.target.getAttribute(name);

		if (remove)
			this.target.removeAttribute(name);
		else if (replacement)
			this.target.setAttribute(name, replacement);

		return lastAttr;
	}

	/**
	 * Atrybut html typu data
	 */
	data(name, options) {

		return this.attr("data-" + name, options);
	}


	static select(selector) {

		let element = document.querySelector(selector);

		return element ? new Noder(element) : null;
	}

	select(selector) {

		let element = this.target.querySelector(selector);

		return element ? new Noder(element) : null;
	}


	/**
	 * Dodaje styl css
	 */
  setStyles(styles) {

    styles = this._objectStyles(styles);

		// Object.keys(styles).forEach(key => console.log(key + ": " + styles[key]))
    Object.keys(styles).forEach(key => this.target.style[key] = styles[key]);
  }

	/**
	 * Zmienia style i usuwa stare
	 */
  set styles(styles) {

    this.target.removeAttribute("style");

    this.setStyles(styles);
  }



	/**
	 * Dodaje klasy present i usuwa absent
	 */
	classify({ present = [], absent = [] }) {

		if (present && present.length) {

			present = this._arrayClasses(present);

			present.forEach((cls) => {

				if (!this.target.classList.contains(cls))
					this.target.classList.add(cls);
			});
		}

		if (absent && absent.length) {

			absent = this._arrayClasses(absent);

			absent.forEach((cls) => {

				if (this.target.classList.contains(cls))
					this.target.classList.remove(cls);
			});
		}
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

    let absent = Array.from(this.target.classList).filter(x => !present.includes(x));

    this.classify({ present, absent });
  }


	/**
	 * Obietnica eventu
	 */
	expectEvent(type) {

		return new Promise((resolve, reject) => {

			this.target.addEventListener(type, e => this._handleEvent(e, resolve))

		}).then(e => {

			this.target.removeEventListener(type, e => this._handleEvent(e, resolve));

			return e;
		});
	}

	addTrigger(name, type, callback) {

		this.target.addEventListener(type, callback, false);

		this.triggers.push(name, {
			remove: () => this.target.removeEventListener(type, callback, false)
		});
	}

	/**
	 * Zwraca specyficzną wartość elementu
	 */
	get value() {

		let tag = this.target.tagName.toLowerCase();

		switch (tag) {

			case "a": {
				return this.target.href;
			} break;

			case "img": {
				return this.target.src;
			} break;

			case "select": case "input": case "button": {

				if (this.target.type == "number") {

					if (this.target.step == "1") // TODO regex dla całkowitych
						return parseInt(this.target.value);
					else
						return parseFloat(this.target.value);

				} /* else if() {

				} */ else
					return this.target.value;

			} break;

			/* case "textarea": {

			} break; */

			default: {

			} break;
		}

	}

	/**
	 * Ustala specyficzną wartość elementu
	 */
	set value(value) {

		let tag = this.target.tagName.toLowerCase();

		switch (tag) {

			case "a": {
				this.target.href = value;
			} break;

			case "img": {
				this.target.src = value;
			} break;

			case "select": case "input": case "button": {
				this.target.value = value
			} break;

			/* case "textarea": {

			} break; */

			default: {

			} break;
		}
	}

	get html() {

		return this.target.innerHTML;
	}

	set html(html) {

		this.target.innerHTML = html;
	}

	get text() {

		return this.target.innerText;
	}

	set text(text) {

		this.target.innerText = text;
	}
}
