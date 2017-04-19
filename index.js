var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

var ccEvents = require('./models/events');
var hours = require('./models/hours');
var keys = require('./models/keys.json');

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function(req, res) {
    res.send('This is Chatbot Server');
});

// Facebook Webhook
app.get('/webhook', function(req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function(req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
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

// generic function sending messages --TODO move to config file
function sendMessage(recipientId, message) {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: process.env.PAGE_ACCESS_TOKEN
        },
        method: 'POST',
        json: {
            recipient: {
                id: recipientId
            },
            message: message,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending message: ', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
};

// send rich message for hours and events
function richMessage(recipientId, text) {

    var date = new Date();
    var compare = date;
    var found = false;
    var i = 0;

    compare.setHours(0, 0, 0, 0);

    // sanitize
    text = text || "";
    text = text.toLowerCase();
    values = text.split(' ');

    // message for staff
    if (keys.message.indexOf(values[0]) != -1) return false;

    // get started
    if (keys.help.indexOf(values[0]) != -1) {
      message2 = {
          "attachment":{
            "type":"image",
            "payload":{
              "url":"http://www.csun.edu/career/plan_your_future/images/chatbot/new_fone/elephant.gif"
            }
          }
        }
        message = "Hi! This is Cinthy the Career Center Assistant.\n\nYou can ask me about:\n-Our hours\n-Our upcoming events for this month, next month, and the semester\n\nI can also recommend events for you. Or, if you know which event you're looking for, just ask!\n\nType 'message' followed by your message if there's something you would like our staff to answer.\n\nSimply say hello or help to bring this screen up again!"
        sendMessage(recipientId, message2, function(){
          sendMessage(recipientId, {
              text: message
          });
        })
        return true;
    }

    // hours block
    for (var i = 0; i < keys.hours.length; i++) {
        if (text.indexOf(keys.hours[i]) != -1) {
            if (date.getUTCDay() > 0 && date.getUTCDay() < 6 && (date.getUTCHours() > 16 || date.getUTCHours() < 1))
                message = "The Career Center is now open\n";
            else
                message = "The Career Center is now closed\n";

            message = message +
                "\nOur regular hours are:\nMonday - Thursday: 9am-5pm\nFriday: 9am-4pm";

            sendMessage(recipientId, {
                text: message
            });
            return true;
        }
    }

    // events block
    for (var i = 0; i < keys.general.length; i++) {
        if (text.indexOf(keys.general[i]) != -1) {
            message = {
                "attachment": {
                    "type": "template",
                    "payload": {
                        "template_type": "generic",
                        "elements": []
                    }
                }
            };

            var count = 0; //for initial greeting

            for (var i = 0; i < keys.tech_fest.length; i++) {
                if (text.indexOf(keys.tech_fest[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Spring Tech Fest") {
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                }
            }

            for (var i = 0; i < keys.resu_makeover.length; i++) {
                if (text.indexOf(keys.resu_makeover[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Resu-Makeover") {
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                }
            }

            for (var i = 0; i < keys.sixty_seconds_to_success.length; i++) {
                if (text.indexOf(keys.sixty_seconds_to_success[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "60 Seconds to Success") {
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                }
            }

            for (var i = 0; i < keys.general_career_fair.length; i++) {
                if (text.indexOf(keys.general_career_fair[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Spring Internship & Career Expo") {
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                }
            }

            for (var i = 0; i < keys.non_profit_gov_career_fair.length; i++) {
                if (text.indexOf(keys.non_profit_gov_career_fair[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Non-Profit & Government Career Fair") {
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                }
            }

            for (var i = 0; i < keys.education_career_fair.length; i++) {
                if (text.indexOf(keys.education_career_fair[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Education Expo") {
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                }
            }

            for (var i = 0; i < keys.alumni_career_fair.length; i++) {
                if (text.indexOf(keys.alumni_career_fair[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Recent Graduate & Alumni Fair") {
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                }
            }

            for (var i = 0; i < keys.on_campus_jobs.length; i++) {
                if (text.indexOf(keys.on_campus_jobs[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "How To Find a Job on Campus Workshop" ||
                            ccEvents[i].name == "How To Find a Job on Campus Job Fair") {
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                }
            }

            for (var i = 0; i < keys.international.length; i++) {
                if (text.indexOf(keys.international[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Job Search Tips for International Students Workshop" ||
                            ccEvents[i].name == "Job Search Tips for International Students Panel") {
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                }
            }

            for (var i = 0; i < keys.next_month.length; i++) {
                if (text.indexOf(keys.next_month[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].tid.getUTCMonth() == compare.getUTCMonth() + 1) {
                            found = true;
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                    if (!found) sendMessage(recipientId, {
                        text: "No events next month!"
                    });
                    else {
                        sendMessage(recipientId, {
                            text: "Here are next month's events:"
                        })
                        sendMessage(recipientId, message);
                    }
                    return true;
                }
            }

            for (var i = 0; i < keys.this_month.length; i++) {
                if (text.indexOf(keys.this_month[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].tid.getUTCMonth() == compare.getUTCMonth()) {
                            found = true;
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                        }
                    }
                    if (!found) sendMessage(recipientId, {
                        text: "No events this month!"
                    });
                    else {
                        sendMessage(recipientId, {
                            text: "Here are this month's events:"
                        })
                        sendMessage(recipientId, message);
                    }
                    return true;
                }
            }

            for (var i = 0; i < keys.all_events.length; i++) {
                if (text.indexOf(keys.all_events[i]) != -1) {
                    sendMessage(recipientId, {
                        text: "Check out our calendar:"
                    });
                    message = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": [{
                                    "title": "Career Center Events",
                                    "subtitle": "",
                                    "image_url": "http://www.csun.edu/sites/default/files/styles/slideshow_full/public/field_image/field_slideshow_slides/Calendar_0.jpg?itok=onQCLNsE",
                                    "buttons": [{
                                        "type": "web_url",
                                        "url": "http://www.csun.edu/career/calendar/",
                                        "title": "Go to calendar"
                                    }]
                                }]
                            }
                        }
                    };
                    sendMessage(recipientId, message);
                    return true;
                }
            }

            for (var i = 0; i < keys.next_event.length; i++) {
                if (text.indexOf(keys.next_event[i]) != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].tid >= compare) {
                            found = true;
                            var card = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            }
                            message.attachment.payload.elements.push(card);
                            break;
                        }
                    }
                    if (!found) sendMessage(recipientId, {
                        text: "No events!"
                    });
                    else {
                        sendMessage(recipientId, {
                            text: "Here is our next event:"
                        })
                        sendMessage(recipientId, message);
                    }
                    return true;
                }
            }

            if (message.attachment.payload.elements.length > 0) {
                sendMessage(recipientId, {
                    text: "This could be helpful"
                });
                sendMessage(recipientId, message);
            }
            return true;
        }
    }
    return true;
};
