
'use strict';

var Timer = class {

	constructor(delay = 0, callback = null, nIter = 0) {

		this.delay = this._id = this.callback = null;

		if (delay) {

			this.delay = delay;

			if (callback) {

				this.callback = callback;

				this._update();
			}
		}
	}

	stop() {

		window.clearInterval(this._id);
		this._id = null;

	}

	start() {

		if (!this._id) {
			this._update();
		}
	}

	_update() {
		this._id = window.setInterval(this.callback, this.timer);
	}

	static sleep(delay) {

		return new Promise((resolve, reject) => window.setTimeout((delay) => resolve(), delay));
	}
}

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
				parent.target.appendChild(element);
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
		this.target = null;
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
			this.target.setAttribute(name, replacement);

		return this.target.getAttribute(name);
	}

	/**
	 * Atrybut html typu data
	 */
	data(name, replacement) {

		if (replacement)
			this.target.setAttribute("data-" + name, replacement);

		return this.target.getAttribute("data-" + name);
	}

	/**
	 * Usuwa stary element główny i zmienia na nowy
	 */
  set self(element) {

    if (this.target)
      this.target.remove();

    if (!element) {

      throw "Noder: null";

    } else if (NoderBase.isElement(element)) {

      this.target = element;

    } else if (typeof element == "object") {

      this.target = this._create(element);

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

    this.target.remove();
  }

	/**
	 * Zmienia rodzica elementu
	 */
	move(parent) {

		parent.appendChild(this.target);
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
      element.parent = this.target;

    this.menials.set(name, new Noder(element));

		return this.menials.get(name);
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
	 * Obietnica eventu
	 */
	expectEvent(type) {

		return new Promise((resolve, reject) =>
			this.target.addEventListener(type, e => this._handleEvent(e, resolve))
		).then(e => {
			this.target.removeEventListener(type, e => this._handleEvent(e, resolve));

			return e;
		});
	}

	getOffset() {

		return this.offset;
	}

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
}

/**
 * Element, który ogarnia ruch myszki nad nim jak na kole
 */
var MouseNoder = class extends Noder {

	constructor(element) {
		super(element);

		this._mouseDown();

		this.cursor = {};
	}

	/**
	 * Ogarnia ruch kursora po kliknięciu
	 */
  expectMouseCircle() {

    return this.expectEvent("mousemove")
			.then((move) => {

				let offset = this.getOffset();

				// relatywnie do środka jak funkcje matematyczne
        let
          top = offset.center.top - move.clientY,
          left = move.clientX - offset.center.left;

				if (this.cursor.top && this.cursor.left) {

					let angle,
						x = Math.sqrt(this.cursor.top**2 + this.cursor.left**2),
						r = Math.sqrt(top**2 + left**2);
					angle = Math.atan(x/r); // nwm czemu tangens, ale cosinus nie działa


					let // Redukcja dokładności
						height = Math.abs(top - this.cursor.top),
						width = Math.abs(left - this.cursor.left);

					let wise;
					// TODO opt:
					let
						vertical = (height > width),
						onTop = (top > 0),
						onLeft = (left < 0),
						toTop = (top > this.cursor.top),
						toLeft = (left < this.cursor.left);

					let
						horizontal = !vertical,
						onBottom = !onTop,
						onRight = !onLeft,
						toBottom = !toTop,
						toRight = !toLeft;


					if (horizontal) {

						if ((onLeft && toTop) || (onRight && toBottom))
							wise = 1;
						else
							wise = -1;

					} else {

						if ((onTop && toRight) || (onBottom && toLeft))
							wise = 1;
						else
							wise = -1;

					}

					this.cursor = { top, left	}

					return { angle, wise };
				}

				this.cursor = { top, left	}
	    });
  }

	_mouseDown() {

		return this.expectEvent("mousedown").then((click) => {

			let offset = this.getOffset();

			// relatywnie do środka jak funkcje matematyczne
			this.cursor = {
				top: offset.center.top - click.clientY,
				left: click.clientX - offset.center.left
			}

			this.mouseDown = true;

			this.expectEvent("mouseup").then(() => this.mouseDown = false);
		}).then(() => this._mouseDown());
	}
}
