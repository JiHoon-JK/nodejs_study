var database;
var UserSchema;
var UserModel;

//데이터베이스 객체, 스키마 객체, 모델 객체를 이 모듈에서 사용할 수 있도록 전달함
var init = function(db, schema, model){
    console.log('init 호출됨.');
    
    database = db;
    UserSchema = schema;
    UserModel = model;
}

// 로그인 라우터 함수 - 데이터베이스의 정보와 비교
var login = function(req,res){
    console.log('user 모델 안에 있는 login 호출됨.');
    
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
                res.write('<div><p>사용자 이름 : ' + username + '</p></div>');
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
}

var adduser = function(req,res){
    console.log('user 모듈 안에 있는 adduser 호출됨.');
    
    var paramId = req.body.id || req.query.id;
    var paramPassword = req.body.password || req.query.password;
    var paramName = req.body.name || req.query.name;
    
    console.log('요청 파라미터 : ' + paramId + ', ' + paramPassword + ', ' + paramName);
    
    // 데이터베이스 객체가 초기화된 경우, addUser 함수 호출하여 사용자 추가
    if (database){
        addUser(database, paramId, paramPassword, paramName, function(err, addedUser){
            if(err) {throw err;}
            
            //결과 객체 확인하여 추가된 데이터 있으면 성공 응답 전송
            if(addedUser){
                console.dir(addedUser);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 성공</h2>');
                res.end();
            }else{
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
                res.write('<h2>사용자 추가 실패</h2>');
                res.end();
            }
        });
    }else{
        // 데이터베이스 객체가 초기화되지 않는 경우 실패응답 전송
        res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
        res.write('<h2>데이터베이스 연결 실패</h2>');
        res.end();
    }
};

//사용자 리스트 함수
var listuser = function(req,res){
    console.log('user 모듈 안에 있는 listuser 호출됨.');
    
    // 데이터베이스 객체가 초기화된 경우, 모델 객체의 findAll 메소드 호출
	if (database) {
		// 1. 모든 사용자 검색
		UserModel.findAll(function(err, results) {
			// 에러 발생 시, 클라이언트로 에러 전송
			if (err) {
                console.error('사용자 리스트 조회 중 에러 발생 : ' + err.stack);
                
                res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회 중 에러 발생</h2>');
                res.write('<p>' + err.stack + '</p>');
				res.end();
                
                return;
            }
			  
			if (results) {  // 결과 객체 있으면 리스트 전송
				console.dir(results);
 
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트</h2>');
				res.write('<div><ul>');
				
				for (var i = 0; i < results.length; i++) {
					var curId = results[i]._doc.id;
					var curName = results[i]._doc.name;
					res.write('    <li>#' + i + ' : ' + curId + ', ' + curName + '</li>');
				}	
			
				res.write('</ul></div>');
				res.end();
			} else {  // 결과 객체가 없으면 실패 응답 전송
				res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
				res.write('<h2>사용자 리스트 조회  실패</h2>');
				res.end();
			}
		});
	} else {  // 데이터베이스 객체가 초기화되지 않은 경우 실패 응답 전송
		res.writeHead('200', {'Content-Type':'text/html;charset=utf8'});
		res.write('<h2>데이터베이스 연결 실패</h2>');
		res.end();
	}
};

// 사용자를 인증하는 함수 : 아이디로 먼저 찾고 비밀번호를 그 다음 비교
var authUser = function(database, id, password, callback){
    console.log('authUser 호출됨 : ' + id + ', ' + password);
                
    // 1. 아이디를 사용해서 검색
    UserModel.findById(id, function(err,results){
        if(err){
            callback(err,null);
            return;
        }
        console.log('아이디 [%s]로 사용자 검색 결과',id);
        console.dir(results);
        
        if(results.length > 0){
            console.log('아이디와 일치하는 사용자 찾음.');
            
            var user = new UserModel({id : id});
            var authenticated = user.authenticate(password, results[0]._doc.salt, results[0]._doc.hashed_password);
            
            if(authenticated){
                console.log('비밀번호 일치함');
                callback(null,results);
            }else{
                console.log('비밀번호 일치하지 않음.');
                callback(null,null);
            }
            
            
        }else{
            console.log('아이디와 일치하는 사용자를 찾지 못함.');
            callback(null,null);
        }
    });
}

// 사용자를 추가하는 함수
var addUser = function(database, id, password, name, callback){
    console.log('addUser 호출됨 : ' + id + ', ' + password);
    
    //UserModel 의 인스턴스 객체 생성
    var user = new UserModel({"id":id, "password":password, "name":name});
    
    // save()로 저장
    user.save(function(err){
        if(err){
            callback(err,null);
            return;
        }
        console.log('사용자 데이터 추가함.');
        callback(null,user);
    });
    
}

module.exports.init = init;
module.exports.login = login;
module.exports.adduser = adduser;
module.exports.listuser = listuser;