// Submit button for building a workout
document.getElementById("doWorkout").addEventListener("click", displayExercise);
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", startTimer);
document.getElementById("end").addEventListener("click", endTimer);

// We'll eventually set this to use the total time of a workout. 
var timeInterval = 1000;

// Might use this to store completed workouts, just have a function that goes through collecting
// completed exercises at the end of the workout. Might just make it an array that references the 
// DB data to pull completed workouts, points etc. 
var completedWorkouts = new Object();

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

function displayExercise() {

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
			console.log(data);
			
			// Likely call this with a for loop for as many rows as there are workouts.
			createHTML(data);
		
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

//Add parameter for row later, splitting to make debugging easier, also allows for repeated function calls. 
function createHTML() {

	// Pass this the info from the DB, it'll create divs with the appropriate styling
	// and add them to the DOM.
	let display = 	document.getElementById("workout-display");
	let divOne = document.createElement("div");
	divOne.className = "number";

	// Creating the completion number button.
	let completeBtn = document.createElement("button");
	completeBtn.className = "complete-btn";
	// Add button ID and inner text here.
	divOne.appendChild(completeBtn)

	// Creating the span to contain the exercise info
	let newSpan = document.createElement("span");
	newSpan.className = "exercise-content";
	// Add text content here to display the workout

	// Creating the more button
	let moreBtn = document.createElement("button");
	moreBtn.id = "more";
	moreBtn.innerText = "More";
	moreBtn.className = "more right-btn"; 
	newSpan.appendChild(moreBtn);

	// Creating the skip button
	let skipBtn = document.createElement("button");
	skipBtn.id = "skip";
	skipBtn.innerText = "Skip";
	skipBtn.className = "skip right-btn"; 
	newSpan.appendChild(skipBtn);

	let divTwo = document.createElement("div");
	divTwo.className = "exercises";


	// insert information here at a later time... not feeling it rn.
	divTwo.appendChild(divOne);
	divTwo.appendChild(newSpan);
	display.appendChild(divTwo);
};

for (i=0; i<5; i++) {
	createHTML();
}
