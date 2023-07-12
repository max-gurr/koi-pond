let main_canvas;
let main_ctx;
let background_canvas;
let background_ctx;
let width, height;
let border;
let draw_scale = 1.25;

let numFish = document.getElementById("num_fish")?.value || 30;
let school;
let bodyColours = [
	'rgb(255, 255, 255)', 
	'rgb(255, 255, 255)', 
	'rgb(255, 255, 255)', 
	'rgb(255, 255, 255)', 
	'rgb(255, 255, 255)', 
	'rgb(255, 255, 255)', 
	'rgb(255, 128, 0)',
	'rgb(255, 128, 0)',
	'rgb(255, 128, 0)',
	'rgb(255, 128, 0)',
	'rgb(249, 226, 15)',
	'rgb(249, 226, 15)',
	'rgb(70, 70, 80)'
];
let dotColours = [
	'rgb(255, 255, 255)', 
	'rgb(20, 40, 30)', 
	'rgb(255, 128, 0)', 
	'rgb(249, 226, 15)',
	'null',
	'null',
	'null',
	'null'
];

let food;

const times = [];
let fps;

function init() {

	// Setup main canvas
	main_canvas = document.getElementById("canvas");
	main_ctx = main_canvas.getContext('2d');

	main_canvas.width = window.innerWidth;
	main_canvas.height = window.innerHeight;

	width = window.innerWidth/draw_scale;
	height = window.innerHeight/draw_scale;

	border = 50;

	// Setup offscreen canvas
	background_canvas = document.createElement('canvas');
	background_canvas.width = width;
	background_canvas.height = height;
	background_ctx = background_canvas.getContext('2d');

	// Make fish
	school = [];
	for (let i = 0; i < numFish; i++) {
		school.push(makeFish());	
	}
	
	food = [];
}

function makeFish() {
	const minSegs = 3;
	const maxSegs = 5;

	// Generate position
	const xPos = width/2 + (Math.random()*2-1) * (width/2 - border);
	const yPos = height/2 + (Math.random()*2-1) * (height/2 - border);

	// Randomise length of fish
	let numSegs = parseInt(gaussianRandom(minSegs, maxSegs));
	const fish = new Fish(background_ctx, xPos, yPos, numSegs);

	// Assign colours
	const bodyColour = bodyColours[parseInt(Math.random() * bodyColours.length)];
	fish.setBodyColour(bodyColour);
	fish.setDotColours(dotColours);

	return fish;
}

function measureFrames() {
	// Measure & display framerate
	const now = performance.now();
    while (times.length > 0 && times[0] <= now - 1000) {
      times.shift();
    }
    times.push(now);
    fps = times.length;

   	let frEl = document.getElementById("display_framerate");
		if (frEl != null) {
			frEl.innerHTML = fps;
		}
}

function animate() {
	// Draw background
	// const alpha = 0.08;
	// main_ctx.fillStyle = `rgba(0, 0, 20, ${alpha})`;
	// main_ctx.fillRect(0, 0, width*draw_scale, height*draw_scale);

	background_canvas.width = width;
	main_canvas.width = width*draw_scale;

	// Draw food
	background_ctx.fillStyle = 'red';
	background_ctx.beginPath();
	food.forEach(f => {
		background_ctx.moveTo(f[0], f[1]);
		background_ctx.arc(f[0], f[1], 5, 0, 2*Math.PI);
	});
	background_ctx.closePath();
	background_ctx.fill();

	// Do fishy things
	let fish1, fish2;
	for (let i = 0; i < numFish; i++) {
		fish1 = school[i];

		for (let j = i+1; j < numFish; j++) {
			if (i !== j) {
				fish2 = school[j];
				// View from this fish to neighbour
				const distVals = fish1.distToNeighbour(fish2);
				const dist = vectorLength(distVals[0], distVals[1]);

				if (dist < Fish.neighbourRadius) {
					fish1.flockTo(fish2);
					fish2.flockTo(fish1);
				}
			}
		}
		
		fish1.applyFlocking();
		fish1.resetFlockingValues();

		fish1.seekFood(food);

		fish1.update();
		fish1.draw();
	}

	measureFrames();
	main_ctx.drawImage(background_canvas, 0, 0, width*draw_scale, height*draw_scale);

	// Cue next animation frame
	requestAnimationFrame(this.animate.bind(this));
}


function placeFood(event) {
	food.push([event.clientX/draw_scale, event.clientY/draw_scale]);
}

function eatFood(index) {
	food.splice(index, 1);
}

init();
animate();

window.addEventListener("resize", init);

window.onunload = function() {
    console.log("about to clear event listeners prior to leaving page");
    
    window.removeEventListener("resize", init);
    document.body.removeEventListener("mousedown", placeFood);
    
    return;
}