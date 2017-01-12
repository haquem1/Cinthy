var express = require('express');
var bodyParser = require('body-parser');
var request = require('request');
var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.listen((process.env.PORT || 3000));

// Server frontpage
app.get('/', function (req, res) {
    res.send('This is TestBot Server');
});

// Facebook Webhook
app.get('/webhook', function (req, res) {
    if (req.query['hub.verify_token'] === 'testbot_verify_token') {
        res.send(req.query['hub.challenge']);
    } else {
        res.send('Invalid verify token');
    }
});

// handler receiving messages
app.post('/webhook', function (req, res) {
    var events = req.body.entry[0].messaging;
    for (i = 0; i < events.length; i++) {
        var event = events[i];
        if (event.message && event.message.text) {
            if (!richMessage(event.sender.id, event.message.text)) {
                sendMessage(event.sender.id, {text: "Thank you for your message! A staff member from the Career Center will get back to you shortly\n\nVisit us at Bayramian Hall, 413 and at www.csun.edu/career"});
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
        qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
        method: 'POST',
        json: {
            recipient: {id: recipientId},
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

// send rich message with kitten
function richMessage(recipientId, text) {

      var date = new Date();
      var compare = date;
      var found = false;
      compare.setHours(0,0,0,0);
      text = text || "";
      //sanitize
      text = text.toLowerCase();

      // hours block
      if (text.indexOf("open") != -1 ||
          text.indexOf("close") != -1 ||
          text.indexOf("closed") != -1 ||
          text.indexOf("hours") != -1 ) {
            if (date.getUTCDay() > 0 && date.getUTCDay() < 6 && (date.getUTCHours() > 16 || date.getUTCHours() < 1)){
                message = "The Career Center is now open\n";
            }
            else{
                message = "The Career Center is now closed\n";
            }
            message = message +
                      "\nOur regular hours are:\nMonday - Thursday: 9am-5pm\nFriday: 9am-4pm";

           sendMessage(recipientId, {text: message});
           return true;
      }

      // events block
      else if (text.indexOf("when") != -1 ||
          text.indexOf("event") != -1 ||
          text.indexOf("events") != -1 ||
          text.indexOf("happen") != -1 ||
          text.indexOf("happening") != -1) {

            // TODO: will migrate to json file
            var ccEvents = [
                          {
                            "name": "How To Find a Job on Campus Workshop",
                            "date": "Tuesday, February 14",
                            "time": "11:00am - 3:00pm",
                            "location": "USU, Grand Salon",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("February 14, 2017")
                          },
                          {
                            "name": "How To Find a Job on Campus Job Fair",
                            "date": "Tuesday, February 16",
                            "time": "11:00am - 3:00pm",
                            "location": "USU, Grand Salon",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("February 16, 2017")
                          },
                          {
                            "name": "Job Search Tips for International Students Workshop",
                            "date": "Wednesday, February 15",
                            "time": "10:00am - 11:15am",
                            "location": "Career Center, BH 410",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("February 15, 2017")
                          },
                          {
                            "name": "Job Search Tips for International Students Panel",
                            "date": "Wednesday, February 15",
                            "time": "11:30am - 12:30pm",
                            "location": "Career Center, BH 410",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("February 15, 2017")
                          },
                          {
                            "name": "Spring Tech Fest",
                            "date": "Wednesday, February 21",
                            "time": "10:00am - 3:00pm",
                            "location": "USU, Northridge Center",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("February 21, 2017")
                          },
                          {
                            "name": "Resume Critique",
                            "date": "Wednesday, February 28",
                            "time": "10:30am - 2:30pm",
                            "location": "USU, Northridge Center",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("February 28, 2017")
                          },
                          {
                            "name": "Internship Experience Panel",
                            "date": "Tuesday, March 1",
                            "time": "4:00pm - 5:30pm",
                            "location": "USU, Flintride Room",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("March 1, 2017")
                          },
                          {
                            "name": "60 Seconds to Success",
                            "date": "Tuesday, March 7",
                            "time": "10:30am - 1:30pm",
                            "location": "USU, Thousand Oaks Room",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("March 7, 2017")
                          },
                          {
                            "name": "Spring Internship & Career Expo",
                            "date": "Wednesday, March 15",
                            "time": "10:00am - 1:00pm",
                            "location": "USU, Northridge Center & Grand Salon",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("March 15, 2017")
                          },
                          {
                            "name": "Non-Profit & Government Career Fair",
                            "date": "Wednesday, March 29",
                            "time": "10:00am - 1:00pm",
                            "location": "USU, Northridge Center & Grand Salon",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("March 29, 2017")
                          },
                          {
                            "name": "Education Expo",
                            "date": "Wednesday, April 12",
                            "time": "12:00pm - 5:00pm",
                            "location": "USU, Northridge Center",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("April 12, 2017")
                          },
                          {
                            "name": "Mocktail Party",
                            "date": "Tuesday, April 25",
                            "time": "6:30pm - 8:30pm",
                            "location": "Orange Grove Bistro",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("April 25, 2017")
                          },
                          {
                            "name": "Recent Graduate & Alumni Fair",
                            "date": "Wednesday, May 23",
                            "time": "10:00am - 1:00pm",
                            "location": "USU, Northridge Center & Grand Salon",
                            "imgUrl": "http://www.csun.edu/career/plan_your_future/images/LAUSD.png",
                            "tid": new Date("May 23, 2017")
                          },
                        ];
            //TODO Add block for key career center events -- expand later to be all events
            if (text.indexOf("month") != -1 || text.indexOf("week") != -1){
                var count = 0; //for initial greeting
                if (text.indexOf("next month") != -1){
                  for (var i = 0; i < ccEvents.length; i++){
                    if (ccEvents[i].tid.getUTCMonth() == compare.getUTCMonth() + 1){
                     found = true;
                     message = {
                                 "attachment": {
                                     "type": "template",
                                     "payload": {
                                         "template_type": "generic",
                                         "elements": [{
                                             "title": ccEvents[i].name,
                                             "subtitle": ccEvents[i].date+"\n"+ccEvents[i].time+"\n"+ccEvents[i].location+"\n",
                                             "image_url": ccEvents[i].imgUrl ,
                                             "buttons": [{
                                                 "type": "web_url",
                                                 "url": "https://csun-csm.symplicity.com/events",
                                                 "title": "Learn More"
                                             }]
                                         }]
                                     }
                                 }
                             };
                             if(++count == 1){
                                sendMessage(recipientId, {text: "Here are next month's events:"});
                             }
                             sendMessage(recipientId, message);
                    }
                }
                if (!found) {
                  sendMessage(recipientId, {text: "No events next month!"});
                }
                return true;
              }
                else {
                  for (var i = 0; i < ccEvents.length; i++){
                    if (ccEvents[i].tid.getUTCMonth() == compare.getUTCMonth()){
                     found = true;
                     message = {
                                 "attachment": {
                                     "type": "template",
                                     "payload": {
                                         "template_type": "generic",
                                         "elements": [{
                                             "title": ccEvents[i].name,
                                             "subtitle": ccEvents[i].date+"\n"+ccEvents[i].time+"\n"+ccEvents[i].location+"\n",
                                             "image_url": ccEvents[i].imgUrl ,
                                             "buttons": [{
                                                 "type": "web_url",
                                                 "url": "https://csun-csm.symplicity.com/events",
                                                 "title": "Learn More"
                                             }]
                                         }]
                                     }
                                 }
                             };
                             if(++count == 1){
                               sendMessage(recipientId, {text: "Here are this month's events:"});
                             }
                             sendMessage(recipientId, message);
                    }
                }
                if (!found){
                  sendMessage(recipientId, {text: "No events this month!"});
                }
                return true;
            }
          }
             else if (text.indexOf("all") != -1 || text.indexOf("semester") != -1 || text.indexOf("year") != -1){
                 // all events for semester
                 sendMessage(recipientId, {text: "Here are the events for the semester"});
                 for (var i = 0; i < ccEvents.length; i++){
                    message = {
                                "attachment": {
                                    "type": "template",
                                    "payload": {
                                        "template_type": "generic",
                                        "elements": [{
                                            "title": ccEvents[i].name,
                                            "subtitle": ccEvents[i].date+"\n"+ccEvents[i].time+"\n"+ccEvents[i].location+"\n",
                                            "image_url": ccEvents[i].imgUrl ,
                                            "buttons": [{
                                                "type": "web_url",
                                                "url": "https://csun-csm.symplicity.com/events",
                                                "title": "Learn More"
                                            }]
                                        }]
                                    }
                                }
                            };
                   sendMessage(recipientId, message);

                 }
                 return true;
            }
            else{
                // show next event by default
                for (var i = 0; i < ccEvents.length; i++){
                  if (ccEvents[i].tid >= compare){
                   message = {
                               "attachment": {
                                   "type": "template",
                                   "payload": {
                                       "template_type": "generic",
                                       "elements": [{
                                           "title": ccEvents[i].name,
                                           "subtitle": ccEvents[i].date+"\n"+ccEvents[i].time+"\n"+ccEvents[i].location+"\n",
                                           "image_url": ccEvents[i].imgUrl ,
                                           "buttons": [{
                                               "type": "web_url",
                                               "url": "https://csun-csm.symplicity.com/events",
                                               "title": "Learn More"
                                           }]
                                       }]
                                   }
                               }
                           };
                  sendMessage(recipientId, {text: "Here is our upcoming event.\n\nAsk the assistant to see the events of this month, next month, and the semester!"});
                  sendMessage(recipientId, message);
                  return true;
                  }
                }
          }
      }
      return false;
  };
