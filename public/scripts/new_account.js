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
    var name = document.getElementById('nameInput').value;
    var email = document.getElementById('emailInput').value;
    var password = document.getElementById('passwordInput').value;
    var height = document.getElementById('heightInput').value;
    var weight = document.getElementById('weightInput').value;
    var gender = document.getElementById('genderInput').value;
    var age = document.getElementById('ageInput').value;

    var formObject = new Object();
    formObject = {
        "name": name,
        "email": email,
        "password": password,
        "height": height,
        "weight": weight,
        "gender": gender,
        "age": age
    };

    req.open('POST', 'http://localhost:3000/new_account', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){

          // Success message sent
		      alert('Form Submit Success')

      } else {
        console.log("Error in network request: " + req.statusText);
      }});

    req.send(JSON.stringify(formObject));

};