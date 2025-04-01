import { calcCenter } from "./utils.mjs";

export default class extends HTMLElement {
	static observedAttributes = [
		'name',
		'src',
		'quantity'
	];

	#rect = {
		width: 147,
		height: 113
	};
	#lineMargin = 14;
	#nameLineCount = 1;

	constructor() {
		super();

		const shadow = this.attachShadow({ mode: 'open' });
		const shadowRootSheet = new CSSStyleSheet();
		shadowRootSheet.replaceSync(`
			:host {
				display: contents;
			}
		`);
		shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, shadowRootSheet];
		shadow.innerHTML = `
			<svg id="root" viewBox="0 0 ${this.#rect.width} ${this.#rect.height}" xmlns="http://www.w3.org/2000/svg" overflow="visible">
				<style>
					text {
						font-family: var(--bestiary-font-family, 'Dosis'), 'Dosis', sans-serif;
					}
					
					.color-1 {
						fill: var(--bestiary-text-color-1, #b38234);
					}

					.color-2 {
						fill: var(--bestiary-text-color-2, #228b22);
					}

					.drop-shadow {
						filter: url(#shadow);
					}
				</style>
				<defs>
					<filter id="shadow" height="180%">
						<feDropShadow dx="0" dy="6" stdDeviation="2" flood-color="#000" flood-opacity="0.2" />
					</filter>
				</defs>
				<g id="item-img" class="drop-shadow"></g>
				<g id="name" class="color-1" font-size="14px" font-weight="600" text-anchor="middle" dominant-baseline="middle">
					<text x="${this.#rect.width / 2}" y="${this.#rect.height / 2}">${this.getAttribute('name')}</text>
				</g>
				<text id="quantity" class="color-2" font-size="28px" font-weight="600" text-anchor="middle" dominant-baseline="hanging" x="${this.#rect.width / 2 + 11.3 / 4}" y="${this.#rect.height / 2}">${this.getAttribute('quantity')}×</text>
			</svg>
		`;
	}

	attributeChangedCallback(name, _, newValue) {
		switch (name) {
			case 'name':
				const words = newValue.split(' ');
				const maxLineLength = this.#rect.width;
				const lines = [];
				let currentLine = [];
				let currentLineLength = 0;

				for (let i = 0; i < words.length; i++) {
					const wordLength = words[i].length * 8; // assume each character 8px wide

					const addWordToLine = () => {
						currentLine.push(words[i]);
						currentLineLength += wordLength;
					};

					if (currentLineLength + wordLength <= maxLineLength || !currentLine.length) {
						addWordToLine();
						if (i > 0 || i < words.length - 1) {
							currentLineLength += 3; // assume 3px space between words
						}
					} else {
						lines.push(currentLine);
						currentLine = [];
						currentLineLength = 0;
						addWordToLine();
					}
				}

				// push last line
				if (currentLine.length) {
					lines.push(currentLine);
					currentLine = [];
					currentLineLength = 0;
				}

				if (lines.length > 4) {
					const lastLine = lines[3];
					const lastLineLength = lastLine.length * 8 + (lastLine.length - 1) * 3;
					const lastWord = lastLine.pop();
					if (lastLineLength <= maxLineLength - 10) {
						lastLine.push(lastWord + '…');
					} else {
						lastLine.push(lastWord.slice(0, lastWord.length - 1) + '…');
					}
					console.log(lastLine);
				}

				const finalLines = lines.slice(0, 4);
				this.#nameLineCount = finalLines.length;
				const middleLineNumber = finalLines.length / 2 + 0.5;
				const text = finalLines.map((line, index) =>
					`<text x="${this.#rect.width / 2}" y="${this.#rect.height / 2}" dy="${15 * (index + 1 - middleLineNumber)}">${line.join(' ')}</text>`);
				this.shadowRoot.getElementById('name').innerHTML = text.join('');
				this.shadowRoot.getElementById('quantity').setAttribute('dy', Math.min(middleLineNumber * this.#lineMargin, 32));

				if (this.shadowRoot.querySelector('#item-img > image')) {
					const img = this.shadowRoot.querySelector('#item-img > image');
					const imgHeight = Number(img.getAttribute('height'));
					const charHeight = 17;
					img.setAttribute('y', Math.max(0, Math.round(calcCenter(this.#rect.height, imgHeight) - imgHeight / 2 - charHeight / 2 - middleLineNumber * this.#lineMargin)));
				}

				break;
			case 'quantity':
				this.shadowRoot.getElementById('quantity').textContent = `${Math.max(parseInt(newValue), 0) || 0}×`;
				break;
			case 'src':
				const img = new Image();
				img.src = newValue;
				img.decode().then(() => {
					const charHeight = 17;
					const middleLineNumber = this.#nameLineCount / 2 + 0.5;
					this.shadowRoot.getElementById('item-img').innerHTML = `<image href="${newValue}" width="${img.width}" height="${img.height}" x="${calcCenter(this.#rect.width, img.width)}" y="${Math.max(0, Math.round(calcCenter(this.#rect.height, img.height) - img.height / 2 - charHeight / 2 - middleLineNumber * this.#lineMargin))}" />`;
				});
				break;
			default:
				break;
		}
	}

	createUntaintedElement() {
		const svgClone = this.shadowRoot.getElementById('root').cloneNode(true);
		svgClone.removeAttribute('id');
		svgClone.querySelectorAll('[id]:not(filter)').forEach((x) => x.removeAttribute('id'));
		return svgClone;
	}
}