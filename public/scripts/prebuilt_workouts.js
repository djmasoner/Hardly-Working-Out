// Code to display all of the users to compete with
function preBuiltWorkouts(){
    var req = new XMLHttpRequest();

    req.open('GET', serverUrl+'/view_prebuilt_workouts', true);
    
    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	// SQL Data returned from server
            var data = JSON.parse(req.responseText);
            var challengeBody = document.getElementById("exerciseBody")

        // This loop goes through each of the challengers and displays them
		for (var i = 0; i < data.length; i++) {

			// Creates the rows and cells
		  	var row = document.createElement("tr");
	    	var cell1 = document.createElement("td");
	    	var cell2 = document.createElement("td");
	    	var cell3 = document.createElement("td");

	    	// These are the variables created from the DB
	    	var workoutName = document.createTextNode(data[i].workout_name);
	    	var workoutDescription = document.createTextNode(data[i].description);
	    	
	    	// Create the challenge button
			var workoutSelect = document.createElement('button');
			workoutSelect.innerHTML = "Start Workout!";
			workoutSelect.className = "btn";
    		var workoutArray = data[i].exercise_array;
    		workoutSelect.onclick = (function(workoutArray){
 				return function(){
			        startPrebuiltWorkout(workoutArray);
			    }
			})(workoutArray);  
	    	
		    // Appending the variables to the cells
		    cell1.appendChild(workoutName);
		    cell2.appendChild(workoutDescription);
		    cell3.appendChild(workoutSelect);

	    	row.appendChild(cell1);
	    	row.appendChild(cell2);
	    	row.appendChild(cell3);
	    	
		    // Appends row to the table
		  	exerciseBody.appendChild(row);
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

function startPrebuiltWorkout(workoutArray){
	event.preventDefault();

    var req = new XMLHttpRequest();

    req.open('POST', serverUrl+'/start_prebuilt_workout', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){

        // Redirect to what will become the "do-workout" page
		window.location.href = "/test_workout";

      } else {
        console.log("Error in network request: " + req.statusText);
      }});
    console.log(workoutArray);
    console.log(JSON.parse(workoutArray));
    req.send(workoutArray);

};

preBuiltWorkouts();