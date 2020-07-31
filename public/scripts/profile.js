// Submit button for daily update of BMI data
document.getElementById("updateBmi").addEventListener("click", dailyUpdate);

function getProfile(){

  	// Creates the response
	var req = new XMLHttpRequest();

	var localUrl = 'http://localhost:3000/display_profile';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/display_profile';

    req.open('GET', flipUrl, true);
    //req.open('GET', localUrl, true);
	req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {
	    	// SQL Data returned from server
	    	var data = JSON.parse(req.responseText);

	    	// Clear the data currently there
	    	document.getElementById('profileUsername').innerHTML = ""
	    	document.getElementById('profileName').innerHTML = ""
	    	document.getElementById('profileGender').innerHTML = ""
	    	document.getElementById('profileAge').innerHTML = ""
	    	document.getElementById('profileHeight').innerHTML = ""
	    	document.getElementById('profileWeight').innerHTML = ""
	    	document.getElementById('profileBmi').innerHTML = ""

	    	// Get the elements again
	    	var profileUsername = document.getElementById('profileUsername');
	    	var profileName = document.getElementById('profileName');
	    	var profileGender = document.getElementById('profileGender');
	    	var profileAge = document.getElementById('profileAge');
	    	var profileHeight = document.getElementById('profileHeight');
	    	var profileWeight = document.getElementById('profileWeight');
	    	var profileBmi = document.getElementById('profileBmi');

	    	// Create text nodes from SQL data
	    	var sqlUsername = document.createTextNode(data.Username);
	    	var sqlName = document.createTextNode(data.Name);
	    	var sqlGender = document.createTextNode(data.Gender);
	    	var sqlAge = document.createTextNode(data.Age);
	    	var sqlHeight = document.createTextNode(Math.floor(data.Height/12)+"\' "+(data.Height%12)+"\"");
	    	var sqlWeight = document.createTextNode(data.Weight+" Lbs");
	    	var sqlBmi = document.createTextNode(data.Bmi);

	    	// Appending the variables to the cells
	    	profileUsername.appendChild(sqlUsername);
	    	profileName.appendChild(sqlName);
	    	profileGender.appendChild(sqlGender);
	    	profileAge.appendChild(sqlAge);
	    	profileHeight.appendChild(sqlHeight);
	    	profileWeight.appendChild(sqlWeight);
	    	profileBmi.appendChild(sqlBmi);

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

function getCompletedWorkouts(){
    var req = new XMLHttpRequest();
    var localUrl = 'http://localhost:3000/view_completed_workouts';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/view_completed_workouts';

    req.open('GET', flipUrl, true);
    //req.open('GET', localUrl, true);
    
    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	// SQL Data returned from server
            var data = JSON.parse(req.responseText);
            var exerciseBody = document.getElementById("workoutsBody")

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

	    	// These are the variables created from the DB
	    	var workoutTitle = document.createTextNode(data[i].title);
	    	var workoutDate = document.createTextNode((data[i].date).substr(0,10));
	    	var workoutRating = document.createTextNode(data[i].rating);
	    	var workoutPoints = document.createTextNode(data[i].points);
	    	var workoutDescription = document.createTextNode(data[i].description);
	    	if (data[i].favorite == 1) {
	    		var workoutFavorite = document.createTextNode("Yes");
	    	} else {
	    		var workoutFavorite = document.createTextNode("No");
	    	};

		    // Appending the variables to the cells
		    cell1.appendChild(workoutTitle);
		    cell2.appendChild(workoutDate);
		    cell3.appendChild(workoutRating);
		    cell4.appendChild(workoutPoints);
		    cell5.appendChild(workoutDescription);
		    cell6.appendChild(workoutFavorite);

	    	row.appendChild(cell1);
	    	row.appendChild(cell2);
	    	row.appendChild(cell3);
	    	row.appendChild(cell4);
	    	row.appendChild(cell5);
	    	row.appendChild(cell6);
	    	
		    // Appends row to the table
		  	workoutsBody.appendChild(row);
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

// This function helps track your daily health data
function dailyUpdate(){
    event.preventDefault();
    // Creates the request
    var req = new XMLHttpRequest();

    // Input values
    var height = document.getElementById('heightInput').value; 
    var weight = document.getElementById('weightInput').value; 
    var bmi = (weight / (height**2)) * 703;
    var day = new Date();
    day = document.getElementById('dateInput').value;

    inputArray = [height, weight, bmi, day];

    // Primitive error checking to make sure all the inputs are present (not the best but it works since html required isn't working)
    for (var i = 0, length = inputArray.length; i < length; i++) {
      if(inputArray[i] == "") {
        alert("Please fill out all update fields")
        return;
      }
    }

    var formObject = new Object();
    formObject = {
        "height": height,
        "weight": weight,
        "bmi": bmi,
        "date": day
    };

    console.log(formObject);

    var localUrl = 'http://localhost:3000/daily_update';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/daily_update';

    req.open('POST', flipUrl, true);
    //req.open('POST', localUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
      	console.log(req.responseText);
        if (req.responseText == 'Failure') {
        	alert('You already made an update for today! Come back tomorrow!');
        } else {
        	alert('Look at you go! Keep up the progress!');
        	console.log(req.responseText);
        	getProfile();
        	// getchart
        }
      } else {
        console.log("Error in network request: " + req.statusText);
      }});

    req.send(JSON.stringify(formObject));
};

function getDailyUpdate(){
	// Pulls daily data from the user's tracking database
	
	dateRange = [];
	dateRangeDash = [];
	trackDay = new Date();

	trackDay.setDate(trackDay.getDate());
	dateRange.push(trackDay.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }));
	dateRangeDash.push(trackDay.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }));
	for (var i = 14; i > 0; i--) {

		trackDay.setDate(trackDay.getDate() - 1);
		dateRange.push(trackDay.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }));
		dateRangeDash.push(trackDay.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }));
	};
  	// Creates the response
	var req = new XMLHttpRequest();
	var localUrl = 'http://localhost:3000/get_daily_update';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/get_daily_update';

    req.open('GET', flipUrl, true);
    //req.open('GET', localUrl, true);

	req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    		// Data from daily user table
    			var data = JSON.parse(req.responseText);
    			var dailyBmi = [];
    			var dailyWeight = [];
    			var dailyHeight = [];
    			var pos = -1;

    			// Goes through DB data and if dates match, insert the data, if not, insert a 0
    			for (var i = 14; i >= 0; i--) {
    				var inData = false;
    				for (var j = 0; j < data.length; j++) {
    					var dVar = data[j].date;
    					dVar = dVar.substring(0,10);

    					if (dVar == dateRangeDash[i]) {
    						dailyBmi.push(data[j].bmi);
    						dailyWeight.push(data[j].weight);
    						dailyHeight.push(data[j].height);
    						pos = j;
    						inData = true;
    					};
					
					};
					if (inData == false) {
						if (pos == -1) {
							dailyBmi.push(0);
							dailyWeight.push(0);
							dailyHeight.push(0);
						} else {
							dailyBmi.push(data[j-1].bmi);
							dailyWeight.push(data[j-1].weight);
							dailyHeight.push(data[j-1].height);
						};
						
					};
				};

    			// Chart for going back 2 weeks
    			// First we must clear any chart already there - https://stackoverflow.com/questions/3387427/remove-element-by-id
    			var removeChart = document.getElementById('daily-chart');
				removeChart.parentNode.removeChild(removeChart);
				document.getElementById('daily-dashboard').innerHTML += 
				'<canvas id="daily-chart" width="300" height="250"></canvas>'

				// Now we create the chart object, and pass through the data
    			var ctx = document.getElementById('daily-chart').getContext('2d');
				var dailyChart = new Chart(ctx, {
				    type: 'line',
				    data: {
				        labels: [dateRange[14], dateRange[13], dateRange[12], dateRange[11], dateRange[10], dateRange[9], 
				        dateRange[8], dateRange[7], dateRange[6], dateRange[5], dateRange[4], dateRange[3], 
				        dateRange[2], dateRange[1], dateRange[0]],
				        datasets: [{
				        	fill: false,
				            label: 'Daily BMI',
				            data: [dailyBmi[0], dailyBmi[1], dailyBmi[2], dailyBmi[3], dailyBmi[4], dailyBmi[5], dailyBmi[6], 
				            dailyBmi[7], dailyBmi[8], dailyBmi[9], dailyBmi[10], dailyBmi[11], dailyBmi[12], dailyBmi[13], dailyBmi[14]],
				            backgroundColor: [
				            	'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 
				            	'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 
				            	'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 
				            	'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)'
				            ],
				            borderColor: [
				            	'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 
				            	'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 
				            	'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 
				            	'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)', 'rgba(255, 0, 0, 1)'  
				            ],
				            borderWidth: 1
				        }]
				    },
				    options: {
				    	title: {
				            display: true,
				            fontSize: 20,
				            fontColor: 'black',
				            text: 'Daily BMI'
        				},
				    	legend: {
				            labels: {
				                fontColor: 'black'
				            }
				        },
				        scales: {
				            yAxes: [{
				                ticks: {
				                	fontColor: 'black',
				                    beginAtZero: true,
				                    // Found the follow splitting function for chart.js here:
				                    // https://stackoverflow.com/questions/38800226/chart-js-add-commas-to-tooltip-and-y-axis
				                    userCallback: function(value, index, values) { 
								        value = value.toString();
								        value = value.split(/(?=(?:...)*$)/);
								        value = value.join(',');
								        return value;
    								}
				                }
				            }],
				            xAxes: [{
				                ticks: {
				                	fontColor: 'black'
				                }
				            }]
				        }
				    }
				});

				// Chart for going back 2 weeks
    			// First we must clear any chart already there - https://stackoverflow.com/questions/3387427/remove-element-by-id
    			var removeWeightChart = document.getElementById('weight-chart');
				removeWeightChart.parentNode.removeChild(removeWeightChart);
				document.getElementById('weight-dashboard').innerHTML += 
				'<canvas id="weight-chart" width="300" height="250"></canvas>'

				// Now we create the chart object, and pass through the data
    			var ctx = document.getElementById('weight-chart').getContext('2d');

				var weightChart = new Chart(ctx, {
				    type: 'line',
				    data: {
				        labels: [dateRange[14], dateRange[13], dateRange[12], dateRange[11], dateRange[10], dateRange[9], 
				        dateRange[8], dateRange[7], dateRange[6], dateRange[5], dateRange[4], dateRange[3], 
				        dateRange[2], dateRange[1], dateRange[0]],
				        datasets: [{
				        	fill: false,
				            label: 'Daily Weight',
				            data: [dailyWeight[0], dailyWeight[1], dailyWeight[2], dailyWeight[3], dailyWeight[4], dailyWeight[5], dailyWeight[6], 
				            dailyWeight[7], dailyWeight[8], dailyWeight[9], dailyWeight[10], dailyWeight[11], dailyWeight[12], dailyWeight[13], dailyWeight[14]],
				            backgroundColor: [
				            	'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 
				            	'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 
				            	'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 
				            	'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)'
				            ],
				            borderColor: [
				            	'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 
				            	'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 
				            	'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 
				            	'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)', 'rgba(0, 255, 0, 1)'  
				            ],
				            borderWidth: 1
				        }]
				    },
				    options: {
				    	title: {
				            display: true,
				            fontSize: 20,
				            fontColor: 'black',
				            text: 'Daily Weight'
        				},
				    	legend: {
				            labels: {
				                fontColor: 'black'
				            }
				        },
				        scales: {
				            yAxes: [{
				                ticks: {
				                	fontColor: 'black',
				                    beginAtZero: true,
				                    // Found the follow splitting function for chart.js here:
				                    // https://stackoverflow.com/questions/38800226/chart-js-add-commas-to-tooltip-and-y-axis
				                    userCallback: function(value, index, values) { 
								        value = value.toString();
								        value = value.split(/(?=(?:...)*$)/);
								        value = value.join(',');
								        return value;
    								}
				                }
				            }],
				            xAxes: [{
				                ticks: {
				                	fontColor: 'black'
				                }
				            }]
				        }
				    }
				});

				// Chart for going back 2 weeks
    			// First we must clear any chart already there - https://stackoverflow.com/questions/3387427/remove-element-by-id
    			var removeHeightChart = document.getElementById('height-chart');
				removeHeightChart.parentNode.removeChild(removeHeightChart);
				document.getElementById('height-dashboard').innerHTML += 
				'<canvas id="height-chart" width="300" height="250"></canvas>'

				// Now we create the chart object, and pass through the data
    			var ctx = document.getElementById('height-chart').getContext('2d');

				var heightChart = new Chart(ctx, {
				    type: 'line',
				    data: {
				        labels: [dateRange[14], dateRange[13], dateRange[12], dateRange[11], dateRange[10], dateRange[9], 
				        dateRange[8], dateRange[7], dateRange[6], dateRange[5], dateRange[4], dateRange[3], 
				        dateRange[2], dateRange[1], dateRange[0]],
				        datasets: [{
				        	fill: false,
				            label: 'Daily Height',
				            data: [dailyHeight[0], dailyHeight[1], dailyHeight[2], dailyHeight[3], dailyHeight[4], dailyHeight[5], dailyHeight[6], 
				            dailyHeight[7], dailyHeight[8], dailyHeight[9], dailyHeight[10], dailyHeight[11], dailyHeight[12], dailyHeight[13], dailyHeight[14]],
				            backgroundColor: [
				            	'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 
				            	'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 
				            	'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 
				            	'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)'
				            ],
				            borderColor: [
				            	'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 
				            	'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 
				            	'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 
				            	'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)', 'rgba(0, 0, 255, 1)'  
				            ],
				            borderWidth: 1
				        }]
				    },
				    options: {
				    	title: {
				            display: true,
				            fontSize: 20,
				            fontColor: 'black',
				            text: 'Daily Height'
        				},
				    	legend: {
				            labels: {
				                fontColor: 'black'
				            }
				        },
				        scales: {
				            yAxes: [{
				                ticks: {
				                	fontColor: 'black',
				                    beginAtZero: true,
				                    // Found the follow splitting function for chart.js here:
				                    // https://stackoverflow.com/questions/38800226/chart-js-add-commas-to-tooltip-and-y-axis
				                    userCallback: function(value, index, values) { 
								        value = value.toString();
								        value = value.split(/(?=(?:...)*$)/);
								        value = value.join(',');
								        return value;
    								}
				                }
				            }],
				            xAxes: [{
				                ticks: {
				                	fontColor: 'black'
				                }
				            }]
				        }
				    }
				});
				


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

getProfile();
getDailyUpdate();
getCompletedWorkouts();