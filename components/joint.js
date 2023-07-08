class Joint {
	ctx;
	len;
	angle;
	x;
	y;
	parent;

	constructor(ctx, x, y, len, angle) {
		this.ctx = ctx;
		this.len = len;
		this.angle = angle;

		this.x = x;
		this.y = y;
	}

	setParent(parent) {
		this.parent = parent;
		this._calcJointPosition();
	}

	update(vx, vy) {
		// Move head
		this.x += vx;
		this.y += vy;
	}

	setAngle(angle) {
		this.angle = angle;
	}

	driveAngle(size, theta) {
		const adjust = size * Math.sin(theta);
		
		// Use wiggle to adjust segment angle
		this.angle += adjust;
		
		// Recalculate tail position with new angle
		if (this.parent != null) {
			this._calcJointPosition();
		}
	}

	followParent() {
		// Calculate angle to parent
		this.angle = Math.atan2(this.y - this.parent.y, this.x - this.parent.x);
		
		// Reposition tail with updated angle
		this._calcJointPosition();
	}

	_calcJointPosition() {
		// Position at desired length from head, at the given angle
		this.x = roundVal(this.parent.x + this.len*Math.cos(this.angle), 10);
		this.y = roundVal(this.parent.y + this.len*Math.sin(this.angle), 10);
	}

	transformToJoint() {
		// Translate canvas to joint
		this.ctx.translate(this.x, this.y);
		this.ctx.rotate(this.angle + Math.PI/2);
	}

	getDrawingPoints(width) {
		const points = [];
		const offset = Math.PI/2;

		points.push([ 
			Math.round(this.x + width * Math.cos(this.angle - offset)), 
			Math.round(this.y + width * Math.sin(this.angle - offset))
		]);

		points.push([ 
			Math.round(this.x + width * Math.cos(this.angle + offset)), 
			Math.round(this.y + width * Math.sin(this.angle + offset))
		]);

		return points;
	}

	drawFishHead(aWidth) {
		this.ctx.save();

		this.transformToJoint();

		// Draw half-circle for head of fish
		const curveHeight = Math.round(aWidth*2.5);
		const curveWidth = 			Math.round(aWidth);

		this.ctx.beginPath();

		this.ctx.rotate(Math.PI);
		this.ctx.moveTo(-curveWidth, 0);
		
		this.ctx.quadraticCurveTo(0, -curveHeight, curveWidth, 0);
		this.ctx.closePath();
		
		this.ctx.fill();

		this.ctx.restore();
	}

	drawFishFins(aWidth, yAdjust=0) {
		this.ctx.save();

		this.transformToJoint();

		// Draw fish fins
		const finSize = 		roundVal(aWidth*1.5, 10);
		const finX = 				Math.round(aWidth*1.3);
		const finY = 				Math.round(-aWidth+yAdjust);
		const finStretch = 	1.25;

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

		this.ctx.restore();
	}

	drawFishTail(aWidth) {
		this.ctx.save();

		this.transformToJoint();

		const tailX = 				0;
		const tailY = 				Math.round(-aWidth/3);
		const tailSize = 			Math.round(aWidth*1.5);
		const tailStretch = 	roundVal(aWidth/4, 10);

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

		this.ctx.restore();
	}

	drawPoint(size) {
		size = roundVal(size, 10);
		this.ctx.beginPath();

		this.ctx.moveTo(this.x, this.y);
		this.ctx.arc(this.x, this.y, size, 0, 2*Math.PI);

		this.ctx.closePath();
		this.ctx.fill();
	}
}
