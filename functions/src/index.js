const functions = require("firebase-functions");
const packageData = require("../package.json");

exports.AppInfo = functions.https.onRequest((req, res) => {
    res.json({
        name: packageData.name,
        version: packageData.version
    });
});
