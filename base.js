/**
 * Robi rzeczy na elementach nie nodes
 */
export default class NoderBase {

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
		begining = false,

		type = null,
		disabled = false,
		value = null,
		placeholder = null,
		step = null,
		scalable = 0

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
	 * Szkaluje element typu input
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
