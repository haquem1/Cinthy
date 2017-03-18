var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

//TODO change ccEvents name to events
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

    //sanitize
    text = text || "";
    text = text.toLowerCase();
    values = text.split(' ');

    // message for staff
    if (keys.message.indexOf(values[0]) != -1) return false;

    // get started
    if (keys.help.indexOf(values[0]) != -1) {
        message = "Hi! This is Cinthy the Career Center Assistant.\n\nYou can ask me about:\n-Our hours\n-Our upcoming events for this month, next month, and the semester\n\nI can also recommend events for you. Or, if you know which event you're looking for, just ask!\n\nType 'message' followed by your message if there's something you would like our staff to answer.\n\nSimply say hello or help to bring this screen up again!"
        sendMessage(recipientId, {
            text: message
        });
        return true;
    }

    // for (var i = 0; i < keys.help.length; i++) {
    //    if (values[0] == keys.help[i]){
    //          message = "Hi! This is Cinthy the Career Center Assistant.\n\nYou can ask me about:\n-Our hours\n-Our upcoming events for this month, next month, and the semester\n\nI can also recommend events for you. Or, if you know which event you're looking for, just ask!\n\nType 'message' followed by your message if there's something you would like our staff to answer.\n\nSimply say hello or help to bring this screen up again!"
    //          sendMessage(recipientId, {
    //              text: message
    //          });
    //          return true;
    //    }
    // }

    // hours block
    if (text.indexOf("open") != -1 ||
        text.indexOf("close") != -1 ||
        text.indexOf("closed") != -1 ||
        text.indexOf("hours") != -1) {
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
    // events block
    else {
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

                // Looking for very specific event
                for (var i = 0; i < ccEvents.length; i++) {
                    if (text.indexOf(ccEvents[i].name.toLowerCase()) != -1 ||
                        text.indexOf("techfest") != -1 ||
                        text.indexOf("tech fest") != -1 ||
                        text.indexOf("resumania") != -1 ||
                        text.indexOf("job on campus") != -1 ||
                        text.indexOf("job on-campus") != -1 ||
                        text.indexOf("job oncampus") != -1 ||
                        text.indexOf("on campus job") != -1 ||
                        text.indexOf("oncampus job") != -1 ||
                        text.indexOf("on-campus job") != -1 ||
                        text.indexOf("international") != -1 ||
                        text.indexOf("non-profit") != -1 ||
                        text.indexOf("nonprofit") != -1 ||
                        text.indexOf("education") != -1 ||
                        text.indexOf("career fair") != -1 ||
                        text.indexOf("job fair") != -1 ||
                        text.indexOf("career expo") != -1 ||
                        text.indexOf("job expo") != -1 ||
                        text.indexOf("job exposition") != -1 ||
                        text.indexOf("career exposition") != -1) {

                        if (text.indexOf("techfest") != -1 ||
                            text.indexOf("tech fest") != -1) {
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
                        } else if (text.indexOf("resumania") != -1) {
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
                        } else if (text.indexOf("fair") != -1 ||
                            text.indexOf("career") != -1 ||
                            text.indexOf("expo") != -1 ||
                            text.indexOf("exposition") != -1) {

                            for (var i = 0; i < ccEvents.length; i++) {
                                if (text.indexOf("education") != -1) {
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
                                } else if (text.indexOf("non-profit") != -1 ||
                                    text.indexOf("nonprofit") != -1 ||
                                    text.indexOf("government") != -1) {
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
                                } else if (text.indexOf("engineering") != -1 ||
                                    text.indexOf("technology") != -1) {
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
                                } else {
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
                        } else if (text.indexOf("job on campus") != -1 ||
                            text.indexOf("job on-campus") != -1 ||
                            text.indexOf("job oncampus") != -1 ||
                            text.indexOf("on campus job") != -1 ||
                            text.indexOf("oncampus job") != -1 ||
                            text.indexOf("on-campus job") != -1) {
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
                        } else if (text.indexOf("international") != -1) {
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
                        } else {
                            sendMessage(recipientId, { //shouldn't reach block
                                text: "I'm very sorry, but I cannot help you. Type 'message:' followed by your question so that a staff member may assist you or to leave me feedback so I can better help you in the future"
                            });
                        }
                        sendMessage(recipientId, message);
                        return true;
                    }
                }
                //TODO Add block for key career center events -- expand later to be all events
                if (text.indexOf("critique") != -1 ||
                    text.indexOf("internship") != -1 ||
                    text.indexOf("internships") != -1 ||
                    text.indexOf("job") != -1 ||
                    text.indexOf("jobs") != -1 ||
                    text.indexOf("fair") != -1 ||
                    text.indexOf("expo") != -1 ||
                    text.indexOf("exposition") != -1 ||
                    text.indexOf("resume") != -1 ||
                    text.indexOf("resumes") != -1 ||
                    text.indexOf("interview") != -1 ||
                    text.indexOf("practice") != -1 ||
                    text.indexOf("prep") != -1 ||
                    text.indexOf("preparation") != -1 ||
                    text.indexOf("prepare") != -1 ||
                    text.indexOf("graduate") != -1 ||
                    text.indexOf("alumni") != -1 ||
                    text.indexOf("alum") != -1 ||
                    text.indexOf("grad") != -1 ||
                    text.indexOf("tech") != -1 ||
                    text.indexOf("technology") != -1 ||
                    text.indexOf("engineering") != -1 ||
                    text.indexOf("computers") != -1 ||
                    text.indexOf("computer") != -1 ||
                    text.indexOf("engineer") != -1 ||
                    text.indexOf("government") != -1 ||
                    text.indexOf("non-profit") != -1 ||
                    text.indexOf("nonprofit") != -1 ||
                    text.indexOf("profit") != -1 ||
                    text.indexOf("education") != -1 ||
                    text.indexOf("teacher") != -1 ||
                    text.indexOf("teaching") != -1 ||
                    text.indexOf("teachers") != -1 ||
                    text.indexOf("teach") != -1 ||
                    text.indexOf("network") != -1 ||
                    text.indexOf("networking") != -1) {

                    // tech fest
                    if (text.indexOf("tech") != -1 ||
                        text.indexOf("technology") != -1 ||
                        text.indexOf("engineering") != -1 ||
                        text.indexOf("computers") != -1 ||
                        text.indexOf("computer") != -1 ||
                        text.indexOf("engineer") != -1) {
                        for (var i = 0; i < ccEvents.length; i++) {
                            if (ccEvents[i].name == "Spring Tech Fest" ||
                                ccEvents[i].name == "Spring Internship & Career Expo") {
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
                                if (++count == 1) sendMessage(recipientId, {
                                    text: "Here are some events to help you:"
                                });
                            }
                        }
                    }
                    //recent grad
                    else if (text.indexOf("grad") != -1 ||
                        text.indexOf("graduate") != -1 ||
                        text.indexOf("alum") != -1 ||
                        text.indexOf("alumni") != -1) {
                        for (var i = 0; i < ccEvents.length; i++) {
                            if (ccEvents[i].name == "Recent Graduate & Alumni Fair" ||
                                ccEvents[i].name == "Spring Internship & Career Expo") {
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
                                if (++count == 1) sendMessage(recipientId, {
                                    text: "Here are some events to help you:"
                                });
                            }
                        }
                    }
                    // non-profit
                    else if (text.indexOf("non-profit") != -1 ||
                        text.indexOf("profit") != -1 ||
                        text.indexOf("nonprofit") != -1 ||
                        text.indexOf("government") != -1) {
                        for (var i = 0; i < ccEvents.length; i++) {
                            if (ccEvents[i].name == "Non-Profit & Government Career Fair" ||
                                ccEvents[i].name == "Spring Internship & Career Expo") {
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
                                if (++count == 1) sendMessage(recipientId, {
                                    text: "Here are some events to help you:"
                                });
                            }
                        }
                    }
                    // education
                    else if (text.indexOf("education") != -1 ||
                        text.indexOf("teacher") != -1 ||
                        text.indexOf("teachers") != -1 ||
                        text.indexOf("teaching") != -1 ||
                        text.indexOf("teach") != -1) {
                        for (var i = 0; i < ccEvents.length; i++) {
                            if (ccEvents[i].name == "Education Expo" ||
                                ccEvents[i].name == "Spring Internship & Career Expo") {
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
                                if (++count == 1) sendMessage(recipientId, {
                                    text: "Here are some events to help you:"
                                });
                            }
                        }
                    }
                    // other signature events
                    else {
                        for (var i = 0; i < ccEvents.length; i++) {
                            if (ccEvents[i].name == "Spring Internship & Career Expo" ||
                                ccEvents[i].name == "Resume Critique" ||
                                ccEvents[i].name == "60 Seconds to Success" ||
                                ccEvents[i].name == "Recent Graduate & Alumni Fair") {
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
                                if (++count == 1) sendMessage(recipientId, {
                                    text: "Here are some events to help you:"
                                });
                            }
                        }
                    }
                    sendMessage(recipientId, message);
                    return true;

                    // events by month
                } else if (text.indexOf("month") != -1 || text.indexOf("week") != -1) {
                    if (text.indexOf("next month") != -1) {
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
                                if (++count == 1) sendMessage(recipientId, {
                                    text: "Here are next month's events:"
                                });
                            }
                        }
                        if (!found) sendMessage(recipientId, {
                            text: "No events next month!"
                        });
                        else {
                            sendMessage(recipientId, message);
                        }

                        return true;

                    } else {
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
                                if (++count == 1) sendMessage(recipientId, {
                                    text: "Here are this month's events:"
                                });
                            }
                        }
                        if (!found) sendMessage(recipientId, {
                            text: "No events this month!"
                        });
                        else {
                            sendMessage(recipientId, message);
                        }

                        return true;
                    }
                } else if (text.indexOf("all") != -1 || text.indexOf("semester") != -1 || text.indexOf("year") != -1) {
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
                                    "image_url": "https://cdn.pixabay.com/photo/2012/04/01/17/38/calendar-23684_1280.png",
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

                    //show next event by default
                } else {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].tid >= compare) {
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
                            sendMessage(recipientId, {
                                text: "Here is our upcoming event:"
                            });
                            sendMessage(recipientId, message);
                            return true;
                        }
                    }
                }
          }
        }
        return true;
    }
};
