// Express 기본 모듈 불러오기
// express 를 불러올 때는 http 모듈을 반드시 함께 불러와야한다.
var express = require('express');
var http = require('http');

// 익스프레스 객체 생성
var app = express();

// 기본 포트를 app 객체에 속성으로 설정
// process.env 객체에 port 속성이 있으면 그 속성을 사용하고
// 그렇지 않다면 3000번 포트를 사용한다는 뜻이다.
app.set('port', process.env.PORT || 3000);

// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
    console.log('익스프레스 서버를 시작했습니다. : ' + app.get('port'));
});