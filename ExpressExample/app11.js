// Express 기본 모듈 불러오기
var express = require('express');
var http = require('http');
var path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser');
var static = require('serve-static');
var errorHandler = require('errorhandler');

// 오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// 쿠키를 다루는 모듈 사용
var cookieParser = require('cookie-parser');

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser 를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended:false}));

// body-parser 를 사용해 application/json 파싱
app.use(bodyParser.json());

app.use('/public', static(path.join(__dirname, 'public')));

// cookieParser 사용하기
app.use(cookieParser);

// 라우터 객체 설정
var router = express.Router();

// 라우터 함수 등록
router.route('/process/showCookie').get(function(req,res){
    console.log('/process/showCookie 호출됨.');
    
    res.send(req.cookies);
});

router.route('/process/setUserCookie').get(function(req,res){
    console.log('/process/setUserCookie 호출됨.');
    
    // 쿠키 설정
    res.cookie('user',{
        id : 'mike',
        name : '소녀시대',
        authorized : true
    });
    
    // redirect 로 응답
    res.redirect('/process/showCookie');
});

// 라우터 객체를 app 객체에 등록
app.use('/',router);


// 모든 router 처리 끝난 후 404 오류 페이지 처리
var errorHandler = expressErrorHandler({
    static:{
        '404': 'C:/Users/kks13/OneDrive/바탕 화면/Dev/Study/nodejs/nodejs_study/ExpressExample/public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

http.createServer(app).listen(app.get('port'),function(){
    console.log('Express 서버가 ' + app.get('port') + '번 포트에서 시작됨.');
});