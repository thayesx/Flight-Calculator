// Get flight info from origin to each destination in destinations
async function getFlightData(destinations, orig1, orig2, date, token) {

  // Get DOM objects
  const pageStatus = $('#status')[0];
  const pageFound = $('#found')[0];
  const pageNotFound = $('#notfound')[0];

  // Reset DOM object content
  pageFound.innerHTML = '';
  pageNotFound.innerHTML = '';

  // Reset arrays for results
  let results = [];
  let notfound = [];
  let found = [];

  // Write origins to DOM
  $('#origin')[0].innerHTML = 'Flying out of: ' + orig1.toUpperCase() + ' & ' + orig2.toUpperCase() + ' the month of ' + date;

  // For each destination in destinations array
  for (const dest of destinations) {
    // Print current destination being searched to DOM + console
    console.log('searching ' + dest.toUpperCase());
    pageStatus.innerHTML = 'Finding cheapest combined flight prices to... ' + dest.toUpperCase();

    // Create URLs
    let url1 = createURL(orig1, dest, date, token);
    let url2 = createURL(orig2, dest, date, token);

    // Call API, JSONify result and assign result.data to flightData
    let flightData = await callAPI(url1, url2, dest);
    results.push(flightData);

    console.log(flightData);

    // If data found push it to results array, else tell the console nothing found
    if (flightData.Success){
      console.log('missing data for', dest.toUpperCase());
      notfound.push(" " + dest.toUpperCase());
    } else {
      console.log('found flights to', dest.toUpperCase());
      found.push(" " + dest.toUpperCase());
    }

    // Write results to DOM
    $('#results')[0].innerHTML = JSON.stringify(results, null, 1);
  }

  // Update DOM with info after function completed
  pageStatus.innerHTML = '';
  pageFound.innerHTML = 'Found price info for flights to ' + found;
  pageNotFound.innerHTML = 'Couldn\'t get enough data on flights to ' + notfound;
};

function createURL(orig, dest, date, token){
  // Create unique url for getting API results from origin
  return 'http://api.travelpayouts.com/v2/prices/latest?currency=usd&origin='
  + orig + '&destination=' + dest + '&beginning_of_period=' + date + '&period_type=month&limit=1&show_to_affiliates=false&sorting=price&token=' + token;
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
    Price = '$' + Price;
    var Destination = flightJSON1.data[0].destination;
    var Success = true;
  }
  
  return {Success, Destination: Destination, Price: Price};
}

function getVars(){
  origin1 = $('#origin1')[0].value;
  origin2 = $('#origin2')[0].value;
  date = $('#date')[0].value;
}

// API token
const token = 'b5160be6c1e24942d2978e5e5c607439';

// All possible destinations
var destinations = ['atl', 'den', 'dfw', 'mia', 'lax', 'las', 'sea', 'clt', 'mco', 'phx', 'ewr', 'iah', 'bos', 'msp', 'dtw', 'phl', 'lga', 'fll', 'bwi', 'dca', 'slc', 'mdw', 'iad', 'san', 'hnl', 'tpa', 'pdx'];

// Variables
var date = '2018-07-01';

// Origin
var origin1 = 'rdu';
var origin2 = 'sfo';

function run(){
  getVars();
  getFlightData(destinations, origin1, origin2, date, token);
};