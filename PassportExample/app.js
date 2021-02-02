// Express 기본 모듈 불러오기
var express = require('express')
  , http = require('http')
  , path = require('path');

// Express의 미들웨어 불러오기
var bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , static = require('serve-static')
  , errorHandler = require('errorhandler');

// 에러 핸들러 모듈 사용
var expressErrorHandler = require('express-error-handler');

// Session 미들웨어 불러오기
var expressSession = require('express-session');
  

// 모듈로 분리한 설정 파일 불러오기
var config = require('./config');

// 모듈로 분리한 데이터베이스 파일 불러오기
var database = require('./database/database');

// 모듈로 분리한 라우팅 파일 불러오기
var route_loader = require('./routes/route_loader');

// ===== Passport ==== //
var passport = require('passport');
var flash = require('connect-flash');


// 익스프레스 객체 생성
var app = express();

// ==== passport 사용 설정 ==== //
app.use(passport.initialize());
app.use(passport.session());

// flash 메세지 사용 설정
app.use(flash());


//===== 뷰 엔진 설정 =====//
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// (★)ejs 모듈 관련 오류 발생으로, 경로를 지정하는 코드 삽입
app.engine('ejs', require('ejs').__express)

console.log('뷰 엔진이 ejs로 설정되었습니다.');


//===== 서버 변수 설정 및 static으로 public 폴더 설정  =====//
console.log('config.server_port : %d', config.server_port);
app.set('port', process.env.PORT || 3000);
 

// body-parser를 이용해 application/x-www-form-urlencoded 파싱
app.use(bodyParser.urlencoded({ extended: false }))

// body-parser를 이용해 application/json 파싱
app.use(bodyParser.json())

// public 폴더를 static으로 오픈
app.use('/public', static(path.join(__dirname, 'public')));
 
// cookie-parser 설정
app.use(cookieParser());

// 세션 설정
app.use(expressSession({
	secret:'my key',
	resave:true,
	saveUninitialized:true
}));

 
//라우팅 정보를 읽어들여 라우팅 설정
route_loader.init(app, express.Router());


// == LocalStrategy === //
var LocalStrategy = require('passport-local').Strategy;

// 패스포트 로그인 설정
passport.use('local-login', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
}, function(req, email, password, done){
    console.log('passport 의 local-login 호출됨 : ' + email + ', ' + password);
    
    var database = app.get('database');
    database.UserModel.findOne({'email':email}, function(err,user){
        if(err) {return done(err);}
        
        //등록된 사용자가 없는 경우
        if(!user){
            console.log('계정이 일치하지 않음.');
            return done(null, false, req.flash('등록된 계정이 없습니다.'));
        }
        
        // 비밀번호를 비교하여 맞지 않는 경우
        var authenticated = user.authenticate(password, user._doc.salt, user._doc.hashed_password);
        
        if(!authenticated){
            console.log('비밀번호 일치하지 않음.');
            return done(null, false, req.flash('loginMessage', '비밀번호가 일치하지 않습니다.'));
        }
        
        // 정상인 경우
        console.log('계정과 비밀번호가 일치함.');
        return done(null,user);
    });
}));


// 패스포트 회원가입 설정
passport.use('local-signup', new LocalStrategy({
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true
}, function(req, email, password, done){
    // 요청 파라미터 중 name 파라미터 확인
    var paramName = req.body.name || req.query.name;
    console.log('passport 의 local-signup 호출됨 : ' + email + ', ' + password + ', ' + paramName);
    
    // User.findOne이 blocking 되므로 async 방식으로 변경할 수 있음
    process.nextTick(function(){
        var database = app.get('database');
        database.UserModel.findOne({'email':email}, function(err, user){
            // 오류가 발생한다면
            if(err){throw done(err);}
            
            // 기존에 이메일이 있다면
            if(user){
                console.log('기존에 계정이 있음.');
                return done(null, false, req.flash('singupMessage','계정이 이미 있습니다.'));
            }else{
                // 모델 인스턴스에 객체 만들어서 저장
                var user = new database.UserModel({'email':email, 'password':password, 'name':paramName});
                user.save(function(err){
                    if(err){throw error;}
                    console.log('사용자 데이터추가')
                    return done(null,user);
                });
            }
        });
    });
}));

// 사용자 인증에 성공했을 때
passport.serializeUser(function(user,data){
    console.log('serializeUser() 호출됨.');
    console.dir(user);
    
    done(null,user);
});

// 사용자 인증 이후 사용자 요청이 있을 때마다 호출
passport.deserializeUser(function(user,done){
    console.log('deserializeUser() 호출됨');
    console.dir(user);
    
    done(null,user);
});





//===== 404 에러 페이지 처리 =====//
var errorHandler = expressErrorHandler({
 static: {
   '404': 'C:/Users/kks13/OneDrive/바탕 화면/Dev/Study/nodejs/nodejs_study/ModuleExample/public/404.html'
 }
});

app.use( expressErrorHandler.httpError(404) );
app.use( errorHandler );


//===== 서버 시작 =====//

//확인되지 않은 예외 처리 - 서버 프로세스 종료하지 않고 유지함
process.on('uncaughtException', function (err) {
	console.log('uncaughtException 발생함 : ' + err);
	console.log('서버 프로세스 종료하지 않고 유지함.');
	
	console.log(err.stack);
});

// 프로세스 종료 시에 데이터베이스 연결 해제
process.on('SIGTERM', function () {
    console.log("프로세스가 종료됩니다.");
    app.close();
});

app.on('close', function () {
	console.log("Express 서버 객체가 종료됩니다.");
	if (database.db) {
		database.db.close();
	}
});

// 시작된 서버 객체를 리턴받도록 합니다. 
var server = http.createServer(app).listen(app.get('port'), function(){
	console.log('서버가 시작되었습니다. 포트 : ' + app.get('port'));

	// 데이터베이스 초기화
	database.init(app, config);
   
});
