let canvas;
let ctx;
let width, height;
let border;

let numFish = document.getElementById("num_fish").value;
let school;
let bodyColours = ['rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 255, 255)', 'rgb(255, 128, 0)', 'rgb(249, 226, 15)'];
let dotColours = ['rgb(255, 255, 255)', 'rgb(0, 0, 0)', 'rgb(255, 128, 0)', 'rgb(249, 226, 15)'];

let food;

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
	const minSegs = 2;
	const maxSegs = 6;
	for (let i = 0; i < numFish; i++) {
		// Generate position
		const xPos = width/2 + (Math.random()*2-1) * (width/2 - border);
		const yPos = height/2 + (Math.random()*2-1) * (height/2 - border);

		// Randomise length of fish
		const numSegs = parseInt(gaussianRandom(minSegs, maxSegs));
		const f = new Fish(ctx, xPos, yPos, numSegs);

		// Assign colours
		const bodyColour = bodyColours[parseInt(Math.random() * bodyColours.length)];
		f.setBodyColour(bodyColour);
		f.setDotColours(dotColours);

		school.push(f);	
	}
	
	food = [];
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
	const alpha = 0.25;
	ctx.fillStyle = `rgba(30, 65, 90, ${alpha})`;
	ctx.fillRect(0, 0, width, height);

	// Draw food
	ctx.fillStyle = 'red';
	ctx.beginPath();
	food.forEach(f => {
		ctx.moveTo(f[0], f[1]);
		ctx.arc(f[0], f[1], 5, 0, 2*Math.PI);
	});
	ctx.closePath();
	ctx.fill();

	// Do fishy things
	let fish;
	for (let i = 0; i < numFish; i++) {
		fish = school[i];
		
		fish.flock(school, i);

		fish.seekFood(food);

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

function placeFood(event) {
	food.push([event.clientX, event.clientY]);
}

function eatFood(index) {
	food.splice(index, 1);
}


init();
animate();


window.addEventListener("resize", init);
document.body.addEventListener("mousedown", placeFood);

window.onunload = function() {
    console.log("about to clear event listeners prior to leaving page");
    
    window.removeEventListener('resize', init);
    document.body.removeEventListener("mousedown", placeFood);
    
    return;
}