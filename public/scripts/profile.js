// Submit button for daily update of BMI data
document.getElementById("updateBmi").addEventListener("click", dailyUpdate);

function getProfile(){

  	// Creates the response
	var req = new XMLHttpRequest();
	req.open("GET", 'http://localhost:3000/display_profile', true);
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

    req.open('POST', 'http://localhost:3000/daily_update', true);
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
	console.log(dateRangeDash);
  	// Creates the response
	var req = new XMLHttpRequest();
	req.open("GET", 'http://localhost:3000/get_daily_update', true);
	req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    		// Data from daily user table
    			var data = JSON.parse(req.responseText);
    			dailyBmi = [];
    			var pos = -1;

    			// Goes through DB data and if dates match, insert the data, if not, insert a 0
    			for (var i = 14; i >= 0; i--) {
    				var inData = false;
    				for (var j = 0; j < data.length; j++) {
    					var dVar = data[j].date;
    					dVar = dVar.substring(0,10);

    					if (dVar == dateRangeDash[i]) {
    						dailyBmi.push(data[j].bmi);
    						pos = j;
    						inData = true;
    					};
					
					};
					if (inData == false) {
						if (pos == -1) {
							dailyBmi.push(0);
						} else {
							dailyBmi.push(data[j-1].bmi);
						};
						
					};
				};

    			// Chart for going back 2 weeks
    			// First we must clear any chart already there - https://stackoverflow.com/questions/3387427/remove-element-by-id
    			var removeChart = document.getElementById('daily-chart');
				removeChart.parentNode.removeChild(removeChart);
				document.getElementById('daily-dashboard').innerHTML += 
				'<canvas id="daily-chart" width="700" height="350"></canvas>'

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
				            	'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 
				            	'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 
				            	'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 
				            	'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)', 'rgba(249, 193, 50, 1)'
				            ],
				            borderColor: [
				            	'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)',
				            	'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 
				            	'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)', 'rgba(0, 0, 0, 1)'  
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
				                	fontColor: 'white'
				                }
				            }]
				        }
				    }
				});

				


	    	} else {
	      		console.error(req.statusText);
	      		// With a bad request, or no data available, we append that message to the box
    			var removeChart = document.getElementById('daily-chart');
				removeChart.parentNode.removeChild(removeChart);
				document.getElementById('daily-dashboard').innerHTML += 
				'<canvas id="daily-chart" width="700" height="350"></canvas>'
				var ctx = document.getElementById('daily-chart').getContext('2d');

				var predChart = new Chart(ctx, {
					options: {
				    	title: {
				            display: true,
				            fontSize: 20,
				            fontColor: 'white',
				            text: 'No Data Available'
				        }
				    }
				});

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