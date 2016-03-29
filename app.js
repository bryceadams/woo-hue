var express = require('express');
var app = express();

/**
 * Various vars
 */
var crypto       = require('crypto');
var async        = require('async');
var _json        = require(__dirname + '/lib/escaped-json');
var bodyParser = require('body-parser');

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

var hue = require("node-hue-api");

/**
 * This is the endpoint WC needs to post through a webhook to,
 * when a new sale has been made.
 */
app.post('/light', function (req, res) {
    var webhookBody      = req.body || {};
    var webhookSignature = req.headers['x-wc-webhook-signature'];

    console.log('Receiving webhook...');

    if (!webhookBody || !webhookSignature) {
        console.log('Access denied - invalid request');

        return res.send('access denied', 'invalid request', null, 403);
    }

    async.parallel([

        function (next ) {
            console.log('thread 1... could do stuff like turn on music');
            return next();
        }

    ], function (err) {

        console.log('thread 2... doing the light stuff');

        var secret    = 'hue'
        var data      = _json.stringify(webhookBody);
        var signature = crypto.createHmac('sha256', secret).update(data).digest('base64');

        // Check the webhook signature
        if (webhookSignature !== signature) {
            console.log('Access denied - invalid signature');

            return res.send('access denied', 'invalid signature', null, 403);
        }

        console.log(webhookBody);
        console.log('Webhook received successfully!');

        var hue = require("node-hue-api"),
          HueApi = hue.HueApi,
          lightState = hue.lightState;

        hue.nupnpSearch(function(err, result) {
            if (err) throw err;

            var host = result[0].ipaddress,
              username = "brycef17c0bbc89",
              api = new HueApi(host, username),
              state = lightState.create().on().rgb(47, 203, 58).longAlert();

            api.setLightState(3, state)
              .then()
              .fail()
              .done();

            return res.json({
                success: true
            });
        });
    });
});

/**
 * Home page.
 */
app.get('/', function (req, res) {
    res.send("Bryce is lighting up the lights!");
});

/**
 * Start the server.
 */
var server = app.listen(80, function () {
  var host = '127.0.0.1';
  var port = '80';

  console.log('WooHue listening at http://%s:%s', host, port);
});