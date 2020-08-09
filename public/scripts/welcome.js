var workoutBtn = document.getElementById("workout-btn");
var navList = document.getElementById("nav-list");

workoutBtn.addEventListener("click", displayList);
navList.addEventListener("mouseleave", hideList);

function displayList() {
    var list = document.getElementById("nav-list");
    list.style.pointerEvents = "all";
};

function hideList() {
    var list = document.getElementById("nav-list");
    list.style.pointerEvents = "none";
}

function chooseChallenge(value, id){
    event.preventDefault();

    var updateObject = new Object();
    updateObject.id = id;
    updateObject.accept = value;

    var req = new XMLHttpRequest();

    req.open('POST', serverUrl+'/update_challenge', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
      	if (value == 1) {
      		console.log('Challenge Accepted!')
      	} else {
      		console.log('Challenge Declined')
      	};
      } else {
        console.log("Error in network request: " + req.statusText);
      }});

    req.send(JSON.stringify(updateObject));

};

function getActiveChallenges(){
    var req = new XMLHttpRequest();

    req.open('GET', serverUrl+'/get_active_challenges', true);
    
    req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	// SQL Data returned from server
            var data = JSON.parse(req.responseText);
            for (var i = 0; i < data.length; i++) {
            	var date = (data[i].end_date).substring(0,10);
            	document.getElementById('createChallengeModal').innerHTML += '<div class="modal fade" id="newChallenge'+data[i].challenge_id+'" tabindex="-1" role="dialog" aria-labelledby="newChallengeLabel" aria-hidden="true"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="newChallengeLabel">New Challenge!</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button></div><div class="modal-body" id="challengeModalBody">'+data[i].username+' is challenging you! You will have until '+date+' to complete the challenge. Do you accept?</div><div class="modal-footer"><button type="button" class="btn btn-secondary" value="2" name="'+data[i].challenge_id+'" onclick="chooseChallenge(this.value,this.name)"  data-dismiss="modal">Dismiss Challenge</button><button type="button" class="btn btn-primary" value="1" name="'+data[i].challenge_id+'" onclick="chooseChallenge(this.value,this.name)" data-dismiss="modal">Accept Challenge</button></div></div></div></div>'
            	$('#newChallenge'+data[i].challenge_id).modal('show')

            };
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

getActiveChallenges();


