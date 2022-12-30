let canvas;
let ctx;
let f;
let width, height;
let mouseX, mouseY;

window.addEventListener("resize", function() {init();})

function init() {
	// Setup canvas
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext('2d');

	width = window.innerWidth;
	height = window.innerHeight;

	canvas.width = width;
	canvas.height = height;


	mouseX = width/2;
	mouseY = height/2;

	// Make fish
	f = new Fish(ctx, 300, 300);
}

function animate() {
	ctx.fillStyle = "rgba(50, 50, 50, 1)";
	ctx.fillRect(0, 0, width, height);

	f.update();
	f.draw();

	// Cue next animation frame
	requestAnimationFrame(this.animate.bind(this));
}


class Fish {
	ctx;
	
	segs;
	vx;
	vy;
	ax;
	ay;

	constructor(c, x, y) {
		this.ctx = c
		
		this.segs = [];
		this.segs.push(new Segment(c, x, y, 10, 0));
		
		this.vx = Math.random();
		this.vy = Math.random(); 
		this.ax = 0;
		this.ay = 0;
	}

	update() {
		// Move towards mouse
		// let dmouseX = mouseX - this.vx;
		// let dmouseY = mouseY - this.vy;

		// this.ax += dmouseX;
		// this.ay += dmouseY;

		this.vx += this.ax;
		this.vy += this.ay;

		this.segs[0].update(this.vx, this.vy);
		
		this.ax = 0;
		this.ay = 0;
	}

	draw() {
		this.segs.forEach(p => {
			p.draw();
		});
	}
}


class Segment {
	ctx;
	ax;
	ay;
	bx;
	by;
	len;
	angle;

	constructor(ctx, x, y, len, angle) {
		this.ctx = ctx;
		this.len = len;
		this.angle = angle;
		this.ax = x;
		this.ay = y;

		this.calcB();
	}

	draw() {
		this.ctx.fillStyle = 'white';
		this.ctx.strokeStyle = 'white';

		this.ctx.beginPath(); 
		this.ctx.arc(this.ax, this.ay, 4, 0, 2 * Math.PI, false);
		this.ctx.fill();
		this.ctx.arc(this.bx, this.by, 2, 0, 2 * Math.PI, false);
		this.ctx.fill();
	}

	update(vx, vy) {
		// Move head of segment to new position
		this.ax += vx;
		this.ay += vy;

		// Move tail towards head

		// Diff between point a and point b
		let dx = this.bx - this.ax;
		let dy = this.by - this.ay;

		// Angle between points
		this.angle = Math.atan2(dy, dx);

		// Adjust point b based on new angle and desired length
		this.calcB();
	}

	calcB() {

		this.bx = this.ax + this.len*Math.cos(this.angle);
		this.by = this.ay + this.len*Math.sin(this.angle);
	}
}


init();
animate();