var fs = require('fs');

// 파일을 비동기식IO로 불러들인다.
fs.readFile('C:/Users/kks13/OneDrive/바탕 화면/Dev/Study/nodejs/nodejs_study/NodeExample1/package.json', 'utf8', function(err,data){
    // 읽어들인 데이터를 출력한다.
    console.log(data);
});

console.log('프로젝트 폴더 안의 package.json 파일을 읽도록 요청했습니다.');