// Submit button for building a workout
document.getElementById("buildChallenge").addEventListener("click", buildChallenge);

function viewExercises(){
    var req = new XMLHttpRequest();
    var localUrl = 'http://localhost:3000/view_exercises';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/view_exercises';

    //req.open('GET', flipUrl, true);
    req.open('GET', localUrl, true);
    
    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	// SQL Data returned from server
            var data = JSON.parse(req.responseText);
            var exerciseBody = document.getElementById("exerciseBody")

        // This loop goes through each of the exercises and displays them
		for (var i = 0; i < data.length; i++) {

			// Creates the rows and cells
		  	var row = document.createElement("tr");
	    	var cell1 = document.createElement("td");
	    	var cell2 = document.createElement("td");
	    	var cell3 = document.createElement("td");
	    	var cell4 = document.createElement("td");
	    	var cell5 = document.createElement("td");
	    	var cell6 = document.createElement("td");
	    	var cell7 = document.createElement("td");
	    	var cell8 = document.createElement("td");
	    	var cell9 = document.createElement("td");
	    	var cell10 = document.createElement("td");

	    	// These are the variables created from the DB
	    	var exerciseName = document.createTextNode(data[i].Name);
	    	var exerciseTargeted = document.createTextNode(data[i].Targeted);
	    	var exerciseEquipment = document.createTextNode(data[i].Equipment);
	    	var exerciseDifficulty = document.createTextNode(data[i].Difficulty);
	    	var exerciseRating = document.createTextNode(data[i].Rating);
	    	var exercisePoints = document.createTextNode(data[i].Points);
	    	var exerciseReps = document.createTextNode(data[i].Reps);
	    	var exerciseTime = document.createTextNode(data[i].Time);
	    	
	    	// Create the check box, link it to the exercise ID
	    	var exerciseSelect = document.createElement('input');
				exerciseSelect.type = "checkbox";
				exerciseSelect.name = data[i].ID;
				exerciseSelect.checked = false;
				exerciseSelect.id = data[i].ID;

			// Create the # of sets input
	    	var exerciseSets = document.createElement('input');
				exerciseSets.type = "number";
				exerciseSets.min = 1;
				exerciseSets.max = 5;

		    // Appending the variables to the cells
		    cell1.appendChild(exerciseName);
		    cell2.appendChild(exerciseTargeted);
		    cell3.appendChild(exerciseEquipment);
		    cell4.appendChild(exerciseDifficulty);
		    cell5.appendChild(exerciseRating);
		    cell6.appendChild(exercisePoints);
		    cell7.appendChild(exerciseReps);
		    cell8.appendChild(exerciseTime);
		    cell9.appendChild(exerciseSelect);
		    cell10.appendChild(exerciseSets);

	    	row.appendChild(cell1);
	    	row.appendChild(cell2);
	    	row.appendChild(cell3);
	    	row.appendChild(cell4);
	    	row.appendChild(cell5);
	    	row.appendChild(cell6);
	    	row.appendChild(cell7);
	    	row.appendChild(cell8);
	    	row.appendChild(cell9);
	    	row.appendChild(cell10);
	    	
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

function buildChallenge(){
    event.preventDefault();
    
    // Counter for the number of rows selected
    var exerciseCount = 0;
    var exerciseArray = [];

    // Grabs the selected rows for building a workout
    var t = document.getElementById("exerciseTable");
	for (var i = 1, row; row = t.rows[i]; i++) {
		//var t = document.getElementById("table"), // This have to be the ID of your table, not the tag
    	d = t.getElementsByTagName("tr")[i],
    	
    	r1 = d.getElementsByTagName("td")[8];
    	r2 = d.getElementsByTagName("td")[9];
	   		if (r1.children[0].checked == true) {
	   			var exerciseObject = new Object();
	   			if (r2.children[0].value == "") {
	   				alert('Please specify a number of sets');
	   				return;
	   			};
	   			exerciseObject = {
			        "id": r1.children[0].id,
			        "sets": r2.children[0].value
			    };
			    exerciseArray.push(exerciseObject);
	   		};
	}
	if (exerciseArray.length == 0) {
		alert("You didn't select any exercises!");
		return;
	};

    var localUrl = 'http://localhost:3000/send_challenge';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/send_challenge';
    var req = new XMLHttpRequest();
    //req.open('POST', flipUrl, true);
    req.open('POST', localUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
    	

      } else {
        console.log("Error in network request: " + req.statusText);
      }});

    req.send(JSON.stringify(exerciseArray));
	
	// Redirect to what will become the "do-workout" page
	window.location.href = "/challenges";

};

viewExercises();
