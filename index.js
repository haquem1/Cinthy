var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function(req, res) {
    res.send('This is TestBot Server');
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

// generic function sending messages
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
    compare.setHours(0, 0, 0, 0);
    text = text || "";
    //sanitize
    text = text.toLowerCase();
    values = text.split(' ');

    // message for career center
    if (text.indexOf("message") != -1 ||
        text.indexOf("message:") != -1 ||
        text.indexOf("msg") != -1) {
        return false;
    }

    // get started
    if ((values[0] == "hello" ||
            values[0] == "hi" ||
            values[0] == "hey" ||
            values[0] == "help" ||
            values[0] == "who") && values.length < 6) {

        message = "Hi! This is Cinthy the Career Center Assistant.\n\nYou can ask me about:\n-Our hours\n-Our upcoming events for this month, next month, and the semester\n\nI can also recommend events for you. Or, if you know which event you're looking for, just ask!\n\nType 'message' followed by your message if there's something you would like our staff to answer.\n\nSimply say hello or help to bring this screen up again!"
        sendMessage(recipientId, {
            text: message
        });
        return true;
    }

    // hours block
    // TODO add special hours/closures
    if (text.indexOf("open") != -1 ||
        text.indexOf("close") != -1 ||
        text.indexOf("closed") != -1 ||
        text.indexOf("hours") != -1) {
        if (date.getUTCDay() > 0 && date.getUTCDay() < 6 && (date.getUTCHours() > 16 || date.getUTCHours() < 1)) {
            message = "The Career Center is now open\n";
        } else {
            message = "The Career Center is now closed\n";
        }
        message = message +
            "\nOur regular hours are:\nMonday - Thursday: 9am-5pm\nFriday: 9am-4pm";

        sendMessage(recipientId, {
            text: message
        });
        return true;
    }

    // events block
    // TODO display eveything as a catalogue instead of an enormous stream of messages
    else if (text.indexOf("when") != -1 ||
        text.indexOf("event") != -1 ||
        text.indexOf("events") != -1 ||
        text.indexOf("happen") != -1 ||
        text.indexOf("happening") != -1 ||
        text.indexOf("find") != -1 ||
        text.indexOf("can i") != -1 ||
        text.indexOf("do i") != -1) {
          
          message = {
              "attachment": {
                  "type": "template",
                  "payload": {
                      "template_type": "generic",
                      "elements": []
                  }
              }
          };

        // TODO: will migrate to json file
        var ccEvents = [{
            "name": "United States Peace Corps Information Session",
            "date": "Wednesday, February 8",
            "time": "2:00pm - 3:30pm",
            "location": "Career Center, BH 410",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/?mode=form&id=6d0fe80494df44564db8141732fd51a3&s=event&ss=is",
            "tid": new Date("February 8, 2017")
        }, {
            "name": "How To Find a Job on Campus Workshop",
            "date": "Tuesday, February 14",
            "time": "11:00am - 3:00pm",
            "location": "USU, Grand Salon",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?s=event&ss=ws&_ksl=1&mode=list", // not direct link
            "tid": new Date("February 14, 2017")
        }, {
            "name": "How To Find a Job on Campus Job Fair",
            "date": "Thursday, February 16",
            "time": "11:00am - 3:00pm",
            "location": "USU, Grand Salon",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?s=event&ss=ws&_ksl=1&mode=list", // not direct link
            "tid": new Date("February 16, 2017")
        }, {
            "name": "Medtronic Information Session",
            "date": "Thursday, February 16",
            "time": "4:00pm - 5:00pm",
            "location": "USU, Lake Balboa Room",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?mode=form&id=8001574a2317b2e330e9de3cf49e4ac9&s=event&ss=is",
            "tid": new Date("February 16, 2017")
        }, {
            "name": "Job Search Tips for International Students Workshop",
            "date": "Wednesday, February 15",
            "time": "10:00am - 11:15am",
            "location": "Career Center, BH 410",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?mode=form&id=a4f4fff4066f2e6aebcf80cb54656e89&s=event&ss=ws",
            "tid": new Date("February 15, 2017")
        }, {
            "name": "Job Search Tips for International Students Panel",
            "date": "Wednesday, February 15",
            "time": "11:30am - 12:30pm",
            "location": "Career Center, BH 410",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?mode=form&id=a4f4fff4066f2e6aebcf80cb54656e89&s=event&ss=ws",
            "tid": new Date("February 15, 2017")
        }, {
            "name": "Spring Tech Fest",
            "date": "Wednesday, February 21",
            "time": "10:00am - 3:00pm",
            "location": "USU, Northridge Center",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/STF17.jpg",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/event/careerfairs/7b59e7d91ffe666a399650f3678892a7/overview?gotodiv=&student=832a136059707ede583fa1da08672024",
            "tid": new Date("February 21, 2017")
        }, {
            "name": "NAVAIR Information Session",
            "date": "Wednesday, February 21",
            "time": "4:00pm - 6:00pm",
            "location": "USU, Lake Balboa Room",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?mode=form&id=151804da45844d582c4153d1fa8f7ba1&s=event&ss=is",
            "tid": new Date("February 21, 2017")
        }, {
            "name": "Resume Critique",
            "date": "Wednesday, February 28",
            "time": "10:30am - 2:30pm",
            "location": "USU, Northridge Center",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?s=event&ss=ws&_ksl=1&mode=list", // not direct link
            "tid": new Date("February 28, 2017")
        }, {
            "name": "Internship Experience Panel",
            "date": "Wednesday, March 1",
            "time": "4:00pm - 5:30pm",
            "location": "USU, Flintride Room",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?s=event&ss=ws&_ksl=1&mode=list", // not direct link
            "tid": new Date("March 1, 2017")
        }, {
            "name": "Peace Corps Movie Screening: Girl Rising",
            "date": "Wednesday, March 1",
            "time": "2:00pm - 4:00pm",
            "location": "Career Center, BH 410",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?mode=form&id=4cc852afc252f312404628f2bdd42f60&s=event&ss=ws",
            "tid": new Date("March 1, 2017")
        }, {
            "name": "60 Seconds to Success",
            "date": "Tuesday, March 7",
            "time": "10:30am - 1:30pm",
            "location": "USU, Thousand Oaks Room",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?s=event&ss=ws&_ksl=1&mode=list", // not direct link
            "tid": new Date("March 7, 2017")
        }, {
            "name": "Spring Internship & Career Expo",
            "date": "Wednesday, March 15",
            "time": "10:00am - 1:00pm",
            "location": "USU, Northridge Center & Grand Salon",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/SICE17.jpg",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/event/careerfairs/6b9940eb0974e6aae863515db76b3e38/overview?gotodiv=&student=832a136059707ede583fa1da08672024",
            "tid": new Date("March 15, 2017")
        }, {
            "name": "Non-Profit & Government Career Fair",
            "date": "Wednesday, March 29",
            "time": "10:00am - 1:00pm",
            "location": "USU, Northridge Center & Grand Salon",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/event/careerfairs/80bc765c134a1fd686d8748e6cdc1077/overview?gotodiv=&student=832a136059707ede583fa1da08672024",
            "tid": new Date("March 29, 2017")
        }, {
            "name": "Education Expo",
            "date": "Wednesday, April 12",
            "time": "12:00pm - 5:00pm",
            "location": "USU, Northridge Center",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/event/careerfairs/111dab5806f0777db1e34c42a71ff629/overview?gotodiv=&student=832a136059707ede583fa1da08672024",
            "tid": new Date("April 12, 2017")
        }, {
            "name": "United States Peace Corps Information Session",
            "date": "Wednesday, April 19",
            "time": "2:00pm - 3:30pm",
            "location": "Career Center, BH 410",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid982139?mode=form&id=7fc6b1811517a0418b085cfcf25dfbd9&s=event&ss=is",
            "tid": new Date("April 19, 2017")
        }, {
            "name": "Mocktail Party",
            "date": "Tuesday, April 25",
            "time": "6:30pm - 8:30pm",
            "location": "Orange Grove Bistro",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/index.php/pid302148?s=event&ss=ws&_ksl=1&mode=list",
            "tid": new Date("April 25, 2017")
        }, {
            "name": "Recent Graduate & Alumni Fair",
            "date": "Wednesday, May 23",
            "time": "10:00am - 1:00pm",
            "location": "USU, Northridge Center & Grand Salon",
            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/generic.png",
            "rsvpUrl": "https://csun-csm.symplicity.com/students/event/careerfairs/59b8238207ea66cf14695afbaa272498/overview?gotodiv=&student=832a136059707ede583fa1da08672024",
            "tid": new Date("May 23, 2017")
        }];

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
                        if (ccEvents[i].name == "Resume Critique") {
                            message = {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "generic",
                                        "elements": [{
                                            "title": ccEvents[i].name,
                                            "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                            "image_url": ccEvents[i].imgUrl,
                                            "buttons": [{
                                                "type": "web_url",
                                                "url": ccEvents[i].rsvpUrl,
                                                "title": "Learn More"
                                            }]
                                        }]
                                    }
                                }
                            };
                        }
                    }
                } else if (text.indexOf("fair") != -1 ||
                    text.indexOf("career") != -1 ||
                    text.indexOf("expo") != -1 ||
                    text.indexOf("exposition") != -1) {

                    for (var i = 0; i < ccEvents.length; i++) {
                        if (text.indexOf("education") != -1) {
                            if (ccEvents[i].name == "Education Expo") {
                                message = {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                            "template_type": "generic",
                                            "elements": [{
                                                "title": ccEvents[i].name,
                                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                                "image_url": ccEvents[i].imgUrl,
                                                "buttons": [{
                                                    "type": "web_url",
                                                    "url": ccEvents[i].rsvpUrl,
                                                    "title": "Learn More"
                                                }]
                                            }]
                                        }
                                    }
                                };
                            }
                        } else if (text.indexOf("non-profit") != -1 ||
                            text.indexOf("nonprofit") != -1 ||
                            text.indexOf("government") != -1) {
                            if (ccEvents[i].name == "Non-Profit & Government Career Fair") {
                                message = {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                            "template_type": "generic",
                                            "elements": [{
                                                "title": ccEvents[i].name,
                                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                                "image_url": ccEvents[i].imgUrl,
                                                "buttons": [{
                                                    "type": "web_url",
                                                    "url": ccEvents[i].rsvpUrl,
                                                    "title": "Learn More"
                                                }]
                                            }]
                                        }
                                    }
                                };
                            }

                        } else if (text.indexOf("engineering") != -1 ||
                            text.indexOf("technology") != -1) {
                            if (ccEvents[i].name == "Spring Tech Fest") {
                                message = {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                            "template_type": "generic",
                                            "elements": [{
                                                "title": ccEvents[i].name,
                                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                                "image_url": ccEvents[i].imgUrl,
                                                "buttons": [{
                                                    "type": "web_url",
                                                    "url": ccEvents[i].rsvpUrl,
                                                    "title": "Learn More"
                                                }]
                                            }]
                                        }
                                    }
                                };
                            }

                        } else {
                            if (ccEvents[i].name == "Spring Internship & Career Expo") {
                                message = {
                                    "attachment": {
                                        "type": "template",
                                        "payload": {
                                            "template_type": "generic",
                                            "elements": [{
                                                "title": ccEvents[i].name,
                                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                                "image_url": ccEvents[i].imgUrl,
                                                "buttons": [{
                                                    "type": "web_url",
                                                    "url": ccEvents[i].rsvpUrl,
                                                    "title": "Learn More"
                                                }]
                                            }]
                                        }
                                    }
                                };
                            }
                        }
                    }
                } else if (text.indexOf("job on campus") != -1 ||
                    text.indexOf("job on-campus") != -1 ||
                    text.indexOf("job oncampus") != -1 ||
                    text.indexOf("on campus job") != -1 ||
                    text.indexOf("oncampus job") != -1 ||
                    text.indexOf("on-campus job") != -1) { //TODO: test if previous error out of sco
                    var items = [];
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "How To Find a Job on Campus Workshop" ||
                            ccEvents[i].name == "How To Find a Job on Campus Fair") {
                            var item = {
                                "title": ccEvents[i].name,
                                "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                "image_url": ccEvents[i].imgUrl,
                                "buttons": [{
                                    "type": "web_url",
                                    "url": ccEvents[i].rsvpUrl,
                                    "title": "Learn More"
                                }]
                            };
                            items.push(item);
                        }
                    }
                    message = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": items
                            }
                        }
                    };
                    if (++count == 1) sendMessage(recipientId, message);



                } else if (text.indexOf("international") != -1) {
                    for (var i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Job Search Tips for International Students Workshop" ||
                            ccEvents[i].name == "Job Search Tips for International Students Panel") {
                            message = {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "generic",
                                        "elements": [{
                                            "title": ccEvents[i].name,
                                            "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                            "image_url": ccEvents[i].imgUrl,
                                            "buttons": [{
                                                "type": "web_url",
                                                "url": ccEvents[i].rsvpUrl,
                                                "title": "Learn More"
                                            }]
                                        }]
                                    }
                                }
                            };
                            if (++count == 1) sendMessage(recipientId, message);
                        }
                    }

                } else {
                    message = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": [{
                                    "title": ccEvents[i].name,
                                    "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                    "image_url": ccEvents[i].imgUrl,
                                    "buttons": [{
                                        "type": "web_url",
                                        "url": ccEvents[i].rsvpUrl,
                                        "title": "Learn More"
                                    }]
                                }]
                            }
                        }
                    };
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
                        message = {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": [{
                                        "title": ccEvents[i].name,
                                        "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                        "image_url": ccEvents[i].imgUrl,
                                        "buttons": [{
                                            "type": "web_url",
                                            "url": ccEvents[i].rsvpUrl,
                                            "title": "Learn More"
                                        }]
                                    }]
                                }
                            }
                        };
                        if (++count == 1) sendMessage(recipientId, {
                            text: "Here are some events to help you:"
                        });
                        sendMessage(recipientId, message);
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
                        message = {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": [{
                                        "title": ccEvents[i].name,
                                        "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                        "image_url": ccEvents[i].imgUrl,
                                        "buttons": [{
                                            "type": "web_url",
                                            "url": ccEvents[i].rsvpUrl,
                                            "title": "Learn More"
                                        }]
                                    }]
                                }
                            }
                        };
                        if (++count == 1) sendMessage(recipientId, {
                            text: "Here are some events to help you:"
                        });
                        sendMessage(recipientId, message);
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
                        message = {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": [{
                                        "title": ccEvents[i].name,
                                        "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                        "image_url": ccEvents[i].imgUrl,
                                        "buttons": [{
                                            "type": "web_url",
                                            "url": ccEvents[i].rsvpUrl,
                                            "title": "Learn More"
                                        }]
                                    }]
                                }
                            }
                        };
                        if (++count == 1) sendMessage(recipientId, {
                            text: "Here are some events to help you:"
                        });
                        sendMessage(recipientId, message);
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
                        message = {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": [{
                                        "title": ccEvents[i].name,
                                        "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                        "image_url": ccEvents[i].imgUrl,
                                        "buttons": [{
                                            "type": "web_url",
                                            "url": ccEvents[i].rsvpUrl,
                                            "title": "Learn More"
                                        }]
                                    }]
                                }
                            }
                        };
                        if (++count == 1) sendMessage(recipientId, {
                            text: "Here are some events to help you:"
                        });
                        sendMessage(recipientId, message);
                    }
                }
            }
            // the other signature fairs and workshops
            else {
                for (var i = 0; i < ccEvents.length; i++) {
                    if (ccEvents[i].name == "Spring Internship & Career Expo" ||
                        ccEvents[i].name == "Resume Critique" ||
                        ccEvents[i].name == "60 Seconds to Success" ||
                        ccEvents[i].name == "Recent Graduate & Alumni Fair") {
                        message = {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": [{
                                        "title": ccEvents[i].name,
                                        "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                        "image_url": ccEvents[i].imgUrl,
                                        "buttons": [{
                                            "type": "web_url",
                                            "url": ccEvents[i].rsvpUrl,
                                            "title": "Learn More"
                                        }]
                                    }]
                                }
                            }
                        };
                        if (++count == 1) sendMessage(recipientId, {
                            text: "Here are some events to help you:"
                        });
                        sendMessage(recipientId, message);
                    }
                }
            }
            return true;
        } else if (text.indexOf("month") != -1 || text.indexOf("week") != -1) {
            if (text.indexOf("next month") != -1) {
                for (var i = 0; i < ccEvents.length; i++) {
                    if (ccEvents[i].tid.getUTCMonth() == compare.getUTCMonth() + 1) {
                        found = true;
                        message = {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": [{
                                        "title": ccEvents[i].name,
                                        "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                        "image_url": ccEvents[i].imgUrl,
                                        "buttons": [{
                                            "type": "web_url",
                                            "url": ccEvents[i].rsvpUrl,
                                            "title": "Learn More"
                                        }]
                                    }]
                                }
                            }
                        };
                        if (++count == 1) {
                            sendMessage(recipientId, {
                                text: "Here are next month's events:"
                            });
                        }
                        sendMessage(recipientId, message);
                    }
                }
                if (!found) {
                    sendMessage(recipientId, {
                        text: "No events next month!"
                    });
                }
                return true;
            } else {
                for (var i = 0; i < ccEvents.length; i++) {
                    if (ccEvents[i].tid.getUTCMonth() == compare.getUTCMonth()) {
                        found = true;
                        message = {
                            "attachment": {
                                "type": "template",
                                "payload": {
                                    "template_type": "generic",
                                    "elements": [{
                                        "title": ccEvents[i].name,
                                        "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                        "image_url": ccEvents[i].imgUrl,
                                        "buttons": [{
                                            "type": "web_url",
                                            "url": ccEvents[i].rsvpUrl,
                                            "title": "Learn More"
                                        }]
                                    }]
                                }
                            }
                        };
                        if (++count == 1) {
                            sendMessage(recipientId, {
                                text: "Here are this month's events:"
                            });
                        }
                        sendMessage(recipientId, message);
                    }
                }
                if (!found) {
                    sendMessage(recipientId, {
                        text: "No events this month!"
                    });
                }
                return true;
            }
        } else if (text.indexOf("all") != -1 || text.indexOf("semester") != -1 || text.indexOf("year") != -1) {
            // all events for semester
            //TODO Maybe make all events a link to a calendar? Show catalogue of only key events
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

        } else {
            // show next event by default
            for (var i = 0; i < ccEvents.length; i++) {
                if (ccEvents[i].tid >= compare) {
                    message = {
                        "attachment": {
                            "type": "template",
                            "payload": {
                                "template_type": "generic",
                                "elements": [{
                                    "title": ccEvents[i].name,
                                    "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                                    "image_url": ccEvents[i].imgUrl,
                                    "buttons": [{
                                        "type": "web_url",
                                        "url": ccEvents[i].rsvpUrl,
                                        "title": "Learn More"
                                    }]
                                }]
                            }
                        }
                    };
                    sendMessage(recipientId, {
                        text: "Here is our upcoming event:"
                    });
                    sendMessage(recipientId, message);
                    return true;
                }
            }
        }
    }
    return true;
};
