// Package Prerequisites
var express = require('express'),
    fs = require('fs'),
    bodyParser = require('body-parser'),
    https = require('https'),
    xml = require('xml');

// Package Prerequisites
var port = process.env.PORT || 8080,
    manifestTemplate = fs.readFileSync('./update-manifest.xml', 'utf8');

console.log("Manifest template:\n" + manifestTemplate);

var app = express();

function writeResponse(res, data) {

    try {
        var gitHubMetaData = JSON.parse(data);
        var version = gitHubMetaData['tag_name'];
        console.log("Latest tag name:" + version);
        var url = gitHubMetaData['assets'][0]['browser_download_url'];
        console.log("Asset download url:" + url);
        var updateManifest = manifestTemplate.replace('APP_VERSION', version);
        var updateManifest = updateManifest.replace('APP_URL', url);
        console.log("Generated update manifest:\n" + updateManifest);
        res.set('Content-Type', 'text/xml');
        res.send(updateManifest);
        res.end();
    } catch(e) {

    }

}

app.get("/", function(req, res) {

    var options = {
      host: 'api.github.com',
      path: '/repos/jguillon/pow/releases/latest',
      headers: {'user-agent': 'Mozilla/5.0'}
    };


    https.get(options, function(gitHubRes) {

        // initialize the container for our data
        var data = "";

        // this event fires many times, each time collecting another piece of the response
        gitHubRes.on("data", function (chunk) {
            // append this chunk to our growing `data` var
            data += chunk;
        });

        // this event fires *one* time, after all the `data` events/chunks have been gathered
        gitHubRes.on("end", function () {
            // you can use res.send instead of console.log to output via express
            console.log("Got data: " + data);
            writeResponse(res, data);
        });

        gitHubRes.on('error', function(e) {
            console.log("Got error: " + e.message);
        });

    })

});

app.listen(port, function() {
    console.log(new Date().toISOString() + ' - ' + 'Server running on port ' + port);
});
