var express = require('express');
var http = require('http'); // Because I am not using a template engine - to serve static html files
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

var formSubmits = []

// Oauth2 Client ID and Secret
var clientID = '5c5585e7f4040ae68986'
var clientSecret = '52d3f8b62aaa23c2d06448fff85c4461c620af67'

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
})

// The login redirect route
app.get('/oauth/redirect', function(req, res){

  // Token is received from github and included into a url with the client ID and client secret
  var requestToken = req.query.code;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('User-Agent', 'ryancraigdavis');
  var tokenUrl = 'https://github.com/login/oauth/access_token?client_id='+clientID+'&client_secret='+clientSecret+'&code='+requestToken
  
  // Request made to github and the response token is used in the redirection response
  request(tokenUrl, function(error,response,body){

    // For some reason we aren't getting a response object, just a weird URL, the loop parses the response
    var pos = 13;
    var accessToken = '';
    while(body[pos] != '&'){
      accessToken += body[pos];
      pos += 1;
    };
    // Until i can figure out the issue with this token
    //var githubApiUrl = 'https://api.github.com/user/'+accessToken
    var githubApiUrl = 'https://api.github.com/user/95ec25c87660269e115269831cb809133f1517e6'

    request({
      uri: githubApiUrl, 
      headers: {'User-Agent':'ryancraigdavis'}
    }, function(error,response,body){
      var data = JSON.parse(body);
      console.log(data);

      // Redirect the user to the welcome page, along with the access token
      // More code here would use the access token to access user data saved in a database
      res.redirect('/welcome.html?name='+data.name);

    });
  });
});

app.get('/new_account', function(req, res){
    var path = 'create.html';
    res.sendFile(path, {root: './public'});
});

app.get('/', function(req, res){
    var path = 'login.html';
    res.sendFile(path, {root: './public'});
});

app.post('/new_account', function(req, res){
    // This simply pushes the form submission into an array
    // Typically this would be saving to a database instead
    formSubmits.push(req.body);

    // Code for saving the profile

    console.log(formSubmits);
	res.send('Success');
});

app.get('/profile', function(req, res){
    var path = 'profile.html';

    // Code for getting the profile

    res.send('Success');
});

console.log('Express started on http://localhost:3000; press Ctrl-C to terminate.');
http.createServer(app).listen(3000);
