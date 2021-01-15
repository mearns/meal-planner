const functions = require("firebase-functions");
const admin = require("firebase-admin");
const packageData = require("../package.json");

admin.initializeApp();

const db = admin.firestore();

exports.Test = functions.https.onRequest(async (req, res) => {
    const foodsCollection = db.collection("dishes");
    const snapshot = await foodsCollection.get();
    const promises = [];
    snapshot.forEach(doc => {
        promises.push(
            (async () => {
                const docData = doc.data();
                console.log(doc.id, await docData.food.get());
            })()
        );
    });
    await Promise.all(promises);
    res.json({});
});

exports.AppInfo = functions.https.onRequest((req, res) => {
    res.json({
        name: packageData.name,
        version: packageData.version
    });
});
