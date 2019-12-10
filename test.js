let params = new URLSearchParams('https://example.com/?&name=Jonathan&age=18');
let name = params.get("name"); // is the string "Jonathan"
let age = parseInt(params.get("age"), 10); // is the number 18

console.log(name)
console.log(age)
