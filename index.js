var express = require('express');
var bodyParser = require('body-parser');
var app = express();

var routes = require('./routes');
var ccEvents = require('./models/events');
var keys = require('./models/keys.json');

var sendMessage = require('./config/facebook');

app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(express.static('public'));

app.use(bodyParser.json());
app.use('/', routes);

app.listen((process.env.PORT || 3000));
