/* module to process user language and return rich message with event(s) */
// TODO: state to process time based event and name based
var events = require('./models/events.js');
var hours = require('./models/hours.js');
var keys = require('./models/keys.json');

var message = function (){
  var result;
  for (var i = 0; i < keys.hours.length; i++) {
      if (text.indexOf(keys.hours[i]) != -1) {
          if (date.getUTCDay() > 0 && date.getUTCDay() < 6 && (date.getUTCHours() > 16 || date.getUTCHours() < 1))
              result = "The Career Center is now open\n";
          else
              result = "The Career Center is now closed\n";

          this.message = this.message +
              "\nOur regular hours are:\nMonday - Thursday: 9am-5pm\nFriday: 9am-4pm";

          var card = fill();
          return result;
      }
  }
}

function fill() {
    var card = {
        "title": events.name,
        "subtitle": events.date + "\n" + events.time + "\n" + events.location + "\n",
        "image_url": events.imgUrl,
        "buttons": [{
            "type": "web_url",
            "url": events.rsvpUrl,
            "title": "Learn More"
        }]
    }
    return card;
}

module.exports = function{
    message: message;
}
