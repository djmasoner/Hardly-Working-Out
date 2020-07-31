// Submit button for building a workout
document.getElementById("start").addEventListener("click", startTimer);
//document.getElementById("pause").addEventListener("click", startTimer);
document.getElementById("submit_workout").addEventListener("click", endWorkout);

// We'll eventually set this to use the total time of a workout.
var workoutTime = 0;
var totalPoints = 0;

// Used to determine if the time needed to start on the timer is the beginning time
// Saved time and current time variables declared
var beginningTime = true;
var savedEllapsed;
var skipEllapsed = 0;
var ellapsed;
var currentTime;
var current_prog_Time;

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
	// Moving forward I'll need the aggregate time of a workout which will be set to start time
	// I'll need to set the repeater off of start time.
	// Also seems to be attached to sessions? It certainly persists. Is this bad?

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

    // Sets the saved time variable to the current time, and changes the beginning time
    // boolean to false so current time isn't reset when the user presses start
    this.pause = function () {
    	beginningTime = false;
      clearInterval(countDown);
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
	completeBtn.className = "complete-btn";
  completeBtn.textContent = num + 1;
  completeBtn.id = id;
  completeBtn.value = points * sets;

  // Adds an event listener to the complete buttons to add their value to the array
  // and add a class of done to the button.
  completeBtn.addEventListener('click', function() {
    if (this.classList.contains("done") == false && this.classList.contains("skipped") == false) {
	  this.className = this.className + " done";
	  if (beginningTime == true) {
	  	skipEllapsed = skipEllapsed + (mins * 60000);
	  } else {
	  	savedEllapsed = savedEllapsed + (mins * 60000);
	  };
    currentTime = currentTime - (mins * 60);
	  displayPoints();
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
	exerciseSet.value = sets;
	newSpan.appendChild(exerciseSet);

	// Creating the skip button
	let skipBtn = document.createElement("button");
	skipBtn.id = id;
	skipBtn.innerText = "Skip";
    skipBtn.className = "skip right-btn";

  // Adds an event listener to the complete buttons to add their value to the array
  // and add a class of done to the button.
  skipBtn.addEventListener('click', function() {
    if (this.classList.contains("done") == false && this.classList.contains("skipped") == false) {
      let btnId = this.getAttribute('id');
      let compId = document.getElementById(btnId);
      if (beginningTime == true) {
		  	skipEllapsed = skipEllapsed + (mins * 60000);
		  } else {
		  	savedEllapsed = savedEllapsed + (mins * 60000);
		  };
		  currentTime = currentTime - (mins * 60);
      compId.className = compId.className + " skipped";
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

function endWorkout () {
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

  var localUrl = 'http://localhost:3000/save_workout';
  var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/save_workout';
  var req = new XMLHttpRequest();
  
  //req.open('POST', flipUrl, true);
  req.open('POST', localUrl, true);
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

}

doWorkout();
