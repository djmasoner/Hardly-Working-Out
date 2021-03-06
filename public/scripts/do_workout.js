// Buttons to attach listeners to the start and end workout buttons
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("submit_workout").addEventListener("click", endWorkout);

// Global variables used to track a users progression through a workout
var workoutTime = 0;
var exerciseTime = 0;
var exerciseTimeSet = 0;
var exerciseNum = 0;
var exerciseMax = 0;
var exerciseTimeLeft = 0;
var exerciseArray = [];
var totalPoints = 0;
var clear_bool = false;
var exerciseWindow;
var workoutStarted = false;
var isChallenge;

// Used to determine if the time needed to start on the timer is the beginning time
// Saved time and current time variables declared
var beginningTime = true;
var savedEllapsed;
var skipEllapsed = 0;
var ellapsed;
var currentTime;
var current_prog_Time;

// Same as the above variables but for the exercise timer
var beginningTimeExercise = true;
var savedEllapsedExercise;
var skipEllapsedExercise = 0;
var ellapsedExercise;
var currentTimeExercise;
var current_prog_TimeExercise;

function calculatePoints(package) {
	// Extra sets earn extra points
	for (i=0; i<Object.keys(package).length; i++) {
		let exerciseSets = Number(package[i].sets);
		let pointsValue = package[i].exercise.Points;
		let exercisePoints = exerciseSets * pointsValue;

		totalPoints = totalPoints + exercisePoints;
	};
	displayPoints();
}

function displayPoints() {
	let currentPoints = 0;

	// Calculate earned points
	var completeExercises = document.getElementsByClassName('done');
	for (i=0; i < completeExercises.length; i++) {
		currentPoints = currentPoints + Number(completeExercises[i].value);
	};
	document.getElementById("points-display").textContent = currentPoints + "/" + totalPoints + " points earned"
};


function getWorkoutType(){

	var req = new XMLHttpRequest();

    req.open('GET', serverUrl+'/workout_type', true);

    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	isChallenge = JSON.parse(req.responseText);
	    	if (isChallenge == true) {
	    		doChallenge();
	    	} else {
	    		doWorkout();
	    	}

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

function doWorkout(){

	// Call the do workout function
	var req = new XMLHttpRequest();

    req.open('GET', serverUrl+'/do_workout', true);

    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	// SQL Data returned from server
			var data = JSON.parse(req.responseText);
			unpackData(data);
			timeData(data);
			calculatePoints(data);

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

function doChallenge(){

	// Call the do workout function
	var req = new XMLHttpRequest();

    req.open('GET', serverUrl+'/do_challenge_workout', true);

    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	// SQL Data returned from server
			var data = JSON.parse(req.responseText);
			unpackData(data);
			timeData(data);
			calculatePoints(data);

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

// https://stackoverflow.com/questions/58842508/how-to-fill-a-100-progress-bar-according-to-the-time-specified-by-the-user
function setUpProgressBar(startTime, endTime, savedMid, update) {

  var timer
  var elem = document.querySelector('#progressBar')
  var max = endTime - startTime
  elem.max = max

  var setValue = function() {
  	if (beginningTime == true) {
  		current_prog_Time = new Date().getTime()
  		current_prog_Time = current_prog_Time + skipEllapsed;
  	} else {
  		current_prog_Time = new Date().getTime()
  		current_prog_Time = current_prog_Time + savedEllapsed;
  	};
    ellapsed = current_prog_Time - startTime
    if (ellapsed >= max) {
      ellapsed = max
      window.clearTimeout(timer)
    }
    elem.value = ellapsed
    var prec = ellapsed/max * 100
    elem.setAttribute("data-label", prec.toFixed(2) + '%')

    document.getElementById("pause").addEventListener("click", this.pause);

    this.pause = function () {
    	savedEllapsed = ellapsed;
      clearInterval(timer);
    };
  }

  setValue()
  timer = window.setInterval(setValue, update)
  return
}

function startTimer(){

	// Call the exercise timer and set workoutStarted to true
  exerciseTimer();
  workoutStarted = true;

	// Get the start time and display element
	if (beginningTime == true) {
		currentTime = workoutTime * 60;
		
		// Set up variables for progress bar
		var start_progress = new Date();
		var end_progress = new Date();
		end_progress.setMinutes(end_progress.getMinutes() + workoutTime);

		// Initial call of progress bar
		setUpProgressBar(start_progress.getTime(), end_progress.getTime(), 100)

	} else {
		// Set up variables for progress bar
		var start_progress = new Date();
		var end_progress = new Date();
		end_progress.setMinutes(end_progress.getMinutes() + workoutTime);

		// Initial call of progress bar
		setUpProgressBar(start_progress.getTime(), end_progress.getTime(), 100)
	}
  var display = document.getElementById("time");

	// Repeater function which calculates the remaining time
	const countDown = window.setInterval(function() {
		var oneSecond = 1;
		var timeLeft = currentTime - oneSecond;
    var mil = timeLeft * 1000;
    currentTime = currentTime - oneSecond;

		//Calculate minutes and seconds
		var min = Math.floor((mil % (1000 * 60 * 60)) / (1000 * 60));
		var sec = Math.floor((mil % (1000 * 60)) / (1000));

		// If sec is less than 10 we add a zero to the display otherwise we get 7:9, 7:8
		if (sec < 10) {
			sec = "0" + sec
		}
		// Sets the text content to the display element
    display.textContent = min + ":" + sec;

		// If we're out of time the timer displays complete.
		// not sure if this will actually stop, it's a new iteration that I haven't tested.
		if (timeLeft <= 0) {
			clearInterval(countDown);
			display.textContent = "Workout Complete!";
    }

    document.getElementById("pause").addEventListener("click", this.pause);
    document.getElementById("end").addEventListener("click", this.stop);

    // boolean to false so current time isn't reset when the user presses start
    this.pause = function () {
    	beginningTime = false;
      clearInterval(countDown);
    };


  }, 1000);
};

function exerciseTimer(){
	console.log(exerciseNum);
	// Get the start time and display element
	if (beginningTimeExercise == true) {
		currentTimeExercise = exerciseArray[exerciseNum] * 60;
		exerciseTimeSet = exerciseArray[exerciseNum] * 60;
	}

	// Repeater function which calculates the remaining time for an exercise
	const countDownExercise = window.setInterval(function() {
		
		// First clear it, if skip or complete buttons have been pushed
		if (clear_bool == true) {
			clearInterval(countDownExercise);
			clear_bool = false;
		}
		var oneSecond = 1;
		var timeLeft = currentTimeExercise - oneSecond;

		// To track how much time is left in an exercise, globally
		exerciseTimeLeft = timeLeft;

    var mil = timeLeft * 1000;
    currentTimeExercise = currentTimeExercise - oneSecond;

		//Calculate minutes and seconds
		var min = Math.floor((mil % (1000 * 60 * 60)) / (1000 * 60));
		var sec = Math.floor((mil % (1000 * 60)) / (1000));

		// If sec is less than 10 we add a zero to the display otherwise we get 7:9, 7:8
		if (sec < 10) {
			sec = "0" + sec
		}

		// If we're out of time the timer displays complete.
		if (timeLeft <= 0) {
			clearInterval(countDownExercise);
			exerciseNum++;
			exerciseTimer();
    }

    document.getElementById("pause").addEventListener("click", this.pause);
    document.getElementById("end").addEventListener("click", this.stop);

    // boolean to false so current time isn't reset when the user presses start
    this.pause = function () {
    	beginningTimeExercise = false;
      clearInterval(countDownExercise);
    };


  }, 1000);
};

function unpackData(package) {
	// unpacks the data and acts as a repeater function for displayExercise
	for (i=0; i<Object.keys(package).length; i++) {
		let exerciseId = package[i].exercise["ID"];
		let exerciseName = package[i].exercise.Name;
		let exerciseReps = package[i].exercise.Reps;
		let exerciseSets = package[i].sets;
		let exercisePoints = package[i].exercise.Points;
		let exerciseMins = package[i].exercise.Time * package[i].sets;
		displayExercise(i, exerciseName, exerciseReps, exerciseSets, exercisePoints, exerciseId, exerciseMins);
	};
};

function timeData(package) {
  // unpacks the data sets the total workout time.
  for (i=0; i<Object.keys(package).length; i++) {
    let exerciseSets = Number(package[i].sets);
    let exerciseTime = package[i].exercise.Time;
    let totalTime = exerciseSets * exerciseTime;

    workoutTime = workoutTime + totalTime;
    exerciseArray.push(totalTime);
    exerciseMax++;
  };
};

function displayExercise(num, name, reps, sets, points, id, mins) {


	// Pass this the info from the DB, it'll create divs with the appropriate styling
	// and add them to the DOM.
	let display = 	document.getElementById("workout-display");
	let divOne = document.createElement("div");
	divOne.className = "number";

	// Creating the completion number button.
	let completeBtn = document.createElement("button");
	completeBtn.className = "complete-btn " + id;
  completeBtn.textContent = num + 1;
  completeBtn.value = points * sets;
  completeBtn.id = num + 1;

  // Adds an event listener to the complete buttons to add their value to the array
  // and add a class of done to the button.
  completeBtn.addEventListener('click', function() {
    if (workoutStarted == true) {
      if (this.classList.contains("done") == false && this.classList.contains("skipped") == false) {
        this.className = this.className + " done";
        if (beginningTime == true) {
          skipEllapsed = skipEllapsed + (mins * 60000);
        } else {
          savedEllapsed = savedEllapsed + (mins * 60000);
        };
        currentTime = currentTime - exerciseTimeLeft;
        this.name = (1 + (exerciseTimeLeft/exerciseTimeSet)).toString();
        exerciseNum++;
        clear_bool = true;
        exerciseTimer();
        displayPoints();
        };
    } else {
      alert("You have to start the workout timer first!")
    }
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
	exerciseSet.value = sets;
	newSpan.appendChild(exerciseSet);

	// Creating the skip button
	let skipBtn = creatSkipButton(id, mins, num);
	newSpan.appendChild(skipBtn);

	let divTwo = document.createElement("div");
	divTwo.className = "exercises";


	// insert information here at a later time... not feeling it rn.
	divTwo.appendChild(divOne);
	divTwo.appendChild(newSpan);
	display.appendChild(divTwo);
};

function creatSkipButton (id, mins, num) {
  //Create the HTML button and set it's attributes
	skipButton = document.createElement("button");
	skipButton.value = num + 1; 
	skipButton.innerText = "Skip";
  skipButton.className = "skip right-btn";

  //Create the event listener which makes sure the workout can't be both skipped or completed again.
  skipButton.addEventListener('click', function() {
    if (workoutStarted == true) {
      var btnId = this.getAttribute('value');
      console.log(btnId)
      var compId = document.getElementById(btnId);
      console.log(compId)
      if (compId.classList.contains("done") == false && compId.classList.contains("skipped") == false) {
        if (beginningTime == true) {
          skipEllapsed = skipEllapsed + (mins * 60000);
        } else {
          savedEllapsed = savedEllapsed + (mins * 60000);
        };
        currentTime = currentTime - exerciseTimeLeft;
        clear_bool = true;
        exerciseNum++;
          exerciseTimer();
        compId.className = compId.className + " skipped";
      };
    } else {
      alert("You have to start the workout timer first!")
    }
  });
  return skipButton
};

// When the end workout button is pressed, submits a challenge or a workout depending 
// on what kind of workout it is
function endWorkout() {
	if (isChallenge == true) {
		submitChallenge();
	} else {
		submitWorkout();
	}
}

function submitWorkout () {
  // Link to the modal page
  //window.location.assign("http://localhost:3000/modal_button.html");

  var completeArray = [];
  var pointsEarned = 0;
  var completeButtons = document.getElementsByClassName('complete-btn');
  for (i=0; i < completeButtons.length; i++) {
	  if (completeButtons[i].classList.contains("done")) {
		completeArray.push(completeButtons[i].id);
		pointsEarned = pointsEarned + Number(completeButtons[i].value);
	  };
  } ;
  var results = Object();
  results.completedExercises = completeArray;
  results.points = pointsEarned;
  results.description = document.getElementById('workout_description').value;
  results.title = document.getElementById('workout_name').value;
  results.rating = document.getElementById('workout_rating').value;
  results.favorite = document.getElementById('workout_favorite').checked;

  var req = new XMLHttpRequest();
  
  req.open('POST', serverUrl+'/save_workout', true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.addEventListener('load',function(){
    if(req.status >= 200 && req.status < 400){
  		console.log(req.responseText);
    } else {
      console.log("Error in network request: " + req.statusText);
    }});

  req.send(JSON.stringify(results));
alert("Congrats on your Workout!");
window.location.href = "/welcome";
};

function submitChallenge () {
  event.preventDefault();

  var completeArray = [];
  var pointsEarned = 0;
  var challengePointsEarned = 0;
  var completeButtons = document.getElementsByClassName('complete-btn');
  for (i=0; i < completeButtons.length; i++) {
	  if (completeButtons[i].classList.contains("done")) {
		completeArray.push(completeButtons[i].id);
		pointsEarned = pointsEarned + Number(completeButtons[i].value);
		challengePointsEarned = challengePointsEarned + (Number(completeButtons[i].value)*Number(completeButtons[i].name));
	  };
  } ;
  var results = Object();
  results.completedExercises = completeArray;
  results.points = pointsEarned;
  results.challengePoints = Math.round(challengePointsEarned);
  results.description = document.getElementById('workout_description').value;
  results.title = document.getElementById('workout_name').value;
  results.rating = document.getElementById('workout_rating').value;
  results.favorite = document.getElementById('workout_favorite').checked;

  var req = new XMLHttpRequest();
  
  req.open('POST', serverUrl+'/save_challenge', true);
  req.setRequestHeader('Content-Type', 'application/json');
  req.addEventListener('load',function(){
    if(req.status >= 200 && req.status < 400){
  		console.log(req.responseText);
    } else {
      console.log("Error in network request: " + req.statusText);
    }});

  req.send(JSON.stringify(results));
alert("Congrats on your Challenge!");
window.location.href = "/welcome";

}

getWorkoutType();
