let canvas;
let ctx;
let f;
let width, height;
let border = 50;

let numFish = 5;
let school;

window.addEventListener("resize", function() {init();})

function init() {
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
		let xPos = width/2 + (Math.random() * 2 - 1) * (width/2 - border);
		let yPos = height/2 + (Math.random() *2 - 1) * (height/2 - border);

		f = new Fish(ctx, xPos, yPos, numSegs=3);
		
		school.push(f);	
	}
	
}

function animate() {
	ctx.fillStyle = "rgba(50, 50, 50, 1)";
	ctx.fillRect(0, 0, width, height);

	school.forEach((fish) => {
		fish.update();
		fish.draw();
	});

	// Cue next animation frame
	requestAnimationFrame(this.animate.bind(this));
}


init();
animate();