
// Code to display all of the users to compete with
function viewCompetitors(){
    var req = new XMLHttpRequest();
    var localUrl = 'http://localhost:3000/view_competitors';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/view_competitors';

    //req.open('GET', flipUrl, true);
    req.open('GET', localUrl, true);
    
    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	// SQL Data returned from server
            var data_and_user = JSON.parse(req.responseText);
            var user = data_and_user[0];
            var data = data_and_user[1];
            var challengeBody = document.getElementById("challengeBody")

        // This loop goes through each of the challengers and displays them
		for (var i = 0; i < data.length; i++) {

			// Creates the rows and cells
		  	var row = document.createElement("tr");
	    	var cell1 = document.createElement("td");
	    	var cell2 = document.createElement("td");
	    	var cell3 = document.createElement("td");
	    	var cell4 = document.createElement("td");

	    	// These are the variables created from the DB
	    	var challengeName = document.createTextNode(data[i].Name);
	    	var challengeRanking = document.createTextNode(data[i].Ranking);
	    	var challengePoints = document.createTextNode(data[i].Points);
	    	
	    	// Create the challenge button
	    	// Does not show a challenge button for the user
	    	if (data[i].Username == user) {
	    		var challengeSelect = document.createTextNode("");
	    	} else {
				var challengeSelect = document.createElement('button');
	    		challengeSelect.innerHTML = "Challenge Me!";
	    		var competitor = data[i].Username;
	    		challengeSelect.onclick = (function(competitor, user){
     				return function(){
				        startChallenge(competitor, user);
				    }
				})(competitor, user);  
	    	};
	    	
		    // Appending the variables to the cells
		    cell1.appendChild(challengeName);
		    cell2.appendChild(challengeRanking);
		    cell3.appendChild(challengePoints);
		    cell4.appendChild(challengeSelect);

	    	row.appendChild(cell1);
	    	row.appendChild(cell2);
	    	row.appendChild(cell3);
	    	row.appendChild(cell4);
	    	
		    // Appends row to the table
		  	challengeBody.appendChild(row);
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

function viewActiveChallenges(){
    var req = new XMLHttpRequest();
    var localUrl = 'http://localhost:3000/view_active_challenges';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/view_active_challenges';

    //req.open('GET', flipUrl, true);
    req.open('GET', localUrl, true);
    
    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	// SQL Data returned from server
            var data = JSON.parse(req.responseText);
            var activeBody = document.getElementById("activeBody")

        // This loop goes through each of the challengers and displays them
		for (var i = 0; i < data.length; i++) {

			// Creates the rows and cells
		  	var row = document.createElement("tr");
	    	var cell1 = document.createElement("td");
	    	var cell2 = document.createElement("td");
	    	var cell3 = document.createElement("td");

	    	// These are the variables created from the DB
	    	var activeCompetitor = document.createTextNode(data[i].username);
	    	var activeDate = document.createTextNode((data[i].end_date).substring(0,10));
	    	
	    	// Create the start challenge button
			var activeSelect = document.createElement('button');
	    	activeSelect.innerHTML = "Start Challenge!";
	    	var id = data[i].challenge_id;
	    	activeSelect.onclick = (function(id){
 				return function(){
			        startWorkout(id);
			    }
			})(id);  
	    	
		    // Appending the variables to the cells
		    cell1.appendChild(activeCompetitor);
		    cell2.appendChild(activeDate);
		    cell3.appendChild(activeSelect);

	    	row.appendChild(cell1);
	    	row.appendChild(cell2);
	    	row.appendChild(cell3);
	    	
		    // Appends row to the table
		  	activeBody.appendChild(row);
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

function startChallenge(competitor, user){
	event.preventDefault();
	// This will be the redirect to the challenge game
	alert(user+' is challenging '+competitor);

	// Sends the challenger to the server
	var challengeObject = new Object();
    challengeObject = {
        "competitor": competitor
    };

    var req = new XMLHttpRequest();
	var localUrl = 'http://localhost:3000/save_competitor';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/save_competitor';

    //req.open('POST', flipUrl, true);
    req.open('POST', localUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        window.location.href = "/build_challenge";
      } else {
        console.log("Error in network request: " + req.statusText);
      }});

    req.send(JSON.stringify(challengeObject));

};

function startWorkout(id){
    event.preventDefault();

    // Posts the id to the server to save in a session
    var startObject = new Object();
    startObject.id = id;

    var localUrl = 'http://localhost:3000/begin_challenge';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/begin_challenge';
    var req = new XMLHttpRequest();
    //req.open('POST', flipUrl, true);
    req.open('POST', localUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
    	

      } else {
        console.log("Error in network request: " + req.statusText);
      }});

    req.send(JSON.stringify(startObject));
	
	// Redirect to the do challenge page
	window.location.href = "/do_challenge";

};

viewCompetitors();
viewActiveChallenges();
