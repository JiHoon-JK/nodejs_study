// module.exports 가 사용되면 exports는 무시됨.
module.exports = {
    getUser : function(){
        return {id:'test01', name:'레드벨벳'};
    },
    group : {id:'group01', name:'아이돌'}
}

exports.group = {id:'group02', name:'친구'};