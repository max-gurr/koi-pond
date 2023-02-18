class LilyPad extends HTMLElement {
	constructor() {
		super();
	}
	
	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return ['slotSize'];
	}

	attributeChangedCallback(name, oldValue, newValue) {
		this.render();
	}

	render() {
		this.innerHTML = `
			<object data="assets/lilypad.svg"></object>
		`;
	}
}

customElements.define('lily-pad', LilyPad);