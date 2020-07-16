let testButton = document.getElementById("test");
testButton.addEventListener("click", viewWorkout(testButton));

function viewWorkout(btn){
    var req = new XMLHttpRequest();
    req.open("GET", 'http://localhost:3000/view_workout', true);
    
    req.withCredentials = false;
    req.body.name = btn.name;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {
	    	// SQL Data returned from server
            var data = JSON.parse(req.responseText);
            console.log(data)

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
