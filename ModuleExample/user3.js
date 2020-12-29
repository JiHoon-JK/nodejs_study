// module.exports 에는 객체를 그대로 할당할 수 있다.
var user = {
    getUser : function(){
        return {id : 'test01', name : '레드벨벳'};
    },
    group : {id : 'group01', name : '아이돌'}
}

module.exports = user;