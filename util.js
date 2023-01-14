function constrainVector(x, y, min, max) {
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

function vectorLength(x, y) {
	return Math.sqrt(x*x + y*y);
}