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
	f = new Fish(ctx, width/2, height/2);
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
	velX;
	velY;
	accX;
	accY;

	maxVel;
	maxForce;

	constructor(c, x, y) {
		this.ctx = c
		this.maxVel = 1;
		this.maxForce = 0.1;

		// Init with random vel
		this.velX = Math.random()*2-1;
		this.velY = Math.random()*2-1;

		// Set vel magnitude
		this.constrainVel();

		// Calc angle of randomised vel
		let angle = Math.atan2(this.velY, this.velX) - Math.PI;
		// Make seg using angle
		let seg1 = new Segment(c, x, y, 10, angle);

		this.segs = [];
		this.segs.push(seg1);

		this.accX = 0;
		this.accY = 0;
	}

	update() {
		// Check position of head
		let border = 100;
		let x = this.segs[0].ax;
		let y = this.segs[0].ay;

		// Check x vs y edges separately to avoid quick turning
		if (x < border || (width - x) < border) {
			let targetX = width/2;
			let dx = targetX - x;
			this.accX += dx - this.velX;
		}
		if (y < border || (height - y) < border) {
			let targetY = height/2;
			let dy = targetY - y;
			this.accY += dy - this.velY;
		}
		// Limit acc force
		this.constrainAcc();

		this.velX += this.accX;
		this.velY += this.accY;

		// Constrain vel magnitude
		this.constrainVel();

		this.segs[0].update(this.velX, this.velY);
		
		this.accX = 0;
		this.accY = 0;
	}

	draw() {
		this.segs.forEach(p => {
			p.draw();
		});
	}

	constrainVel() {
		let max = this.maxVel;
		let mag = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
		
		this.velX = max * this.velX / mag
		this.velY = max * this.velY / mag;
	}

	constrainAcc() {
		let max = this.maxForce;
		let mag = Math.sqrt(this.accX * this.accX + this.accY * this.accY);
		
		if (mag > max) {
			this.accX = max * this.accX / mag
			this.accY = max * this.accY / mag;
		}
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