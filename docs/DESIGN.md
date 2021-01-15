# Design Document

## Domain Types

A `meal` is a set of zero or more `dishes`, representing everything that will be served together to
constitute a meal. A `dish` is a named set of quanitified ingredients. A `dish` may have one or more associated
`recipes`, which include instructions on how to prepare the dish.

A `meal-time` describes generally what time of day or type of meal, such as "dinner", "lunch", "dessert", etc.
