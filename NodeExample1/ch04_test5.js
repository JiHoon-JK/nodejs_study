var fs = require('fs');

// 파일을 동기식 IO로 읽어들인다.
var data = fs.readFileSync('C:/Users/kks13/OneDrive/바탕 화면/Dev/Study/nodejs/nodejs_study/NodeExample1/package.json', 'utf8');

// 읽어 들인 데이터를 출력한다.
console.log(data);

