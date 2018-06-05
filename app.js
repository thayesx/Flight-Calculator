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
    header: 'The cheapest places to meet up',
    subheader: 'Choose two airports to fly out of, pick a month, and find the cheapest airports for you both to fly to'
  });
});

// Search route
app.get('/search?', async (req, res) => {

  // Assign query variables
  let orig1 = req.query.origin1;
  let orig2 = req.query.origin2;
  let date = req.query.date;

  // All possible destinations
  const destinations = ['atl', 'den', 'dfw', 'mia', 'lax', 'las', 'sea', 
                      'clt', 'mco', 'phx', 'ewr', 'iah', 'bos', 'msp', 
                      'dtw', 'phl', 'lga', 'fll', 'bwi', 'dca', 'slc', 
                      'mdw', 'iad', 'san', 'hnl', 'tpa', 'pdx'];

  // API token
  const token = 'b5160be6c1e24942d2978e5e5c607439';

  try {
    // Run getFlightData to get flight info from API
    const data = await getFlightData(orig1, orig2, date, destinations, token);

    // Render view with data returned from API
    res.render('layouts/main', {
      header: 'Results',
      subheader: 'Places to fly from ' + orig1 + ' and ' + orig2 + ' in the month of ' + date,
      flightResults: data.flightResults,
      found: 'Found info on flights to ' + data.found, 
      notfound: 'Couldn\'t find info for flights to ' + data.notfound,
      inputDate: date,
      inputOrigin1: orig1,
      inputOrigin2: orig2
    });
  } catch (err) {
    console.log('error:', err);
  }
});

// Render fake data without needing to call API
app.get('/dev', async (req, res) => {
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
    header: 'Places to fly from RDU and JFK in the month of 2018-08-01',
    flightResults: testResults,
    found: 'Found info on flights to ATL, DEN, DFW, MIA', 
    notfound: 'Couldn\'t find info for flights to LAX, LAS, SEA'
  });
});

// Get flight info from origins to each destination in destinations
async function getFlightData(orig1, orig2, date, destinations, token) {

  // Reset arrays for results
  let flightResults = [];
  let found = [];
  let notfound = [];

  // Create asynchronous API call for each destination
  await Promise.all(
    // For each destination in destinations array
    destinations.map( async (destination) => {

      // Create URLs
      let url1 = createURL(orig1, date, destination, token);
      let url2 = createURL(orig2, date, destination, token);

      // Call API, JSONify result and assign result.data to flightData
      let flightData = await callAPI(url1, url2, destination);
      flightResults.push({'success': flightData.Success, 'destination': flightData.Destination, 'price': flightData.Price});

      // If data found push it to results array, else tell the console nothing found
      if (!flightData.Success){
        notfound.push(" " + destination.toUpperCase());
      } else {
        found.push(" " + destination.toUpperCase());
      }
    })
  );

  console.log('flightResults', flightResults);
  return {flightResults, found, notfound};
};

function createURL(orig, date, dest, token){
  // Create unique url for getting API results from origin
  return `http://api.travelpayouts.com/v2/prices/latest?currency=usd&origin=${orig}&destination=${dest}&beginning_of_period=${date}&period_type=month&limit=1&show_to_affiliates=false&sorting=price&token=${token}`;
}

async function callAPI(url1, url2, dest){
  // Call API and assign result to var flight
  let flight1 = await fetch(url1); console.log('apicall1');
  let flight2 = await fetch(url2); console.log('apicall2');

  // JSONify result of API call
  let flightJSON1 = await flight1.json(); console.log('jsonify1', flightJSON1);
  let flightJSON2 = await flight2.json(); console.log('jsonify2', flightJSON2);

  // Get flight data from result of API call
  if (flightJSON1.data.length == 0 && flightJSON2.data.length == 0){
    var Price = "No flight data found.";
    var Destination = dest.toUpperCase();
    var Success = false;
  }
  else if (flightJSON1.data.length == 0 || flightJSON2.data.length == 0){
    var Price = "Missing data from one origin.";
    var Destination = dest.toUpperCase();
    var Success = false;
  } else {
    var Price = flightJSON1.data[0].value + flightJSON2.data[0].value;
    Price = '$' + Price.toFixed(2);
    var Destination = flightJSON1.data[0].destination;
    var Success = true;
  }
  
  return {Success, Destination: Destination, Price: Price};
}