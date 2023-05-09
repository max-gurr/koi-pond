let main_canvas;
let main_ctx;
let background_canvas;
let background_ctx;
let width, height;
let border;

let numFish = document.getElementById("num_fish").value;
let school;
let bodyColours = ['rgb(255, 255, 255)', 
				   'rgb(255, 255, 255)', 
				   'rgb(255, 255, 255)', 
				   'rgb(255, 128, 0)',
				   'rgb(255, 128, 0)',
				   'rgb(249, 226, 15)'
				  ];
let dotColours = ['rgb(255, 255, 255)', 
				  'rgb(20, 40, 30)', 
				  'rgb(255, 128, 0)', 
				  'rgb(249, 226, 15)',
				  'null',
				  'null',
				  'null',
				  'null',
				  'null',
				 ];

let food;

const times = [];
let fps;

function init() {
	// Adjust display
	document.getElementById("display_num_fish").innerHTML = numFish;

	// Setup main canvas
	main_canvas = document.getElementById("canvas");
	main_ctx = main_canvas.getContext('2d');

	width = window.innerWidth;
	height = window.innerHeight;

	border = 50;

	main_canvas.width = width;
	main_canvas.height = height;

	// Setup offscreen canvas
	background_canvas = document.createElement('canvas');
	background_canvas.width = width;
	background_canvas.height = height;
	background_ctx = background_canvas.getContext('2d');

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
		const f = new Fish(background_ctx, xPos, yPos, numSegs);

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
	// const alpha = 1;
	// ctx.fillStyle = `rgba(30, 65, 90, ${alpha})`;
	// ctx.fillRect(0, 0, width, height);
	background_canvas.width = width;
	main_canvas.width = width;

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
	let fish;
	for (let i = 0; i < numFish; i++) {
		fish = school[i];
		
		fish.flock(school, i);

		fish.seekFood(food);

		fish.update();
		fish.draw();
	}

	measureFrames();

	main_ctx.drawImage(background_canvas, 0, 0);
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

function changeAlignment(newValue) {
	val = parseInt(newValue) / 10
	Fish.alignmentScale = val
}

function changeCohesion(newValue) {
	val = parseInt(newValue) / 10
	Fish.cohesionScale = val
}

function changeSeparation(newValue) {
	val = parseInt(newValue) / 10
	Fish.separationScale = val
}

init();
animate();

window.addEventListener("resize", init);

window.onunload = function() {
    console.log("about to clear event listeners prior to leaving page");
    
    window.removeEventListener('resize', init);
    document.body.removeEventListener("mousedown", placeFood);
    
    return;
}