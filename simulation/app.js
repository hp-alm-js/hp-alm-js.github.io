var connect = require('connect'),
    https = require('https'),
    fs = require('fs'),
    app = connect().use(connect.static(__dirname))
                 .use(function(req, res, next){
        var body = 'my page';
        res.setHeader('Content-Length', body.length);
        res.end(body);
    });
var options = {
    key:    fs.readFileSync('ssl/server.key'),
    cert:   fs.readFileSync('ssl/server.crt')
};
https.createServer(
 options, app
).listen(443);

