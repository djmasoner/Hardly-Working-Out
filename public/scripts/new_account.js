// Submit buttons
document.getElementById("submitForm").addEventListener("click", createProfile);

// This function pulls the name and email from the submit form, creates a JSON,
// and sends the object to the server where it is pushed to an array.
// An alert happens if it was a success
function createProfile(){
    event.preventDefault();
    // Creates the request
    var req = new XMLHttpRequest();

    // Input values
    var username = window.location.search.split('=')[1];
    var name = document.getElementById('nameInput').value;
    var height = document.getElementById('heightInput').value;
    var weight = document.getElementById('weightInput').value;
    var gender = document.getElementById('genderInput').value;
    var age = document.getElementById('ageInput').value;
    var bmi = (weight / (height**2)) * 703;

    var formObject = new Object();
    formObject = {
        "username": username,
        "name": name,
        "height": height,
        "weight": weight,
        "gender": gender,
        "age": age,
        "bmi": bmi
    };

    req.open('POST', 'http://localhost:3000/new_account', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){

          // Success message sent
		      console.log('Form Submit Success')

      } else {
        console.log("Error in network request: " + req.statusText);
      }});

    req.send(JSON.stringify(formObject));

};