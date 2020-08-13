var express = require('express');
var http = require('http'); // Because we aren't using a template engine - to serve static html files
var app = express();
var session = require('express-session');
var bodyParser = require('body-parser');
var request = require('request');
var mysql = require('mysql');
var passport = require('passport');
var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
const {google} = require('googleapis');

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

passport.use(new GoogleStrategy({
    clientID:     '374190043347-pbn6hpfs7norvdg7p78oilsdghsvacfa.apps.googleusercontent.com',
    clientSecret: 'CkQIBtJTqUR-LyCR8jgRIMR0',
    callbackURL: 'http://localhost:3000/auth/google/callback',
    passReqToCallback   : true
  },
  function(request, accessToken, refreshToken, profile, done) {
    var email_array = (profile.email).split('@');

    request.session.userData = email_array[0];
    request.session.token = accessToken;

    pool.query('SELECT Username FROM user', function(err, rows, fields){
      var usernameValid = false;
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].Username == request.session.userData) {
          usernameValid = true;
        };
      };
      if (usernameValid == true) {
        return done(null, {profile: profile.email, token: accessToken, userExist: true});
      } else {
        return done(null, {profile: profile.email, token: accessToken, userExist: false});
      };
    });
  }
));
app.use(passport.initialize());
passport.serializeUser(function(user, done) {
  done(null, user);
});

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

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  if (req.user.userExist == false) {
    res.redirect('/create');
  } else {
    res.redirect('/welcome');
  }; 
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
                  // Not currently working - workaround exists on the front end
                  res.redirect('/login');
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

// Display the completed workouts by the user
app.get('/view_completed_workouts', function(req, res){
  if (req.session.userData) {

    // SQL query requires string to be in "double" quotes
    pool.query('SELECT * FROM completed_workouts WHERE username = "'+req.session.userData+'"', function(err, rows, fields){
      res.send(rows);
    });
  };
});

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
            pool.query("UPDATE user SET weight=?, height=?, bmi=? WHERE username=? ",
              [req.body.weight, req.body.height, req.body.bmi, req.session.userData], function(err, result){
                if (err) {
                  console.log(err)
                };
                if (result) {
                  res.send('Success');
                };
            });
          };
        }
      );

      // Otherwise, return 'Failure' meaning the user has already updated for the day
    } else {
      res.send('Failure');
    };
  }); 
});

// Get daily profile data for the daily tracking chart
app.get('/get_daily_update', function(req, res){
  if (req.session.userData) {

    // SQL query requires string to be in "double" quotes
    pool.query('SELECT * FROM daily_'+req.session.userData, function(err, rows, fields){
      res.send(rows);
    });
  };
});

app.get('/view_exercises', function(req, res){
  pool.query("SELECT * FROM Exercises", function(err, rows, fields){
    res.send(rows);
  });
});

// Pulls competitors based on ranking -> wins/losses/points
app.get('/view_competitors', function(req, res){
  pool.query('SELECT * FROM user ORDER BY wins DESC, losses ASC, challenge_points DESC', function(err, rows, fields){
    if (err) {
      console.log(err);
    }
    var competitorsArray = [];
    competitorsArray.push(req.session.userData);
    competitorsArray.push(rows);
    res.send(competitorsArray);
  });
});

// Goes through and updates the leaderboard
app.get('/update_leaderboard', function(req, res){

  // Selects all the users and for each one
  // checks the challenges for wins and losses for that user
  // If the user's wins/losses in the user table doesn't match - updates
  pool.query('SELECT * FROM user', function(err, rows, fields){
      pool.query('SELECT * FROM challenges', function(err2, rows2, fields2){
        for (var i = 0; i < rows.length; i++) {
        var wins = 0;
        var losses = 0;
        for (var j = 0; j < rows2.length; j++) {
          if (rows2[j].winner == rows[i].Username) {
            wins++;
          }
          if (rows2[j].loser == rows[i].Username) {
            losses++;
          }
        }
        if (rows[i].wins != wins) {
          pool.query("UPDATE user SET wins=? WHERE Username=? ",
          [wins, rows[i].Username], function(err, result){
            if (err) {
              console.log(err)
            };
            if (result) {
            };
          });
        }
        if (rows[i].losses != losses) {
          pool.query("UPDATE user SET losses=? WHERE Username=? ",
          [losses, rows[i].Username], function(err, result){
            if (err) {
              console.log(err)
            };
            if (result) {
            };
          });
        }
      }
      });
  });
  res.send('Leaderboard Updated');
});

// Goes through and updates winners and losers for challenges
app.get('/update_win_loss', function(req, res){
  today = new Date();
  today.setDate(today.getDate());

  // Four possible loss permutations
  pool.query('SELECT * FROM challenges', function(err, rows, fields){
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].accept == 1 && rows[i].competitor_complete == 1 && today > rows[i].end_date && rows[i].user_complete == 0 && rows[i].winner == null && rows[i].loser == null) {
        
        pool.query("UPDATE challenges SET winner=?, loser=? WHERE challenge_id=? ",
          [rows[i].competitor, rows[i].username, rows[i].challenge_id], function(err, result){
            if (err) {
              console.log(err)
            };
            if (result) {
              console.log(rows[i].username + ' Forfeit')
            };
        });
      };
    };
  });
  pool.query('SELECT * FROM challenges', function(err, rows, fields){
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].accept == 1 && rows[i].competitor_complete == 0 && today > rows[i].end_date && rows[i].user_complete == 1 && rows[i].winner == null && rows[i].loser == null) {
        
        pool.query("UPDATE challenges SET winner=?, loser=? WHERE challenge_id=? ",
          [rows[i].username, rows[i].competitor, rows[i].challenge_id], function(err, result){
            if (err) {
              console.log(err)
            };
            if (result) {
              console.log(rows[i].competitor + ' Forfeit')
            };
        });
      };
    };
  });
  pool.query('SELECT * FROM challenges', function(err, rows, fields){
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].accept == 1 && rows[i].competitor_complete == 1 && rows[i].username_points >= rows[i].competitor_points && rows[i].user_complete == 1 && rows[i].winner == null && rows[i].loser == null) {
        
        pool.query("UPDATE challenges SET winner=?, loser=? WHERE challenge_id=? ",
          [rows[i].username, rows[i].competitor, rows[i].challenge_id], function(err, result){
            if (err) {
              console.log(err)
            };
            if (result) {
              console.log('Win')
            };
        });
      };
    };
  });
  pool.query('SELECT * FROM challenges', function(err, rows, fields){
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].accept == 1 && rows[i].competitor_complete == 1 && rows[i].username_points < rows[i].competitor_points && rows[i].user_complete == 1 && rows[i].winner == null && rows[i].loser == null) {
        pool.query("UPDATE challenges SET winner=?, loser=? WHERE challenge_id=? ",
          [rows[i].competitor, rows[i].username, rows[i].challenge_id], function(err, result){
            if (err) {
              console.log(err)
            };
            if (result) {
              console.log('Win')
            };
        });
      };
    };
  });
  res.send('Success'); 
});

app.get('/view_active_challenges', function(req, res){

  // Captures both competitor and user challenges that are accepted and not completed
  pool.query('SELECT * FROM challenges WHERE competitor = "'+req.session.userData+'"', function(err, rows, fields){
    var activeChallengesArray = [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].accept == 1 && rows[i].competitor_complete == 0 && rows[i].winner == null && rows[i].loser == null) {
        activeChallengesArray.push(rows[i]);
      };
    };
    pool.query('SELECT * FROM challenges WHERE username = "'+req.session.userData+'"', function(err, rows, fields){
      for (var i = 0; i < rows.length; i++) {
        if (rows[i].accept == 1 && rows[i].user_complete == 0 && rows[i].winner == null && rows[i].loser == null) {
          activeChallengesArray.push(rows[i]);
        };
      };
      res.send(activeChallengesArray);
    });
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

app.post('/begin_workout', function(req, res){
    req.session.newWorkout = req.body;
    res.send('success');
});

app.post('/update_challenge', function(req, res){
  pool.query("UPDATE challenges SET accept=? WHERE challenge_id=? ",
    [req.body.accept, req.body.id], function(err, result){
      if (err) {
        console.log(err)
      };
      if (result) {
        res.send('Success');
      };
  });
});

app.post('/update_point_goal', function(req, res){
  pool.query("UPDATE user SET pointsGoal=? WHERE Username=? ",
    [req.body.newPointGoal, req.body.username], function(err, result){
      if (err) {
        console.log(err)
      };
      if (result) {
        console.log(req.body)
        res.send('Success');
      };
  });
});

app.post('/update_workout_goal', function(req, res){
  pool.query("UPDATE user SET workoutGoal=? WHERE Username=? ",
    [req.body.newWorkoutGoal, req.body.username], function(err, result){
      if (err) {
        console.log(err)
      };
      if (result) {
        console.log(req.body)
        res.send('Success');
      };
  });
});

app.get('/get_active_challenges', function(req, res){
  activeArray = [];

  // Grabs current date
  var todayDate = new Date();
  todayDate.setDate(todayDate.getDate());

  pool.query('SELECT * FROM challenges', function(err, rows, fields){
    for (var i = 0; i < rows.length; i++) {
      if (rows[i].accept == 0 && rows[i].competitor == req.session.userData && rows[i].end_date >= todayDate) {
        activeArray.push(rows[i]);
      };
    };
    res.send(activeArray);
  });
});

app.get('/do_workout', function(req, res){
  returnArray = [];
  pool.query('SELECT * FROM Exercises', function(err, rows, fields){
    for (var i = 0; i < rows.length; i++) {
      for (var j = 0; j < req.session.newWorkout.length; j++) {
        if (rows[i].ID == req.session.newWorkout[j].id) {
          var exerciseReturnObject = new Object();
          exerciseReturnObject = {
            "exercise": rows[i],
            "sets": req.session.newWorkout[j].sets
          };
          returnArray.push(exerciseReturnObject);
        };
      };
    };
    res.send(returnArray);
  });
});

app.get('/do_challenge_workout', function(req, res){
  pool.query('SELECT exercise_array FROM challenges WHERE challenge_id = "'+req.session.doChallengeId+'"', function(err, rows, fields){
    var exercisesArray = JSON.parse(rows[0].exercise_array);
    returnArray = [];
    pool.query('SELECT * FROM Exercises', function(err, rows, fields){
    for (var i = 0; i < rows.length; i++) {
      for (var j = 0; j < exercisesArray.length; j++) {
        if (rows[i].ID == exercisesArray[j].id) {
          var exerciseReturnObject = new Object();
          exerciseReturnObject = {
            "exercise": rows[i],
            "sets": exercisesArray[j].sets
          };
          returnArray.push(exerciseReturnObject);
        };
      };
    };
    res.send(returnArray);
  });

  });
});

app.post('/save_workout', function(req, res){
  // Converts favorite true/false to 0/1 for DB
  var isFavorite = false;
  if (req.body.favorite == true) {
    isFavorite = 1;
  } else {
    isFavorite = 0;
  };

  // Grabs current date
  var todayDate = new Date();
  todayDate.setDate(todayDate.getDate());
  todayDate = todayDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

  pool.query("INSERT INTO completed_workouts (`username`, `title`, `description`, `favorite`, `points`, `rating`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.session.userData, req.body.title, req.body.description, isFavorite, req.body.points, req.body.rating, todayDate], 
    function(err, result){
      if (err) {
        console.log(err)
      };
      if (result) {
        res.send('Success');
      };
    }
  );
});

app.post('/save_challenge', function(req, res){
  // Converts favorite true/false to 0/1 for DB
  var isFavorite = false;
  if (req.body.favorite == true) {
    isFavorite = 1;
  } else {
    isFavorite = 0;
  };

  // Grabs current date
  var todayDate = new Date();
  todayDate.setDate(todayDate.getDate());
  todayDate = todayDate.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

  pool.query("INSERT INTO completed_workouts (`username`, `title`, `description`, `favorite`, `points`, `rating`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?)",
    [req.session.userData, req.body.title, req.body.description, isFavorite, req.body.points, req.body.rating, todayDate], 
    function(err, result){
      if (err) {
        console.log(err)
      };
      if (result) {
        console.log('Workout Saved');
      };
    }
  );
  pool.query('SELECT challenge_points FROM user WHERE username = "'+req.session.userData+'"', function(err, rows, fields){
    var new_points = rows[0].challenge_points + req.body.challengePoints;
    pool.query("UPDATE user SET challenge_points=? WHERE username=? ",
    [new_points, req.session.userData], function(err, result){
      if (err) {
        console.log(err)
      };
      if (result) {
        console.log('Points Added');
      };
    });   
  });
  pool.query('SELECT * FROM challenges WHERE challenge_id = "'+req.session.doChallengeId+'"', function(err, rows, fields){
    if (rows[0].username == req.session.userData) {
      pool.query("UPDATE challenges SET username_points=?, user_complete=? WHERE challenge_id=? ",
      [req.body.challengePoints, 1, req.session.doChallengeId], function(err, result){
        if (err) {
          console.log(err)
        };
        if (result) {
          res.send('Success');
        };
      });
    } else {
      pool.query("UPDATE challenges SET competitor_points=?, competitor_complete=? WHERE challenge_id=? ",
      [req.body.challengePoints, 1, req.session.doChallengeId], function(err, result){
        if (err) {
          console.log(err)
        };
        if (result) {
          res.send('Success');
        };
      });
    }
  });
});

app.post('/save_competitor', function(req, res){

  // Saves current competitor to the session
  req.session.newCompetitor = req.body.competitor;
  res.send('Success');
});

app.post('/begin_challenge', function(req, res){

  // Saves the challenges ID to the session
  req.session.doChallengeId = req.body.id;
  res.send('Success');
});

app.post('/send_challenge', function(req, res){
  var exercise_JSON = JSON.stringify(req.body);

  startDay = new Date();
  endDay = new Date();

  startDay.setDate(startDay.getDate());
  startDay.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });
  endDay.setDate(endDay.getDate()+7);
  endDay.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' });

  pool.query("INSERT INTO challenges (`username`, `competitor`, `start_date`, `end_date`, `exercise_array`) VALUES (?, ?, ?, ?, ?)",
    [req.session.userData, req.session.newCompetitor, startDay, endDay, exercise_JSON], 
    function(err, result){
      if (err) {
        console.log(err)
      };
      if (result) {
        res.send('Success');
      };
    }
  );
});

app.get('/welcome', function(req, res){
  var path = 'welcome.html';
  res.sendFile(path, {root: './public'});
});

app.get('/challenges', function(req, res){
  var path = 'challenges.html';
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

app.get('/build_workouts', function(req, res){
  var path = 'build_workouts.html';
  res.sendFile(path, {root: './public'})
})

app.get('/build_challenge', function(req, res){
  var path = 'build_challenge.html';
  res.sendFile(path, {root: './public'})
})

app.get('/workouts_completed', function(req, res){
  var path = 'workouts_completed.html';
  res.sendFile(path, {root: './public'})
})

app.get('/test_workout', function(req, res){
  var path = 'test_workout.html';
  res.sendFile(path, {root: './public'})
})

app.get('/do_challenge', function(req, res){
  var path = 'do_challenge.html';
  res.sendFile(path, {root: './public'})
})

app.get('/working_out', function(req, res){
  var path = 'working_out.html';
  res.sendFile(path, {root: './public'})
})

app.get('/saved_workouts', function(req, res){

  if (req.session.userData) {

    // SQL query requires string to be in "double" quotes
    pool.query('SELECT * FROM Generic_Workouts_Table', function(err, rows, fields){
      res.send(rows);
    });
  };
});

console.log('Express started on port 3000; press Ctrl-C to terminate.');
http.createServer(app).listen(3000);
