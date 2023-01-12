let canvas;
let ctx;
let width, height;
let border = 50;

let numFish = document.getElementById("num_fish").value;
let school;

const times = [];
let fps;

window.addEventListener("resize", function() {init();})

function init() {
	// Adjust display
	document.getElementById("display_num_fish").innerHTML = numFish;

	// Setup canvas
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext('2d');

	width = window.innerWidth;
	height = window.innerHeight;

	canvas.width = width;
	canvas.height = height;

	// Make fish
	school = [];
	for (let i = 0; i < numFish; i++) {
		const xPos = width/2 + (Math.random()*2-1) * (width/2 - border);
		const yPos = height/2 + (Math.random()*2-1) * (height/2 - border);

		const f = new Fish(ctx, xPos, yPos, numSegs=3);
		
		school.push(f);	
	}
	
}

function animate() {
	// Draw background
	const alpha = 0.15;
	ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
	ctx.fillRect(0, 0, width, height);

	// Do fishy things
	school.forEach((fish) => {
		fish.update();
		fish.draw();
	});

	// Measure & display framerate
	const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;

   	document.getElementById("display_framerate").innerHTML = fps;

	// Cue next animation frame
	requestAnimationFrame(this.animate.bind(this));
}

function adjustNumFish(newValue) {
	numFish = newValue;
	init();
}


init();
animate();