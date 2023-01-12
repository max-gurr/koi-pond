class Fish {
	ctx;
	
	segs;
	x;
	y;
	velX;
	velY;
	accX;
	accY;

	maxVel = 1;
	minVel = 0.65;
	maxForce = 0.025;

	tick;

	constructor(c, x, y, numSegs) {
		this.ctx = c

		// Init with random vel
		// Random heading
		let angle = Math.random() * Math.PI * 2;
		
		this.velX = this.maxVel * Math.cos(angle);
		this.velY = this.maxVel * Math.sin(angle);

		// Make segs facing opposite to direction of velocity
		let segmentAngle = angle - Math.PI;
		this.segs = this.constructSegments(this.ctx, x, y, segmentAngle);
		this._updatePosition();

		this.accX = 0;
		this.accY = 0;

		// Individual ticker used for wiggle movement
		// Randomise start values so wiggles aren't synchronised
		this.tick = Math.random() * Math.PI
	}

	constructSegments(ctx, x, y, angle) {
		let minLen = 5;
		let lenIncrement = 2;

		let segs = [];
		let head = new Segment(ctx, x, y, minLen + lenIncrement*numSegs, angle);
		segs.push(head);

		for (let i = 0; i < numSegs-1; i++) {
			// Adjust length of segment based on position

			// Longest at second nodule
			// let lenFactor = numSegs + Math.abs(1 - i);
			
			// Longest at head
			let lenFactor = numSegs - (i+1);

			let segLen = minLen + lenIncrement * lenFactor;
			let tail = new Segment(ctx, head.bx, head.by, segLen, angle);	
			
			segs.push(tail);

			// Use tail of current segment as head of next segment
			head = tail;
		}

		return segs;
	}

	update() {
		// Move away from edges of screen
		this._avoidBorder();

		// Limit acc force
		let acc = this._constrainVector(this.accX, this.accY, 0, this.maxForce);
		this.accX = acc[0];
		this.accY = acc[1];

		this.velX += this.accX;
		this.velY += this.accY;

		// Constrain vel magnitude
		let vel = this._constrainVector(this.velX, this.velY, this.minVel, this.maxVel);
		this.velX = vel[0];
		this.velY = vel[1];
		
		// Move fish segments
		this._moveSegments();
		this._updatePosition();
		
		this.accX = this.accX/2;
		this.accY = this.accY/2;

		this.tick += 0.1;
		// Limit value so it doesn't increase to infinity
		this.tick = this.tick % (Math.PI * 2);
	}

	_updatePosition() {
		this.x = this.segs[0].ax;
		this.y = this.segs[0].ay;
	}

	_avoidBorder() {
		// Use position of head of first segment
		let x = this.x;
		let y = this.y;

		let xForce = 0, yForce = 0;
		
		// Push towards centre if at border
		if (x < border || (width - x) < border || 
			y < border || (height - y) < border) {
			// Random target position
			let targetX = width/2 + (Math.random() * (width/2 - border));
			let targetY = height/2 + (Math.random() * (height/2 - border));
			
			// Vector from current position to desired position
			// i.e. desired velocity
			let dx = targetX - x;
			let dy = targetY - y;

			// Vector from current velocity to desired velocity
			// i.e. acceleration force towards the desired velocity
			xForce += dx - this.velX;
			yForce += dy - this.velY;
		}
		
		this.accX += xForce;
		this.accY += yForce;
	}

	_moveSegments() {
		// Update head with fish vel
		let head = this.segs[0];
		head.update(this.velX, this.velY);

		// Wiggle head point of fish directly, 
		// 		perpendicular to direction of velocity

		// Size of wiggle movement
		// let adjustSize = 0.1 * Math.sin(this.tick);
		// let adjustAngle = head.angle - Math.PI/2;

		// // Vector of wiggle movement
		// let xAdjust = adjustSize * Math.cos(adjustAngle);
		// let yAdjust = adjustSize * Math.sin(adjustAngle);

		// head.update(xAdjust, yAdjust);

		// Wiggle other points by driving angle
		this._driveSegment(0);

		// Update other segs
		for (let i = 1; i < this.segs.length; i++) {
			// Follow the previous segment
			let tail = this.segs[i];
			tail.follow(head.bx, head.by);

			// Wiggle by driving angle
			this._driveSegment(i);

			head = tail;
		}
	}

	_driveSegment(index) {
		// Angle of wiggle on sine curve
		// Head and tail of fish should have same wiggle 
		// So adjust increment by num of points being driven
		let angleIncrement = -Math.PI/(this.segs.length);
		// Point being driven is tail of current segment
		// So point number is 1 + segment number
		let wiggleAngle = this.tick + (angleIncrement * (index+1));

		// Size coefficient for wiggle
		// Index is an arbitrary multiplier, doesn't need to specifically reference seg/point
		let startSize = 0.02;
		let sizeIncrement = 0.01;
		let wiggleSize = startSize + (sizeIncrement * index);

		this.segs[index].driveAngle(wiggleSize, wiggleAngle);
	}

	_constrainVector(x, y, min, max) {
		// Constrain vector to within desired magnitude
		let currentMag = Math.sqrt(x * x + y * y);
		let desiredMag = Math.max(min, Math.min(max, currentMag));

		let newX = desiredMag * x / currentMag;
		let newY = desiredMag * y / currentMag;

		return [
			newX || 0, 
			newY || 0
		];
	}

	draw() {
		const numSegs = this.segs.length;
		let seg, rightFish = [], leftFish = [];

		for (let i = 0; i < numSegs; i++) {
			seg = this.segs[i];

			// Use position from tail to adjust size
			// Largest at head
			const sizeFactor = numSegs - i;
			const sizeIncrement = 1.5;
			const minSize = 0;

			// Each segment has a point a and a point b
			const aWidth = minSize + sizeIncrement * sizeFactor;
			const bWidth = minSize + sizeIncrement * (sizeFactor-1);

			// Get co-ordinates of points to draw body
			if (i==0) {
				// Only draw head of the first segment
				// For all other segments, the head is a repeat
				// Of the tail it follows
				const aPoints = seg.getDrawingPointsA(aWidth);
				leftFish.push(aPoints[0]);
				rightFish.push(aPoints[1]);
			}
			
			const bPoints = seg.getDrawingPointsB(bWidth);
			leftFish.push(bPoints[0]);
			rightFish.push(bPoints[1]);
			
			// Drawing fish bodyparts
			const drawHead = i==0,
				  drawFins = i==0,
				  drawTail = i==numSegs-1;

			if (drawHead || drawFins || drawTail) {
				this.ctx.save();

				// Transform canvas to head of segment
				seg.transformToA();

				this.ctx.fillStyle = 'white';
				this.ctx.strokeStyle = 'white';

				if (drawHead) seg.drawFishHead(aWidth, bWidth);
				if (drawFins) seg.drawFishFins(aWidth, bWidth);

				// Transform canvas to tail of segment
				seg.transformToB();

				if (drawTail) seg.drawFishTail(aWidth, bWidth);
				
				this.ctx.restore();
			}
		}

		// Draw fish body
		this.drawFishBody(rightFish, leftFish);
	}

	drawFishBody(rightPoints, leftPoints) {
		this.ctx.fillStyle = 'white';
		this.ctx.strokeStyle = 'white';
		
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);

		let point;
		// Start drawing at top of right side of fish
		for (let i = 0; i < rightPoints.length; i++) {
			point = rightPoints[i];
			this.ctx.lineTo(point[0], point[1]);
		}
		// Path is at tail of right side of fish,
		// So continuing drawing from tail of left side
		for (let i = leftPoints.length-1; i >= 0; i--) {
			point = leftPoints[i];
			this.ctx.lineTo(point[0], point[1]);
		}
		// Path is at top of left side of fish

		this.ctx.fill();
		this.ctx.stroke();
		this.ctx.closePath();
	}
}
