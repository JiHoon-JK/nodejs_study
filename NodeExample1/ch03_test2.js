var Person = {};

Person['age'] = 20;
Person['name'] = '레드벨벳';
Person.mobile = '010-0000-0000';

console.log(Person);
console.log('나이 : %d',Person.age);
console.log('이름 : %s',Person.name);
console.log('전화번호 : %s',Person['mobile']);