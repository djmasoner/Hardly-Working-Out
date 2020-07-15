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

getProfile();