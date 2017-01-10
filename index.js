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
                sendMessage(event.sender.id, {text: "Thank you for your message! A staff member from the Career Center will get back to you shortly"});
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
      date.setHours(0,0,0,0,0);

      text = text || "";
      var values = text.split(' ');
      if (values.indexOf("open") > -1 ||
          values.indexOf("close") > -1 ||
          values.indexOf("closed") > -1 ||
          values.indexOf("hours") > -1 ) > {
            // hours
            if (date.getDay > 0 && date.getDay < 5){
                message = "The Career Center is open from 9am-5pm today\n";
            }
            else if (date.getDay == 5) {
                message = "The Career Center is open from 9am-4pm today\n";
            }
            else{
                message = "The Career Center is closed today\n";
            }
            message = message +
                      "Our regular hours are:\n \tMonday - Thursday: 9am-5pm\n \tFriday: 9am-4pm";

           sendMessage(recipientId, {text: message});
           return true;
      }

      return false;
    // text = text || "";
    // var values = text.split(' ');
    //
    // if (values.length === 3 && values[0] === 'kitten') {
    //     if (Number(values[1]) > 0 && Number(values[2]) > 0) {
    //
    //         var imageUrl = "https://placekitten.com/" + Number(values[1]) + "/" + Number(values[2]);
    //
    //         message = {
    //             "attachment": {
    //                 "type": "template",
    //                 "payload": {
    //                     "template_type": "generic",
    //                     "elements": [{
    //                         "title": "Kitten",
    //                         "subtitle": "Cute kitten picture",
    //                         "image_url": imageUrl ,
    //                         "buttons": [{
    //                             "type": "web_url",
    //                             "url": imageUrl,
    //                             "title": "Show kitten"
    //                             }, {
    //                             "type": "postback",
    //                             "title": "I like this",
    //                             "payload": "User " + recipientId + " likes kitten " + imageUrl,
    //                         }]
    //                     }]
    //                 }
    //             }
    //         };
    //
    //         sendMessage(recipientId, message);
    //
    //         return true;
    //     }
    // }
    //
    // return false;

};

// // checks if date falls on holiday or special hours
// function getSpecialHours(recipientId, date) {
//     // holiday closure, JSON array
//     var closed = [{"date": new Date(2017,0,16), "holiday: Martin Luther King Jr Day"},
//                   {"date": new Date(2017,2,31), "holiday: Cesar Chavez Day"},
//                   {"date": new Date(2017,4,29), "holiday: Memorial Day"}];
//     // holds special hours, JSON array
//     var special = [{"date": new Date(2017,0,16), "holiday: Martin Luther King Jr Day", "hours": "9am-2pm"}];
//     for (var i = 0; i < closed.length; i++) {
//         if (closed[i].date == date){
//             return true;
//         }
//     }
//     for (var i = 0; i < special.length; i++) {
//         if (special[i].date == date){
//             sendMessage(recipientId, {text: "The Career Center is open from"
//                                           + special[i].hours
//                                           + "9am-4pm today"})
//             return true;
//         }
//     }
//     return false;
// }
// var express = require('express');
// var bodyParser = require('body-parser');
// var request = require('request');
// var app = express();
//
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());
// app.listen((process.env.PORT || 3000));
//
// // Server frontpage
// app.get('/', function (req, res) {
//     res.send('This is TestBot Server');
// });
//
// // Facebook Webhook
// app.get('/webhook', function (req, res) {
//     if (req.query['hub.verify_token'] === 'testbot_verify_token') {
//         res.send(req.query['hub.challenge']);
//     } else {
//         res.send('Invalid verify token');
//     }
// });
//
// // handler receiving messages
// app.post('/webhook', function (req, res) {
//     var events = req.body.entry[0].messaging;
//     for (i = 0; i < events.length; i++) {
//         var event = events[i];
//         if (event.message && event.message.text) {
//             // if (!richMessage(event.sender.id, event.message.text)) {
//                 // auto reply to sender
//                 sendMessage(event.sender.id, {text: "Thank you for your message! A staff member from the Career Center will get back to you shortly"});
//             // }
//         } else if (event.postback) {
//             console.log("Postback received: " + JSON.stringify(event.postback));
//         }
//     }
//     res.sendStatus(200);
// });
//
// // generic function sending messages
// function sendMessage(recipientId, message) {
//     request({
//         url: 'https://graph.facebook.com/v2.6/me/messages',
//         qs: {access_token: process.env.PAGE_ACCESS_TOKEN},
//         method: 'POST',
//         json: {
//             recipient: {id: recipientId},
//             message: message,
//         }
//     }, function(error, response, body) {
//         if (error) {
//             console.log('Error sending message: ', error);
//         } else if (response.body.error) {
//             console.log('Error: ', response.body.error);
//         }
//     });
// };
//
// // checks if date falls on holiday or special hours
// function getSpecialHours(recipientId, date) {
//     // holiday closure, JSON array
//     var closed = [{"date": new Date(2017,0,16), "holiday: Martin Luther King Jr Day"},
//                   {"date": new Date(2017,2,31), "holiday: Cesar Chavez Day"},
//                   {"date": new Date(2017,4,29), "holiday: Memorial Day"}];
//     // holds special hours, JSON array
//     var special = [{"date": new Date(2017,0,16), "holiday: Martin Luther King Jr Day", "hours": "9am-2pm"}];
//     for (var i = 0; i < closed.length; i++) {
//         if (closed[i].date == date){
//             return true;
//         }
//     }
//     for (var i = 0; i < special.length; i++) {
//         if (special[i].date == date){
//             sendMessage(recipientId, {text: "The Career Center is open from"
//                                           + special[i].hours
//                                           + "9am-4pm today"})
//             return true;
//         }
//     }
//     return false;
// }
//
// // checks when the upcoming events are
// function getEvents(recipientId, start, end){
//     // holds events, their dates and links, JSON array
//     var events;
//
//     if(events[start]==events[end]){
//       return true;
//     }
// }
//
// // send rich message
// function richMessage(recipientId, text) {
//
//     var date = new Date();
//     date.setHours(0,0,0,0,0);
//
//     text = text || "";
//     var values = text.split(' ');
//     if (values.indexOf("open") > -1 ||
//         values.indexOf("close") ||
//         values.indexOf("hours")) {
//           // hours
//           if (date.getDay > 0 && date.getDay < 5 && !getSpecialHours(date)){
//               message = "The Career Center is open from 9am-5pm today\n";
//           }
//           else if (date.getDay == 5 && !getSpecialHours(date)) {
//               message = "The Career Center is open from 9am-4pm today\n";
//           }
//           else{
//               message = "The Career Center is closed today\n";
//           }
//           message = message +
//                     "Our regular hours are:\n \tMonday - Thursday: 9am-5pm\n  \tFriday: 9am-4pm";
//
//          sendMessage(recipientId, {text: message});
//          return true;
//     }
//
//     return false;
//
// };
