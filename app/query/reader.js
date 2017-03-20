/* Fill in card programmatically */
module.exports = function(ccEvents) {
    this.card = {
        "title": ccEvents.name,
        "subtitle": ccEvents.date + "\n" + ccEvents.time + "\n" + ccEvents.location + "\n",
        "image_url": ccEvents.imgUrl,
        "buttons": [{
            "type": "web_url",
            "url": ccEvents.rsvpUrl,
            "title": "Learn More"
        }]
    }
    return this.card;
}
