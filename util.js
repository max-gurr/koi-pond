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

function vectorAngle(x, y) {
	return Math.atan2(y, x);
}

function _gaussianRand(sample) {
  let rand = 0;

  for (let i = 0; i < sample; i += 1) {
    rand += Math.random();
  }

  return (rand / sample);
}

function gaussianRandom(start, end) {
	const resolution = 5;
	const rand = _gaussianRand(resolution);
  	return Math.floor(start + rand * (end - start + 1));
}

function roundVal(val, scale=1) {
	return Math.round(val * scale)/scale;
}