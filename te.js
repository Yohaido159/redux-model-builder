const get = require("lodash.get");

list = { a: [1, 5] };

console.log(get(list, "a.1"));
