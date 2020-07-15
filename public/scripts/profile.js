// function getProfile(){

// 	// Creates the request
//     var req = new XMLHttpRequest();

//     req.open('GET', 'http://localhost:3000/profile', true);
//     req.setRequestHeader('Content-Type', 'application/json');
//     req.addEventListener('load',function(){
//       if(req.status >= 200 && req.status < 400){

//       	var data = JSON.parse(req.responseText);

// 	// This loop goes through each of the articles and creates a table with the image, title, source, link,
// 		// and description appended to each row of the table.
// 		for (var i = 0; i < 9; i++) {
// 			// Creates the rows and cells
// 		  	var row = document.createElement("tr");
// 	    	var cell1 = document.createElement("td");
// 	    	var cell2 = document.createElement("td");
// 	    	var cell3 = document.createElement("td");
// 	    	var cell4 = document.createElement("td");
// 	    	var linkRow = document.createElement("tr");
// 	    	var blankCell1 = document.createElement("td");
// 	    	var blankCell2 = document.createElement("td");

// 	    	// These are the variables created from the API data
// 	    	var articleTitle = document.createTextNode("From "+data.articles[i].source.name+": "+data.articles[i].title);
// 	    	var articleClick = document.createTextNode("View Full Article");
// 	    	var articleDescription = document.createTextNode(data.articles[i].description);
// 	    	var articleUrl = data.articles[i].url
// 	    	var articleImageLink = data.articles[i].urlToImage
// 	    	var articleBlank1 = document.createTextNode('');
// 	    	var articleBlank2 = document.createTextNode('');

// 	    	// These variables are for the url link and image
// 	    	var articleImage = document.createElement('img');
// 	    	articleImage.src = articleImageLink;
// 	    	var articleLink = document.createElement('a');
// 		    articleLink.appendChild(articleClick);
// 		    articleLink.title = 'Click to Go';
// 		    articleLink.href = articleUrl;
// 		    articleLink.target = '_blank'

// 		    // Appending the variables to the cells
// 		    cell1.appendChild(articleImage);
// 		    cell4.appendChild(articleLink);
// 	    	cell2.appendChild(articleTitle);
// 	    	cell3.appendChild(articleDescription);
// 	    	row.appendChild(cell1);
// 	    	row.appendChild(cell2);
// 	    	row.appendChild(cell3);
// 	    	linkRow.appendChild(cell4);
// 	    	linkRow.appendChild(blankCell1);
// 	    	linkRow.appendChild(blankCell2);
// 		    // Appends rows to the table
// 		  	tableBody.appendChild(row);
// 		  	tableBody.appendChild(linkRow);
// 		}
// 		// Appends the table to the body of the html
// 		newsTable.appendChild(tableBody);
// 		newsfeedContainer.appendChild(newsTable);

//       } else {
//         console.log("Error in network request: " + req.statusText);
//         document.getElementById('newsfeed-bad-api').innerHTML += '<h3>Too Many API Requests</h3><p>Unfortunately the API has received too many requests, please wait a bit and try again</p>'
//       }});

//     req.send(JSON.stringify(newsObject));

// };

function getProfile(){

  	// Creates the response
	var req = new XMLHttpRequest();
	req.open("GET", 'http://localhost:3000/display_profile', true);
	req.withCredentials = false;
	req.onload = function (e) {
	  	if (req.readyState === 4) {
	    	if (req.status === 200) {

	    	console.log(req.responseText);				

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

getProfile();