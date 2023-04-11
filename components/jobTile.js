class JobTile extends HTMLElement {
	constructor() {
		super();
    this.attachShadow({mode: 'open'});
	}
	
	connectedCallback() {
		this.render();
	}

	static get observedAttributes() {
		return ['company', 'role', 'from', 'until'];
	}

	attributeChangedCallback(property, oldValue, newValue) {
		if (oldValue === newValue) return;

		this.render();
	}

	render() {
		const company = this.getAttribute('company');
		const role = this.getAttribute('role');
		const from = this.getAttribute('from');
		const until = this.getAttribute('until');

		this.shadowRoot.innerHTML = `
			<style> 
				:host{
				}
			</style>
			<div class="job">
				<h2 class="company">${company}</h2>
				<h3 class="role">${role}</h3>
				<div class="dates">
					<h4 class="from">${from}</h4>
					<h4 class="until">${until}</h4>
				</div>
				<div class="content">
					<slot></slot>
				</div>
			</div>
		`;
	}
}

customElements.define('job-tile', JobTile);