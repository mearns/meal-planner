const functions = require("firebase-functions");
const admin = require("firebase-admin");
const Food = require("../../dto/food");

const db = admin.firestore();

exports.add = functions.https.onRequest(async (req, res) => {
    // const food = new Food("McIntosh Apples");
    // food.addIsARelationship("apples");

    const food = new Food("McIntosh II Apple");
    food.addIsARelationship("Y4RlA196DhlIBf6i03fU");

    // food.addIngredient(
    //     // "apple-raisin-breakfast-oatmeal-HMRn8Y9ExPxRCRtSNi9m",
    //     "apples",
    //     "apple-medium",
    //     0.5
    // );
    // food.addIngredient("raisins", "cup", 0.25);
    // food.addIngredient("instant oats", "cup", 0.5);
    // food.addIngredient("water", "cup", 0.75);
    // food.addIngredient("salt", "pinch", 1, true);
    const result = await food.add(db);
    res.json(result);
});
