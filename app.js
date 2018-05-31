const express = require('express');
const fetch = require('node-fetch');
const exphbs = require('express-handlebars');
const port = process.env.PORT || 5000;
const app = express();

app.use(express.static("."));

// Handlebars Middleware
app.engine('hbs', exphbs({
  defaultLayout: 'main.hbs'
}));
app.set('view engine', 'hbs');

// Main route
app.get('/', (req, res) => {
  res.render('layouts/main', {
    header: 'Choose two airports to fly from + the date'
  });
});

// Search route
app.get('/search?', async (req, res) => {

  // Assign query variables
  let orig1 = req.query.origin1;
  let orig2 = req.query.origin2;
  let date = req.query.date;

  // List of destinations (short for testing speed)
  const destinations = ['atl', 'den', 'dfw'];

  // API token
  const token = 'b5160be6c1e24942d2978e5e5c607439';

  try {
    // Run getFlightData to get flight info from API
    const data = await getFlightData(orig1, orig2, date, destinations, token);

    // Render view with data returned from API
    res.render('layouts/main', {
      header: 'Results for flying from ' + orig1 + ' and ' + orig2,
      searchResults: JSON.stringify(data.allflights, null, 4), 
      found: 'Found info on flights to ' + data.found, 
      notfound: 'Couldn\'t find info for flights to ' + data.notfound
    });
  } catch (err) {
    console.log('error:', err);
  }
});

// Start server
app.listen(port, () =>{
  console.log(`Server started on ${port}`);
});

// Get flight info from origins to each destination in destinations
async function getFlightData(orig1, orig2, date, destinations, token) {

  // Reset arrays for results
  let allflights = [];
  let found = [];
  let notfound = [];

  // For each destination in destinations array
  for (const dest of destinations) {
    // Print current destination being searched to DOM + console
    console.log('searching ' + dest.toUpperCase());

    // Create URLs
    let url1 = createURL(orig1, date, dest, token);
    let url2 = createURL(orig2, date, dest, token);

    // Call API, JSONify result and assign result.data to flightData
    let flightData = await callAPI(url1, url2, dest);
    allflights.push(flightData);
    console.log(flightData);

    // If data found push it to results array, else tell the console nothing found
    if (!flightData.Success){
      console.log('missing data for', dest.toUpperCase());
      notfound.push(" " + dest.toUpperCase());
    } else {
      console.log('found flights to', dest.toUpperCase());
      found.push(" " + dest.toUpperCase());
    }
  }

  return {allflights, found, notfound}
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
  if (flightJSON1.data.length == 0 || flightJSON2.data.length == 0){
    var Price = 'Missing data';
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

  // All possible destinations
  const destinations = ['atl', 'den', 'dfw', 'mia', 'lax', 'las', 'sea', 
                      'clt', 'mco', 'phx', 'ewr', 'iah', 'bos', 'msp', 
                      'dtw', 'phl', 'lga', 'fll', 'bwi', 'dca', 'slc', 
                      'mdw', 'iad', 'san', 'hnl', 'tpa', 'pdx'];