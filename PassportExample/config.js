module.exports = {
	server_port: 3000,
    // db url 설정 : 제일 뒤에 부분이 database 명에 해당
	db_url: 'mongodb://localhost:27017/shopping',
    // collection 이 db에 표시되는 컬렉션명
	db_schemas: [
	    {file:'./user_schema', collection:'users5', schemaName:'UserSchema', modelName:'UserModel'}
	],
	route_info: [
	    
	]
}