class Fish {
	ctx;
	
	segs;
	velX;
	velY;
	accX;
	accY;

	maxVel = 1;
	minVel = 0.75;
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
		
		this.accX = this.accX/2;
		this.accY = this.accY/2;

		this.tick += 0.1;
		// Limit value so it doesn't increase to infinity
		this.tick = this.tick % (Math.PI * 2);
	}

	_avoidBorder() {
		// Use position of head of first segment
		let x = this.segs[0].ax;
		let y = this.segs[0].ay;

		let xForce = 0, yForce = 0;
		
		/*
		// Check x vs y edges separately to avoid quick turning
		if (x < border || (width - x) < border) {
			let targetX = width/2 + Math.random() * width/2;
			let dx = targetX - x;
			
			xForce = dx - this.velX;
		}
		if (y < border || (height - y) < border) {
			let targetY = height/2 + Math.random() * height/2;
			let dy = targetY - y;
			
			yForce = dy - this.velY;
		}
		*/
		
		
		// Push towards centre if at border
		if (x < border || (width - x) < border || 
			y < border || (height - y) < border) {
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
		

		Math.acos();

		this.accX += xForce;
		this.accY += yForce;
	}

	_moveSegments() {
		// Update head with fish vel
		let head = this.segs[0];
		head.update(this.velX, this.velY);

		// // Wiggle head point of fish directly, 
		// // 		perpendicular to direction of velocity

		// // Size of wiggle movement
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
		let startSize = 0.01;
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
		for (let i = 0; i < this.segs.length; i++) {
			this.ctx.save();
			// Use position from tail to adjust size
			
			// Largest at second nodule
			// let sizeFactor = this.segs.length - Math.abs(1 - i);
			
			// Largest at head
			let sizeFactor = this.segs.length - i;
			
			let drawHead = i==0;
			let drawFins = i==0;
			let drawTail = i==this.segs.length-1;
			this.segs[i].draw(sizeFactor, drawHead, drawTail, drawFins);
			this.ctx.restore();
		}
	}
}
