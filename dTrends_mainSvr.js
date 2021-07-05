// set up ======================================================================
// get all the tools we need
const express  = require('express');
const app      = express();
const config = require('./config/serverConfig');

// const session  = require('express-session');
// const MySQLStore = require('express-mysql-session')(session);
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

// const CORS_host = process.env.HOST || config.CORS_host;
// const CORS_port = process.env.PORT || config.CORS_port;
// const local_URL = config.local_URL;
// const mv = require('mv');
const path    = require('path');
const port = process.env.PORT || config.Server_Port;

const morgan = require('morgan');

// set up our express application
app.use(express.static(__dirname));
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use("/css", express.static(__dirname + "/css"));
app.use("/scripts", express.static(__dirname + "/scripts"));
app.use("/config", express.static(__dirname + "/config"));
// app.use("/uploadfolder", express.static(__dirname + "/a"));
app.use("/pic", express.static(__dirname + "/pic"));

app.set('views', path.join(__dirname, './', 'views'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');


// routes ======================================================================
require('./routes/routes.js')(app); // load our routes and pass in our routes and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);

