var express = require('express');
var http = require('http'); // Because I am not using a template engine - to serve static html files
var app = express();
var bodyParser = require('body-parser');
var request = require('request');

var formSubmits = []

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(function(req,res,next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
})

app.get('/', function(req, res){
    var path = 'create.html';
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

// app.post('/news', function(req, res){
//     res.setHeader('Content-Type', 'application/json');
//     // This is the News API call url, it will be sent, and the response object will be sent
//     // back to the front end
//     var newsUrl = req.body.destination

//     request(newsUrl, function(error,response,body){
//         var apiResponse = body;
//         res.send(apiResponse);
//   });
// });

console.log('Express started on http://localhost:3000; press Ctrl-C to terminate.');
http.createServer(app).listen(3000);
