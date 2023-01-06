class Fish {
	ctx;
	
	segs;
	velX;
	velY;
	accX;
	accY;

	maxVel = 1;
	minVel = 0;
	maxForce = 0.025;

	tick;

	constructor(c, x, y, numSegs) {
		this.ctx = c

		// Init with random vel
		// Random heading
		let angle = Math.random() * Math.PI * 2;
		// Random velocity within desired range
		let vel = Math.random() * (this.maxVel - this.minVel) + this.minVel;
		
		this.velX = this.maxVel * Math.cos(angle);
		this.velY = this.maxVel * Math.sin(angle);

		// Constrain vel magnitude
		this._constrainVel();

		// Make segs facing opposite to direction of velocity
		let segmentAngle = angle - Math.PI;
		this.segs = this.constructSegments(this.ctx, x, y, segmentAngle);

		this.accX = 0;
		this.accY = 0;

		// Individual ticker used for wiggle movement
		// Randomise start values so wiggles aren't synchronised
		this.tick = Math.random() * Math.PI * 2;
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
		this._constrainAcc();

		this.velX += this.accX;
		this.velY += this.accY;

		// Move fish segments
		this._moveSegments();
		
		// Constrain vel magnitude
		this._constrainVel();
		
		this.accX = this.accX/2;
		this.accY = this.accY/2;

		this.tick += 0.1;
	}

	_avoidBorder() {
		// Use position of head of first segment
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
		
		
		/*
		// Push towards centre if at border
		if (x < border || (width - x) < border || 
			y < border || (height - y) < border) {
			let targetX = width/2;
			let targetY = height/2;

			// Vector from current position to desired position
			// i.e. desired velocity
			let dx = targetX - x;
			let dy = targetY - y;

			// Vector from current velocity to desired velocity
			// i.e. acceleration force towards the desired velocity
			this.accX += dx - this.velX;
			this.accY += dy - this.velY;
		}
		*/
	}

	_moveSegments() {
		// Update head with fish vel
		let head = this.segs[0];
		head.update(this.velX, this.velY);

		// Wiggle head of fish directly, 
		// perpendicular to direction of velocity

		// Size of wiggle movement
		let adjustSize = 0.1 * Math.sin(this.tick + 0.25);
		let adjustAngle = head.angle - Math.PI/2;

		// Vector of wiggle movement
		let xAdjust = adjustSize * Math.cos(adjustAngle);
		let yAdjust = adjustSize * Math.sin(adjustAngle);

		head.update(xAdjust, yAdjust);

		// Wiggle next nodule by driving angle
		this._driveSegment(head, 0);

		// Update other segs
		for (let i = 1; i < this.segs.length; i++) {
			// Follow the previous segment
			let tail = this.segs[i];
			tail.follow(head.bx, head.by);

			// Wiggle by driving angle
			this._driveSegment(tail, i);

			head = tail;
		}
	}

	_driveSegment(segment, index) {		
		// Angle of wiggle on sine curve
		// Head and tail of fish should have same wiggle - so adjust increment by num of segs
		// Each segment has 2 points, so number of points to wiggle is num of segs +1
		let angleIncrement = -1 * Math.PI/(this.segs.length+1);
		let wiggleAngle = this.tick + (angleIncrement * index);

		// Size coefficient for wiggle
		let startSize = 0.025;
		let sizeIncrement = 0.01;
		let wiggleSize = startSize + (index * sizeIncrement);

		segment.driveAngle(wiggleSize, wiggleAngle);
	}

	_constrainVector(x, y, min, max) {
		// Constrain vector to within desired magnitude
		let currentMag = Math.sqrt(x * x + y * y);
		let desiredMag = Math.max(min, Math.min(max, currentMag));

		let newX = desiredMag * x / currentMag
		let newY = desiredMag * y / currentMag;

		return [newX, newY];
	}

	draw() {
		for (let i = 0; i < this.segs.length; i++) {
			// Use position from tail to adjust size
			
			// Largest at second nodule
			// let sizeFactor = this.segs.length - Math.abs(1 - i);
			
			// Largest at head
			let sizeFactor = this.segs.length - i;

			this.segs[i].draw(sizeFactor);
		}
	}

	_constrainVel() {
		// Adjust velocity vector to within desired magnitude
		let currentMag = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
		let desiredMag = Math.max(this.minVel, Math.min(this.maxVel, currentMag));

		this.velX = desiredMag * this.velX / currentMag
		this.velY = desiredMag * this.velY / currentMag;
	}

	_constrainAcc() {
		// Adjust acceleration vector to within desired magnitude
		let max = this.maxForce;
		let mag = Math.sqrt(this.accX * this.accX + this.accY * this.accY);
		
		if (mag > max) {
			this.accX = max * this.accX / mag
			this.accY = max * this.accY / mag;
		}
	}
}
