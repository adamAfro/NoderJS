/**
 * Strona, wielkość, połaczenie z internetem itp.
 */
export class Website {

	static get hash() {

		return window.location.hash.substring(1);
	}

	static insertCSSDefaults({ className = "default" } = {}) {

		let styleSheet = document.createElement("style");

		styleSheet.innerHTML =
			`.${className} {margin:0;border:0}` +
			`.${className} button, .${className} input[type="submit"], .${className} input[type="reset"], .${className} input, .${className} a{background: none; color: inherit;border: none; outline: none;font: inherit; cursor: pointer;text-decoration: none;padding: 0;}` +
			`.${className} h1, .${className} h2, .${className} h3, .${className} h4, .${className} h5, .${className} h6{margin: 0; font-size: 100%; font-weight: normal;}` +
			`.${className} button::-moz-focus-inner{border: 0}`;

		document.querySelector("head").appendChild(styleSheet);
	}

	static expectUrlChange() {

		return new Promise((resolve, reject) => window.addEventListener("hashchange", () => this._resolveUrlChange(resolve)))
			.then(() => window.removeEventListener("hashchange", () => this._resolveUrlChange(resolve)));
	}

	static _resolveUrlChange(resolve) {

		resolve();
	}

	static call(
		url = null, {
		async = true,
		method = 'POST',
		// timer = null,
		header = { type: "Content-Type", value: "application/x-www-form-urlencoded" },
	} = {}, data = null) {

		return new Promise((resolve, reject) => {

			let request = new XMLHttpRequest();

			request.open(method.toUpperCase(), url, async);

			request.onload = function() {

				if (request.status >= 200 && request.status < 300) {

					try {
						resolve({
							valid: true,
							data: JSON.parse(request.response),
						});
					} catch (e) {
						resolve({
							valid: false,
							data: request.response
						});
					}
				} else {

					reject({
						status: request.status,
						statusText: request.statusText
					});
				}
			};

			request.setRequestHeader(header.type, header.value);

			if (data) // zakodowanie
				data = Object.keys(data).map(key => key + '=' + data[key]).join('&');

			request.send();
		});
	}
}

/**
 * Interwały i czas w formie obietnic
 */
export class Timer {

	/**
	 * Jeśli nie ma callbacku to nie zaczyna się odliczanie
	 */
	constructor(nIter = 1, delay = 0, callback = null) {

		this.delay = this._id = this.callback =
			null;

		this.done = false;
		this.iter = 0;
		this.nIter = nIter;

		if (delay) {

			this.delay = delay;

			if (callback) {

				this.callback = callback;

				this.start();
			}
		}
	}

	static Promise(nIter = 1, delay = 0, callback = null) {

		return new Promise((resolve, reject) => {

			let timer = new Timer(nIter, delay, (iter) => callback(iter) && resolve());
		});
	}

	/**
	 * Zatrzymuje
	 */
	stop() {

		window.clearInterval(this._id);
		this._id = null;

	}

	/**
	 * Rozpoczyna po zatrzymaniu
	 */
	start() {

		if (!this._id) {
			this._update();
		}
	}

	_update() {

		this._id = window.setInterval(() => this._execute(), this.delay);
	}

	_execute() {

		if (this.iter < this.nIter) {

			this.callback(this.iter);

			this.iter++;

		} else {

			this.done = true;

			this.stop();

		}
	}

	static sleep(delay) {

		return new Promise((resolve, reject) => window.setTimeout((delay) => resolve(), delay));
	}
}
