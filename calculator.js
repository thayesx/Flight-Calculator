// Define variables
function getVars(){
  origin1 = $('#origin1')[0].value.toUpperCase();
  origin2 = $('#origin2')[0].value.toUpperCase();
  date = $('#date')[0].value;
  
  // Create flight search URL
  return `http://localhost:5000/search?origin1=${origin1}&origin2=${origin2}&date=${date}`;
};

function run(){
  let searchURL = getVars();
  
  // Update DOM
  $('#header')[0].innerHTML = `Getting info on flights from ${origin1} and ${origin2} for the month of ${date}...`;
  $('#results')[0].innerHTML = '';
  
  // call server
  location.replace(searchURL);
};