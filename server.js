var express = require('express');
var http = require('http'); // Because we aren't using a template engine - to serve static html files
var app = express();
var bodyParser = require('body-parser');
var request = require('request');
var fs = require('fs');
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

// The login redirect route
app.get('/oauth/redirect', function(req, res){

  // Token is received from github and included into a url with the client ID and client secret
  var requestToken = req.query.code;
  res.setHeader('Content-Type', 'application/json');
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

      // Query the user table in the database
      pool.query('SELECT username FROM user', function(err, rows, fields){
        if (err) {
          console.log(err)
        };
        var inUserArray = false;

        // Loop through the primary keys, if the github login is in the table, redirect to the welcome page
        // Else redirect to the account creation page
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].username == githubData.login) {
            inUserArray = true;
          };
        };
        if (inUserArray == true) {
          res.redirect('/welcome.html?name='+githubData.login);
        } else {
          res.redirect('/create.html?name='+githubData.login);
        };
      });

      // fs.readFile('./users.json', 'utf-8', function(err, data) {
      //   if (err) throw err
  
      //   var userArray = JSON.parse(data);
      //   var inUserArray = false
      //   for (var i = 0; i < userArray.users.length; i++) {
      //     if ((JSON.parse(userArray.users[i].userId)).name == githubData.login) {
      //       inUserArray = true;
      //     };
      //   };

      //   if (inUserArray == true) {
      //     res.redirect('/welcome.html?name='+githubData.login);
      //   }
      //   else {
      //     res.redirect('/create.html?name='+githubData.login);
      //   }
      // });

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
  var userData = JSON.stringify(req.body);
  console.log(userData);

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

 //    // This simply pushes the form submission into an array
 //    // Typically this would be saving to a database instead
 //    formSubmits.push(req.body);

 //    // Code for saving the profile in a JSON file. 
 //    fs.readFile('./users.json', 'utf-8', function(err, data) {
 //      if (err) throw err

 //      var userArray = JSON.parse(data);
 //      var userData = JSON.stringify(req.body);

 //      //Need to get the gitHub user id
 //      var userId = "1";
      
 //      userArray.users.push({userId: userData});

 //      fs.writeFile('./users.json', JSON.stringify(userArray), 'utf-8', function(err) {
 //        if (err) throw err

 //        console.log("Done!")
 //      });
 //    });

 //    console.log(formSubmits);
	// res.send('Success');
});

app.get('/profile', function(req, res){
    var path = 'profile.html';

    // Code for getting the profile
    fs.readFile('./users.json', 'utf-8', function(err, data) {
      if (err) throw err
    
      var userArray = JSON.parse(data);
      var userId = "1"; 
    });


    res.send('Success');
});

console.log('Express started on http://localhost:3000; press Ctrl-C to terminate.');
http.createServer(app).listen(3000);
