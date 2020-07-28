// Submit button for building a workout
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", startTimer);
document.getElementById("end").addEventListener("click", endTimer);

// We'll eventually set this to use the total time of a workout.
var timeInterval = 1000;
var workoutTime = 0;
var completeArray = [];
var skipArray = [];

function doWorkout(){
    var req = new XMLHttpRequest();
    var localUrl = 'http://localhost:3000/do_workout';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/do_workout';

    //req.open('GET', flipUrl, true);
    req.open('GET', localUrl, true);

    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	// SQL Data returned from server
			var data = JSON.parse(req.responseText);
			// console.log(data) -- if we want to see our data returned from the server.
			unpackData(data);
      timeData(data);

	    	} else {
	      		console.error(req.statusText);
	    	}
	  	}
	};
	req.onerror = function (e) {
	  console.error(req.statusText);
	};
	req.send(null);
};

function startTimer(){
	// Moving forward I'll need the aggregate time of a workout which will be set to start time
	// I'll need to set the repeater off of start time.
	// Also seems to be attached to sessions? It certainly persists. Is this bad?

	// Get the start time and display element
	var startTime = new Date("Jul 25, 2021 16:37:52").getTime();
	var display = document.getElementById("time");

	// Repeater function which calculates the remaining time
	const countDown = setInterval(function() {
		var rightNow = new Date().getTime();
		var timeLeft = startTime - rightNow;

		//Calculate minutes and seconds
		var min = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
		var sec = Math.floor((timeLeft % (1000 * 60)) / (1000));

		// If sec is less than 10 we add a zero to the display otherwise we get 7:9, 7:8
		if (sec < 10) {
			sec = "0" + sec
		}
		// Sets the text content to the display element
		display.textContent = min + ":" + sec;

		// If we're out of time the timer displays complete.
		// not sure if this will actually stop, it's a new iteration that I haven't tested.
		if (min <= 0 && sec <= 0) {
			clearInterval(countDown);
			display.textContent = "Workout Complete!";
		}
	}, timeInterval);
};

function endTimer(){
	// can't access due to scope... yay...
	timeInterval = null;
	var display = document.getElementById("time");
	display.text = "Workout ended";
};

function unpackData(package) {
	console.log(package);
	console.log(Object.keys(package));
	// unpacks the data and acts as a repeater function for displayExercise
	for (i=0; i<Object.keys(package).length; i++) {
		let exerciseName = package[i].exercise.Name;
		let exerciseReps = package[i].exercise.Reps;
		let exerciseSets = package[i].sets;
		let exercisePoints = package[i].exercise.Points;
		console.log(exerciseName, exerciseReps, exerciseSets, exercisePoints)
		displayExercise(i, exerciseName, exerciseReps, exerciseSets, exercisePoints);
	};
};

function timeData(package) {
  for (i=0; i<Object.keys(package).length; i++) {
    let exerciseSets = package[i].sets;
    let exerciseTime = package[i].Time;
    var totalTime = exerciseSets * exerciseTime;
    typeof(exerciseSets);
    workoutTime = workoutTime + totalTime;
  };
    console.log("This is the workout time: " + workoutTime);
};

function displayExercise(num, name, reps, sets, points) {


	// Pass this the info from the DB, it'll create divs with the appropriate styling
	// and add them to the DOM.
	let display = 	document.getElementById("workout-display");
	let divOne = document.createElement("div");
	divOne.className = "number";

	// Creating the completion number button.
	let completeBtn = document.createElement("button");
	completeBtn.className = "complete-btn";
  completeBtn.textContent = num + 1;
  completeBtn.id = num;

  // Adds an event listener to the complete buttons to add their value to the array
  // and add a class of done to the button.
  completeBtn.addEventListener('click', function() {
    if (completeArray.includes(this.getAttribute('id')) == false && skipArray.includes(this.getAttribute('id')) == false) {
      completeArray.push(this.getAttribute('id'));
      this.className = this.className + " done";
      console.log(completeArray);
    } else {
      console.log(completeArray);
    };
  });
	// Add button ID and inner text here.
	divOne.appendChild(completeBtn)

	// Creating the span to contain the exercise info
	let newSpan = document.createElement("span");
	newSpan.className = "exercise-content";

	// Adding name content to the display
	let exerciseName = document.createElement("div");
	exerciseName.className = "exercise-name";
	exerciseName.textContent = name;
	newSpan.appendChild(exerciseName);

	// Adding reps content to the display
	let exerciseReps = document.createElement("div");
	exerciseReps.className = "exercise-reps";
	exerciseReps.textContent = reps + " Reps";
	newSpan.appendChild(exerciseReps);

	// Adding sets content to the display
	let exerciseSet = document.createElement("div");
	exerciseSet.className = "exercise-reps";
	if (sets == 1) {
		exerciseSet.textContent = sets + " Set";
	}
	if (sets != 1) {
		exerciseSet.textContent = sets + " Sets";
	}
	newSpan.appendChild(exerciseSet);

	// Creating the more button
	let moreBtn = document.createElement("button");
	moreBtn.id = "more";
	moreBtn.innerText = "More";
	moreBtn.className = "more right-btn";
	newSpan.appendChild(moreBtn);

	// Creating the skip button
	let skipBtn = document.createElement("button");
	skipBtn.id = num;
	skipBtn.innerText = "Skip";
  skipBtn.className = "skip right-btn";

  // Adds an event listener to the complete buttons to add their value to the array
  // and add a class of done to the button.
  skipBtn.addEventListener('click', function() {
    if (completeArray.includes(this.getAttribute('id')) == false && skipArray.includes(this.getAttribute('id')) == false) {
      let btnId = this.getAttribute('id');
      skipArray.push(btnId);
      let compId = document.getElementById(btnId);
      compId.className = compId.className + " skipped";
      console.log(skipArray);
    } else {
      console.log(skipArray);
    };
  });
	newSpan.appendChild(skipBtn);

	let divTwo = document.createElement("div");
	divTwo.className = "exercises";


	// insert information here at a later time... not feeling it rn.
	divTwo.appendChild(divOne);
	divTwo.appendChild(newSpan);
	display.appendChild(divTwo);
};

doWorkout();
