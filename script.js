let canvas;
let ctx;
let f;
let width, height;
let border = 50;

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
	f = new Fish(ctx, x=width/2, y=height/2, numSegs=3);
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

	maxVel = 1;
	minVel = 1;
	maxForce = 0.075;

	tick;

	constructor(c, x, y, numSegs) {
		this.ctx = c

		// Init with random vel
		this.velX = Math.random()*2-1;
		this.velY = Math.random()*2-1;

		// Set vel magnitude
		this._constrainVel();

		// Calc angle of randomised vel
		let angle = Math.atan2(this.velY, this.velX) - Math.PI;

		// Make segs using angle
		this.segs = this.constructSegments(this.ctx, angle);

		this.accX = 0;
		this.accY = 0;

		this.tick = 0;
	}

	constructSegments(ctx, angle) {
		let minLen = 5;
		let lenIncrement = 2;

		let segs = [];
		let head = new Segment(ctx, x, y, minLen + lenIncrement*numSegs, angle);
		segs.push(head);

		for (let i = 0; i < numSegs-1; i++) {
			let len = numSegs - (i+1);
			let tail = new Segment(ctx, head.bx, head.by, minLen + lenIncrement*len, angle);	
			segs.push(tail);

			head = tail;
		}

		return segs;
	}

	update() {
		// Move away from edges of screen
		this._avoidBorder();

		// Limit acc force
		this._constrainAcc();

		this.velX += this.accX;
		this.velY += this.accY;

		// Move fish segments
		this._moveSegments();
		
		// Constrain vel magnitude
		this._constrainVel();
		
		this.accX = 0;
		this.accY = 0;

		this.tick += 0.1;
	}

	_avoidBorder() {
		// Check position of head
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
	}

	_moveSegments() {
		// Update head with fish vel
		let head = this.segs[0];
		head.update(this.velX, this.velY);

		// Wiggle head of fish directly
		let adjustSize = 0.15 * Math.sin(this.tick + 0.15);
		let adjustAngle = head.angle - Math.PI/2;

		let xAdjust = adjustSize * Math.cos(adjustAngle);
		let yAdjust = adjustSize * Math.sin(adjustAngle);

		head.update(xAdjust, yAdjust);

		// Wiggle end of head segment by driving angle
		head.driveAngle(this.tick, 0);

		// Update other segs
		for (let i = 1; i < this.segs.length; i++) {
			// Follow the previous segment
			let tail = this.segs[i];
			tail.follow(head.bx, head.by);

			head = tail;

			// Wiggle segment by driving angle
			head.driveAngle(this.tick, i);
		}
	}

	draw() {
		for (let i = 0; i < this.segs.length; i++) {
			// Use position from tail to adjust size
			// +1 is necessary because each seg is 2 points,
			// so the size of the last dot would be 0
			this.segs[i].draw(this.segs.length - i + 1);
		}
	}

	_constrainVel() {
		let currentMag = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
		let desiredMag = Math.max(this.minVel, Math.min(this.maxVel, currentMag));

		this.velX = desiredMag * this.velX / currentMag
		this.velY = desiredMag * this.velY / currentMag;
	}

	_constrainAcc() {
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

	draw(index) {
		this.ctx.fillStyle = 'white';
		this.ctx.strokeStyle = 'white';

		let size = 1;

		this.ctx.beginPath(); 
		this.ctx.arc(this.ax, this.ay, size*index, 0, 2 * Math.PI, false);
		this.ctx.fill();
		this.ctx.arc(this.bx, this.by, size, 0, 2 * Math.PI, false);
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

	driveAngle(tick, index) {
		let angleIncrement = -0.5;
		let angle = tick + (angleIncrement * index);

		let startSize = 0.025;
		let sizeIncrement = 0.01;
		let size = startSize + (index * sizeIncrement);

		let adjust = size * Math.sin(angle);
		
		this.angle += adjust;
		
		this.calcB();
	}

	follow(x, y) {
		this.ax = x;
		this.ay = y;

		// Diff between point a and point b
		let dx = this.bx - this.ax;
		let dy = this.by - this.ay;

		// Angle between points
		this.angle = Math.atan2(dy, dx);

		this.calcB();
	}

	calcB() {
		this.bx = this.ax + this.len*Math.cos(this.angle);
		this.by = this.ay + this.len*Math.sin(this.angle);
	}
}


init();
animate();