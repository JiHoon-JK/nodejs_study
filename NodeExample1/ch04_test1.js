var url = require('url');

// 주소 문자열을 URL 객체로 만들기
var curURL = url.parse('https://m.search.naver.com/search.naver?qurey=steve+jobs&where=m&sm=mtp_hty');

// URL 객체를 주소 문자열로 만들기
var curStr = url.format(curURL);

console.log('주소 문자열 : %s',curStr);
console.dir(curURL);

/*
주소 문자열 : https://m.search.naver.com/search.naver?qurey=steve+jobs&where=m&sm=mtp_hty
Url {
  protocol: 'https:',
  slashes: true,
  auth: null,
  host: 'm.search.naver.com',
  port: null,
  hostname: 'm.search.naver.com',
  hash: null,
  search: '?qurey=steve+jobs&where=m&sm=mtp_hty',
  query: 'qurey=steve+jobs&where=m&sm=mtp_hty',
  pathname: '/search.naver',
  path: '/search.naver?qurey=steve+jobs&where=m&sm=mtp_hty',
  href: 'https://m.search.naver.com/search.naver?qurey=steve+jobs&where=m&sm=mtp_hty'
}
*/