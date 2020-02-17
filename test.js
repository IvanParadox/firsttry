// специальные символы (пробелы), требуется кодирование
let name = "my name";
let value = "John Smith"

// кодирует в my%20name=John%20Smith
let allCookie = document.cookie;
document.cookie = encodeURIComponent(name) + '=' + encodeURIComponent(value);

alert(allCookie); // ...; my%20name=John%20Smith
