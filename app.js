// Package Prerequisites
var express = require('express'),
    fs = require('fs'),
    bodyParser = require('body-parser');

// Package Prerequisites
var port = process.env.PORT || 8080,
    manifest = fs.readFileSync('update-manifest.xml');

var app = express();

function writeResponse(res, data) {

    try {
        var gitHubMetaData = JSON.parse(data);
        var url = gitHubMetaData['assets'][0]['browser_download_url'];
        var version = gitHubMetaData['tag_name'];
        var updateManifest = manifest.replace('APP_VERSION', version);
        var updateManifest = updateManifest.replace('APP_URL', url);
        res.write(updateManifest);
        res.end();
    } catch(e) {

    }

}

app.get("/", function(req, res) {

    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            writeResponse(res, xmlHttp.responseText);
    }
    xmlHttp.open("GET", "https://api.github.com/repos/jguillon/pow/releases/latest", true); // true for asynchronous
    xmlHttp.send(null);

});

app.listen(port, function() {
    console.log(new Date().toISOString() + ' - ' + 'Server running on port ' + port);
});
