let baseURL;

$(document).ready(() => {
	baseURL = location.origin;
	var list = $(".flightResults.sort");

	$(".sort").each(function(){
		$(this).html(
			$(this).children('.success').sort(
				function(a, b){
					return ($(b).data('price')) < ($(a).data('price')) ? 1 : -1;
				}
			)
		);
	});
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
  $('#header')[0].innerHTML = `One sec...`;
  $('#subheader')[0].innerHTML = `Finding the cheapest places to meet up when flying from ${origin1} and ${origin2} in the month of ${date}...`;
  $('#flightResults')[0].innerHTML = '';
  $('#found').innerHTML = '';
  $('#notfound').innerHTML = '';
  
  // call server
  location.replace(searchURL);
};

function home(){
	location.replace(baseURL);
};