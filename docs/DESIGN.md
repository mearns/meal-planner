# Design Document

## Domain Types

A `meal` is a set of zero or more `dishes`, representing everything that will be served together to
constitute a meal. A `dish` is a named set of quanitified ingredients. A `dish` may have one or more associated
`recipes`, which include instructions on how to prepare the dish.

A `meal-time` describes generally what time of day or type of meal, such as "dinner", "lunch", "dessert", etc.

Foods should be heirarchical. Receipes are made of ingredients, which may themselves have their own ingredients,
and so on. (e.g., BBQ chicken uses BBQ sauce, which might be made with ketchup, which has it's own ingredients
that it's made with). This allows for flexibility but we will need to someone identify: what's a "dish" that
can actually be served as part of a meal. I don't want the function generating a meal of "ketchup with a side
of relish" for dinner.

To keep the queries surface area a little more manageable, I'm still going to define `dish` as a data type,
but it will basically just be a reference to another a `food`. Every `dish` is a `food`, but not every `food`
is a `dish`. And a `food` can have other `foods` as ingredients. We can go even higher and have some _predefined_
`meals` which are collections of `dishes`.

So these _ingredients_ are a "has a" relationship; we will also want to define an "is a" relationship for foods.
E.g., we want to have generic "apple" as a food, but also "macintosh apple" as a specific type of apple.
