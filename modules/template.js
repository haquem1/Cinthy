function template(text) {
    var found = false;
    // TODO create dictionary with [keywords, index of events array]
    var dict = {};
    // TODO create element array template for catalogue look in message template
    var events = [];
    // TODO create items array for catalogue look
    var items = [];
    // iterate through dictionary
    for (var key in dict) {
        // if a key is found in text string
        if (text.indexOf("key") != -1) {
            found = true;
            var index = dict[key];
            var item = {
              "title": events[index].name,
              "subtitle": events[index].date + "\n" + events[index].time + "\n" + events[index].location + "\n",
              "image_url": events[index].imgUrl,
              "buttons": [{
                  "type": "web_url",
                  "url": events[index].rsvpUrl,
                  "title": "Learn More"
              }]
            }
            items.push(item);
        }
    }
    if (found) {
        message = {
            "attachment": {
                "type": "template",
                "payload": {
                    "template_type": "generic",
                    "elements": items
                }
            }
        };
    }
    message = {
        "found": "none"
    });
return message;
};
