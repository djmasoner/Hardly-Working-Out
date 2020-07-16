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

      pool.query('SELECT Username FROM user', function(err, rows, fields){
        var usernameValid = false;
        for (var i = 0; i < rows.length; i++) {
          if (rows[i].Username == req.session.userData) {
            usernameValid = true;
          };
        };
        if (usernameValid == true) {
          res.redirect('/welcome');
        } else {
          res.redirect('/create');
        };
      });
    });
  });
});

app.get('/logout', function(req, res){
  req.session.destroy();
  res.redirect('/login');
});

app.post('/create', function(req, res){
  var userData = JSON.stringify(req.body);

  pool.query("INSERT INTO user (`username`, `name`, `gender`, `weight`, `height`, `age`, `bmi`) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.session.userData, req.body.name, req.body.gender, req.body.weight, req.body.height, req.body.age, req.body.bmi], 
    function(err, result){
      if (err) {
        console.log(err)
      };
      if (result) {

        // Creates a table for daily tracking of BMI
        var createDailyTable = "CREATE TABLE daily_"+req.session.userData+"(" +
          "id INT PRIMARY KEY AUTO_INCREMENT," +
          "username VARCHAR(255) NOT NULL," +
          "height INT," +
          "weight INT," +
          "bmi INT," +
          "date DATE," +
          "FOREIGN KEY (username) REFERENCES user (username))";

        // Creates the daily tracking of BMI table for the user
        pool.query(createDailyTable, function(err, result){
          if (err) {
            console.log(err)
          };
          if (result) {
            console.log(req.session.userData+' Profile Created')
            pool.query("INSERT INTO daily_"+req.session.userData+" (`username`, `height`, `weight`, `bmi`, `date`) VALUES (?, ?, ?, ?, ?)",
              [req.session.userData, req.body.height, req.body.weight, req.body.bmi, req.body.today], 
              function(err, result){
                if (err) {
                  console.log(err)
                };
                if (result) {
                  res.send('Success');
                };
              }
            );
          }
        });
      };
  });
});

// Display the profile information
app.get('/display_profile', function(req, res){
  if (req.session.userData) {

    // SQL query requires string to be in "double" quotes
    pool.query('SELECT * FROM user WHERE Username = "'+req.session.userData+'"', function(err, rows, fields){
      res.send(rows[0]);
    });
  };
});

// // Display the profile information
// app.get('/display_profile', function(req, res){
//   if (req.session.userData) {

//     // SQL query requires string to be in "double" quotes
//     pool.query('SELECT * FROM user WHERE Username = "'+req.session.userData+'"', function(err, rows, fields){
//       res.send(rows[0]);
//     });
//   };
// });

app.post('/daily_update', function(req, res){

  // Gets the date from the Post object and compares to the dates inside the database
  pool.query('SELECT Date FROM daily_'+req.session.userData, function(err, rows, fields){
    var todayValid = true;
    for (var i = 0; i < rows.length; i++) {
      if ((rows[i].Date).toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' }) == req.body.date) {
        todayValid = false;
      };
    };

    // If the user hasn't yet made a daily update, create that daily update
    if (todayValid == true) {
      pool.query("INSERT INTO daily_"+req.session.userData+" (`username`, `height`, `weight`, `bmi`, `date`) VALUES (?, ?, ?, ?, ?)",
        [req.session.userData, req.body.height, req.body.weight, req.body.bmi, req.body.date], 
        function(err, result){
          if (err) {
            console.log(err)
          };
          if (result) {
            res.send('Success');
          };
        }
      );

      // Otherwise, return 'Failure' meaning the user has already updated for the day
    } else {
      res.send('Failure');
    };
  }); 
});

app.get('/', function(req, res){
  // If the user is logged in, redirect to welcome page
  if (req.session.userData) {
    res.redirect('/welcome');
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

app.get('/welcome', function(req, res){
  var path = 'welcome.html';
  res.sendFile(path, {root: './public'});
});

app.get('/create', function(req, res){
  var path = 'create.html';
  res.sendFile(path, {root: './public'});
});

app.get('/login', function(req, res){
  var path = 'login.html';
  res.sendFile(path, {root: './public'})
})

app.get('/workouts', function(req, res){
  var path = 'workouts.html';
  res.sendFile(path, {root: './public'})
})

console.log('Express started on http://localhost:3000; press Ctrl-C to terminate.');
http.createServer(app).listen(3000);
