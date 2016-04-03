var http = require('http');
var https = require('https');
var forecast = require('./weather-key.js');

var apiKey = (forecast.key);

//get the zip code from user input
var zip = [];
process.argv.forEach(function(value){
  zip.push(value);
});
zip = zip.slice(2, 3);
zip = zip[0]; // needs validation

// If the zip is valid, continue
if(zip.match(/^\d{5}$/)) {

  var coordinates = '';

  // get the coordinates of the zip code via google maps api
  var request = http.get('http://maps.googleapis.com/maps/api/geocode/json?address=' + zip, function(response){
    if(response.statusCode === 200) {
      var body = '';
      response.on('data', function(chunk){
        body += chunk;
      });
      response.on('end', function(){
        try {
          var data = JSON.parse(body);
          var location = data.results[0].geometry.location;
          var lat = location.lat;
          var lng = location.lng;
          coordinates = lat + ',' + lng;

          // pass the coordinates to the forecast.io api
          var request = https.get('https://api.forecast.io/forecast/' + apiKey + '/' + coordinates, function(response){
            if(response.statusCode === 200) {
              var body = '';
              response.on('data', function(chunk){
                body += chunk;
              });
              response.on('end', function(){
                try {
                  var data = JSON.parse(body);
                  // Get this week's weather
                  var report = data.daily.summary;
                  console.log(report);
                } catch(error) {
                  // Forecast Parse Error
                  console.error('Forecast error: "' + error.message + '".');
                }
              });
            } else {
              // Forecast Status Code Error
              console.error('Forecast request failed with a ' + response.statusCode + ' "' + http.STATUS_CODES[response.statusCode] + '" error.');
            }
          });
          // Forecast Connection Error
          request.on('error', function(error){
            console.error('Forecast error: "' + error.message + '".');
          });


        } catch(error) {
          // Google Parse Error
          console.error('Location error: "' + error.message + '".');
        }
      });
    } else {
      // Google Status Code Error
      console.error('Location request failed with a ' + response.statusCode + ' "' + http.STATUS_CODES[response.statusCode] + '" error.');
    }
  });
  // Google Connection Error
  request.on('error', function(error){
    console.error('Location error: "' + error.message + '".');
  });

} else {
  // If the zip is invalid
  console.error('Invalid zip code entered.');
}
