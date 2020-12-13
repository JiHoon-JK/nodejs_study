// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser');
var static = require('serve-static');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// 파일 업로드용 미들웨어
var fs = require('fs');

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// 라우터 사용하여 라우팅 함수 등록
var router = express.Router();


// 메모 저장을 위한 라우팅 함수
router.route('/process/save').post(function(req, res){
    console.log('/process/save 호출됨.');
    
    try {
        var paramAuthor = req.body.author;
        var paramContents = req.body.contents;
        var paramCreateDate = req.body.createDates;
        
        console.log('작성자 : ' + paramAuthor);
        console.log('내용 : ' + paramContents);
        console.log('일시 : ' + paramCreateDate);
        
        res.writeHead(200, {'Content-Type':'text/html;charset=utf8'});
        res.write('<div><p>메모가 저장되었습니다</p></div>');
        res.write('<div><input type="button" value="다시 작성" onclick="javascript:history.back()"></div>');
        res.end();
    } catch(err){
        console.dir(err.stack);
        
        res.writeHead(400, {'Content-Type':'text/html;charset=utf8'});
        res.write('<div><p>메모 저장 시 에러 발생</p></div>');
        res.end();
    }
})


app.use('/', router);


// 404 에러 페이지 처리
var errorHandler = expressErrorHandler({
    static: {
      '404': 'C:/Users/kks13/OneDrive/바탕 화면/Dev/Study/nodejs/nodejs_study/ExpressExample/연습문제/public/404.html'
    }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


// Express 서버 시작
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

