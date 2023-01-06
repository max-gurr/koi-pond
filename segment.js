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

		// Initialise location of segment tail
		this.calcB();
	}

	draw(sizeFactor) {
		this.ctx.fillStyle = 'white';
		this.ctx.strokeStyle = 'white';

		// SizeFactor is the position of segment from the tail
		let sizeIncrement = 1.5;
		let minSize = 1;

		// Draw arc at head of segment
		this.ctx.beginPath(); 
		this.ctx.arc(this.ax, this.ay, minSize + sizeIncrement*sizeFactor, 0, 2 * Math.PI, false);
		this.ctx.fill();

		// Draw arc at tail of segment
		this.ctx.arc(this.bx, this.by, minSize + sizeIncrement*(sizeFactor-1), 0, 2 * Math.PI, false);
		this.ctx.fill();
	}

	update(vx, vy) {
		// Move head of segment
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

	driveAngle(size, theta) {
		let adjust = size * Math.sin(theta);
		
		// Use wiggle to adjust segment angle
		this.angle += adjust;
		// Recalculate tail position with new angle
		this.calcB();
	}

	follow(x, y) {
		// Set location of segment head
		this.ax = x;
		this.ay = y;

		// Distance between new head and old tail
		let dx = this.bx - this.ax;
		let dy = this.by - this.ay;

		// New angle between current head and old tail
		this.angle = Math.atan2(dy, dx);

		// Reposition tail with updated angle
		this.calcB();
	}

	calcB() {
		// Place tail at desired length from head, at the given angle
		this.bx = this.ax + this.len*Math.cos(this.angle);
		this.by = this.ay + this.len*Math.sin(this.angle);
	}
}
