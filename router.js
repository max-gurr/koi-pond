
function getShuffledLilyPads(parentEl) {
	// Get all lilypads from parent
	const pads = parentEl.getElementsByTagName("lily-pad");

	// Shuffle elements
	const shuffledPads = Array.from(pads).sort(() => {
		return Math.random() - 0.5;
	})

	return shuffledPads;
}

function showLilyPadsWithDelay(parentEl, delay) {
	window.setTimeout(() => {
		showLilyPads(parentEl);
	}, delay);
}

function showLilyPads(parentEl) {
	const delayPerPad = 150;
	const shuffledPads = getShuffledLilyPads(parentEl);

	// Hide elements with delay
	let i;
	for (i = 0; i < shuffledPads.length; i++) {
		const delay = i * delayPerPad;
		shuffledPads[i].show(delay);
	}

	return i * delayPerPad;
}

function hideLilyPads(parentEl) {
	// 150ms delay between each pad transition
	const delayPerPad = 100;
	const shuffledPads = getShuffledLilyPads(parentEl);

	// Hide elements with delay
	let i;
	for (i = 0; i < shuffledPads.length; i++) {
		const delay = i * delayPerPad;
		shuffledPads[i].hide(delay);
	}

	return (i+1) * delayPerPad;
}

function goToPage(destination) {
	const destinationPage = document.getElementById(destination);
	
	let originPage;
	let totalDelay = 0;
	// Get current page
	document.querySelectorAll(".page").forEach(page => {
		if (page.style.display != "" && page.style.display != "none") {
			// Hide lilypads on current page
			totalDelay = hideLilyPads(page);

			originPage = page;
		}
	})

	// Hide origin page
	// Show destination page
	window.setTimeout(() => {
		originPage.style.display = 'none';
		destinationPage.style.display = 'block';
	}, totalDelay);

	showLilyPadsWithDelay(destinationPage, totalDelay+200);
}

// Keep track of scroll position
let scrolling = false;
let scrollOffset = 0;
function ScrollAboutPage(contentElement, event) {
	// Only scroll more if a scroll isn't already happening
	if (!scrolling) {
		scrolling = true;

		const clientRect = contentElement.getBoundingClientRect();
		// clientRect.right + right.width = offset from right of screen
		// clientRect.left = offset from left of screen

		// Scrolling down
		if (event.deltaY > 0 && (clientRect.right + clientRect.width) >= 0) {
			scrollOffset -= 100;
		} 
		// Scrolling up
		else if (event.deltaY < 0 && clientRect.left < 0) {
			scrollOffset += 100;
		} 
		// Don't scroll
		else {
			scrolling = false;
			return;
		}

		// Set scroll on content
		contentElement.style.left = `${scrollOffset}%`;

		// When scroll is finished, enable further scrolling
		contentElement.addEventListener('transitionend', () => {
			scrolling = false;
		})
	}
}

// Load homepage
const startPage = 'about';
document.getElementById(startPage).style.display = 'block';
showLilyPadsWithDelay(document.getElementById(startPage), 1000);