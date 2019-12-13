let request = 'http://localhost:3000/api/auth?username=paradox&password=admin'
let response = '123'
function requestBusinessHandler(request, response){
  console.log('1')
}
function logIn(request, response){
  console.log('2')
}

function router (request, response) {
  let requestedFile = decodeURI(request.url);
  result = {};
  let data = {
    '\^/api': requestBusinessHandler(),
    '\^/api/auth': logIn()
  }
  for (key in data) {
    let apiKey  = new RegExp(data[key], 'g');
    if (!apiKey.test(requestedFile)){
      result[apiKey] = data[value];
      return result;
    }
  }
  for (key in result) {
    if (!key.test(requestedFile)){return result[value](request, response)}
  }
  console.log(result)
}

router (request);
