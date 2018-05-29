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
  res.render('layouts/main', {flightInfo: 'this will be flight data', url: 'url'});
});

// Start server
app.listen(port, () =>{
  console.log(`Server started on ${port}`);
});