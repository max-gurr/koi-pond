class LilyPad extends HTMLElement {
	constructor() {
		super();
		
    this.attachShadow({mode: 'open'});
	}
	
	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return ['notchSize', 'rotate', 'rotateBy', 'x', 'y', 'size'];
	}

	attributeChangedCallback(property, oldValue, newValue) {
		if (oldValue === newValue) return;

		this.render();
	}

	render() {
		const notchSize = parseFloat(this.getAttribute('notchSize')) || 0;
		const rotate = parseInt(this.getAttribute('rotate')) || 0;
		const rotateBy = parseInt(this.getAttribute('rotateBy')) || 0;
		const x = this.getAttribute('x') || 0;
		const y = this.getAttribute('y') || 0;
		const size = this.getAttribute('size') || '75px';
		
		this.shadowRoot.innerHTML = `
			<style>
				:host {
					display: flex;
					justify-content: center;
					align-items: center;
					width: ${size};
					height: ${size};
					position: absolute;
					${x};
					${y};
				}
				svg {
					position: absolute;
					top: 0;
					left: 0;
					transform: rotate(${rotate}deg);
					transition: transform 0.25s ease;
				}
				svg:hover {
					transform: rotate(${rotate+rotateBy}deg);
				}
				.content {
					position: relative;
					z-index: 2;
					pointer-events: none;
					color: rgb(220, 240, 250);
				}
			</style>
			
			<div class="content">
				<slot></slot>
			</div>

			<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 100 100">
		 		<defs>
					<mask id="cutout">
						<rect x="0" y="0" width="100" height="100" fill="white"/>
						${notchSize > 0 ? 
							`<path 
									d="M ${50 - notchSize*10} 0
										 L 50 ${50 * notchSize}
										 L ${50 + notchSize*10} 0
										 Z" 
									fill="black"
							/>` : ''
						}
					</mask>
	
					<radialGradient id="lilypad_gradient">
						<stop offset="10%" stop-color="rgb(10, 175, 55)" />
						<stop offset="95%" stop-color="rgb(27, 207, 30)" />
					</radialGradient>
				</defs>
 
				<g mask="url(#cutout)">
					<circle 
						cx="50" 
						cy="50" 
						r="48" 
						fill="url(#lilypad_gradient)" 
						stroke="rgb(9, 141, 35)"
					/>
 
					<path d="M 50 85 l 0 -20 M 75 75 l -15 -15 M 25 75 l 15 -15 M 15 50 l 20 0 M 85 50 l -20 0 M 25 25 l 15 15 M 75 25 l -15 15 M 20 36 l 20 10 M 60 80 l -8 -20 M 38 78 l 10 -20 M 80 35 l -20 10 M 15 65 l 20 -10 M 87 60 l -25 -6 M 35 15 l 10 20 M 65 18 l -10 20 M 50 15 l 0 25"
						stroke-width="0.7px"
						stroke="rgb(10, 185, 55)"
					/>
				</g>
				
			</svg>
		`;
	}
}

customElements.define('lily-pad', LilyPad);