
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

function goToPageFrom(destination, origin) {
	const originPage = document.getElementById(origin);
	const destinationPage = document.getElementById(destination);
	
	const totalDelay = hideLilyPads(originPage);

	window.setTimeout(() => {
		originPage.style.display = 'none';
		destinationPage.style.display = 'block';
	}, totalDelay);

	showLilyPadsWithDelay(destinationPage, totalDelay+200);
}

const startPage = 'home';
document.getElementById(startPage).style.display = 'block';
showLilyPadsWithDelay(document.getElementById(startPage), 500);