class EmptyTemplate extends HTMLElement {
	constructor() {
		super();
    this.attachShadow({mode: 'open'});
	}
	
	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return ['val'];
	}

	attributeChangedCallback(property, oldValue, newValue) {
		if (oldValue === newValue) return;

		this.render();
	}

	render() {
		const val = this.getAttribute('val');
		this.shadowRoot.innerHTML = `
			<style> 
				:host{
				}
			</style>
			:slotted{
				
			}
			<div>Empty content: ${val}</div>
			<div>
				<slot></slot>
			</div>
		`;
	}
}

customElements.define('empty-template', EmptyTemplate);