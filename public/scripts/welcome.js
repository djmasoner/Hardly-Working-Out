// Submit buttons
document.getElementById("logout").addEventListener("click", logout);

// Logout
function logout(){
  event.preventDefault();
  // Creates the request
  var req = new XMLHttpRequest();
  req.open("GET", 'http://localhost:3000/logout', true);
  req.withCredentials = false;
  req.onload = function (e) {
    if (req.readyState === 4) {
      if (req.status === 200) {              

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