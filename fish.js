class Fish {
	static maxVel = 1.5;
	static minVel = 1;
	static maxForce = 0.004;
	static neighbourRadius = 75;
	static neighbourRadiusSq = Fish.neighbourRadius * Fish.neighbourRadius;
	static neighbourAngleMax = Math.PI/1.5;
	static neighbourAngleMin = Math.PI/8;
	static alignmentScale = 0.4;
	static cohesionScale = 0.3;
	static separationScale = 1.5;
	static borderScale = 2;
	
	ctx;
	
	segs;
	x;
	y;
	velX;
	velY;
	accX;
	accY;

	tick;

	constructor(c, x, y, numSegs) {
		this.ctx = c

		// Init with random vel
		// Random heading
		const angle = Math.random() * Math.PI * 2;
		
		this.velX = Fish.maxVel * Math.cos(angle);
		this.velY = Fish.maxVel * Math.sin(angle);

		// Make segs facing opposite to direction of velocity
		const segmentAngle = angle - Math.PI;
		this.segs = this.constructSegments(this.ctx, x, y, segmentAngle);
		this._updatePosition();

		this.accX = 0;
		this.accY = 0;

		// Individual ticker used for wiggle movement
		// Randomise start values so wiggles aren't synchronised
		this.tick = Math.random() * Math.PI
	}

	constructSegments(ctx, x, y, angle) {
		const minLen = 5;
		const lenIncrement = 2;

		const segs = [];
		let head = new Segment(ctx, x, y, minLen + lenIncrement*numSegs, angle);
		segs.push(head);

		let tail;
		for (let i = 0; i < numSegs-1; i++) {
			// Adjust length of segment based on position

			// Longest at second nodule
			// let lenFactor = numSegs + Math.abs(1 - i);
			
			// Longest at head
			const lenFactor = numSegs - (i+1);

			const segLen = minLen + lenIncrement * lenFactor;
			tail = new Segment(ctx, head.bx, head.by, segLen, angle);	
			
			segs.push(tail);

			// Use tail of current segment as head of next segment
			head = tail;
		}

		return segs;
	}

	update() {
		// Move away from edges of screen
		this._avoidBorder();
		this._wrapEdges();

		// Apply accumulated forces to velocity
		this.velX += this.accX;
		this.velY += this.accY;

		// Constrain vel magnitude
		const vel = this._constrainVector(this.velX, this.velY, Fish.minVel, Fish.maxVel);
		this.velX = vel[0];
		this.velY = vel[1];
		
		// Move fish segments
		this._moveSegments();
		this._updatePosition();
		
		// Reset acceleration
		this.accX = 0;
		this.accY = 0;

		this.tick += 0.1;
		// Limit value so it doesn't increase to infinity
		this.tick = this.tick % (Math.PI * 2);
	}

	_updatePosition() {
		this.x = this.segs[0].ax;
		this.y = this.segs[0].ay;
	}

	_wrapEdges() {
		// Adjust position to be inside of screen
		let xAdjust = 0, yAdjust = 0;
		if (this.x < -border) {
			// Fish is off left side of screen
            xAdjust += width + border*2;
        } else if (this.x > width + border) {
        	// Fish is off right side of screen
            xAdjust -= (width + border*2);
        }

        if (this.y < -border) {
        	// Fish is off top of screen
            yAdjust += height + border*2;
        } else if (this.y > height + border) {
        	// Fish is off bottom of screen
            yAdjust -= (height + border*2);
        }

        this.segs[0].ax += xAdjust;
        this.segs[0].ay += yAdjust;
	}

	_avoidBorder() {
		let xForce = 0, yForce = 0;
		
		// Push towards centre if at border
		let distFromBorderX = border - Math.min(this.x, width - this.x);
		let distFromBorderY = border - Math.min(this.y, height - this.y);
		// console.log(distFromBorderX, distFromBorderY);
		if (distFromBorderX > 0 || distFromBorderY > 0) {
			const targetX = width/2;
			const targetY = height/2;
			const dx = targetX - this.x;
			const dy = targetY - this.y;

			const distFromCenter = Math.sqrt(dx*dx + dy*dy);
			// Vector from current velocity to desired velocity
			// i.e. acceleration force towards the desired velocity
			xForce = (Fish.maxVel * dx / distFromCenter) - this.velX;
			yForce = (Fish.maxVel * dy / distFromCenter) - this.velY;

			let distScale = Math.max(Math.max(distFromBorderX, 1), Math.max(distFromBorderY, 1));
			const force = this._constrainVector(xForce, yForce, 0, Fish.maxForce);

			xForce = force[0] * Fish.borderScale;
			yForce = force[1] * Fish.borderScale;
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
		let tail;
		for (let i = 1; i < this.segs.length; i++) {
			// Follow the previous segment
			tail = this.segs[i];
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
		const angleIncrement = -Math.PI/(this.segs.length);
		// Point being driven is tail of current segment
		// So point number is 1 + segment number
		const wiggleAngle = this.tick + (angleIncrement * (index+1));

		// Size coefficient for wiggle
		// Index is an arbitrary multiplier, doesn't need to specifically reference seg/point
		const startSize = 0.015;
		const sizeIncrement = 0.01;
		const wiggleSize = startSize + (sizeIncrement * index);

		this.segs[index].driveAngle(wiggleSize, wiggleAngle);
	}

	_constrainVector(x, y, min, max) {
		// Constrain vector to within desired magnitude
		const currentMag = Math.sqrt(x * x + y * y);
		const desiredMag = Math.max(min, Math.min(max, currentMag));

		const newX = desiredMag * x / currentMag;
		const newY = desiredMag * y / currentMag;

		return [
			newX || 0, 
			newY || 0
		];
	}

	canSeeNeighbour(neighbour) {
		// Distance between this fish and neighbour
		const xDist = neighbour.x - this.x;
		const yDist = neighbour.y - this.y;

		// Angle between this fish and neighbour
		const dotProduct = xDist * this.velX + yDist * this.velY;
		const distMag = Math.sqrt(xDist * xDist + yDist * yDist);
		const velMag = Math.sqrt(this.velX * this.velX + this.velY * this.velY);
		const theta = Math.acos(dotProduct/(distMag * velMag));

		// Check if neighbour is visible
		if (distMag > 0 && 
			distMag < Fish.neighbourRadius && 
			theta < Fish.neighbourAngleMax && 
			theta > Fish.neighbourAngleMin
		) {
			// this._lineToNeighbour(neighbour);
			return true;
		} else {
			return false;
		}
	}

	_lineToNeighbour(neighbour) {
		// Draw line from fish to neighbour
		this.ctx.strokeStyle = 'red';
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.ctx.lineTo(neighbour.x, neighbour.y);
		this.ctx.closePath();
		this.ctx.stroke();
	}

	applyAlignment(alignmentX, alignmentY) {
		// Normalise
		const alignment = this._constrainVector(alignmentX, alignmentY, 1, 1);

		// Force = difference in velocity
		let xForce = alignment[0] * Fish.maxVel - this.velX;
        let yForce = alignment[1] * Fish.maxVel - this.velY;

        // Limit force magnitude
        let force = this._constrainVector(xForce, yForce, 0, Fish.maxForce);

        // Adjust by behaviour multipler
        xForce = force[0] * Fish.alignmentScale;
        yForce = force[1] * Fish.alignmentScale;

        // Add to acc
        this.accX += xForce;
        this.accY += yForce;
	}

	applyCohesion(cohesionX, cohesionY) {
		// Desired velocity
        const dx = cohesionX - this.x;
        const dy = cohesionY - this.y;

        // Normalise
        const cohesion = this._constrainVector(cohesionX, cohesionY, 1, 1);
        // Force to get to desired velocity
        let xForce = cohesion[0] * Fish.maxVel - this.velX;
        let yForce = cohesion[1] * Fish.maxVel - this.velY;

        let force = this._constrainVector(xForce, yForce, 0, Fish.maxForce);

        // Scale by behaviour multiplier
        xForce = force[0] * Fish.cohesionScale;
        yForce = force[1] * Fish.cohesionScale;

        // Add to acceleration
        this.accX += xForce;
        this.accY += yForce;
	}

	applySeparation(separationX, separationY) {
		// Normalise
		const separation = this._constrainVector(separationX, separationY, 1, 1);

		// Force = difference in velocity
		let xForce = separation[0] * Fish.maxVel - this.velX;
		let yForce = separation[1] * Fish.maxVel - this.velY;

		let force = this._constrainVector(xForce, yForce, 0, Fish.maxForce);

		// Adjust by behaviour multiplier
		xForce = force[0] * Fish.separationScale;
		yForce = force[1] * Fish.separationScale;

		// Add to acc
		this.accX += xForce;
		this.accY += yForce;
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
		this._drawFishBody(rightFish, leftFish);
		// this._drawVector(this.velX, this.velY, 20);
	}

	_drawVector(x, y, scale = 1) {
		this.ctx.strokeStyle = 'blue';
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.ctx.lineTo(this.x + x * scale, this.y + y * scale);
		this.ctx.closePath();
		this.ctx.stroke();
	}

	_drawFishBody(rightPoints, leftPoints) {
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
		this.ctx.closePath();

		this.ctx.fill();
		this.ctx.stroke();
	}
}
