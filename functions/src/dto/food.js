const TT_INGREDIENT = "ingredient";
const TT_CONTAINS = "contains";
const TT_IS_A = "isA";

const VERSION = [1, 0];

class Food {
    constructor(name) {
        this.name = name;
        this.ingredients = [];
        this.isA = [];
        this.otherTags = [];
    }

    addIsARelationship(isAId) {
        this.isA.push(isAId);
    }

    addTag(tag, tagType, details) {
        this.otherTags.push({ tag, tagType, details });
    }

    addIngredient(ingredientId, amountUnit, amountValue, optional = false) {
        this.ingredients.push({
            id: ingredientId,
            amount: {
                value: amountValue,
                unit: amountUnit
            },
            optional
        });
    }

    async add(db) {
        const tags = [];
        const foodDocPromisesMap = new Map();
        await Promise.all([
            addIngredientsToDocMap(
                db,
                foodDocPromisesMap,
                this.ingredients,
                `<new food: ${this.name}>`
            ),
            addIsAToDocMap(
                db,
                foodDocPromisesMap,
                this.isA,
                `<new food: ${this.name}>`
            )
        ]);

        const foodDocMap = new Map();
        (
            await Promise.all(
                [
                    ...foodDocPromisesMap.entries()
                ].map(async ([id, promiseForDoc]) => [
                    id,
                    (await promiseForDoc).data()
                ])
            )
        ).forEach(([id, doc]) => {
            foodDocMap.set(id, doc);
        });

        const isATags = generateIsATags(foodDocMap, this.isA);
        tags.push(...isATags);

        // FIXME: Test this, it may need to be more recursive.
        // Note; it does NOT inherit contains from isA. E.g., apples might typically contain some compound,
        // but a particular variety of apply might have had it bred out.
        this.ingredients.forEach(({ id, amount, optional }) => {
            const ingredientDoc = foodDocMap.get(id);
            tags.push(
                {
                    name: ingredientDoc.name,
                    id,
                    tagType: TT_INGREDIENT,
                    details: {
                        amount,
                        optional
                    }
                },
                {
                    name: ingredientDoc.name,
                    id: id,
                    tagType: TT_CONTAINS
                }
            );
        });

        tags.push(...this.otherTags);

        const newDoc = {
            name: this.name,
            tags,
            _version: VERSION
        };
        const res = await db.collection("foods").add(newDoc);
        return {
            id: res.id,
            data: newDoc
        };
    }
}

function generateIsATags(docMap, isAIds) {
    const isASet = new Set();
    generateIsASet(isASet, docMap, isAIds);
    return [...isASet].map(id => {
        const doc = docMap.get(id);
        return {
            name: doc.name,
            id,
            tagType: TT_IS_A
        };
    });
}

function generateIsASet(isASet, docMap, isAIds) {
    isAIds.forEach(id => {
        isASet.add(id);
        const doc = docMap.get(id);
        const isATagIds = (doc.tags || [])
            .filter(({ tagType }) => tagType === TT_IS_A)
            .map(tag => tag.id);
        generateIsASet(isASet, docMap, isATagIds);
    });
}

async function addIsAToDocMap(db, map, isA, ownerId) {
    await Promise.all(
        isA.map(async id => {
            const doc = await addFoodDocToMap(db, map, id);
            if (!doc.exists) {
                throw new Error(
                    `No such food found, an isA of ${ownerId}: ${id}`
                );
            }
            const food = doc.data();
            const containsIds = (food.tags || [])
                .filter(
                    ({ id, tagType }) => tagType === TT_IS_A && !map.has(id)
                )
                .map(({ id }) => id);
            await addIsAToDocMap(db, map, containsIds, id);
        })
    );
}

async function addIngredientsToDocMap(db, map, ingredients, ownerId) {
    await Promise.all(
        ingredients.map(async ({ id, amount, optional }) => {
            const doc = await addFoodDocToMap(db, map, id);
            if (!doc.exists) {
                throw new Error(
                    `No such food found, an ingredient of ${ownerId}: ${id}`
                );
            }
            const ingredient = doc.data();
            const containsIds = (ingredient.tags || [])
                .filter(
                    ({ id, tagType }) => tagType === TT_CONTAINS && !map.has(id)
                )
                .map(({ id }) => id);
            await addIngredientsToDocMap(db, map, containsIds, id);
        })
    );
}

function addFoodDocToMap(db, map, id) {
    const foods = db.collection("foods");
    const p = map.get(id);
    if (p) {
        return p;
    }
    const np = foods.doc(id).get();
    map.set(id, np);
    return np;
}

module.exports = Food;
