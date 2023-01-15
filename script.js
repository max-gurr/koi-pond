let canvas;
let ctx;
let width, height;
let border;

let numFish = document.getElementById("num_fish").value;
let school;
let bodyColours = ['rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 128, 0)', 'rgb(249, 226, 15)'];
let dotColours = ['rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(255, 128, 0)'];

const times = [];
let fps;

function init() {
	// Adjust display
	document.getElementById("display_num_fish").innerHTML = numFish;

	// Setup canvas
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext('2d');

	width = window.innerWidth;
	height = window.innerHeight;

	border = 50;

	canvas.width = width;
	canvas.height = height;

	// Make fish
	school = [];
	for (let i = 0; i < numFish; i++) {
		const xPos = width/2 + (Math.random()*2-1) * (width/2 - border);
		const yPos = height/2 + (Math.random()*2-1) * (height/2 - border);

		const numSegs = parseInt(gaussianRandom(2, 5));
		console.log(numSegs);

		const f = new Fish(ctx, xPos, yPos, numSegs);

		const bodyColour = bodyColours[parseInt(Math.random() * bodyColours.length)];
		f.setBodyColour(bodyColour);

		f.setDotColours(dotColours);

		school.push(f);	
	}
	
}

function measureFrames() {
	// Measure & display framerate
	const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;

   	document.getElementById("display_framerate").innerHTML = fps;
}

function animate() {
	// Draw background
	const alpha = 1;
	ctx.fillStyle = `rgba(10, 35, 40, ${alpha})`;
	ctx.fillRect(0, 0, width, height);

	// Do fishy things
	let fish, neighbour;
	for (let i = 0; i < numFish; i++) {
		fish = school[i];
		
		fish.flock(school, i);

		fish.update();
		fish.draw();
	}

	measureFrames();

	// Cue next animation frame
	requestAnimationFrame(this.animate.bind(this));
}

function adjustNumFish(newValue) {
	numFish = newValue;
	init();
}


init();
animate();

window.addEventListener("resize", init);
window.onunload = function() {
    console.log("about to clear event listeners prior to leaving page");
    window.removeEventListener('resize', init);
    return;
}