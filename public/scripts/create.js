// Submit buttons
document.getElementById("submitForm").addEventListener("click", createProfile);

// This function pulls info from the submit form, creates a JSON,
// and sends the object to the server where it is pushed to an array.
// An alert happens if it was a success
function createProfile(){
    event.preventDefault();
    // Creates the request
    var req = new XMLHttpRequest();

    // Input values
    var name = document.getElementById('nameInput').value;
    var height = document.getElementById('heightInput').value;
    var weight = document.getElementById('weightInput').value;
    var radioInput = document.getElementsByName('genderInput');
    var today = new Date();

    today.setDate(today.getDate());
    today = today.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

    for (var i = 0, length = radioInput.length; i < length; i++) {
      if(radioInput[i].checked) {
        var gender = radioInput[i].value
      }
    }
    var age = document.getElementById('ageInput').value;
    var bmi = (weight / (height**2)) * 703;

    inputArray = [name, height, weight, gender, age, bmi, today];

    // Primitive error checking to make sure all the inputs are present (not the best but it works since html required isn't working)
    for (var i = 0, length = inputArray.length; i < length; i++) {
      if(inputArray[i] == "") {
        alert("Please fill out all fields")
        break;
      }
    }

    var formObject = new Object();
    formObject = {
        "name": name,
        "height": height,
        "weight": weight,
        "gender": gender,
        "age": age,
        "bmi": bmi,
        "today": today
    };

    var localUrl = 'http://localhost:3000/create';
    var flipUrl = 'http://flip2.engr.oregonstate.edu:1344/create';

    req.open('POST', flipUrl, true);
    //req.open('POST', localUrl, true);
    req.setRequestHeader('Content-Type', 'application/json');
    req.addEventListener('load',function(){
      if(req.status >= 200 && req.status < 400){
        console.log('Success')
      } else {
        console.log("Error in network request: " + req.statusText);
      }});

    req.send(JSON.stringify(formObject));
    window.location.href = '/welcome';
};
