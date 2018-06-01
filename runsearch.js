let baseURL;

$(document).ready(() => {
  baseURL = location.origin;
});

// Define variables
function getVars(){
  origin1 = $('#origin1')[0].value.toUpperCase();
  origin2 = $('#origin2')[0].value.toUpperCase();
  date = $('#date')[0].value;
  
  // Create flight search URL
  return `${baseURL}/search?origin1=${origin1}&origin2=${origin2}&date=${date}`;
};

function runSearch(){
  let searchURL = getVars();
  
  // Update DOM
  $('#header')[0].innerHTML = `Searching...`;
  $('#subheader')[0].innerHTML = `Getting info on flights from ${origin1} and ${origin2} for the month of ${date}...`;
  $('#flightResults')[0].innerHTML = '';
  $('#found')[0].innerHTML = '';
  $('#notfound')[0].innerHTML = '';
  
  // call server
  location.replace(searchURL);
};