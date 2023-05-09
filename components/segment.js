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
		const dx = this.bx - this.ax;
		const dy = this.by - this.ay;

		// Angle between points
		this.angle = Math.atan2(dy, dx);

		// Adjust point b based on new angle and desired length
		this._calcB();
	}

	shift(vx, vy) {
		this.ax += vx;
		this.ay += vy;

		this.bx += vx;
		this.by += vy;
	}

	driveAngle(size, theta) {
		const adjust = size * Math.sin(theta);
		
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
		const dx = this.bx - this.ax;
		const dy = this.by - this.ay;

		// New angle between current head and old tail
		this.angle = Math.atan2(dy, dx);

		// Reposition tail with updated angle
		this._calcB();
	}

	_calcB() {
		this.ax = roundVal(this.ax, 10);
		this.ay = roundVal(this.ay, 10);
		// Place tail at desired length from head, at the given angle
		this.bx = roundVal(this.ax + this.len*Math.cos(this.angle), 10);
		this.by = roundVal(this.ay + this.len*Math.sin(this.angle), 10);
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
		const points = [];
		const offset = Math.PI/2;

		points.push([ 
			Math.round(this.ax + aWidth * Math.cos(this.angle - offset)), 
			Math.round(this.ay + aWidth * Math.sin(this.angle - offset))
		]);

		points.push([ 
			Math.round(this.ax + aWidth * Math.cos(this.angle + offset)), 
			Math.round(this.ay + aWidth * Math.sin(this.angle + offset))
		]);

		return points;
	}

	getDrawingPointsB(bWidth) {
		const points = [];
		const offset = Math.PI/2;

		points.push([
			Math.round(this.bx + bWidth * Math.cos(this.angle -offset)), 
			Math.round(this.by + bWidth * Math.sin(this.angle - offset))
		]);

		points.push([
			Math.round(this.bx + bWidth * Math.cos(this.angle + offset)), 
			Math.round(this.by + bWidth * Math.sin(this.angle + offset))
		]);

		return points;
	}

	drawFishHead(aWidth, bWidth) {
		// Draw half-circle for head of fish
		const curveHeight = Math.round(aWidth*2.5);
		const curveX = 			Math.round(aWidth+1);
		const curveWidth = 	Math.round(0.5*curveX);

		this.ctx.beginPath();

		this.ctx.moveTo(-curveX, 0);
		this.ctx.bezierCurveTo(-curveWidth, curveHeight, curveWidth, curveHeight, curveX, 0);
		this.ctx.closePath();
		
		this.ctx.fill();
	}

	drawFishFins(aWidth, bWidth) {
		// Draw fish fins
		const finSize = 		roundVal(aWidth, 10);
		const finX = 				Math.round(aWidth*0.5 + bWidth*0.5);
		const finY = 				Math.round(aWidth);
		const finStretch = 	1.5;

		this.ctx.beginPath();

		// Left fin
		this.ctx.moveTo(-finX, -finY);
		this.ctx.quadraticCurveTo(-(finX + finSize), -finY, -(finX+finSize), -(finY+finSize*finStretch));
		this.ctx.quadraticCurveTo(-finX, -(finY+finSize), -finX, -finY);
		
		// Right fin
		this.ctx.moveTo(finX, -finY);
		this.ctx.quadraticCurveTo((finX + finSize), -finY, (finX+finSize), -(finY+finSize*finStretch));
		this.ctx.quadraticCurveTo(finX, -(finY+finSize), finX, -finY);
		
		this.ctx.closePath();
		this.ctx.fill(); 
	}

	drawFishTail(aWidth, bWidth) {
		const tailX = 				0;
		const tailY = 				Math.round(-bWidth/3);
		const tailSize = 			Math.round(5 + bWidth);
		const tailStretch = 	roundVal(0.25 + aWidth/5, 10);

		this.ctx.beginPath();

		// Left fin
		this.ctx.moveTo(tailX, tailY);
		this.ctx.quadraticCurveTo(tailX-tailSize, tailY, tailX-tailSize, tailY-tailSize*tailStretch);
		this.ctx.quadraticCurveTo(tailX, tailY-tailSize, tailX, tailY);
		
		// Right fin
		this.ctx.moveTo(tailX, tailY);
		this.ctx.quadraticCurveTo(tailX+tailSize, tailY, tailX+tailSize, tailY-tailSize*tailStretch);
		this.ctx.quadraticCurveTo(tailX, tailY-tailSize, tailX, tailY);
		
		this.ctx.closePath();
		this.ctx.fill(); 
	}

	drawPointA(size) {
		this.ctx.beginPath();

		const x = this.ax;
		const y = this.ay;
		this.ctx.moveTo(x, y);
		this.ctx.arc(x, y, size, 0, 2*Math.PI);

		this.ctx.closePath();
		this.ctx.fill();
	}

	drawPointB(size) {
		this.ctx.beginPath();

		const x = this.bx;
		const y = this.by;
		this.ctx.moveTo(x, y);
		this.ctx.arc(x, y, size, 0, 2*Math.PI);

		this.ctx.closePath();
		this.ctx.fill();
	}
}
