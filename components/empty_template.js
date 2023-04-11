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
			<div>Empty content: ${val}</div>
		`;
	}
}

customElements.define('empty-template', EmptyTemplate);