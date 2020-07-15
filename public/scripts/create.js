const session = require("express-session");

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
    //var username = window.location.search.split('=')[1]; Disabled temporarily
    var username = session.id;
    var name = document.getElementById('nameInput').value; 
    var height = document.getElementById('heightInput').value; 
    var weight = document.getElementById('weightInput').value; 
    var radioInput = document.getElementsByName('genderInput'); 

    for (var i = 0, length = radioInput.length; i < length; i++) {
      if(radioInput[i].checked) {
        var gender = radioInput[i].value
      }
    }
    var age = document.getElementById('ageInput').value; 
    var bmi = (weight / (height**2)) * 703; 

    inputArray = [username, name, height, weight, gender, age, bmi];

    // Primitive error checking to make sure all the inputs are present (not the best but it works since html required isn't working)
    for (var i = 0, length = inputArray.length; i < length; i++) {
      if(inputArray[i] == "") {
        alert("Please fill out all fields")
        break;
      }
    }

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

    req.open('POST', 'http://localhost:3000/create', true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){

          // Success message sent
          console.log('Form Submit Success')
          console.log(formObject)

      } else {
        console.log("Error in network request: " + req.statusText);
      }});

    req.send(JSON.stringify(formObject));

};