let canvas;
let ctx;
let f;
let width, height;

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
	f = new Fish(ctx, 100, 100);
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
	
	points;
	vx;
	vy;
	ax;
	ay;

	constructor(c, x, y) {
		this.ctx = c

		this.points = [];
		this.points.push(new Point(c, x, y));
		
		this.vx = Math.random();
		this.vy = Math.random(); 
		this.ax = 0;
		this.ay = 0;
	}

	update() {
		this.vx += this.ax;
		this.vy += this.ay;

		this.points[0].update(this.vx, this.vy);
		
		this.ax = 0;
		this.ay = 0;
	}

	draw() {
		this.points.forEach(p => {
			p.draw();
		});
	}
}


class Point {
	ctx;
	x;
	y;

	constructor(ctx, x, y) {
		this.ctx = ctx;
		this.x = x;
		this.y = y;
	}

	draw() {
		this.ctx.fillStyle = 'white';
		this.ctx.strokeStyle = 'white';

		this.ctx.beginPath(); 
		this.ctx.arc(this.x, this.y, 2, 0, 2 * Math.PI, false);
		this.ctx.fill(); 
	}

	update(vx, vy) {
		this.x += vx;
		this.y += vy;
	}
}


init();
animate();