const { RTMClient } = require('@slack/client'),
  app = require('express')(),
  bodyParser = require('body-parser'),
  PORT = process.env.PORT || 8080,
  request = require('request'),
  keys = require('./keys.json');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const rtm = new RTMClient(keys.token);
rtm.start();

const memes = ['https://www.askideas.com/media/48/Dude-You-Gotta-Try-The-Sea-Weed-Brownies-Funny-Dolphin-Meme-Image.jpg', "http://i0.kym-cdn.com/photos/images/original/000/324/390/db4.jpg", "http://i0.kym-cdn.com/photos/images/original/000/325/168/1d4.jpg", "http://i0.kym-cdn.com/photos/images/original/000/324/411/276.jpg", "http://i0.kym-cdn.com/photos/images/original/000/324/385/5cf.jpg", "https://media1.popsugar-assets.com/files/thumbor/gpjj6n6c-7udcKM_idQ6LztObxI/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2015/08/11/224/n/1922283/88a0d7cc56665245_xmanatee15.jpg.pagespeed.ic.jW7T0G-AiL/i/When-Your-Friend-Going-Through-Harsh-Breakup.jpg", "https://i.redd.it/iu8f1iybajdy.jpg", "https://www.pleated-jeans.com/wp-content/uploads/2011/05/Anatomy-of-a-Manatee.jpg", "http://www.mypokecard.com/en/Gallery/my/galery/3oJvOnKsWutm.jpg", "http://i.imgur.com/WyusJ.jpg", "https://media1.tenor.com/images/ea7339e8fa89c10cb614d830cb153f71/tenor.gif?itemid=5890398", "https://media1.tenor.com/images/a5490df7690af1c6b9acde5ce69768c4/tenor.gif?itemid=8068954"];
const greets = ["Hi there!", "Hello hello", "Hiiiiiii", "Hey!", "Hey there, Nice to meet ya", "What's up good lookin?"];

rtm.on('message', (message) => { //for DMing bot
  if ((message.subtype && message.subtype === 'bot_message') || (!message.subtype && message.user === rtm.activeUserId)) {
    return;
  }
  console.log(`(channel:${message.channel}) ${message.user} says: ${message.text}`);
  rtm.sendMessage(`Hey so I see you're trying to talk to me however, I haven't been programed to hold full conversations yet :/ sorry. Maybe go bug Jonathan if you would like to see this happen!`, message.channel)
    .then(res => {
      console.log('Message sent: ', res.ts);
    })
    .catch(console.error);
});

app.post('/', (req, res) => { //listens to all messages sent
  console.log(req.body)
  if (req.body.event.type == 'message' && req.body.event.subtype != 'message_deleted' && req.body.event.subtype != 'bot_message') {
    let channel = req.body.event.channel;
    let messageText = req.body.event.text;
    switch (true) {
      case /hi manatee|hey manatee|hello manatee/i.test(messageText):
        res.send(200);
        sendmessage(greets[generateNumber(6)], channel);
        break;
      case /manatee/i.test(messageText):
        res.send(200);
        request.post(`https://slack.com/api/reactions.add?token=${keys.token}&name=manatee&channel=${channel}&timestamp=${req.body.event.ts}`, (error, response, body) => {
          error ? console.log(error) : console.log(JSON.parse(body));
        });
        break;
      case /humanity/i.test(messageText):
        res.send(200);
        sendmessage(`HU-MANATEE`, channel);
        break;
      case /lit+$|lit\s/i.test(messageText):
        res.send(200)
        request.post(`https://slack.com/api/chat.postMessage?token=${keys.webToken}&text=ITS LIT FAM. :fireball:&channel=${channel}&attachments=[{'text':'LIT.gif','image_url':'https://media1.tenor.com/images/0496babb8151d878f2a13a25ba836e7e/tenor.gif?itemid=7301792','thumb_url':'https://media1.tenor.com/images/0496babb8151d878f2a13a25ba836e7e/tenor.gif?itemid=7301792'}]`, (error, response, body) => {
          error ? console.log(error) : console.log(JSON.parse(body));
        });
        break;
      default:
        res.send(200);
        break;
    }
  }
  else res.send(200);
})

app.post('/commands', (req, res) => { // for slash commands
  console.log(req.body);
  if (req.body.command = '/manateememes') {
    let randomNumber = generateNumber(12);
    console.log(`generated number ${randomNumber}`);
    res.status(200).send({ 'text': 'MEMES GALLOR', 'response_type': 'in_channel', 'attachments': [{ 'text': 'MEME.JPG', 'image_url': memes[randomNumber], 'thumb_url': memes[randomNumber] }] });
  }
})

function sendmessage(message, to, attachments) {
  console.log('Sending message...');
  request.post(`https://slack.com/api/chat.postMessage?token=${keys.webToken}&channel=${to}&text=${message}&attachments=${attachments}`, (error, response, body) => {
    error ? console.log(error) : console.log(JSON.parse(body));
  });
}

function generateNumber(limit) {
  return Math.floor(Math.random() * limit);
}

app.listen(PORT, () => {
  console.log(`Listening on port: ${PORT}`);
});
