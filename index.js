import NoderBase from './base.js';

/**
 * Nakładka na element
 */
export class Noder extends NoderBase {

  constructor(element) {

    super();

		/**
		 * Element głowny
		 */
		this.target = null;
    this.setTarget(element);
  }

	clear() {

		this.target.innerHTML = "";
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

	dataRemove(name) { this.target.removeAttribute("data-" + name) }

	/**
	 * Usuwa stary element główny i zmienia na nowy
	 */
  setTarget(element) {

    if (this.target) {

      this.target.remove();
		}

    if (!element) {

      throw "Noder: null";

    } else if (element instanceof Noder) {

			this.target = element.target;

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

    this.target.remove();
  }

	/**
	 * Zmienia rodzica elementu
	 */
	move(parent) {

		parent.appendChild(this.target);
	}


	static select(selector) {

		let element = document.querySelector(selector);

		return new Noder(element);
	}

	select(selector) {

		let element = this.target.querySelector(selector);

		return new Noder(element);
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

		return new Promise((resolve, reject) => {

			this.target.addEventListener(type, e => this._handleEvent(e, resolve))

		}).then(e => {

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


	addChar(char) {

		this.target.innerHTML = this.target.innerText + char;
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

	get input() {

		let input;

		if (this.target.type == "number") {

			if (this.target.step == "1")
				input = parseInt(this.target.value);
			else
				input = parseFloat(this.target.value);

		} else {

			input = this.target.value;

		}

		return input;
	}

	set input(input) { this.target.value = input }
}

var WidgetFoundations = {

	MouseCircle: class extends Noder {

		constructor(element, {
			onMouseDown = true
		} = {}) {
			super(element);

			this._mouseDown();

	    this.onMouseDown = onMouseDown;

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

						/* TODO: opt */
						if (horizontal) {
							if ((onLeft && toTop) || (onRight && toBottom));
							else
								angle = -angle;

						} else {
							if ((onTop && toRight) || (onBottom && toLeft));
							else
								angle = -angle;
						}

						this.cursor = { top, left	}

						return angle;
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
	},
}

export var Widgets = {

	/**
	 * @TODO: kręcenie nie jest dokładne
	 */
	Wheel: class extends WidgetFoundations.MouseCircle {

	  constructor(element, mouseAttr, {
			delay = 50
		} = {}) {

	    super(element, mouseAttr);

			this.delay = delay;

	    this._onRotation = () => { return }
	  }

	  set onRotation(callback) { this._onRotation = callback }

	  rotate() {

	    if (this.onMouseDown)
	      this.expectEvent("mousedown").then(() => this._rotate());
	    else
	      this._rotate();
	  }

	  _rotate() { this.handleWheel().then(() => this.rotate()) }

	  handleWheel() {

	    return this.expectMouseCircle()
	      .then((angle) => {

	        if (!angle)
	          return;

	        let //regex: https://regex101.com/
	          style = this.target.style.transform,
	          regex = /rotate\((\-{0,1}\d*\.{1}\d*)\w*\)/;
	        style = regex.exec(style);

	        let presentAngle = style ? style[1] : 0;
	        let newAngle = parseFloat(presentAngle) + angle;

	        if (presentAngle > 0 || angle > 0)
	          this.setStyles(`transform: rotate(${newAngle}rad);`);

	        this._onRotation(angle);
	      })

	      .finally(() => Timer.sleep(this.delay))
	      .then(() => {

	        if (!this.onMouseDown || this.mouseDown)
	          this.handleWheel();
	      });
	  }
	},

	// Calendar: class extends Noder {
	//
	// 	constructor(target) {
	//
	// 		super(target);
	//
	// 		this.today = new Date();
	// 		this.year = null;
	// 		this.month = null;
	// 		this.table = new Noder({ tag: "table", classes: "days", parent: this });
	//
	// 		this.signDays();
	//
	//
	// 		this.days = [];
	//
	// 	}
	//
	// 	/**
	// 	 * @author https://stackoverflow.com/a/16353241
	// 	 */
	// 	isLeapYear() {
	//
	// 		return ((this.year % 4 == 0) && (this.year % 100 != 0)) || (this.year % 400 == 0);
	// 	}
	//
	// 	_daysN() {
	//
	// 		if (!this.year)
	// 			this.year = this.today.getFullYear();
	//
	// 		if (!this.month)
	// 			this.month = this.today.getMonth();
	//
	// 		if ([0,2,4,6,7,9,11].includes(this.month))
	// 			return 31;
	// 		else if ([3,5,8,10].includes(this.month))
	// 			return 30;
	// 		else if (this.isLeapYear())
	// 			return 29;
	// 		else
	// 			return 28;
	// 	}
	//
	// 	iterDays() {
	//
	// 		let
	// 			pause = new Date(this.year, this.month, 0).getDay(),
	// 			daysN = this._daysN();
	//
	// 		for (let i = 0; i < daysN; i++) {
	//
	// 			let text;
	// 			if (i < pause)
	// 				text = "";
	// 			else
	// 				text = i + 1;
	//
	// 		}
	// 	}
	//
	// 	signDays() {
	//
	// 		let
	// 			parent = new Noder({ tag: "tr", classes: "week",
	// 				parent: new Noder({ tag: "thead", parent: this.table })
	// 			}),
	// 			names =
	// 				//["monday", "thuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
	// 				["poniedziałek", "wtorek", "środa", "czwartek", "piątek", "sobota", "niedziela"];
	//
	// 		for (let i = 0; i < 7; i++)
	// 			new Noder({ tag: "th", text: names[i], classes: "name", parent });
	// 	}
	// }
};
