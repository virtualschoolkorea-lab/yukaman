// 아빠 육아템 탭의 카테고리와 상품 목록(2026-11-12 운영 방향 1단계). app.js 앞에 읽는다.
// 상품은 쿠팡이나 광고주의 판매처로 가는 링크다. 육아맨이 결제 · 배송을 하지 않는다.
// 지금은 비워 둔다: 쿠팡 가입 전이고, 지어낸 상품을 넣지 않는다. 채울 때 한 줄 꼴:
//   { cat: 'out', sub: '아기띠', name: '상품 이름', seller: '쿠팡', url: 'https://…' }
//   cat = 아래 cats의 key · sub = 그 카테고리 subs 가운데 하나 · url은 https만 보인다 · 가격과 순위 말은 적지 않는다
// 올리지 않는 것(운영 방향 6-4): 조제분유, 의약품 · 의약외품 · 의료기기 · 건강기능식품, 이유식 · 아기 간식, 안전 인증(KC)과 리콜을 확인할 수 없는 어린이제품.
// 이 파일을 고치면 sw.js CACHE 숫자를 하나 올린다.
window.YK_SHOP = {
  cats: [
    { key: 'out', name: '외출', e: '🦘', subs: ['아기띠', '유모차', '가방'] },
    { key: 'car', name: '차', e: '🚗', subs: ['카시트', '차량용품'] },
    { key: 'home', name: '집', e: '🏠', subs: ['수유 기기', '잠', '안전'] },
    { key: 'play', name: '놀이', e: '🧩', subs: ['장난감', '책', '탈것'] },
    { key: 'trip', name: '가족여행 · 캠핑', e: '⛺', subs: ['텐트', '의자', '여행용품'] },
    { key: 'school', name: '초등', e: '🎒', subs: ['가방', '헬멧'] }
  ],
  // 2026-11-13 운영자 "가입했고 … 필요한거 다 넣어": 쿠팡 파트너스 상품 링크(파트너스 '상품 링크'로 만든 단축 주소).
  // 어린이제품 · 전기용품은 제품안전정보센터(safetykorea.kr)에서 모델의 KC 인증과 리콜 목록을 확인한 것만 넣었다(확인한 인증번호를 줄 끝에).
  // 쿠팡 상품 화면은 자동 접속이 막혀 열지 못했다. KC를 모델로 확인하지 못한 어린이제품(아기띠 · 유모차 · 유아 침대 · 안전문 · 장난감 · 책가방)은 넣지 않았다.
  items: [
    { cat: 'out', sub: '가방', name: '알로토 기저귀가방 백팩 초경량 방수', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJxacE1Su' },
    { cat: 'out', sub: '가방', name: '베베슬 클램셸 보냉 기저귀가방 백팩', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJxORX380' },
    { cat: 'car', sub: '카시트', name: '비바픽스 ISOFIX 카시트 LB589', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJuurkwh2' },     // KC 자동차용 어린이보호장치 적합 A171R051-3001, 리콜 목록 없음
    { cat: 'car', sub: '차량용품', name: '아가드 차량용 유아 안전 후방거울', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJyubaGM8' },
    { cat: 'home', sub: '수유 기기', name: '유팡 시그니처2 젖병 소독기 UP920A', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJwukxKeq' },     // KC 전기소독기 적합 YA07079-25001, 리콜 목록 없음
    { cat: 'play', sub: '책', name: '옹알옹알 첫 말하기 보드북 세트(전 8권)', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJy9rYFrg' },
    { cat: 'play', sub: '책', name: '사과가 쿵 · 달님 안녕 · 사랑해 사랑해 사랑해 · 두드려 보아요(전 4권)', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJzOHBlue' },
    { cat: 'play', sub: '탈것', name: '베이비루나 기내반입 트라이크 TS580', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJu9JqyiG' },     // KC 완구 적합 CB067R3225-6001, 리콜 목록 없음
    { cat: 'trip', sub: '텐트', name: '캠핑힐스 원터치 텐트(3~4인용)', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJAt8miyq' },
    { cat: 'trip', sub: '의자', name: '스카이필드 미니 릴렉스체어 STEEL(SF-CH-111)', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJA9itK2u' },
    { cat: 'trip', sub: '여행용품', name: '센코 캠핑용 일산화탄소 경보기 SI-611', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJBOYglNY' },
    { cat: 'school', sub: '헬멧', name: '삼천리 AH520 주니어 어린이 헬멧', seller: '쿠팡', url: 'https://link.coupang.com/a/iCJDSiJmDI' }     // KC 운동용 안전모 적합 B531R028-24001, 리콜 목록 없음
  ]
};
