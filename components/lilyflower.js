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
					A ${petal_width} ${petal_width} 0 0 1 50 ${50 - petal_size} 
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
					<radialGradient id="outer_petal_fill">
						<stop offset="15%" stop-color="rgb(210, 200, 220)" />
						<stop offset="100%" stop-color="rgb(230, 230, 230)" />
					</radialGradient>

					<radialGradient id="inner_petal_fill">
						<stop offset="15%" stop-color="rgb(180, 20, 220)" />
						<stop offset="100%" stop-color="rgb(210, 200, 220)" />
					</radialGradient>
				</defs>

				${LilyFlower.generatePetals(50, 46, "url(#outer_petal_fill)", 360/6)}
				${LilyFlower.generatePetals(45, 46, "url(#outer_petal_fill)", 360/6, 360/12)}
				${LilyFlower.generatePetals(25, 20, "url(#inner_petal_fill)", 360/9)}
				${LilyFlower.generatePetals(7, 5, "rgb(215, 255, 39)", 360/10)}

			</svg>
		`;
	}
}

customElements.define('lily-flower', LilyFlower);