// Submit button for building a workout
document.getElementById("doWorkout").addEventListener("click", displayExercise);
document.getElementById("start").addEventListener("click", startTimer);
document.getElementById("pause").addEventListener("click", startTimer);
document.getElementById("end").addEventListener("click", endTimer);

// We'll eventually set this to use the total time of a workout. 
var timeInterval = 1000;

function doWorkout(){
    
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

            // Pass this the info from the DB, it'll create divs with the appropriate styling
			// and add them to the DOM.
			let display = 	document.getElementById("workout-display");
			let newDiv = document.createElement("div");
			newDiv.className = "exercises";

			// insert information here at a later time... not feeling it rn.

			display.appendChild(newDiv);
		
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