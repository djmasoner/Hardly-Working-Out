// Submit button for building a workout
document.getElementById("doWorkout").addEventListener("click", doWorkout);

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
            console.log(data);
		
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