// 육아맨 설정. API_URL = 서버 주소(화면과 같은 Pages 프로젝트의 /api). 비우면 시험 모드(견본 글 + 이 폰에만 저장)로만 돈다.
// 내 컴퓨터(localhost)에서 정적 서버로 열어 /api가 없으면 화면이 알아서 시험 모드로 바뀐다. 운영 주소에서는 바꾸지 않는다(서버 오류를 그대로 알림).
// www로 들어온 사람은 뿌리 주소로 보낸다(11-12). 네이버 로그인의 돌아오는 주소와 기기에 저장되는 값이 주소마다 따로라서 하나로 모은다
if (location.hostname.indexOf('www.') === 0) location.replace(location.protocol + '//' + location.hostname.slice(4) + location.pathname + location.search + location.hash);
window.YK_CONFIG = {
  APP_NAME: '육아맨',
  API_URL: '/api',
  VERSION: '0.16.8',
  // 본인인증(포트원). 비어 있으면 꺼져 있고 초대 코드·신청서가 보인다. 켜는 순서는 저장소 CLAUDE.md '본인인증 켜기'. 둘 다 공개되어도 되는 값이다(비밀 키는 서버의 PORTONE_API_SECRET)
  IDENTITY: { storeId: '', channelKey: '' },
  // 카카오 로그인(11-05). true면 가입·인증이 카카오 + 닉네임이 된다. 켜는 순서는 저장소 CLAUDE.md '카카오 로그인 켜기'
  KAKAO_LOGIN: false,     // 11-12 새 사이트에는 카카오로 가입한 회원이 없어 끈다(켜면 '카카오로 가입한 회원이에요' 줄이 다시 보인다)
  // 네이버 로그인(11-05 운영자 "네이버로 진행"). true면 로그인 자리가 네이버가 되고 계정 성별이 남성인 회원만 새로 받는다. 켜는 순서는 저장소 CLAUDE.md '네이버 로그인 켜기'
  NAVER_LOGIN: true
};
