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

    // sanitize
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
        sendMessage(recipientId, {
            text: "This could be helpful"
        });
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

            for (var i = 0; i < keys.sixty_seconds_to_success.length; i++) {
                if (text.indexOf(keys.sixty_seconds_to_success[i]) != -1) {
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

            for (var i = 0; i < keys.general_career_fair.length; i++) {
                if (text.indexOf(keys.general_career_fair[i]) != -1) {
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

            for (var i = 0; i < keys.non_profit_gov_career_fair.length; i++) {
                if (text.indexOf(keys.non_profit_gov_career_fair[i]) != -1) {
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

            for (var i = 0; i < keys.education_career_fair.length; i++) {
                if (text.indexOf(keys.education_career_fair[i]) != -1) {
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

            for (var i = 0; i < keys.alumni_career_fair.length; i++) {
                if (text.indexOf(keys.alumni_career_fair[i]) != -1) {
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

            for (var i = 0; i < keys.on_campus_jobs.length; i++) {
                if (text.indexOf(keys.on_campus_jobs[i]) != -1) {
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

            for (var i = 0; i < keys.international.length; i++) {
                if (text.indexOf(keys.international[i]) != -1) {
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

            // for (var i = 0; i < keys.next.length; i++) {
            //     if (text.indexOf(keys.next[i]) != -1) {
            //         for (var i = 0; i < ccEvents.length; i++) {
            //           for (var i = 0; i < ccEvents.length; i++) {
            //               if (ccEvents[i].tid.getUTCMonth() == compare.getUTCMonth() + 1) {
            //                   found = true;
            //                   var card = {
            //                       "title": ccEvents[i].name,
            //                       "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
            //                       "image_url": ccEvents[i].imgUrl,
            //                       "buttons": [{
            //                           "type": "web_url",
            //                           "url": ccEvents[i].rsvpUrl,
            //                           "title": "Learn More"
            //                       }]
            //                   }
            //                   message.attachment.payload.elements.push(card);
            //                   if (++count == 1) sendMessage(recipientId, {
            //                       text: "Here are next month's events:"
            //                   });
            //               }
            //           }
            //           if (!found) sendMessage(recipientId, {
            //               text: "No events next month!"
            //           });
            //           else {
            //               sendMessage(recipientId, message);
            //           }
            //
            //           return true;
            //         }
            //     }
            // }
            //
            // for (var i = 0; i < keys.international.length; i++) {
            //     if (text.indexOf(keys.international[i]) != -1) {
            //         for (var i = 0; i < ccEvents.length; i++) {
            //             if (ccEvents[i].name == "Spring Tech Fest") {
            //                 var card = {
            //                     "title": ccEvents[i].name,
            //                     "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
            //                     "image_url": ccEvents[i].imgUrl,
            //                     "buttons": [{
            //                         "type": "web_url",
            //                         "url": ccEvents[i].rsvpUrl,
            //                         "title": "Learn More"
            //                     }]
            //                 }
            //                 message.attachment.payload.elements.push(card);
            //             }
            //         }
            //     }
            // }

            sendMessage(recipientId, message);
            return true;
            
            else if (text.indexOf("month") != -1 || text.indexOf("week") != -1) {
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
                sendMessage(recipientId, message);
                return true;
          }
        }
        return true;
};
