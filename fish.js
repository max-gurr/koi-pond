class Fish {
	static maxVel = 1.5;
	static minVel = 0.75;
	static maxForce = 0.0014;
	static neighbourRadius = 50;
	static neighbourAngleMax = Math.PI/2;
	static neighbourAngleMin = 0;
	static separationRadius = Fish.neighbourRadius/1.5;
	static alignmentScale = 0.5;
	static cohesionScale = 0.8;
	static separationScale = 1.5;
	static borderScale = 2;
	static foodScale = 8;
	static grow = true;
	static maxLength = 6;
	
	ctx;
	
	segs;
	length;
	x;
	y;
	velX;
	velY;
	accX;
	accY;

	tick;

	bodyColour = 'white';
	dotColours = [];

	constructor(c, x, y, numSegs) {
		this.ctx = c

		// Init with random vel
		// Random heading
		const angle = Math.random() * Math.PI * 2;
		
		this.velX = Fish.maxVel * Math.cos(angle);
		this.velY = Fish.maxVel * Math.sin(angle);

		// Make segs facing opposite to direction of velocity
		const segmentAngle = angle - Math.PI;
		this.segs = this.constructSegments(x, y, segmentAngle, numSegs);
		this._updatePosition();

		this.accX = 0;
		this.accY = 0;

		// Individual ticker used for wiggle movement
		// Randomise start values so wiggles aren't synchronised
		this.tick = Math.random() * Math.PI
	}

	constructSegments(x, y, angle, numSegs) {
		this.length = 0;

		const minLen = 4;
		const lenIncrement = 2;

		const segs = [];
		let segLen = minLen + lenIncrement * numSegs;
		let head = new Segment(this.ctx, x, y, segLen, angle);

		segs.push(head);
		this.length += segLen;

		let tail;
		for (let i = 0; i < numSegs-1; i++) {
			// Adjust length of segment based on position

			// Longest at head
			const lenFactor = numSegs - (i+1);

			segLen = minLen + lenIncrement * lenFactor;
			tail = new Segment(ctx, head.bx, head.by, segLen, angle);	
			
			segs.push(tail);
			this.length += segLen;

			// Use tail of current segment as head of next segment
			head = tail;
		}

		return segs;
	}

	update() {
		// Move away from edges of screen
		this._wrapEdges();
		this._avoidBorder();

		// Apply accumulated forces to velocity
		this.velX += this.accX;
		this.velY += this.accY;

		// Constrain vel magnitude
		const vel = constrainVector(this.velX, this.velY, Fish.minVel, Fish.maxVel);
		this.velX = vel[0];
		this.velY = vel[1];
		
		// Move fish segments
		this._moveSegments();
		this._updatePosition();
		
		// Adjust tick increment by acceleration magnitude
		// So fish wiggles faster when accelerating
		const accMag = vectorLength(this.accX, this.accY);
		const scaledAccMag = accMag * 1.25;

		this.tick += 0.075 + Math.min(0.2, scaledAccMag);

		// Limit value so it doesn't increase to infinity
		this.tick = this.tick % (Math.PI * 2);

		
		// Reset acceleration
		this.accX = 0;
		this.accY = 0;
	}

	_updatePosition() {
		this.x = this.segs[0].ax;
		this.y = this.segs[0].ay;
	}

	_wrapEdges() {
		// Adjust position to be inside of screen
		const boundary = this.length * 1.15;
		const offset = this.length * 1.5;
		let xAdjust = 0, yAdjust = 0;
		if (this.x < -boundary) {
			// Fish is off left side of screen
            xAdjust += width + offset;
        } else if (this.x > width + boundary) {
        	// Fish is off right side of screen
            xAdjust -= (width + offset);
        }

        if (this.y < -boundary) {
        	// Fish is off top of screen
            yAdjust += height + offset;
        } else if (this.y > height + boundary) {
        	// Fish is off bottom of screen
            yAdjust -= (height + offset);
        }

        // Check if adjustment is needed
        if (xAdjust !== 0 || yAdjust !== 0) {
        	this.segs.forEach(s => {
        		s.shift(xAdjust, yAdjust);
        	});
		}
	}

	_avoidBorder() {
		let xForce = 0, yForce = 0;
		
		// Push towards centre if at border
		let distFromBorderX = border - Math.min(this.x, width - this.x);
		let distFromBorderY = border - Math.min(this.y, height - this.y);
		if (distFromBorderX > 0 || distFromBorderY > 0) {
			const targetX = width/2;
			const targetY = height/2;
			const dx = targetX - this.x;
			const dy = targetY - this.y;

			const distFromCenter = vectorLength(dx, dy);
			// Vector from current velocity to desired velocity
			// i.e. acceleration force towards the desired velocity
			xForce = (Fish.maxVel * dx / distFromCenter) - this.velX;
			yForce = (Fish.maxVel * dy / distFromCenter) - this.velY;

			let distScale = Math.max(Math.max(distFromBorderX, 1), Math.max(distFromBorderY, 1));
			const force = constrainVector(xForce, yForce, 0, Fish.maxForce);

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
		// Adjust by length of fish so small fish wiggle more per segment
		const startSize = 0.03/this.segs.length;

		// Adjust wiggle size by acceleration magnitude
		// So fish wiggles more when accelerating
		const accMag = vectorLength(this.accX, this.accY);
		const scaledAccMag = Math.min(0.015, accMag/3);
		const sizeIncrement = 0.03/this.segs.length + scaledAccMag;

		// Index is an arbitrary multiplier, doesn't need to specifically reference seg/point
		const wiggleSize = startSize + (sizeIncrement * index);

		this.segs[index].driveAngle(wiggleSize, wiggleAngle);
	}

	flock(school, i) {
		let neighbourCount = 0;
	    let cohesionX = 0;
	    let cohesionY = 0;
	    let alignmentX = 0;
	    let alignmentY = 0;
	    let separationX = 0;
	    let separationY = 0;

	    let neighbour;
		for (let j = 0; j < numFish; j++) {
			if (i !== j) {
				neighbour = school[j];
				// View from this fish to neighbour
				const view = this._viewToNeighbour(neighbour);
				const dist = view[0];
				const angle = view[1];

				// For alignment & cohesion,
				// Only go towards fish that are inside view angle
				const isAttractedToNeighbour = dist > 0 && 
					dist <= Fish.neighbourRadius && 
					angle <= Fish.neighbourAngleMax && 
					angle >= Fish.neighbourAngleMin
				// For separation 
				// Repel all nearby fish
				const isRepelledByNeighbour = dist > 0 && 
					dist <= Fish.separationRadius;

				if (isAttractedToNeighbour || isRepelledByNeighbour) {
					neighbourCount += 1;
					
					if (isAttractedToNeighbour) {
						// Alignment
						alignmentX += neighbour.velX;
						alignmentY += neighbour.velY;

						// Cohesion
						cohesionX += neighbour.x;
						cohesionY += neighbour.y;
					}

					if (isRepelledByNeighbour) {
						// Separation
						// Point away from neighbour
						const dx = this.x - neighbour.x;
						const dy = this.y - neighbour.y;
						// Magnitude of separation is inverse of view distance
						const separationMagnitude = Fish.neighbourRadius - dist;
						// Scale distance components by separation magnitude
						separationX += separationMagnitude * dx/dist;
						separationY += separationMagnitude * dy/dist;
					}
				}
			}

			// To get average forces across neighbour group
			// Divide each force component by the number of fish it came from
			if (neighbourCount > 0) {
				alignmentX = alignmentX / neighbourCount;
				alignmentY = alignmentY / neighbourCount;

				cohesionX = cohesionX / neighbourCount;
				cohesionY = cohesionY / neighbourCount;

				separationX = separationX / neighbourCount;
				separationY = separationY / neighbourCount;

				this.applyAlignment(alignmentX, alignmentY);
				this.applyCohesion(cohesionX, cohesionY);
				this.applySeparation(separationX, separationY);
			}
		}
	}

	_viewToNeighbour(neighbour) {
		// Distance between this fish and neighbour
		const xDist = neighbour.x - this.x;
		const yDist = neighbour.y - this.y;

		// Angle between this fish and neighbour
		const dotProduct = xDist * this.velX + yDist * this.velY;
		const distMag = vectorLength(xDist, yDist);
		const velMag = vectorLength(this.velX, this.velY);
		const theta = Math.acos(dotProduct/(distMag * velMag));

		return [distMag, theta];
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
		const alignment = constrainVector(alignmentX, alignmentY, 0, 1);

		// Force = difference in velocity
		let xForce = alignment[0] * Fish.maxVel - this.velX;
        let yForce = alignment[1] * Fish.maxVel - this.velY;

        // Limit force magnitude
        const force = constrainVector(xForce, yForce, 0, Fish.maxForce);

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
        const cohesion = constrainVector(cohesionX, cohesionY, 0, 1);
        // Force to get to desired velocity
        let xForce = cohesion[0] * Fish.maxVel - this.velX;
        let yForce = cohesion[1] * Fish.maxVel - this.velY;

        const force = constrainVector(xForce, yForce, 0, Fish.maxForce);

        // Scale by behaviour multiplier
        xForce = force[0] * Fish.cohesionScale;
        yForce = force[1] * Fish.cohesionScale;

        // Add to acceleration
        this.accX += xForce;
        this.accY += yForce;
	}

	applySeparation(separationX, separationY) {
		// Normalise
		const separation = constrainVector(separationX, separationY, 0, 1);

		// Force = difference in velocity
		let xForce = separation[0] * Fish.maxVel - this.velX;
		let yForce = separation[1] * Fish.maxVel - this.velY;

		const force = constrainVector(xForce, yForce, 0, Fish.maxForce);

		// Adjust by behaviour multiplier
		xForce = force[0] * Fish.separationScale;
		yForce = force[1] * Fish.separationScale;

		// Add to acc
		this.accX += xForce;
		this.accY += yForce;
	}

	seekFood(food) {
		// Only seek out the closest food
		let closestFood = null;
		let closestDistance = 10000000;
		let f;

		const eatDistance = Math.max(6, this.length/5);

		for (let i = 0; i < food.length; i++) {
			f = food[i];
			// Distance to food from this fish
			const dx = f[0] - this.x;
			const dy = f[1] - this.y;

			const dist = vectorLength(dx, dy);

			// Keep track of the min distance to any food item
			if (dist < closestDistance) {
				closestDistance = dist;
				closestFood = [dx, dy];

				// Eat food if on top of it
				if (dist < eatDistance) {
					eatFood(i);
					closestFood = null;

					if (Fish.grow) {
						this.grow(1);
					}

					break;				
				}
			}
		}

		// Seek out the closest food item, if any
		if (closestFood != null) {
			this.seek(closestFood[0], closestFood[1], Fish.foodScale);
		}
	}

	grow(size) {
		// Only grow if this fish hasn't reached size limit
		if (this.segs.length < Fish.maxLength) {
			this.segs = this.constructSegments(this.x, this.y, this.segs[0].angle, this.segs.length+size);
		}
	}

	seek(x, y, scale) {
		// Normalise
		const normalised = constrainVector(x, y, 0, 1);

		// Force = difference in velocity
		let xForce = normalised[0] * Fish.maxVel - this.velX;
		let yForce = normalised[1] * Fish.maxVel - this.velY;

		const force = constrainVector(xForce, yForce, 0, Fish.maxForce);

		// Adjust by behaviour multiplier
		xForce = force[0] * scale;
		yForce = force[1] * scale;

		// Add to acc
		this.accX += xForce;
		this.accY += yForce;
	}

	draw() {
		const numSegs = this.segs.length;
		let seg, rightFish = [], leftFish = [];

		this.ctx.fillStyle = this.bodyColour;
		this.ctx.strokeStyle = this.bodyColour;

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

				const aWidthSized = aWidth + this.segs.length;
				const bWidthSized = bWidth + this.segs.length;

				if (drawHead) seg.drawFishHead(aWidth, bWidth);
				if (drawFins) seg.drawFishFins(aWidth, bWidthSized);

				// Transform canvas to tail of segment
				seg.transformToB();

				if (drawTail) seg.drawFishTail(aWidthSized, bWidthSized);
				
				this.ctx.restore();
			}
		}

		// Draw fish body
		this._drawFishBody(rightFish, leftFish);
		this._drawDots();
		// this._drawVector(this.velX, this.velY, 20);
	}

	_drawVector(x, y, scale = 1) {
		this.ctx.strokeStyle = 'red';
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.ctx.lineTo(this.x + x * scale, this.y + y * scale);
		this.ctx.closePath();
		this.ctx.stroke();
	}

	_drawFishBody(rightPoints, leftPoints) {
		
		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);

		// Start drawing at top of right side of fish
		rightPoints.forEach(p => {
			this.ctx.lineTo(p[0], p[1]);
		})
		// Path is at tail of right side of fish,
		// So continuing drawing from tail of left side
		leftPoints.reverse().forEach(p => {
			this.ctx.lineTo(p[0], p[1]);
		})
		// Path is at top of left side of fish
		// this.ctx.closePath();

		this.ctx.fill();
		this.ctx.stroke();
	}

	_drawDots() {
		// Go through each stored dot colour
		for (let i = 0; i < this.dotColours.length; i++) {
			if (this.dotColours[i] == "null") {
				continue;
			}
			
			this.ctx.fillStyle = this.dotColours[i];
			this.ctx.strokeStyle = this.dotColours[i];

			// Adjust size based on position from head
			const sizeFactor = this.segs.length - i;
			const sizeIncrement = 1.3;
			const minSize = 0.5;

			const size = minSize + sizeIncrement * sizeFactor;

			this.segs[i].drawPointA(size);
		}
	}

	setBodyColour(newColour) {
		this.bodyColour = newColour;
	}

	setDotColours(colourList) {
		for (let i = 0; i < this.segs.length; i++) {
			// Pick a random colour 
			const randomColour = colourList[parseInt(Math.random() * colourList.length)];
			this.dotColours[i] = randomColour;
		}
	}
}
