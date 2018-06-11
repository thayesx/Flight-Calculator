const express = require('express');
const fetch = require('node-fetch');
const exphbs = require('express-handlebars');
const port = process.env.PORT || 5000;
const app = express();

var inputData = {
	date: '',
	origin1: '',
	origin2: ''
};

var airportList = require('./airportShortlist.json');

app.use(express.static("."));

// Handlebars Middleware
app.engine('hbs', exphbs({
	defaultLayout: 'main.hbs'
}));
app.set('view engine', 'hbs');

// Server listen
app.listen(port, () =>{
	console.log(`Server started on ${port}`);
});

// Main route
app.get('/', (req, res) => {
	res.render('layouts/main', {
		header: 'Meet in the middle',
		subheader: 'Pick a month and two airports for you and a friend to fly out of, and see the cheapest places to meet up.'
	});
});

// Search route
app.get('/search?', (req, res) => {

	// Assign query variables
	let orig1 = req.query.origin1;
	let orig2 = req.query.origin2;
	let date = req.query.date;

	// All possible destinations
	const destinations = airportList;

	// API token
	const token = 'b5160be6c1e24942d2978e5e5c607439';

	// Run getFlightData to get flight info from API
	handleFlightResults(orig1, orig2, date, destinations, token)
	// Render view with data returned from API
	.then((results) => {res.render('layouts/main', {
			header: 'Get going!',
			subheader: 'Found these prices for flying to places from ' + orig1 + ' and ' + orig2 + ' in the month of ' + date,
			flightResults: results.flightResults,
			found: 'Found prices for flights to... ' + results.found, 
			notfound: 'Missing info on flights to... ' + results.notfound,
			inputDate: date,
			inputOrigin1: orig1,
			inputOrigin2: orig2
		})
	})
	.catch(err => console.log('Error in GET route', err));
});

// Render fake data without needing to call API
app.get('/dev', (req, res) => {
	let testResults =[
		{'success': true, 'destination': 'ATL', 'price': '$250.59'},
		{'success': true, 'destination': 'DEN', 'price': '$344.12'},
		{'success': false, 'destination': 'LAX', 'price': 'Missing data'},
		{'success': false, 'destination': 'LAS', 'price': 'Missing data'},
		{'success': true, 'destination': 'DFW', 'price': '$509.91'},
		{'success': false, 'destination': 'SEA', 'price': 'Missing data'},
		{'success': true, 'destination': 'MIA', 'price': '$630.34'},
	];

	res.render('layouts/main', {
		header: 'Get going!',
		subheader: 'Check out these combined costs for flying to places from RDU and SFO in the month of 2018-08-01',
		flightResults: testResults,
		found: 'Found prices for flights to... ATL, DEN, DFW, MIA', 
		notfound: 'Missing info on flights to... LAX, LAS, SEA'
	});
});

// Get flight info from origins to each destination in destinations
async function handleFlightResults(orig1, orig2, date, destinations, token) {

	// Reset arrays for results
	let flightResults = [];
	let found = [];
	let notfound = [];

	try {
		// Create asynchronous API call for each destination
		await Promise.all(
			// For each destination in destinations array
			destinations.map(async destination => {
				
				try {
					// Create URLs
					let url1 = createURL(orig1, date, destination.code, token);
					let url2 = createURL(orig2, date, destination.code, token);
		
					// Call API, JSONify result and assign result.data to flightData
					let flightData = await getFlightData(url1, url2);
					flightResults.push({'success': flightData.success, 
															'destination': destination.city, 
															'price': flightData.price, 
															'details': flightData.details});
		
					// If data found push it to results array, else tell the console nothing found
					if (!flightData.success){
						notfound.push(" " + destination.code);
					} else {
						found.push(" " + destination.code);
					}
				} catch(err){console.log('Error mapping ' + destination.code + ': ', err)}
			})
		);
		// console.log('flightResults', flightResults);
		return {flightResults, found, notfound};	
	} catch(err){console.log('Error handling flight results', err)}
};

async function getFlightData(url1, url2){

	try {
		// Get flight info from API from each origin and initialize variables
		let flight1 = await callAPI(url1);
		let flight2 = await callAPI(url2);

		var success;
		var price;
	
		// Get flight data from result of API call
		if (flight1.data.length == 0 && flight2.data.length == 0){
			success = false;
			price = "No flight data found.";
		}
		else if (flight1.data.length == 0 || flight2.data.length == 0){
			success = false;
			price = "Missing data from one origin.";
		} else {
			success = true;
			price = '$' + Math.round(flight1.data[0].value + flight2.data[0].value);
			var details = [
				{origin: "from " + flight1.data[0].origin,
				price: '$' + Math.round(flight1.data[0].value)},
				{origin: "from " + flight2.data[0].origin,
				price: '$' + Math.round(flight2.data[0].value)}
			];
		}
		let flightData = {success, price, details}
		return flightData;
	} catch(err){console.log('getFlightData error', err)};
}

async function callAPI(url){
	let promise = await fetch(url);
	let flightJSON = await promise.json();
	return flightJSON;
};

function createURL(orig, date, dest, token){
	// Create unique url for getting API results from origin
	return `http://api.travelpayouts.com/v2/prices/latest?currency=usd&origin=${orig}&destination=${dest}&beginning_of_period=${date}&period_type=month&limit=1&show_to_affiliates=false&sorting=price&token=${token}`;
};