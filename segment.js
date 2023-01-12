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
		this._calcB();
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
		this._calcB();
	}

	driveAngle(size, theta) {
		let adjust = size * Math.sin(theta);
		
		// Use wiggle to adjust segment angle
		this.angle += adjust;
		
		// Recalculate tail position with new angle
		this._calcB();
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
		this._calcB();
	}

	_calcB() {
		// Place tail at desired length from head, at the given angle
		this.bx = this.ax + this.len*Math.cos(this.angle);
		this.by = this.ay + this.len*Math.sin(this.angle);
	}

	transformToA() {
		// Translate canvas to point a
		this.ctx.translate(this.ax, this.ay);
		this.ctx.rotate(this.angle + Math.PI/2);
	}

	transformToB() {
		this.ctx.translate(0, -this.len);
	}

	getDrawingPointsA(aWidth) {
		let points = [];
		let offset = Math.PI/2;

		points.push([
			this.ax + aWidth * Math.cos(this.angle - offset), 
			this.ay + aWidth * Math.sin(this.angle - offset)
		]);

		points.push([
			this.ax + aWidth * Math.cos(this.angle + offset), 
			this.ay + aWidth * Math.sin(this.angle + offset)
		]);

		return points;
	}

	getDrawingPointsB(bWidth) {
		let points = [];
		let offset = Math.PI/2;

		points.push([
			this.bx + bWidth * Math.cos(this.angle -offset), 
			this.by + bWidth * Math.sin(this.angle - offset)
		]);

		points.push([
			this.bx + bWidth * Math.cos(this.angle + offset), 
			this.by + bWidth * Math.sin(this.angle + offset)
		]);

		return points;
	}

	drawFishHead(aWidth, bWidth) {
		// Draw half-circle for head of fish
		let curveHeight = aWidth*2;
		let curveWidth = 0.5*aWidth;

		this.ctx.beginPath();

		this.ctx.moveTo(-aWidth, 0);
		this.ctx.bezierCurveTo(-curveWidth, curveHeight, curveWidth, curveHeight, aWidth, 0);
		
		this.ctx.fill();
		this.ctx.closePath();
	}

	drawFishFins(aWidth, bWidth) {
		// Draw fish fins
		let finSize = 4;
		let finX = bWidth*2;
		let finY = aWidth/1;
		let finStretch = 1.25;

		this.ctx.beginPath();

		// Left fin
		this.ctx.moveTo(-finX, -finY);
		this.ctx.quadraticCurveTo(-(finX + finSize), -finY, -(finX+finSize), -(finY+finSize*finStretch));
		this.ctx.quadraticCurveTo(-finX, -(finY+finSize), -finX, -finY);
		
		// Right fin
		this.ctx.moveTo(finX, -finY);
		this.ctx.quadraticCurveTo((finX + finSize), -finY, (finX+finSize), -(finY+finSize*finStretch));
		this.ctx.quadraticCurveTo(finX, -(finY+finSize), finX, -finY);
		
		this.ctx.fill(); 
		this.ctx.closePath();
	}

	drawFishTail(aWidth, bWidth) {
		let tailX = 0;
		let tailY = 0;
		let tailSize = 5;
		let tailStretch = 1.5;

		this.ctx.beginPath();

		// Left fin
		this.ctx.moveTo(tailX, tailY);
		this.ctx.quadraticCurveTo(-tailSize, 0, -tailSize, -tailSize*tailStretch);
		this.ctx.quadraticCurveTo(0, -tailSize, 0, 0);
		
		// Right fin
		this.ctx.moveTo(0, 0);
		this.ctx.quadraticCurveTo(tailSize, 0, tailSize, -tailSize*tailStretch);
		this.ctx.quadraticCurveTo(0, -tailSize, 0, 0);
		
		this.ctx.fill(); 
		this.ctx.closePath();
	}
}
