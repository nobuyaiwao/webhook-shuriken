const express = require('express')
const bodyParser = require('body-parser');
const auth = require('./auth');
const path = require('path')
const PORT = process.env.PORT || 3000

const app = express();

app.use(bodyParser.json());

app.listen(PORT, () => console.log(`Listening over ${ PORT }`))

// basic auth
app
  .use(auth)
  .post('/listener', function(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    console.log(`Request IP: ${ip}`);
    console.log(req.header);
    console.log(JSON.stringify(req.body,null,"   "));
    //console.log(JSON.stringify(req.body,null));
    res.send("[accepted]");
  })

//express()
//  .use(express.static(path.join(__dirname, 'public')))
//  .set('views', path.join(__dirname, 'views'))
//  .set('view engine', 'ejs')
//  .get('/', (req, res) => res.render('pages/index'))
//  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
