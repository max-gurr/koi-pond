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
					width: ${size};
					height: ${size};
					position: absolute;
					${x};
					${y};
				}
				.pad {
					position: absolute;
					top: 0;
					left: 0;
					height: 100%;
					width: 100%;
					display: block;
					transform: rotate(${rotate}deg);
					transition: transform 0.25s ease;
				}
				:host(:hover) .pad {
					transform: rotate(${rotate+rotateBy}deg);
				}
				.content {
					display: flex;
					justify-content: center;
					align-items: center;
					height: 100%;
					width: 100%;
					position: relative;
					z-index: 2;
					pointer-events: none;
				}
			</style>
			
			<div class="content">
				<slot></slot>
			</div>
			
			<div class="pad">
				<slot name="flower"></slot>
				<svg version="1.1" xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 100 100">
					<defs>
						<mask id="cutout">
							<rect x="0" y="0" width="100" height="100" fill="white"/>
							${notchSize > 0 ? 
								`<path 
										d="M ${50 - notchSize*15} 0
											A 50 85 0 0 1 50 ${50 * notchSize}
											A 50 85 0 0 1 ${50 + notchSize*15} 0
											Z" 
										fill="black"
								/>` : ''
							}
						</mask>
		
						<radialGradient id="lilypad_bg">
							<stop offset="15%" stop-color="rgb(10, 175, 55)" />
							<stop offset="100%" stop-color="rgb(27, 207, 30)" />
						</radialGradient>

						<radialGradient id="lilypad_shadow">
							<stop offset="0%" stop-color="rgb(0, 160, 60)" />
							<stop offset="35%" stop-color="rgb(0, 175, 60)" />
						</radialGradient>
					</defs>
	
					<g mask="url(#cutout)">
						<circle 
							cx="50" 
							cy="50" 
							r="48" 
							fill="url(#lilypad_bg)" 
							stroke="rgb(20, 230, 60)"
						/>
	
						<path d="	M 75 12 
											C 50 50 50 50 92 42 
											C 50 50 50 50 86 78
											C 50 50 50 50 52 94 
											C 50 50 50 50 12 80 
											C 50 50 50 50 10 50
											C 50 50 50 50 22 18
											C 50 50 50 50 75 12
											"
							stroke="none"
							fill="url(#lilypad_shadow)"
						/>
					</g>
				</svg>
			</div>
		`;
	}
}

customElements.define('lily-pad', LilyPad);