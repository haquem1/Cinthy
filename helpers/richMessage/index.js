var ccEvents = require('../../models/events');
var keys = require('../../models/keys.json');
var sendMessage = require('../../config/facebook');

// send rich message for hours and events
richMessage = function (recipientId, text) {

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
    if (keys.help.indexOf(values[0]) != -1 && values.length < 6) {
        message = "Hi! This is Cinthy the Career Center Assistant.\n\nYou can ask me about:\n-Our hours\n-Our upcoming events for this month, next month, and the semester\n\nI can also recommend events for you. Or, if you know which event you're looking for, just ask!\n\nType 'message' followed by your message if there's something you would like our staff to answer.\n\nSimply say hello or help to bring this screen up again!\n\n\nVisit us at http://www.csun.edu/career or call us 818-677-2878\nWe are located on the 4th floor of Bayramian Hall";
        sendMessage(recipientId, {
            text: message
        });
        return true;
      }

    // sunlink block
    for (i = 0; i < keys.sunlink.length; i++) {
        if (text.indexOf(keys.sunlink[i]) != -1) {
                message = "If you are a current student, your Sunlink password is #CareerCenter for your first log in.\n\nPlease contact the Career Center if you are not a current student or the password is not working.\n\nVisit us at http://www.csun.edu/career or call us 818-677-2878\nWe are located on the 4th floor of Bayramian Hall";
            sendMessage(recipientId, {
                text: message
            });
            return true;
        }
    }
    // location block
    for (i = 0; i < keys.location.length; i++) {
        if (text.indexOf(keys.location[i]) != -1) {
                message = "The Career Center is located on the 4th floor of Bayramian Hall\n\nIf this did not answer your question, please call us at 818-304-2506\n\nVisit us at http://www.csun.edu/career";
            sendMessage(recipientId, {
                text: message
            });
            return true;
        }
    }
    // hours block
    for (i = 0; i < keys.hours.length; i++) {
        if (text.indexOf(keys.hours[i]) != -1) {
            if (date.getUTCDay() > 0 && date.getUTCDay() < 6 && (date.getUTCHours() > 16 || date.getUTCHours() < 1))
                message = "The Career Center is now open\n";
            else
                message = "The Career Center is now closed\n";

            message = message +
                "\nOur regular hours are:\nMonday - Thursday: 9am-5pm\nFriday: 9am-4pm\n\nIf this did not answer your question, please call us at 818-304-2506\n\nVisit us at http://www.csun.edu/career";

            sendMessage(recipientId, {
                text: message
            });
            return true;
        }
    }

    // events block
    for (i = 0; i < keys.general.length; i++) {
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

            for (i = 0; i < keys.tech_fest.length; i++) {
                if (text.indexOf(keys.tech_fest[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Fall Tech Fest") {
                            // var card = {
                            //     "title": ccEvents[i].name,
                            //     "subtitle": ccEvents[i].date + "\n" + ccEvents[i].time + "\n" + ccEvents[i].location + "\n",
                            //     "image_url": ccEvents[i].imgUrl,
                            //     "buttons": [{
                            //         "type": "web_url",
                            //         "url": ccEvents[i].rsvpUrl,
                            //         "title": "Learn More"
                            //     }]
                            // };
                            message.attachment.payload.elements.push(attachCard(ccEvents[i]));
                        }
                    }
                }
            }

            for (i = 0; i < keys.resu_makeover.length; i++) {
                if (text.indexOf(keys.resu_makeover[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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

            for (i = 0; i < keys.sixty_seconds_to_success.length; i++) {
                if (text.indexOf(keys.sixty_seconds_to_success[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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

            for (i = 0; i < keys.general_career_fair.length; i++) {
                if (text.indexOf(keys.general_career_fair[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Fall Internship & Career Expo") {
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

            for (i = 0; i < keys.non_profit_gov_career_fair.length; i++) {
                if (text.indexOf(keys.non_profit_gov_career_fair[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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

            for (i = 0; i < keys.education_career_fair.length; i++) {
                if (text.indexOf(keys.education_career_fair[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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

            for (i = 0; i < keys.alumni_career_fair.length; i++) {
                if (text.indexOf(keys.alumni_career_fair[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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

            for (i = 0; i < keys.grad_school.length; i++) {
                if (text.indexOf(keys.grad_school[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
                        if (ccEvents[i].name == "Graduate School Info Day") {
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

            for (i = 0; i < keys.on_campus_jobs.length; i++) {
                if (text.indexOf(keys.on_campus_jobs[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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

            for (i = 0; i < keys.international.length; i++) {
                if (text.indexOf(keys.international[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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

            for (i = 0; i < keys.next_month.length; i++) {
                if (text.indexOf(keys.next_month[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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
                        });
                        sendMessage(recipientId, message);
                    }
                    return true;
                }
            }

            for (i = 0; i < keys.this_month.length; i++) {
                if (text.indexOf(keys.this_month[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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
                            };
                            message.attachment.payload.elements.push(card);
                        }
                    }
                    if (!found) sendMessage(recipientId, {
                        text: "No events this month!"
                    });
                    else {
                        sendMessage(recipientId, {
                            text: "Here are this month's events:"
                        });
                        sendMessage(recipientId, message);
                    }
                    return true;
                }
            }

            for (i = 0; i < keys.all_events.length; i++) {
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

            for (i = 0; i < keys.next_event.length; i++) {
                if (text.indexOf(keys.next_event[i]) != -1) {
                    for (i = 0; i < ccEvents.length; i++) {
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
                            };
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
                        });
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
}

attachCard = function (item, stuff) {

  var card = {
      "title": item.name,
      "subtitle": item.date + "\n" + item.time + "\n" + item.location + "\n",
      "image_url": item.imgUrl,
      "buttons": [{
          "type": "web_url",
          "url": item.rsvpUrl,
          "title": "Learn More"
      }]
  };

  return card;

}

module.exports = richMessage;
