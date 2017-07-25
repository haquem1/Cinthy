var sendMessage = require('../config/facebook');
var richMessage = require('../helpers/richMessage');

const routes = require('express').Router();

// Server frontpage
routes.get('/', function(req, res) {
    res.send('This is Chatbot Server');
});

// Facebook Webhook
routes.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
routes.post('/webhook', function(req, res) {
    var events = req.body.entry[0].messaging;
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            if (!richMessage(event.sender.id, event.message.text)) {
                sendMessage(event.sender.id, {
                    text: "Thank you for your message! A staff member from the Career Center will get back to you shortly\n\nVisit us at Bayramian Hall, 413 and at www.csun.edu/career"
                });
            }
        } else if (event.postback) {
            console.log("Postback received: " + JSON.stringify(event.postback));
        }
    }
    res.sendStatus(200);
});

// handler receiving messages from generic client (sunlink in future)
routes.post('/generic_hook', function(req, res) {
    var events = req.body.entry[0].messaging;
    for (var i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            if (!richMessage(event.sender.id, event.message.text)) {
                sendMessage(event.sender.id, {
                    text: "Thank you for your message! A staff member from the Career Center will get back to you shortly\n\nVisit us at Bayramian Hall, 413 and at www.csun.edu/career"
                });
            }
        } else if (event.postback) {
            console.log("Postback received: " + JSON.stringify(event.postback));
        }
    }
    res.sendStatus(200);
});


module.exports = routes;
