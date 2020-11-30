var Users = [{name:'소녀시대',age:20},{name:'걸스데이',age:17},{name:'티아라',age:18}];
console.log('push() 호출 전 배열 요소의 수 : %d',Users.length);

Users.push({name:'원더걸스',age:24});
console.log('push() 호출 후 배열 요소의 수 : %d',Users.length);

Users.pop();
console.log('pop() 호출 후 배열 요소의 수 : %d',Users.length);
