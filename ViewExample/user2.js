// Reason : exports는 속성으로, exports에 속성을 추가하면 모듈에서 접근하지만 exports에 객체를 지정하면 자바스크립트에서 새로운 변수로 처리한다.
exports = {
    getUser : function(){
        return {id : 'test01', name : '레드벨벳'};
    },
    group : {id : 'group01', name : '아이돌'}
}