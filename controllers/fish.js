

function changeAlignment(newValue) {
	val = parseInt(newValue) / 10
	Fish.alignmentScale = val
	document.getElementById("display_alignment").innerHTML = val;
}

function changeCohesion(newValue) {
	val = parseInt(newValue) / 10
	Fish.cohesionScale = val
	document.getElementById("display_cohesion").innerHTML = val;
}

function changeSeparation(newValue) {
	val = parseInt(newValue) / 10
	Fish.separationScale = val
	document.getElementById("display_separation").innerHTML = val;
}

function changeBorder(newValue) {
	val = parseInt(newValue) / 10
	Fish.borderScale = val
	document.getElementById("display_border").innerHTML = val;
}

function adjustNumFish(newValue) {
	numFish = newValue;
	document.getElementById("display_num_fish").innerHTML = newValue;
	init();
}

// Adjust display
document.getElementById("display_num_fish").innerHTML = numFish;
changeAlignment(Fish.alignmentScale*10);
changeCohesion(Fish.cohesionScale*10);
changeSeparation(Fish.separationScale*10);
changeBorder(Fish.borderScale*10);