import { calcCenter } from './utils.mjs';

export default class extends HTMLElement {
	static observedAttributes = ['name', 'charactersrc', 'guild', 'emblemsrc', 'emblembgsrc'];

	#emblem;
	#emblemImg;
	#emblemBgImg;

	#rect = {
		width: 147,
		height: 113
	};

	constructor() {
		super();

		const shadow = this.attachShadow({ mode: 'open' });
		const shadowRootSheet = new CSSStyleSheet();
		shadowRootSheet.replaceSync(`
			:host {
				display: contents;
			}
			
			* {
				box-sizing: border-box;
				margin: 0;
			}

			.nametag {
				color: #fff;
				font-size: 12px;
				line-height: 13px;
				text-align: center;
			}

			p + p {
				margin-top: 1px;
			}

			.tag {
				background-color: rgba(10, 10, 10, 0.8);
				border-radius: 4px;
				display: inline-block;
				padding: 3px;
			}

			.guild {
				font-weight: 700;
			}

			.emblem {
				align-items: center;
				border-radius: 0;
				display: inline-grid;
				height: 17px;
				justify-items: center;
				margin-left: -18px;
				margin-right: 1px;
				vertical-align: text-top;
				width: 17px;
			}

			.emblem > * {
				grid-area: 1 / 1;
			}
		`);
		shadow.adoptedStyleSheets = [...shadow.adoptedStyleSheets, shadowRootSheet];
		shadow.innerHTML = `
			<svg class="root" viewBox="0 0 ${this.#rect.width} ${this.#rect.height}" xmlns="http://www.w3.org/2000/svg" overflow="visible">
				<style>
					.font-system {
						font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans',sans-serif,'Apple Color Emoji','Segoe UI Emoji','Segoe UI Symbol','Noto Color Emoji';
					}
				</style>
				<image id="character-image" href="${this.getAttribute('charactersrc')}" width="200" height="200" x="${calcCenter(this.#rect.width, 200) + 4}" y="-91" />
				<foreignObject width="${this.#rect.width}" height="50" x="0" y="74">
					<div class="nametag font-system" xmlns="http://www.w3.org/1999/xhtml">
						<p><span id="name" class="tag">${this.getAttribute('name')}</span></p>
					</div>
				</foreignObject>
			</svg>
		`;
	}

	#createEmblem() {
		const span = document.createElement('span');
		span.className = 'emblem';
		if (this.#emblemBgImg) span.append(this.#emblemBgImg);
		if (this.#emblemImg) span.append(this.#emblemImg);
		return span;
	}

	attributeChangedCallback(name, _, newValue) {
		const currentEmblemImg = this.#emblemImg;
		const currentEmblemBgImg = this.#emblemBgImg;

		const appendEmblem = () => {
			const emblemChanged = Boolean(
				this.#emblemImg?.src !== currentEmblemImg?.src && this.#emblemBgImg?.src !== currentEmblemBgImg?.src
			);
			const emblemInDOM = Boolean(this.shadowRoot.contains(this.#emblem));
			if ((emblemChanged || !emblemInDOM) && this.shadowRoot.getElementById('guild')) {
				if (this.#emblem) {
					this.#emblem.remove();
					this.#emblem = null;
				}
				const newEmblem = this.#createEmblem();
				if (newEmblem.childElementCount) {
					this.#emblem = newEmblem;
					this.shadowRoot
						.getElementById('guild')
						.insertBefore(this.#emblem, this.shadowRoot.getElementById('guildname'));
				}
			}
		};

		switch (name) {
			case 'name':
				this.shadowRoot.getElementById('name').textContent = newValue;
				break;
			case 'charactersrc':
				this.shadowRoot.getElementById('character-image').setAttribute('href', newValue);
				break;
			case 'guild':
				if (!newValue) {
					if (this.shadowRoot.getElementById('guild')) {
						this.shadowRoot.getElementById('guild').remove();
					}
				} else {
					if (this.shadowRoot.getElementById('guild')) {
						this.shadowRoot.getElementById('guild').innerHTML = `<span id="guildname" class="tag">${newValue}</span>`;
					} else {
						const guildTag = document.createElement('template');
						guildTag.innerHTML = `<p id="guild" class="guild"><span id="guildname" class="tag">${newValue}</span></p>`;
						this.shadowRoot.querySelector('.nametag').appendChild(guildTag.content);
					}
					appendEmblem();
				}
				break;
			case 'emblemsrc': {
				const emblemImg = new Image(15, 15);
				emblemImg.src = newValue;
				emblemImg.alt = '';
				emblemImg
					.decode()
					.then(() => {
						this.#emblemImg = emblemImg;
					})
					.catch(() => {
						this.#emblemImg = null;
					})
					.finally(() => appendEmblem());
				break;
			}
			case 'emblembgsrc': {
				const emblemBgImg = new Image(17, 17);
				emblemBgImg.src = newValue;
				emblemBgImg.alt = '';
				emblemBgImg
					.decode()
					.then(() => {
						this.#emblemBgImg = emblemBgImg;
					})
					.catch(() => {
						this.#emblemBgImg = null;
					})
					.finally(() => appendEmblem());
				break;
			}
			default:
				break;
		}
	}

	createUntaintedElement() {
		const tmpl = document.createElementNS('http://www.w3.org/2000/svg', 'g');

		const nameContainer = this.shadowRoot.querySelector('foreignObject');
		const containRect = nameContainer.getBoundingClientRect();
		const scaleFactor = containRect.width / this.#rect.width;

		const nameTagRect = this.shadowRoot.getElementById('name').getBoundingClientRect();
		const nameTagWidth = nameTagRect.width / scaleFactor;
		const nameTagHeight = nameTagRect.height / scaleFactor;
		const nameTagYPos = 74;
		tmpl.insertAdjacentHTML(
			'beforeend',
			`<rect fill="#0a0a0a" opacity="0.8" width="${nameTagWidth}" height="${nameTagHeight}" x="${(this.#rect.width - nameTagWidth) / 2}" y="${nameTagYPos}" rx="4" />`
		);
		tmpl.insertAdjacentHTML(
			'beforeend',
			`<text class="font-system" fill="#fff" font-size="12px" text-anchor="middle" dominant-baseline="hanging" x="${this.#rect.width / 2}" y="${nameTagYPos + 4}">${this.getAttribute('name')}</text>
		`
		);

		if (this.hasAttribute('guild') && this.shadowRoot.getElementById('guildname')) {
			const guildTagRect = this.shadowRoot.getElementById('guildname').getBoundingClientRect();
			const guildTagWidth = guildTagRect.width / scaleFactor;
			const guildTagHeight = guildTagRect.height / scaleFactor;
			const guildTagXPos = (this.#rect.width - guildTagWidth) / 2;
			const guildTagYPos = nameTagHeight + nameTagYPos + 1;
			tmpl.insertAdjacentHTML(
				'beforeend',
				`<rect fill="#0a0a0a" opacity="0.8" width="${guildTagWidth}" height="${guildTagHeight}" x="${guildTagXPos}" y="${guildTagYPos}" rx="4" />`
			);
			tmpl.insertAdjacentHTML(
				'beforeend',
				`<text class="font-system" fill="#fff" font-size="12px" text-anchor="middle" font-weight="700" dominant-baseline="hanging" x="${this.#rect.width / 2}" y="${guildTagYPos + 4}">${this.getAttribute('guild')}</text>`
			);

			if (this.#emblem) {
				if (this.#emblemBgImg) {
					tmpl.insertAdjacentHTML(
						'beforeend',
						`<image href=${this.#emblemBgImg.src} width="17" height="17" x="${Math.round(guildTagXPos - 18)}" y="${calcCenter(guildTagHeight, 17) + guildTagYPos}" />`
					);
				}
				if (this.#emblemImg) {
					tmpl.insertAdjacentHTML(
						'beforeend',
						`<image href=${this.#emblemImg.src} width="15" height="15" x="${Math.round(guildTagXPos - 17)}" y="${calcCenter(guildTagHeight, 15) + guildTagYPos}" />`
					);
				}
			}
		}

		const svgClone = this.shadowRoot.querySelector('.root').cloneNode(true);
		const foreignObject = svgClone.querySelector('foreignObject');
		svgClone.replaceChild(tmpl, foreignObject);
		svgClone.removeAttribute('id');
		svgClone.querySelectorAll('[id]').forEach((x) => x.removeAttribute('id'));
		return svgClone;
	}
}
