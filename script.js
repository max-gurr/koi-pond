let canvas;
let ctx;
let width, height;
let border;
let center;
let centerSq = center*center;

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

	center = Math.min(width, height)/5;
	border = 50;

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
	const alpha = 0.15;
	ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
	ctx.fillRect(0, 0, width, height);

	// Do fishy things
	let fish, neighbour;
	for (let i = 0; i < numFish; i++) {
		fish = school[i];
		let neighbourCount = 0;
	    let cohesionX = 0;
	    let cohesionY = 0;
	    let alignmentX = 0;
	    let alignmentY = 0;
	    let separationX = 0;
	    let separationY = 0;

		for (let j = 0; j < numFish; j++) {
			if (i !== j) {
				neighbour = school[j];

				if (fish.canSeeNeighbour(neighbour)) {
					neighbourCount += 1;
					
					// Alignment
					alignmentX += neighbour.velX;
					alignmentY += neighbour.velY;

					// Cohesion
					cohesionX += neighbour.x;
					cohesionY += neighbour.y;

					// Separation
					const dx = fish.x - neighbour.x;
					const dy = fish.y - neighbour.y;
					const dist = Math.sqrt(dx * dx + dy * dy);
					if (dist < Fish.neighbourRadius/2) {
						// Magnitude of separation is inverse of view distance
						const separationMagnitude = Fish.neighbourRadius - dist;
						// Scale distance components by separation magnitude
						separationX += separationMagnitude * dx/dist;
						separationY += separationMagnitude * dy/dist;
					}
				}
			}

			// To get average forces across neighbour group
			// Divide each force component by the number of fish it came from
			if (neighbourCount > 0) {
				alignmentX = alignmentX / neighbourCount;
				alignmentY = alignmentY / neighbourCount;

				cohesionX = cohesionX / neighbourCount;
				cohesionY = cohesionY / neighbourCount;

				separationX = separationX / neighbourCount;
				separationY = separationY / neighbourCount;

				fish.applyAlignment(alignmentX, alignmentY);
				fish.applyCohesion(cohesionX, cohesionY);
				fish.applySeparation(separationX, separationY);
			}
		}

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