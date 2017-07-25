var request = require('request');

request({
  url: 'https://api.someapi.com/oauth/token',
  method: 'POST',
  auth: {
    user: 'xxx',
    pass: 'yyy'
  },
  form: {
    'grant_type': 'client_credentials'
  }
}, function(err, res) {
  var json = JSON.parse(res.body);
  console.log("Access Token:", json.access_token);
});

// This authorizes other clients connected internally developed
