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
		const x = this.getAttribute('x') || '';
		const y = this.getAttribute('y') || '';
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
						<stop offset="15%" stop-color="rgb(10, 175, 55)" />
						<stop offset="100%" stop-color="rgb(27, 207, 30)" />
					</radialGradient>
				</defs>
 
				<g mask="url(#cutout)">
					<circle 
						cx="50" 
						cy="50" 
						r="48" 
						fill="url(#lilypad_gradient)" 
						stroke="rgb(0, 175, 15)"
					/>
 
					<path d="	M 65 5 
										C 50 50 50 50 87 32 
										C 50 50 50 50 87 70
										C 50 50 50 50 55 95 
										C 50 50 50 50 15 80 
										C 50 50 50 50 8 40
										C 50 50 50 50 28 15
										C 50 50 50 50 65 5
										"
						stroke="none"
						fill="rgb(0, 178, 60)"
					/>
				</g>
				
			</svg>
		`;
	}
}

customElements.define('lily-pad', LilyPad);