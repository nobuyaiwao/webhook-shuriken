const express = require('express')
const bodyParser = require('body-parser');
const auth = require('./auth');
const path = require('path')
const PORT = process.env.PORT || 3000

// mTLS
const fs = require('fs');
const https = require('https');

const app = express();

app.use(bodyParser.json());

app.listen(PORT, () => console.log(`Listening over ${ PORT }`))

// basic auth
app
  .use(auth)
  .post('/listener', function(req, res) {
    //
    if (!req.client.authorized) {
      return res.status(401).send('Invalid client certificate authentication.');
    }
    //
    console.log(req.header);
    console.log(JSON.stringify(req.body,null,"   "));
    //console.log(JSON.stringify(req.body,null));
    res.send("[accepted]");
  });

https
  .createServer(
    {
      // ...
      //requestCert: true,
      //rejectUnauthorized: false,
      //ca: fs.readFileSync('ca.crt'),
      // ...
    },
    app
  )
  .listen(443);

//express()
//  .use(express.static(path.join(__dirname, 'public')))
//  .set('views', path.join(__dirname, 'views'))
//  .set('view engine', 'ejs')
//  .get('/', (req, res) => res.render('pages/index'))
//  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
