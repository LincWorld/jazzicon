var jazzicon = require('./');
var fs = require('fs');
jazzicon(512, Math.random() * 10).then(function(e) {
	fs.writeFile("test" + (new Date()).getTime() + ".jpg", e, "binary", function(err) {
		if (err) {
			console.log(err);
		} else {
			console.log("The file was saved!");
		}
	});
});
