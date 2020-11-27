var Person = {
    age : 20,
    name : '레드벨벳',
    add : function(a,b){
        return a+b;
    }
};

console.log('더하기 : %d',Person.add(10,10));