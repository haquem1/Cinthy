/* module to process user language and return rich message with event(s) */
// TODO: state to process time based event and name based
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
        // if key is substring of text
        if (text.indexOf(key) != -1) {
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
            found = true;
            items.push(item);
        }
    }
    if (!found) items.push({"title" : "not found"});

    message = {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": items
            }
          }
    };

    return message;
};
