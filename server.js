var express = require('express');
var http = require('http'); // Because we aren't using a template engine - to serve static html files
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');
var mysql = require('mysql');

var formSubmits = []

// MySQL pool connections
var pool = mysql.createPool({
  connectionLimit  : 10,
  host  : 'classmysql.engr.oregonstate.edu',
  user  : 'cs361_daviryan',
  password: 'h@rdlyw0rking',
  database: 'cs361_daviryan'
});

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

// // Sets up our session
app.use (session({
  secret: '12345',
  resave: false,
  saveUninitialized: true,
  //won't use secure since we aren't using HTTPS
}))

// The login redirect route
app.get('/oauth/redirect', function(req, res){
  // Token is received from github and included into a url with the client ID and client secret
  var requestToken = req.query.code;
  //res.setHeader('Content-Type', 'application/json');
  var tokenUrl = 'https://github.com/login/oauth/access_token?client_id='+clientID+'&client_secret='+clientSecret+'&code='+requestToken
  // Request made to github and the response token is used in the redirection response
  request({
      uri: tokenUrl, 
      headers: {'Accept':'application/json'}
    }, function(error,response,body){
    
      // Access token is the OAuth access token for Github
      var accessToken = (JSON.parse(body)).access_token;
      var githubApiUrl = 'https://api.github.com/user'
    // Request made to the Github API with the OAuth token passed; username is requested
    request({
      uri: githubApiUrl,
      // User agent header tells Github which app is requesting, auth token is the OAuth token 
      headers: {'User-Agent':'ryancraigdavis', 'Authorization': 'token ' + accessToken}
    }, function(error,response,body){
      var githubData = JSON.parse(body);
      req.session.userData = githubData.login;
      res.redirect('/welcome.html');
    });
  });
});

app.get('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/login');
});

app.post('/new_account', function(req, res){
  var userData = JSON.stringify(req.body);

  pool.query("INSERT INTO user (`username`, `name`, `gender`, `weight`, `height`, `age`, `bmi`) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.body.username, req.body.name, req.body.gender, req.body.weight, req.body.height, req.body.age, req.body.bmi], 
    function(err, result){
      if (err) {
        console.log(err)
      };
      if (result) {
        pool.query('SELECT * FROM workouts', function(err, rows, fields){
          console.log(rows);
        });
        res.redirect('/welcome.html');
      };
  });
});

// Display the profile information
app.get('/display_profile', function(req, res){
  if (req.session.userData) {
    pool.query('SELECT * FROM user', function(err, rows, fields){
      console.log(rows);
    });
    res.send(rows);
  };
});

app.get('/', function(req, res){
  // If the user is logged in, redirect to welcome page
  if (req.session.userData) {
    res.redirect('/welcome.html');
  }
  else {
    res.redirect('/login');
  }
});

app.get('/profile', function(req, res){
  if (req.session.userData) {
    var path = 'profile.html';
    res.sendFile(path, {root: './public'})
  }
  else {
    res.redirect('/login');
  }
});

app.get('/new_account', function(req, res){
  var path = 'create.html';
  res.sendFile(path, {root: './public'});
});

app.get('/login', function(req, res){
  var path = 'login.html';
  res.sendFile(path, {root: './public'})
})

console.log('Express started on http://localhost:3000; press Ctrl-C to terminate.');
http.createServer(app).listen(3000);
