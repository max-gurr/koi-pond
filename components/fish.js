class Fish {
	static maxVel = 1.25;
	static minVel = 0.75;
	static maxForce = 0.0014;
	static neighbourRadius = 60;
	static neighbourAngleMax = Math.PI/1.75;
	static neighbourAngleMin = 0;
	static separationRadius = Fish.neighbourRadius/1.5;
	static alignmentScale = 0.5;
	static cohesionScale = 0.7;
	static separationScale = 1.2;
	static borderScale = 2.5;
	static foodScale = 8;
	static grow = true;
	static maxLength = 6;
	
	ctx;
	
	joints;
	length;
	x;
	y;
	tailX;
	tailY;
	velX;
	velY;
	accX;
	accY;

	tick;

	bodyColour = 'white';
	dotColours = [];

	constructor(c, x, y, numJoints) {
		this.ctx = c

		// Init with random vel
		// Random heading
		const angle = Math.random() * Math.PI * 2;
		
		this.velX = Fish.maxVel * Math.cos(angle);
		this.velY = Fish.maxVel * Math.sin(angle);

		// Make joints facing opposite to direction of velocity
		const jointAngle = angle - Math.PI;
		this.joints = this.constructJoints(x, y, jointAngle, numJoints);
		this._updatePosition();

		this.accX = 0;
		this.accY = 0;

		// Individual ticker used for wiggle movement
		// Randomise start values so wiggles aren't synchronised
		this.tick = Math.random() * Math.PI
	}

	constructJoints(x, y, angle, numJoints) {
		this.length = 0;

		const minLen = 4;
		const lenIncrement = 2.5;

		const joints = [];
		let jointLen = minLen + lenIncrement * numJoints;

		// Head
		joints.push(new Joint(this.ctx, x, y, jointLen, angle));
		this.length += jointLen;

		let joint;
		for (let i = 0; i < numJoints-1; i++) {
			// Adjust length of joint based on position
			// Longest at head
			const lenFactor = numJoints - (i+1);
			jointLen = minLen + lenIncrement * lenFactor;
			
			joint = new Joint(this.ctx, x, y, jointLen, angle)
			joint.setParent(joints[i]);
			joints.push(joint);
			this.length += jointLen;
		}

		return joints;
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
		
		this._moveJoints();
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
		this.x = this.joints[0].x;
		this.y = this.joints[0].y;
		this.tailX = this.joints[this.joints.length-1].x;
		this.tailY = this.joints[this.joints.length-1].y;
	}

	_wrapEdges() {
		// Adjust position to be inside of screen
		const boundary = this.length * 1.15;
		const offset = this.length * 1.5;
		let xAdjust = 0, yAdjust = 0;
		if (this.x < -boundary) {
			// Fish is off left side of screen
			xAdjust += width + offset;
		} 
		else if (this.x > width + boundary) {
			// Fish is off right side of screen
			xAdjust -= (width + offset);
		}

		if (this.y < -boundary) {
			// Fish is off top of screen
			yAdjust += height + offset;
		} 
		else if (this.y > height + boundary) {
			// Fish is off bottom of screen
			yAdjust -= (height + offset);
		}

		// Check if adjustment is needed
		if (xAdjust !== 0 || yAdjust !== 0) {
			this.joints.forEach(j => {
				j.update(xAdjust, yAdjust);
			});
		}
	}

	_avoidBorder() {
		let xForce = 0, yForce = 0;

		// Relative distance from center of screen
		const xDist = (width/2 - this.x)/(width/2);
		const yDist = (height/2 - this.y)/(height/2);

		// Adjust angle to be perpendicular to fish direction, around center of screen
		// But also want to point slightly towards center of screen
		const angle = vectorAngle(xDist, yDist) + Math.PI/3;
		const t_dist = vectorLength(xDist, yDist);

		// Apply force at right angle to distance vector, 
		// so fish circles the center of screen
		xForce = t_dist * Math.cos(angle);
		yForce = t_dist * Math.sin(angle);

		const force = constrainVector(xForce, yForce, 0, Fish.maxForce);
		xForce = force[0] * Fish.borderScale;
		yForce = force[1] * Fish.borderScale;
		
		this.accX += xForce;
		this.accY += yForce;
	}

	_moveJoints() {
		// Update head with fish vel
		this.joints[0].update(this.velX, this.velY);
		this.joints[0].setAngle(vectorAngle(this.velX, this.velY) + Math.PI);

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
		this._driveJoint(0);

		// Update other joints
		for (let i = 1; i < this.joints.length; i++) {
			this.joints[i].followParent();

			// Wiggle by driving angle
			this._driveJoint(i);
		}
	}

	_driveJoint(index) {
		// Angle of wiggle on sine curve
		// Head and tail of fish should have same wiggle 
		// So adjust increment by num of points being driven
		const angleIncrement = -Math.PI/(this.joints.length);
		// Point being driven is tail of current joint
		// So point number is 1 + joint number
		const wiggleAngle = this.tick + (angleIncrement * (index+1));


		// Size coefficient for wiggle
		// Adjust by length of fish so small fish wiggle more per joint
		const startSize = 0.02/this.joints.length;

		// Adjust wiggle size by acceleration magnitude
		// So fish wiggles more when accelerating
		const accMag = vectorLength(this.accX, this.accY);
		const scaledAccMag = Math.min(0.015, accMag/3);
		const sizeIncrement = 0.03/this.joints.length + scaledAccMag;

		// Index is an arbitrary multiplier, doesn't need to specifically reference joint
		const wiggleSize = startSize + (sizeIncrement * index);

		this.joints[index].driveAngle(wiggleSize, wiggleAngle);
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
				const isRepelledByNeighbour = dist > 0 && 
					dist <= Fish.separationRadius;

				if (isAttractedToNeighbour) {
					neighbourCount += 1;
					
						// Alignment
						alignmentX += neighbour.velX;
						alignmentY += neighbour.velY;

						// Cohesion
						cohesionX += neighbour.x;
						cohesionY += neighbour.y;
					
						if (isRepelledByNeighbour) {
							// Separation
							// Point away from neighbour head
							const dx = this.x - neighbour.x;
							const dy = this.y - neighbour.y;
							// Magnitude of separation is inverse of view distance
							const separationMagnitude = Fish.neighbourRadius - dist;
							// Scale distance components by separation magnitude
							separationX += separationMagnitude * dx/dist;
							separationY += separationMagnitude * dy/dist;
						}

						// Point away from neighbour tail
						const tailDx = this.x - neighbour.tailX;
						const tailDy = this.y - neighbour.tailY;
						const tailSeparationMagnitude = Fish.neighbourRadius - vectorLength(tailDx, tailDy);
						// Scale distance components by separation magnitude
						separationX += tailSeparationMagnitude * tailDx/dist;
						separationY += tailSeparationMagnitude * tailDy/dist;
						
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
		// const alignment = constrainVector(alignmentX, alignmentY, 0, 1);

		// Force = difference in velocity
		let xForce = alignmentX - this.velX;
		let yForce = alignmentY - this.velY;

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
		// const cohesion = constrainVector(cohesionX, cohesionY, 0, 1);
		// Force to get to desired velocity
		let xForce = dx - this.velX;
		let yForce = dy - this.velY;

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
		// const separation = constrainVector(separationX, separationY, 0, 1);

		// Force = difference in velocity
		let xForce = separationX - this.velX;
		let yForce = separationY - this.velY;

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
		if (this.joints.length < Fish.maxLength) {
			this.joints = this.constructJoints(this.x, this.y, this.joints[0].angle, this.joints.length + size);
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
		const numJoints = this.joints.length;
		let joint, rightFish = [], leftFish = [];

		this.ctx.fillStyle = this.bodyColour;
		this.ctx.strokeStyle = this.bodyColour;

		for (let i = 0; i < numJoints; i++) {
			joint = this.joints[i];

			// Use position from tail to adjust size
			// Largest at head
			const sizeFactor = numJoints - i;
			const sizeIncrement = 1.5;
			const minSize = 0;

			// aWidth corresponds to joint parent
			// bWidth corresponds to the current joint
			const aWidth = minSize + sizeIncrement * sizeFactor;
			
			const drawPoints = joint.getDrawingPoints(aWidth);
			leftFish.push(drawPoints[0]);
			rightFish.push(drawPoints[1]);
			
			// Drawing fish bodyparts
			const drawHead = i==0,
				  	drawFins = i==1,
				  	drawTail = i==numJoints-1;

			if (drawHead || drawFins || drawTail) {
				this.ctx.save();

				// Transform canvas to head of joint
				joint.transformToJoint();

				const aWidthSized = aWidth + numJoints;

				if (drawHead) joint.drawFishHead(aWidth);
				if (drawFins) joint.drawFishFins(aWidth);
				if (drawTail) joint.drawFishTail(aWidthSized);
				
				this.ctx.restore();
			}
		}

		// Draw fish body
		this._drawFishBody(rightFish, leftFish);
		this._drawDots();

		// this._drawVector(this.velX, this.velY, 20);
	}

	_drawVector(x, y, lineLength = 10) {
		this.ctx.strokeStyle = 'red';

		let angle = vectorAngle(x, y);
		let xDraw = lineLength * Math.cos(angle);
		let yDraw = lineLength * Math.sin(angle);

		this.ctx.beginPath();
		this.ctx.moveTo(this.x, this.y);
		this.ctx.lineTo(this.x + xDraw, this.y + yDraw);
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
			const sizeFactor = this.joints.length - i;
			const sizeIncrement = 1;
			const minSize = 0.25;

			const size = minSize + sizeIncrement * sizeFactor;

			this.joints[i].drawPoint(size);
		}
	}

	setBodyColour(newColour) {
		this.bodyColour = newColour;
	}

	setDotColours(colourList) {
		for (let i = 0; i < this.joints.length-1; i++) {
			// Pick a random colour 
			const randomColour = colourList[parseInt(Math.random() * colourList.length)];
			this.dotColours[i] = randomColour;
		}
	}
}
