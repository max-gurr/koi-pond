class LilyFlower extends HTMLElement {
	constructor() {
		super();
    this.attachShadow({mode: 'open'});
	}
	
	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return ['x', 'y', 'size'];
	}

	attributeChangedCallback(property, oldValue, newValue) {
		if (oldValue === newValue) return;

		this.render();
	}

	static generatePetals(petal_size, petal_width, petal_fill, rotation_increment, start_rotation=0) {
		let petals = '';
		for (let rotation = start_rotation; rotation < 360+start_rotation; rotation += rotation_increment) {
			petals += `
				<path 
					d="M 50 50 
					A ${petal_width} ${petal_width} 0 0 1 46 ${60 - petal_size}
					Q 50 ${50 - petal_size} 54 ${60 - petal_size}
					A ${petal_width} ${petal_width} 0 0 1 50 50"
					fill="${petal_fill}"
					transform="rotate(${rotation}, 50, 50)"
				/>
			`;
		}
		return petals;
	}

	render() {
		const x = this.getAttribute('x') || 'top: 50%';
		const y = this.getAttribute('y') || 'left: 50%';
		const size = this.getAttribute('size') || '100%';

		this.shadowRoot.innerHTML = `
			<style> 
				:host{
					width: ${size};
					height: ${size};
					position: absolute;
					z-index: 1;
					${x};
					${y};
					transform: translate(-50%, -50%);
				}
			</style>
			<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 100 100">
				<defs>
					<radialGradient id="petal_fill_white">
						<stop offset="15%" stop-color="rgb(210, 220, 220)" />
						<stop offset="100%" stop-color="rgb(230, 230, 230)" />
					</radialGradient>

					<radialGradient id="petal_fill_pink">
						<stop offset="15%" stop-color="rgb(218, 196, 198)" />
						<stop offset="100%" stop-color="rgb(235, 206, 225)" />
					</radialGradient>

					<radialGradient id="petal_fill_pliurple">
						<stop offset="15%" stop-color="rgb(228, 156, 198)" />
						<stop offset="100%" stop-color="rgb(225, 186, 205)" />
					</radialGradient>

					<radialGradient id="petal_fill_purple">
						<stop offset="15%" stop-color="rgb(180, 60, 80)" />
						<stop offset="100%" stop-color="rgb(210, 150, 190)" />
					</radialGradient>
				</defs>

				${LilyFlower.generatePetals(50, 40, "url(#petal_fill_white)", 360/7)}
				${LilyFlower.generatePetals(43, 40, "url(#petal_fill_pink)", 360/7, 360/14)}
				${LilyFlower.generatePetals(33, 30, "url(#petal_fill_pliurple)", 360/9, 360/12)}
				${LilyFlower.generatePetals(24, 20, "url(#petal_fill_purple)", 360/11, 360/22)}
				${LilyFlower.generatePetals(0, 9, "rgb(215, 255, 39)", 360/13)}

			</svg>
		`;
	}
}

customElements.define('lily-flower', LilyFlower);