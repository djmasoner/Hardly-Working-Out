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
    var today = new Date();

	today.setDate(today.getDate());
	today = today.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }); 

    inputArray = [height, weight, bmi, today];

    // Primitive error checking to make sure all the inputs are present (not the best but it works since html required isn't working)
    for (var i = 0, length = inputArray.length; i < length; i++) {
      if(inputArray[i] == "") {
        alert("Please fill out all update fields")
        break;
      }
    }

    var formObject = new Object();
    formObject = {
        "height": height,
        "weight": weight,
        "bmi": bmi,
        "date": today
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

getProfile();