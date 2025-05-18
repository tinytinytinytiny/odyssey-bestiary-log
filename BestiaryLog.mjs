import { calcCenter, getBase64 } from './utils.mjs';

export default class extends HTMLElement {
	static observedAttributes = ['bgsrc', 'name', 'level', 'mobsrc', 'hp', 'mp', 'exp', 'mesos', 'kills'];

	#rects = {
		bg: {
			width: 385,
			height: 280,
			x: 52,
			y: -18
		},
		monsterFrame: {
			width: 375,
			height: 169,
			x: 57,
			y: 92
		},
		hpBar: {
			width: 126,
			height: 30,
			x: 46,
			y: 266
		},
		mpBar: {
			width: 126,
			height: 30,
			x: 180,
			y: 266
		},
		expBar: {
			width: 126,
			height: 30,
			x: 314,
			y: 266
		},
		mesoCountFrame: {
			width: 147,
			height: 42,
			x: 62,
			y: 378
		},
		killCountFrame: {
			width: 147,
			height: 42,
			x: 273,
			y: 378
		},
		dropFrame: {
			width: 147,
			height: 113,
			x: 62,
			y: 480
		},
		characterFrame: {
			width: 147,
			height: 113,
			x: 273,
			y: 480
		}
	};
	#fontFaceRules;
	#iconGutter = 12;

	constructor() {
		super();

		const shadow = this.attachShadow({ mode: 'open' });
		shadow.innerHTML = `
			<style>
				:host {
					display: block;
					width: 485px;	
					max-width: 100%;
				}
			</style>
			<svg class="root" viewBox="0 0 485 639" xmlns="http://www.w3.org/2000/svg">
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

					.light-glow {
						filter: url(#light-glow);
					}

					.dark-glow {
						filter: url(#dark-glow);
					}

					.drop-shadow {
						filter: url(#shadow);
					}
				</style>
				<defs>
					<clipPath id="bg-box">
						<rect x="${this.#rects.monsterFrame.x - 2}" y="${this.#rects.monsterFrame.y - 2}" width="${this.#rects.monsterFrame.width + 4}" height="${this.#rects.monsterFrame.height + 4}" />
					</clipPath>
					<symbol id="star">
						<image href="ui-assets/star.png" width="16" height="14" />
					</symbol>
					<symbol id="crossed-swords" viewBox="0 0 64 64">
						<g transform="translate(0,64) scale(0.1,-0.1)" stroke="none" fill="#b38234">
							<path
								d="M68 597 c-3 -7 -2 -42 1 -80 6 -67 7 -68 66 -121 55 -50 59 -56 44   -71 -13 -13 -20 -14 -42 -4 -22 10 -31 9 -52 -5 -31 -20 -32 -52 -3 -83 l22   -23 -52 -53 c-57 -58 -65 -87 -30 -111 34 -24 45 -20 103 35 l54 51 30 -23   c26 -19 35 -21 55 -11 33 15 42 47 22 77 -15 23 -15 25 9 41 23 15 27 15 50 0   24 -16 24 -18 9 -41 -20 -30 -11 -62 22 -77 20 -10 29 -8 55 11 l30 23 54 -51   c58 -55 69 -59 103 -35 35 24 27 53 -30 111 l-52 53 22 23 c29 31 28 63 -3 83   -21 14 -30 15 -52 5 -22 -10 -29 -9 -42 4 -15 15 -11 21 44 71 59 53 60 54 66   121 3 38 4 73 1 80 -2 8 -25 10 -75 7 l-72 -6 -52 -56 -53 -57 -52 57 -53 56   -72 6 c-50 3 -73 1 -75 -7z m179 -86 c23 -25 42 -50 43 -55 0 -5 -15 -25 -33   -46 l-34 -37 -24 19 c-79 65 -86 74 -92 127 l-6 52 52 -7 c45 -6 57 -12 94   -53z m286 7 c-3 -29 -6 -53 -7 -53 -1 -1 -35 -30 -76 -66 -41 -36 -105 -90   -141 -122 l-66 -57 -26 28 -27 28 120 140 c106 122 126 140 158 145 75 12 72   14 65 -43z m-110 -270 l-27 -28 -23 22 -23 22 32 27 33 28 17 -22 c16 -21 16   -23 -9 -49z m-228 -28 c55 -55 67 -72 57 -82 -10 -10 -27 2 -82 57 -39 38 -70   75 -70 82 0 27 28 10 95 -57z m345 57 c0 -7 -31 -44 -70 -82 -55 -55 -72 -67   -82 -57 -10 10 2 27 57 82 67 67 95 84 95 57z m-394 -108 c7 -12 -74 -99 -93   -99 -24 0 -13 24 29 67 45 45 53 50 64 32z m412 -32 c42 -43 53 -67 29 -67   -19 0 -100 87 -93 99 11 18 19 13 64 -32z">
							</path>
						</g>
					</symbol>
					<filter id="light-glow">
						<feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#f8dc5c" />
					</filter>
					<filter id="dark-glow">
						<feDropShadow dx="0" dy="0" stdDeviation="2" flood-color="#000" flood-opacity="0.2" />
					</filter>
					<filter id="shadow" height="180%">
						<feDropShadow dx="0" dy="6" stdDeviation="2" flood-color="#000" flood-opacity="0.2" />
					</filter>
				</defs>
				<g id="bg" clip-path="url(#bg-box)"></g>
				<image href="ui-assets/bestiary/bestiary-frame.png" width="485" height="639" />
				<text id="name" class="color-1 light-glow" opacity="0.9" font-size="32px" font-weight="700" x="${this.#rects.monsterFrame.x - 1}" y="81">${this.getAttribute('name').toUpperCase()}</text>
				<g id="mob" class="drop-shadow"></g>
				<g id="stars">
					<use href="#star" x="50" y="18" />
					<use href="#star" x="69" y="18" />
					<use href="#star" x="88" y="18" />
					<use href="#star" x="107" y="18" />
					<use href="#star" x="126" y="18" />
					<use href="#star" x="145" y="18" />
					<use href="#star" x="164" y="18" />
					<use href="#star" x="183" y="18" />
					<use href="#star" x="202" y="18" />
					<use href="#star" x="221" y="18" />
					<use href="#star" x="240" y="18" />
					<use href="#star" x="259" y="18" />
					<use href="#star" x="278" y="18" />
					<use href="#star" x="297" y="18" />
					<use href="#star" x="316" y="18" />
				</g>
				<g id="level">
					<image href="ui-assets/LevelNo.0.png" width="11" height="13" x="391" y="18" />
				</g>
				<g id="hp" class="dark-glow">
					<image href="ui-assets/ItemNo.0.png" width="8" height="11" x="105" y="275" />
				</g>
				<g id="mp" class="dark-glow">
					<image href="ui-assets/ItemNo.0.png" width="8" height="11" x="239" y="275" />
				</g>
				<g id="exp" class="dark-glow">
					<image href="ui-assets/ItemNo.0.png" width="8" height="11" x="373" y="275" />
				</g>
				<image data-label="meso-count" href="ui-assets/coin.png" width="14" height="14" x="${calcCenter(this.#rects.mesoCountFrame.width, 14) + this.#rects.mesoCountFrame.x - 4 - this.#iconGutter / 2}" y="392" />
				<use data-label="kill-count" href="#crossed-swords" width="14" height="14" x="${calcCenter(this.#rects.killCountFrame.width, 14) + this.#rects.killCountFrame.x - 4 - this.#iconGutter / 2}" y="392" />
				<g font-size="16px" font-weight="600" text-anchor="middle" dominant-baseline="middle">
					<text class="color-1" x="135.5" y="381">Gained</text>
					<text id="meso-count" class="color-2" x="${this.#rects.mesoCountFrame.width / 2 + this.#rects.mesoCountFrame.x + this.#iconGutter / 2}" y="401">0</text>
					<text class="color-1" x="346.5" y="381">Killed</text>
					<text id="kill-count" class="color-2" x="${this.#rects.killCountFrame.width / 2 + this.#rects.killCountFrame.x + this.#iconGutter / 2}" y="401">0</text>
				</g>
				<foreignObject width="${this.#rects.characterFrame.width}" height="${this.#rects.characterFrame.height}" x="${this.#rects.characterFrame.x}" y="${this.#rects.characterFrame.y}" overflow="visible">
					<slot name="character" xmlns="http://www.w3.org/1999/xhtml"></slot>
				</foreignObject>
				<foreignObject width="${this.#rects.dropFrame.width}" height="${this.#rects.dropFrame.height}" x="${this.#rects.dropFrame.x}" y="${this.#rects.dropFrame.y}" overflow="visible">
					<slot name="item" xmlns="http://www.w3.org/1999/xhtml"></slot>
				</foreignObject>
			</svg>
		`;

		const iconLabelResizeObserver = new ResizeObserver((entries) => {
			for (const entry of entries) {
				if (entry.contentBoxSize) {
					const contentBoxSize = entry.contentBoxSize[0];
					const icon = this.shadowRoot.querySelector(`[data-label="${entry.target.id}"]`);
					const rects = {
						'meso-count': this.#rects.mesoCountFrame,
						'kill-count': this.#rects.killCountFrame
					};
					const container = rects[entry.target.id];
					const centerXPos = calcCenter(container.width, 14) + container.x;

					// icon xPos = centerXPos - textWidth / 2 - gutter / 2
					icon.setAttribute('x', Math.round(centerXPos - contentBoxSize.inlineSize / 2 - this.#iconGutter / 2));
				}
			}
		});

		iconLabelResizeObserver.observe(shadow.getElementById('meso-count'));
		iconLabelResizeObserver.observe(shadow.getElementById('kill-count'));

		this.#updateStyles();
	}

	attributeChangedCallback(name, _, newValue) {
		switch (name) {
			case 'bgsrc':
				this.shadowRoot.getElementById('bg').innerHTML =
					`<image href="${newValue}" width="${this.#rects.bg.width}" height="${this.#rects.bg.height}" x="${this.#rects.bg.x}" y="${this.#rects.bg.y}" />`;
				break;
			case 'name':
				this.shadowRoot.getElementById('name').textContent = newValue.toUpperCase();
				break;
			case 'mobsrc': {
				const mobImg = new Image();
				mobImg.src = newValue;
				mobImg.decode().then(() => {
					const scaleFactor = Math.min(1, this.#rects.monsterFrame.height / mobImg.height);
					const imgHeight = Math.min(this.#rects.monsterFrame.height, mobImg.height);
					const imgWidth = Math.round(mobImg.width * scaleFactor);
					this.shadowRoot.getElementById('mob').innerHTML =
						`<image href="${newValue}" width="${imgWidth}" height="${imgHeight}" x="${calcCenter(this.#rects.monsterFrame.width, imgWidth) + this.#rects.monsterFrame.x}" y="${calcCenter(this.#rects.monsterFrame.height, imgHeight) + this.#rects.monsterFrame.y}" />`;
				});
				break;
			}
			case 'level': {
				const int = Math.abs(Number.parseInt(newValue));
				if (typeof int === 'number' && !Number.isNaN(int)) {
					const digits = int.toString().split('');
					const digitImgs = digits.map(
						(n, index) =>
							`<image href="ui-assets/LevelNo.${n}.png" width="11" height="13" x="${391 + index * 12}" y="18" />`
					);
					this.shadowRoot.getElementById('level').innerHTML = digitImgs.join('');
				}
				break;
			}
			case 'hp':
				this.#setBarValue('hp', newValue);
				break;
			case 'mp':
				this.#setBarValue('mp', newValue);
				break;
			case 'exp':
				this.#setBarValue('exp', newValue);
				break;
			case 'mesos':
				this.shadowRoot.getElementById('meso-count').textContent = new Intl.NumberFormat().format(
					Number.parseInt(newValue)
				);
				break;
			case 'kills':
				this.shadowRoot.getElementById('kill-count').textContent = new Intl.NumberFormat().format(
					Number.parseInt(newValue)
				);
				break;
			default:
				break;
		}

		this.#updateStyles();
	}

	#updateStyles() {
		const starsSheet = new CSSStyleSheet();
		const stars = 1 + Math.min(Math.floor(Math.abs(Number.parseInt(this.getAttribute('level'))) / 10), 14);
		starsSheet.replaceSync(`
			#stars > :nth-child(${stars}) ~ * {
				opacity: 0.25;
			}
		`);
		this.shadowRoot.adoptedStyleSheets = [starsSheet];
	}

	#setBarValue(type, value) {
		const int = Math.abs(Number.parseInt(value));
		const gap = 1;
		if (typeof int === 'number' && !Number.isNaN(int)) {
			const digits = int.toString().split('');
			const digitWidths = digits.map((n) => (n === '1' ? 5 : 8));
			const totalWidth = digitWidths.reduce((prev, curr) => prev + curr + gap, 0);
			const digitImgs = digits.map((n, index) => {
				const xOffset = index > 0 ? digitWidths.slice(0, index).reduce((prev, curr) => prev + curr + gap, 0) : 0;
				return `<image href="ui-assets/ItemNo.${n}.png" width="${digitWidths[index]}" height="11" x="${calcCenter(this.#rects[`${type}Bar`].width, totalWidth) + this.#rects[`${type}Bar`].x + xOffset}" y="275" />`;
			});
			this.shadowRoot.getElementById(type).innerHTML = digitImgs.join('');
		}
	}

	async #makeImage() {
		const svgClone = this.shadowRoot.querySelector('.root').cloneNode(true);
		this.shadowRoot.querySelectorAll('slot').forEach((slot) => {
			const [component] = slot.assignedElements();
			const foreignObject = svgClone.querySelector(`slot[name="${component.slot}"]`).parentNode;
			const untaintedSVG = component.createUntaintedElement();
			const cloneAttributes = (...attributes) => {
				attributes.forEach((attribute) => untaintedSVG.setAttribute(attribute, foreignObject.getAttribute(attribute)));
			};
			cloneAttributes('width', 'height', 'x', 'y');
			svgClone.replaceChild(untaintedSVG, foreignObject);
		});

		const base64Images = []; // array of promises
		const images = svgClone.querySelectorAll('image');
		for (const i in images) {
			if (Object.prototype.hasOwnProperty.call(images, i)) {
				base64Images.push(
					getBase64(images[i].getAttribute('href')).then((dataURL) => images[i].setAttribute('href', dataURL))
				);
			}
		}
		await Promise.all(base64Images);

		if (!this.#fontFaceRules) {
			const fontFamilyCSSVariable = window.getComputedStyle(this).getPropertyValue('--bestiary-font-family');
			const getFontFaceRules = (sheet) => {
				// returns array of @font-face rules in the stylesheet
				return Promise.allSettled(
					[...sheet.cssRules]
						.filter((rule) => rule.constructor.name === 'CSSFontFaceRule')
						.map((rule) => {
							const fontFamily = rule.style.getPropertyValue('font-family');
							const isUserDefinedFont = Boolean(
								fontFamily === fontFamilyCSSVariable.replace(/\'\"/g, '') || fontFamily === 'Dosis'
							);
							if (fontFamilyCSSVariable && !isUserDefinedFont) {
								return '';
							}
							const fontWeight = rule.style.getPropertyValue('font-weight');
							const fontUrl = rule.style.getPropertyValue('src').match(/(?<=url\([\"\'])([^\)]*)(?=[\"\'])/g);
							const fontFormat = rule.style.getPropertyValue('src').match(/(?<=format\([\"\'])([^\)]*)(?=[\"\'])/g);
							return getBase64(fontUrl)
								.then((dataURL) => {
									if (!dataURL) return '';
									const fontSrc = fontFormat ? `url('${dataURL}') format('${fontFormat}')` : `url('${dataURL}')`;
									return `@font-face {
									font-family: ${fontFamily};
									font-weight: ${fontWeight};
									src: ${fontSrc};
								}`.replace(/[\t\n]/g, '');
								})
								.catch(() => '');
						})
				).then((results) => results.map((result) => result.value));
			};
			const fontFaceRules = Promise.allSettled(
				[...document.styleSheets].reduce((a, b) => {
					a.push(getFontFaceRules(b));
					return a;
				}, [])
			).then((results) => {
				return results.map((result) => result.value).join('');
			});
			this.#fontFaceRules = await fontFaceRules;
		}

		const svgStyle = svgClone.querySelector('style');
		svgStyle.insertAdjacentHTML('afterbegin', this.#fontFaceRules);
		[...this.shadowRoot.adoptedStyleSheets].forEach((sheet) => {
			for (let i = 0; i < sheet.cssRules.length; i++) {
				const cssText = sheet.cssRules.item(i).cssText;
				svgStyle.insertAdjacentHTML('beforeend', cssText);
			}
		});

		const blob = new Blob([svgClone.outerHTML], { type: 'image/svg+xml' });
		const objectURL = URL.createObjectURL(blob);
		const img = new Image();
		img.src = objectURL;

		return new Promise((resolve) => {
			img.decode().then(() => {
				const canvas = document.createElement('canvas');
				canvas.width = 485;
				canvas.height = 639;
				const context = canvas.getContext('2d');
				requestAnimationFrame(() => {
					context.drawImage(img, 0, 0, 485, 639);
					URL.revokeObjectURL(objectURL);
					resolve(canvas);
				});
			});
		});
	}

	async saveImage() {
		const snapshot = await this.#makeImage();
		const a = document.createElement('a');
		a.download = `${new Date().getTime()}.png`;
		a.style.opacity = '0';
		a.style.position = 'absolute';
		a.href = snapshot.toDataURL();
		a.click();
		a.remove();
	}

	async copyImage() {
		const makeBlob = async () => {
			const snapshot = await this.#makeImage();
			return new Promise((resolve) => {
				return snapshot.toBlob(resolve);
			});
		};
		const clipboardItem = new ClipboardItem({ 'image/png': makeBlob() });
		navigator.clipboard.write([clipboardItem], { type: 'image/png' }).then(() => console.log('Image copied'));
	}
}
