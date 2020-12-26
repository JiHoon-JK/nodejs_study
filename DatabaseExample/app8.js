// Express 기본 모듈 사용하기
var express = require('express')
, http = require('http')
, path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
, cookieParser = require('cookie-parser')
, static = require('serve-static')
, errorHandler = require('errorhandler');

// 오류 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');

// 익스프레스 객체 생성
var app = express();

// 기본 속성 설정
app.set('port', process.env.PORT || 3000);

// body-parser를 사용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({extended:false}));

// body-parser를 사용해 application/json 파싱
app.use(bodyParser.json());

// public 폴더를 static 으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));

// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
    secret:'my key',
    resave:true,
    saveUninitialized:true
}));

// 라우터 객체 참조
var router = express.Router();

// <----- 데이터베이스 연결 ------->//

// MySQL 데이터베이스를 사용할 수 있는 mysql 모듈 알아보기
var mysql = require('mysql');

// MySQL 데이터베이스 연결 설정
var pool = mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    password : 'kks4217117!',
    database : 'test',
    debug : false
});

// 데이터베이스 객체를 위한 변수 선언
var database;

// 사용자를 등록하는 함수
var addUser = function(id, name, age, password, callback){
    console.log('addUser 호출됨.');
    
    // 커넥션 풀에서 연결 객체를 가져온다.
    pool.getConnection(function(err,conn){
        if(err){
            if(conn){
                conn.release(); // 반드시 해제해야한다.
            }
            
            callback(err,null);
            return;
        }
        console.log('데이터베이스 연결 스레드 아이디 : ' + conn.threadId);
        
        // 데이터를 객체로 만든다.
        var data = {id:id , name:name, age:age, password:password};
        
        // SQL 문을 실행한다.
        var exec = conn.query('insert into users set ?', data, function(err, result){
            conn.release(); // 반드시 해제해야한다.
            console.log('실행 대상 SQL : ' + exec.sql);
            
            if(err){
                console.log('SQL 실행 시 오류 발생함.');
                console.dir(err);
                
                callback(err,null);
                return;
            }
            callback(null, result);
        });
    })
}

// 사용자를 인증하는 함수
var authUser = function(database, id, password, callback){
    console.log('authUser 호출됨.');
    
    // users 컬렉션 참조
    var users = database.collection('users');
    
    // 아이디와 비밀번호를 사용해 검색
    users.find({"id":id, "password":password}).toArray(function(err,docs){
        if(err) {
            callback(err, null);
            return;
        }
        // 검색한 결과가 있는 경우
        if(docs.length > 0){
            console.log('아이디 [%s]. 비밀번호 [%s]가 일치하는 사용자 찾음,',id,password);
            callback(null,docs);
        }
        // 검색한 결과가 없는 경우
        else{
            console.log('일치하는 사용자를 찾지 못함.');
            callback(null,null);
        }
    });
}

// 로그인 라우터 함수 - 데이터베이스의 정보와 비교
router.route('/process/login').post(function(req,res){
    console.log('/process/login 호출됨.');
    
    var paramId = req.param('id');
    var paramPassword = req.param('password');
    
    if(database){
        authUser(database, paramId, paramPassword, function(err, docs){
            if(err) {throw err;}
            
            if(docs){
                console.dir(docs);
                var username = docs[0].name;
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 성공</h1>');
                res.write('<div><p>사용자 아이디 : ' + paramId + '</p></div>');
                res.write('<div><p>사용자 이름 : ' + paramPassword + '</p></div>');
                res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
                res.end();
            }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h1>로그인 실패</h1>');
                res.write('<div><p>아이디와 비밀번호를 다시 확인하십시오.</p></div>');
                res.write("<br><br><a href='/public/login.html'>다시 로그인하기</a>");
                res.end();
            }
        });
    }else{
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.write('<div><p>데이터베이스에 연결하지 못했습니다.</p></div>');
        res.end();
    }
    
});

// 사용자 추가 라우팅 함수
router.route('/process/adduser').post(function(req,res){
    console.log('/process/adduser 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
    var paramAge = req.body.age || req.query.age;
    
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName + ', ' + paramAge );
    
    // pool 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if (pool){
        addUser(paramId,paramName,paramAge,paramPassword, function(err, addedUser){
            // 동일한 id 로 추가할 때 오류 발생 - 클라이언트로 오류 전송
            if(err){
                console.error('사용자 추가 중 오류 발생 : ' + err.stack);
                
                res.writeHead('200',{'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 중 오류 발생</h2>');
                res.write('<p>'+ err.stack +'</p>');
                res.end();
                
                return;
            }
            if(addedUser){
                console.dir(addedUser);
                
                console.log('inserted ' + addedUser.affectedRows + ' rows');
                
                var insertId = addedUser.insertId;
                console.log('추가한 레코드의 아이디 : ' + insertId);
                
                res.wirteHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    }else{
        //데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
    
});

// 라우터 객체 등록
app.use('/', router);

// ===========404 오류 페이지 처리 ===========//
var errorHandler = expressErrorHandler({
    static:{
        '404':'./public/404.html'
    }
});

app.use(expressErrorHandler.httpError(404));
app.use(errorHandler);

// ===== 서버 시작 ===== //
http.createServer(app).listen(app.get('port'), function(){
    console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));
    
});