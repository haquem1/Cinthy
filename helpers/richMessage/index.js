var events = require('../../models/events');
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

    // // get started
    // if (keys.help.indexOf(values[0]) != -1 && values.length < 6) {
    //     message = "Hi! This is Cinthy the Career Center Assistant.\n\nYou can ask me about:\n-Our hours\n-Our upcoming events for this month, next month, and the semester\n\nI can also recommend events for you. Or, if you know which event you're looking for, just ask!\n\nType 'message' followed by your message if there's something you would like our staff to answer.\n\nSimply say hello or help to bring this screen up again!\n\n\nVisit us at http://www.csun.edu/career or call us 818-677-2878\nWe are located on the 4th floor of Bayramian Hall";
    //     sendMessage(recipientId, {
    //         text: message
    //     });
    //     return true;
    //   }

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
                message = "The Career Center is located on the 4th floor of Bayramian Hall\n\nIf this did not answer your question, please call us at 818-677-2878\n\nVisit us at http://www.csun.edu/career";
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
                "\nOur regular hours are:\nMonday - Thursday: 9am-5pm\nFriday: 9am-4pm\n\nIf this did not answer your question, please call us at 818-677-2878\n\nVisit us at http://www.csun.edu/career";

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

            // generic event finder
            findEvent = function (key, name) {
                for (i = 0; i < keys[key].length; i++) {
                    if (text.indexOf(keys[key][i]) != -1) {
                        for (i = 0; i < events.length; i++) {
                            if (events[i].name == name) {
                                message.attachment.payload.elements.push(attachCard(events[i]));
                            }
                        }
                    }
                }
            }

            findEvent("tech_fest", "Fall Tech Fest");
            findEvent("resu_makeover", "Resu-Makeover");
            findEvent("sixty_seconds_to_success", "60 Seconds to Success");
            findEvent("general_career_fair", "Fall Internship & Career Expo");
            findEvent("grad_school", "Graduate School Info Day");
            findEvent("on_campus_jobs", "How To Find a Job on Campus Workshop");
            findEvent("on_campus_jobs", "Open House & On-Campus Job Fair");
            findEvent("peace_corps", "Peace Corps Information Session: Application Workshop");
            findEvent("peace_corps", "Peace Corps Information Session: Central & South American Spotlight");
            findEvent("peace_corps", "Peace Corps Screening: Girl Rising");
            findEvent("peace_corps", "Peace Corps Information Session: Application Workshop 2");
            findEvent("hr_panel", "Careers in HR Panel");

            // Date based queries
            for (i = 0; i < keys.next_month.length; i++) {
                if (text.indexOf(keys.next_month[i]) != -1) {
                    for (i = 0; i < events.length; i++) {
                        if (events[i].tid.getUTCMonth() == compare.getUTCMonth() + 1) {
                            found = true;
                            message.attachment.payload.elements.push(attachCard(events[i]));
                        }
                    }
                    if (!found) { sendMessage(recipientId, {
                        text: "No events next month!"
                    });
                    } else {
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
                    for (i = 0; i < events.length; i++) {
                        if (events[i].tid.getUTCMonth() == compare.getUTCMonth()) {
                            found = true;
                            message.attachment.payload.elements.push(attachCard(events[i]));
                        }
                    }
                    if (!found) { sendMessage(recipientId, {
                        text: "No events this month!"
                    });
                    } else {
                        sendMessage(recipientId, {
                            text: "Here are this month's events:"
                        });
                        sendMessage(recipientId, message);
                      }
                    return true;
                }
            }

            for (i = 0; i < keys.next_event.length; i++) {
                if (text.indexOf(keys.next_event[i]) != -1) {
                    for (i = 0; i < events.length; i++) {
                        if (events[i].tid >= compare) {
                            found = true;
                            message.attachment.payload.elements.push(attachCard(events[i]));
                        }
                    }
                    if (!found) { sendMessage(recipientId, {
                        text: "No events!"
                    });
                    } else {
                        sendMessage(recipientId, {
                            text: "Here is the next events:"
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

            if (message.attachment.payload.elements.length > 0) {
                sendMessage(recipientId, {
                    text: "This could be helpful"
                });
                sendMessage(recipientId, message);
            }
        }
    }
    return true;
}

// attaches card
attachCard = function (item) {
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
