/* 육아맨 화면(2026-11-04).
   해시 주소: #/ 홈 · #/guide[/<분류>] 아빠 가이드 · #/g/<id> 가이드 글 · #/calc[/<종류>] 계산기 · #/library 자료실
              #/community[/<주제>] 질문게시판(옛 커뮤니티) · #/p/<번호> 질문 · #/write 질문하기 · #/shop[/<카테고리>] 아빠 육아템 · #/me MY · #/join/<코드> 초대 · #/admin 관리자
   0.9.0(2026-11-12 운영 방향 1단계): 아래 탭 다섯(홈 · 가이드 · 질문 · 육아템 · MY). 질문게시판은 글 = 질문, 댓글 = 답으로 그대로 쓴다. 외출증 · 초대 링크 · 지금 뜨는 글 · 글쓰기 양식은 접음(코드는 남김)
   커뮤니티 글·댓글·인증: 서버(/api, server/app.js)에. 시험 모드(견본 글 sample-data.js + 이 기기 localStorage)는 config.js API_URL이 비었거나, 파일로 열었거나, 내 컴퓨터(localhost)에서 /api가 없을 때만.
   운영 주소에서는 서버가 JSON이 아닌 것을 돌려줘도(오류 페이지·와이파이 로그인 페이지) 시험 모드로 바꾸지 않고 "서버에 연결할 수 없어요"만 보인다(11-04 검수 1).
   계정: 기기 토큰(localStorage) + 가입 때 한 번 보여 주는 복구 코드(폰 바꿀 때) · 이 기기 로그아웃 · 탈퇴(11-04 검수 3·5).
   가이드 글: guide-data.js · 자료실: data/library.json · 계산: calc.js(법령 기준, test/calc-test.js). 사진·영상 없음 — 줄글 + 댓글만, 검색 됨(11-04 운영자).
   아빠 인증: 커뮤니티는 읽기도 쓰기도 인증 아빠만(2026-11-04 운영자 "인증 아빠만"), 가이드·계산기·자료실은 누구나. 초대 코드(바로) 또는 신청서(관리자 승인). 서류·아이 정보는 받지 않는다.
   카카오 로그인(11-05 운영자): config.js KAKAO_LOGIN을 켜면 카카오 + 닉네임이 곧 인증이고, 신청서·초대 코드 화면은 숨는다(관리자 코드 링크만 남음).
   네이버 로그인(11-05 운영자 "네이버로 진행"): config.js NAVER_LOGIN을 켜면 같은 자리가 네이버가 되고, 계정 성별이 남성인 회원만 새로 받는다. 이미 카카오로 가입한 회원은 작은 글자 입구로 들어온다. */
(function () {
  'use strict';
  const CFG = window.YK_CONFIG || {};
  const GD = window.YK_GUIDES || { cats: [], items: [] };
  const K = window.YK_CALC;
  // 질문게시판의 질문 주제(2026-11-12 운영 방향 1단계: 커뮤니티 → 질문게시판, 가입한 아빠끼리 묻고 답한다). server/app.js CATS와 같게
  const CATS = [
    { key: 'leave', name: '육아휴직', e: '💼' },
    { key: 'money', name: '돈·지원', e: '💰' },
    { key: 'care', name: '아기 돌보기', e: '🍼' },
    { key: 'gear', name: '용품', e: '🎒' },
    { key: 'play', name: '놀이·나들이', e: '🎡' },
    { key: 'mind', name: '아빠 마음', e: '🧠' },
    { key: 'etc', name: '기타', e: '💬' }
  ];
  const CAT = {}; CATS.forEach(c => { CAT[c.key] = c; });
  // 그 전 분류(11-05)로 이미 올라간 글은 이름만 그대로 보여 준다. 새 글에는 쓰지 않는다
  const CAT_OLD = { question: { name: '질문', e: '🙋' }, tip: { name: '정보', e: '💡' }, vent: { name: '하소연', e: '😩' } };
  const catOf = k => CAT[k] || CAT_OLD[k] || CAT.etc;
  const catCls = k => (CAT[k] || CAT_OLD[k] ? k : 'etc');
  const GCAT = {}; GD.cats.forEach(c => { GCAT[c.key] = c; });
  const LIM = { title: [2, 60], body: [1, 3000], comment: [1, 1000], answer: [20, 500], ask: [5, 300], qa: [2, 1000] };   // server/app.js LIM과 같게
  const PAGE = 20;
  const RESERVED = /(육아맨|운영|관리|자료실|공식|스태프|스탭|매니저|마스터|심사|admin|official|staff|manager|master|moderator|yukaman)/i;   // 화면은 미리 알려 주는 것뿐이고, 막는 것은 server/app.js(거기에는 이름이 더 있다)
  const foldNick = s => s.replace(/[\s_.\-]+/g, '').toLowerCase().replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/5/g, 's');
  const MSG = {
    login: '닉네임 먼저 정하기', unknown_user: '이 기기에 닉네임 기록 없음. 다시 정하기',
    logged_out: '다른 기기에서 로그인해 이 기기는 로그아웃됨. 다시 로그인하기',
    nick_taken: '이미 쓰는 닉네임. 별명 바꾸기', name_taken: '다른 아빠가 쓰는 별명. 다른 별명 적기',nick_form: '별명/거주지/자녀 출생연도 끝 2자리로 적기', nick_reserved: '운영 계정과 헷갈리는 이름은 사용 불가', nick_bad: '욕설 · 비속어는 닉네임에 사용 불가',
    bad_word: '욕설 · 비하 · 혐오 표현은 올리기 불가. 고쳐서 다시 올리기',
    limit: '너무 잦은 시도. 잠시 뒤 다시 하기', title_len: '질문은 2~60자로 적기', body_len: '상황 적기(3000자까지)',
    comment_len: '답은 1~1000자로 적기', cat: '질문 주제 고르기', not_found: '글을 찾을 수 없음(지워졌을 수 있음)',
    forbidden: '내가 쓴 것만 삭제 가능', bad_json: '보낼 내용 오류', server: '서버 문제 발생. 잠시 뒤 다시 하기', network: '인터넷 연결 확인 필요',
    own: '내가 쓴 글은 신고 불가', no_api: '서버 연결 실패. 잠시 뒤 다시 열기', recovery_bad: '맞지 않는 복구 코드', token_in_use: '이 기기에 이미 다른 닉네임 있음',
    verify: '질문게시판은 가입한 아빠만 읽고 쓰기 가능', blocked: '이용이 제한된 계정',
    code_bad: '맞지 않는 초대 코드', code_used: '이미 쓴 초대 코드', stage: '지금 상황 고르기', answer_len: '이야기는 20자 이상으로 적기', pledge: '약속에 체크하기', invite_max: '초대 코드는 3개까지 만들기 가능',
    ask_len: '5자 이상 300자 안으로 적기', identity_bad: '본인인증 확인 실패. 다시 하기', identity_denied: '만 19세 이상 남성만 가입 가능', identity_dup: '이미 가입한 분. MY에서 복구 코드로 돌아오기', identity_off: '본인인증 준비 중',
    kakao_bad: '카카오 로그인 확인 실패. 다시 하기', kakao_off: '카카오 로그인 준비 중', kakao_taken: '이 기기는 다른 카카오 계정과 연결됨. 로그아웃 뒤 다시 하기', kakao_mismatch: '가입할 때 쓴 카카오 계정으로 하기', kakao_used: '이미 가입한 카카오 계정. 카카오로 다시 시작하기', kakao_leave: '카카오 연결을 끊어야 탈퇴 가능', kakao_closed: '새 가입은 네이버 로그인으로만',
    naver_bad: '네이버 로그인 확인 실패. 다시 하기', naver_off: '네이버 로그인 준비 중', naver_taken: '이 기기는 다른 계정과 연결됨. 로그아웃 뒤 다시 하기', naver_mismatch: '가입할 때 쓴 네이버 계정으로 하기', naver_used: '이미 가입한 네이버 계정. 네이버로 다시 시작하기', naver_leave: '네이버 연동을 끊어야 탈퇴 가능', naver_required: '네이버 로그인으로 가입하기', naver_not_dad: '아빠만 가입 가능', naver_gender: '성별 제공 동의 필요',
    terms: '약관 동의 필요', user_blocked: '차단한 아빠의 글', block_self: '나 자신은 차단 불가', block_staff: '운영 계정은 차단 불가', review_bad: '맞지 않는 심사용 코드', review_off: '심사용 입구 닫힘'
  };

  // ----- 도구 -----
  const $ = (s, el) => (el || document).querySelector(s);
  const $$ = (s, el) => Array.prototype.slice.call((el || document).querySelectorAll(s));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  // 주소에 쓰는 글자만 링크로(한글 조사 "…com에서"가 붙지 않게). 끝의 문장 부호는 뺀다
  const rich = s => esc(s).replace(/https?:\/\/[A-Za-z0-9\-._~:\/?#\[\]@!$&;=%+,*()]+/g, m => { const t = m.replace(/(&#39;|&quot;|[.,;:!?)\]])+$/, ''); return '<a href="' + t + '" target="_blank" rel="noopener">' + t + '</a>' + m.slice(t.length); });
  const len = s => Array.from(String(s || '')).length;
  const fmtNum = n => Number(n || 0).toLocaleString('ko-KR');
  // 1,684,210 → '168만 4,210원' / 25,000,000 → '2,500만원'
  function won(n) {
    n = Math.round(n || 0);
    const sign = n < 0 ? '-' : ''; n = Math.abs(n);
    if (n < 10000) return sign + fmtNum(n) + '원';
    const man = Math.floor(n / 10000), rest = n % 10000;
    return sign + fmtNum(man) + '만' + (rest ? ' ' + fmtNum(rest) : '') + '원';
  }
  const dot = s => (s ? String(s).replace(/-/g, '.') : '');
  const dotd = s => { const m = String(s || '').match(/^(\d{4})-(\d{2})-(\d{2})/); return m ? m[1] + '. ' + (+m[2]) + '. ' + (+m[3]) + '.' : ''; };
  // 안내는 개조식 점 목록으로(11-05 운영자 "2줄 문구는 개조식으로"). 코드에 적은 글자만 넣는다(사용자 글은 넣지 않는다)
  const notes = list => '<ul class="nlist">' + list.filter(Boolean).map(x => '<li>' + x + '</li>').join('') + '</ul>';
  const store = {
    get(k, d) { try { const v = localStorage.getItem('yk.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem('yk.' + k, JSON.stringify(v)); } catch (e) { /* 비공개 창 등 */ } },
    del(k) { try { localStorage.removeItem('yk.' + k); } catch (e) { /* 무시 */ } }
  };
  function ago(iso) {
    const t = new Date(iso).getTime(); if (!t) return '';
    const d = Date.now() - t;
    if (d < 60e3) return '방금';
    if (d < 3600e3) return Math.floor(d / 60e3) + '분 전';
    if (d < 86400e3) return Math.floor(d / 3600e3) + '시간 전';
    if (d < 7 * 86400e3) return Math.floor(d / 86400e3) + '일 전';
    const dt = new Date(t);
    return (dt.getFullYear() !== new Date().getFullYear() ? dt.getFullYear() + '.' : '') + (dt.getMonth() + 1) + '.' + dt.getDate();
  }
  function ymd(iso) { const dt = new Date(iso); if (!dt.getTime()) return ''; return dt.getFullYear() + '.' + String(dt.getMonth() + 1).padStart(2, '0') + '.' + String(dt.getDate()).padStart(2, '0'); }
  const first = s => Array.from(String(s || '?'))[0] || '?';
  const CHECK = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5 6.7 11.5 12.5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const vbadge = b => (b === 'official' ? '<span class="vb of">자료</span>' : b === 'admin' ? '<span class="vb of">운영</span>' : b === 'dad' ? '<span class="vb" title="인증 아빠" aria-label="인증 아빠">' + CHECK + '</span>' : '');
  const avatar = nick => '<span class="avatar">' + esc(first(nick)) + '</span>';
  // 계급(11-05 운영자 "1안 좋아 대신 앞에 계급이모티콘도 붙여줘 있잖아 짝대기부터해서"). 재미로만 쓰고 권한 차이는 없다. at·days는 server/app.js RANK_AT·RANK_DAYS와 같게
  // 진급은 점수와 복무일을 둘 다 채워야 한다(11-05 운영자 "진급 조건을 조금 까다롭게 해서 모두가 너무 빨리 진급하지 않도록")
  const RANKS = [
    { name: '이병', at: 0, days: 0, line: '신병 왔습니다. 일단 기저귀부터.' },
    { name: '일병', at: 20, days: 7, line: '분유 타는 손이 빨라졌습니다.', pass: '30분' },
    { name: '상병', at: 60, days: 30, line: '오늘 밤 야간 근무도 이상 무.', pass: '1시간' },
    { name: '병장', at: 150, days: 90, line: '울음소리만 들어도 원인을 압니다.', pass: '2시간' },
    { name: '예비군', at: 400, days: 180, line: '전역했지만 부르면 옵니다.', pass: '반나절' },
    { name: '민방위', at: 1000, days: 365, line: '후배 아빠들은 제가 챙깁니다.', pass: '하루' }
  ];
  const INVITE_PTS = 10, INVITE_PTS_MAX = 10;     // server/app.js와 같게(11-05 운영자 "다른 아빠들을 초대하면 진급 포인트가 올라가는 제도")
  const rankLevel = (pts, days) => { let i = 0; while (RANKS[i + 1] && pts >= RANKS[i + 1].at && days >= RANKS[i + 1].days) i++; return i; };
  const serviceDays = t => Math.max(0, Math.floor((Date.now() - new Date(t).getTime()) / 86400000)) || 0;
  // 계급장 그림: 그런 이모지가 없어 직접 그렸다. 작대기 1~4개(이병~병장) · 얼룩무늬(예비군복) · 노란 바탕 삼각형(민방위)
  const RANK_CAMO = [['M2 5c2-2 5-2 6 0s-1 4-3 4-4-2-3-4z', '#2E3A22'], ['M11 3c2-1 5 0 6 2s-2 3-4 3-3-4-2-5z', '#B3A574'], ['M4 13c2-2 5-1 6 1s-1 4-3 4-4-3-3-5z', '#B3A574'], ['M12 11c2-1 5 0 6 2s-1 4-3 4-4-5-3-6z', '#2E3A22']];
  const RANK_TRI = 'M10 4 16.500 15.500H3.500z';
  function rankMark(i) {
    let inner = '<rect width="20" height="20" rx="4" fill="#3F5232"/>';
    if (i < 4) { const n = i + 1, top = (20 - (n * 2.4 + (n - 1) * 1.6)) / 2; for (let k = 0; k < n; k++) inner += '<rect x="4" y="' + (top + k * 4).toFixed(1) + '" width="12" height="2.4" rx=".6" fill="#FFF6D6"/>'; }
    else if (i === 4) inner = '<rect width="20" height="20" rx="4" fill="#5F6F3E"/>' + RANK_CAMO.map(p => '<path d="' + p[0] + '" fill="' + p[1] + '"/>').join('');
    else inner = '<rect width="20" height="20" rx="4" fill="#FFC914"/><path d="' + RANK_TRI + '" fill="#14213D"/>';
    return '<svg class="rk" viewBox="0 0 20 20" aria-hidden="true">' + inner + '</svg>';
  }
  // 계급이 있으면 동그라미 글자와 초록 체크 대신 계급장을 쓴다(카카오 가입 뒤로는 글쓴이가 모두 인증이라 체크가 구분이 안 됨). 자료실·운영 계정은 예전 그대로
  const who = (nick, badge, rank) => '<span class="nick">' + (RANKS[rank] ? rankMark(rank) + '<b class="rkn">' + RANKS[rank].name + '</b>' : avatar(nick)) + '<span class="nn">' + esc(nick) + '</span>' + (RANKS[rank] && badge === 'dad' ? '' : vbadge(badge)) + '</span>';
  const nickKey = s => String(s).replace(/\s+/g, '').toLowerCase();
  const clean = (s, n) => String(s == null ? '' : s).replace(/\r\n?/g, '\n').trim().slice(0, n);
  // 닉네임 = 별명/거주지/자녀 출생연도 끝 2자리(11-05 운영자). server/app.js NICK_RE와 같게
  const NICK_RE = /^[가-힣A-Za-z0-9]{2,8}\/[가-힣]{2,6}\/\d{2}$/;
  function checkNick(nick) { if (!NICK_RE.test(nick)) return 'nick_form'; if (RESERVED.test(foldNick(nick))) return 'nick_reserved'; return ''; }
  const nickParts = s => { const m = String(s || '').match(/^([^/]+)\/([^/]+)\/(\d{2})$/); return m ? { name: m[1], place: m[2], year: m[3] } : { name: '', place: '', year: '' }; };
  function checkPost(p) { if (!CAT[p.cat]) return 'cat'; const t = len(p.title), b = len(p.body); if (t < LIM.title[0] || t > LIM.title[1]) return 'title_len'; if (b < LIM.body[0] || b > LIM.body[1]) return 'body_len'; return ''; }
  const ICON = {
    back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
    send: '<svg viewBox="0 0 24 24"><path d="M4 12 20 4l-4 16-4-7z"/></svg>',
    chat: '<svg viewBox="0 0 24 24"><path d="M4 5h16v11H9l-5 4z"/></svg>'
  };
  const LOGO = '<svg aria-hidden="true" viewBox="0 0 64 64"><rect width="64" height="64" rx="18" fill="#14213D"/><path transform="translate(4.5086 36.9683) scale(0.0208)" d="M678 -464H204Q121 -464 72.5 -508.5Q24 -553 24 -642Q24 -746 72 -786Q120 -826 204 -827H678Q767 -827 812.5 -786.5Q858 -746 858 -642Q858 -552 811 -507.5Q764 -463 678 -464ZM581 -653H301Q296 -653 294 -652Q292 -651 292 -644Q292 -637 294 -636Q296 -635 301 -635H581Q586 -635 588 -636Q590 -637 590 -644Q590 -651 588 -652Q586 -653 581 -653ZM869 -442V-244H743V-212H842V42H563V-1H32V-212H140V-244H14V-442ZM383 -212H500V-244H383Z M1692 -583H1755V-304H1692V42H1422V-822H1692ZM1395 -620V-199Q1396 -110 1336 -55.5Q1276 -1 1148 -1Q1065 -1 1008 -27Q951 -53 921.5 -97.5Q892 -142 891 -197V-617Q891 -671 920 -715.5Q949 -760 1006.5 -786Q1064 -812 1148 -812Q1232 -812 1286 -787Q1340 -762 1366.5 -719Q1393 -676 1395 -620ZM1157 -285V-528Q1157 -532 1155.5 -537Q1154 -542 1143 -542Q1133 -542 1131.5 -537Q1130 -532 1130 -528V-285Q1130 -282 1131.5 -277Q1133 -272 1143 -272Q1154 -272 1155.5 -277Q1157 -282 1157 -285Z M2439 -426H2408V-246H2237V-813H2408V-669H2439V-822H2619V-228H2439ZM1782 -795H2214V-313H1782ZM1989 -476H2007V-632H1989ZM2106 -286V-196H2628V42H1818V-286Z" fill="#FFFFFF" stroke="#14213D" stroke-width="33.3" stroke-linejoin="round"/><rect y="41.6" width="64" height="7.04" fill="#FFC914"/></svg>';   // 띠 로고 1(11-04 운영자 확정): 남색 타일 + 육아맨(Gasoek One, 두께 10% 줄임) + 노란 밑줄 띠. tools/make_logo.py가 구운 선 — icons/logo.svg · tools/build_icons.py와 같게
  const WORDMARK = '<svg aria-hidden="true" viewBox="0 0 308.8055 134"><path transform="translate(2.389 95.1669) scale(0.1151)" d="M678 -464H204Q121 -464 72.5 -508.5Q24 -553 24 -642Q24 -746 72 -786Q120 -826 204 -827H678Q767 -827 812.5 -786.5Q858 -746 858 -642Q858 -552 811 -507.5Q764 -463 678 -464ZM581 -653H301Q296 -653 294 -652Q292 -651 292 -644Q292 -637 294 -636Q296 -635 301 -635H581Q586 -635 588 -636Q590 -637 590 -644Q590 -651 588 -652Q586 -653 581 -653ZM869 -442V-244H743V-212H842V42H563V-1H32V-212H140V-244H14V-442ZM383 -212H500V-244H383Z M1692 -583H1755V-304H1692V42H1422V-822H1692ZM1395 -620V-199Q1396 -110 1336 -55.5Q1276 -1 1148 -1Q1065 -1 1008 -27Q951 -53 921.5 -97.5Q892 -142 891 -197V-617Q891 -671 920 -715.5Q949 -760 1006.5 -786Q1064 -812 1148 -812Q1232 -812 1286 -787Q1340 -762 1366.5 -719Q1393 -676 1395 -620ZM1157 -285V-528Q1157 -532 1155.5 -537Q1154 -542 1143 -542Q1133 -542 1131.5 -537Q1130 -532 1130 -528V-285Q1130 -282 1131.5 -277Q1133 -272 1143 -272Q1154 -272 1155.5 -277Q1157 -282 1157 -285Z M2439 -426H2408V-246H2237V-813H2408V-669H2439V-822H2619V-228H2439ZM1782 -795H2214V-313H1782ZM1989 -476H2007V-632H1989ZM2106 -286V-196H2628V42H1818V-286Z" fill="currentColor" style="stroke:var(--bg,#fff)" stroke-width="33.3" stroke-linejoin="round"/><rect y="110" width="308.8055" height="24" fill="#FFC914"/></svg>';   // 앱 바 글자 로고. 글자색은 currentColor, 깎는 선은 바탕색(--bg)

  // 앱 바 그림(11-04 운영자 "로고도 글씨니까 이상해서 … 아이 안고있는 행복한 아빠 이모지 같은걸로"). 글자 이모지는 기기마다 달라 직접 그렸다. 홈 화면 아이콘은 띠 로고 그대로
  const DAD = '<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M3 64v-6c0-11 8-18 19-18h6c11 0 19 7 19 18v6z" fill="#2F6FE0"/><circle cx="25" cy="22" r="15.5" fill="#FFD3A8"/><path d="M9.700 21c-.6-10 6.300-15.500 15.300-15.500 8.500 0 15.800 5.200 15.300 15.300-2.700-.2-4.800-3.800-5.700-6.300-3.600 2.800-13.300 3.300-19 1.700-1.400 1.700-3.300 4-5.900 4.800z" fill="#3B2A20"/><path d="M15.500 23.500c1.300-2 4-2 5.300 0M29.300 23.500c1.300-2 4-2 5.300 0" fill="none" stroke="#3B2A20" stroke-width="2" stroke-linecap="round"/><path d="M18.500 28c1.300 4.800 11.700 4.800 13 0z" fill="#fff" stroke="#3B2A20" stroke-width="1.600" stroke-linejoin="round"/><circle cx="14.500" cy="28" r="2.300" fill="#FFB199"/><circle cx="35.500" cy="28" r="2.300" fill="#FFB199"/><path d="M26 64c0-10 6-17 15-17h4c9 0 15 7 15 17z" fill="#FFD66B"/><circle cx="44" cy="39" r="11" fill="#FFE2C4"/><path d="M37 33.500c1.500-4.500 5.200-6 8-5.500-1 1.500-.6 3 .7 4-3 1.200-6 1.800-8.700 1.500z" fill="#3B2A20"/><path d="M38.800 39.500c.8-1.300 2.400-1.300 3.200 0M46 39.500c.8-1.300 2.400-1.300 3.200 0" fill="none" stroke="#3B2A20" stroke-width="1.700" stroke-linecap="round"/><path d="M41.300 43.500c1.300 2 4.100 2 5.400 0" fill="none" stroke="#3B2A20" stroke-width="1.600" stroke-linecap="round"/><path d="M20 64c1-5 8-8.500 16-8 5 .3 9.500 1.500 12 4.500 1.500 1.800-.3 3.500-2.200 3.500z" fill="#FFD3A8"/></svg>';
  // 글꼴은 화면을 막지 않게(index.html media=print → 여기서 all)
  (function () { const f = document.getElementById('fontcss'); if (f) requestAnimationFrame(() => { f.media = 'all'; }); })();
  // 사이트 아래 운영자 표시(11-13 운영자가 보낸 꼴 그대로: 운영 · 메일 · 사업자등록번호 · 개인정보처리방침). 모든 화면 아래에 한 번
  (function () {
    const ft = document.getElementById('sitefoot'); if (!ft) return;
    ft.innerHTML = '<span>운영 버추얼스쿨코리아</span> · <a href="mailto:virtualschoolkorea@gmail.com">virtualschoolkorea@gmail.com</a> · <span>사업자등록번호 465-09-03231</span> · <a href="terms.html">이용약관</a> · <a class="pp" href="privacy.html">개인정보처리방침</a>';
  })();
  // 다크 모드: 저장값 auto(기기 따름) · light · dark. <html data-theme>로 CSS가 바뀐다(검수 25)
  function applyTheme() {
    const pref = store.get('theme', 'auto');
    const dark = pref === 'dark' || (pref === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    const m = document.querySelector('meta[name=theme-color]'); if (m) m.setAttribute('content', dark ? '#141A26' : '#FFFBF0');
  }
  applyTheme();
  if (window.matchMedia) { const q = matchMedia('(prefers-color-scheme: dark)'); if (q.addEventListener) q.addEventListener('change', applyTheme); }

  // ----- 나(닉네임 + 기기 토큰) -----
  function randomToken() { const a = new Uint8Array(24); crypto.getRandomValues(a); let s = ''; a.forEach(b => { s += String.fromCharCode(b); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); }
  function token() { let t = store.get('token'); if (!t || !/^[A-Za-z0-9_-]{16,80}$/.test(t)) { t = randomToken(); store.set('token', t); } return t; }
  let me = store.get('me', null);
  function setMe(u) { me = u ? { id: u.id, nick: u.nick, created: u.created, verified: !!u.verified, role: u.role || 'user', how: u.how || '', blocked: !!u.blocked, kakao: !!u.kakao, naver: !!u.naver, terms: !!u.terms } : null; if (me) store.set('me', me); else { store.del('me'); store.del('rank'); } }
  const canWrite = () => me && !me.blocked && (me.verified || me.role === 'admin');
  const canRead = canWrite;   // 커뮤니티 읽기 자격은 쓰기와 같다
  const pub = u => ({ id: u.id, nick: u.nick, created: u.created, verified: !!u.verified, role: 'user', how: u.how || '', blocked: false, terms: true });
  // 차단 단추를 보일지: 나와 운영·자료실 계정의 글에는 없다(서버 blockUser와 같게)
  const canBlock = x => me && x.uid !== me.id && canWrite() && x.badge !== 'admin' && x.badge !== 'official';
  // 초대 링크(#/join/코드)의 코드는 이 기기에 남겨 둔다 — 주소가 #/me로 바뀌거나 새로고침해도 사라지지 않게(11-04 검수 6). 쓰이면 지운다.
  let pendingInvite = store.get('invite', '');
  let invitePrompted = false;          // 이번에 열어 둔 동안 초대 시트를 한 번만 자동으로 띄운다("둘러보기"를 눌렀는데 MY마다 다시 뜨지 않게)
  const keepInvite = code => { pendingInvite = code; store.set('invite', code); };
  const clearInvite = () => { pendingInvite = ''; store.del('invite'); };

  // ----- 서버 / 시험 모드 -----
  function ApiError(code, status) { this.name = 'ApiError'; this.code = code; this.status = status || 400; this.message = code; }
  ApiError.prototype = Object.create(Error.prototype);
  let mode = (!CFG.API_URL || location.protocol === 'file:') ? 'local' : 'server';
  // /api가 JSON이 아닌 것을 돌려줄 때 시험 모드로 바꾸는 것은 내 컴퓨터(정적 서버로 public/만 열었을 때)에서만. 운영 주소에서는 오류로 알린다.
  const DEV_HOST = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  function qs(p) { const u = new URLSearchParams(); Object.keys(p || {}).forEach(k => { if (p[k] !== '' && p[k] != null && p[k] !== false) u.set(k, p[k]); }); const s = u.toString(); return s ? '?' + s : ''; }
  const remote = {
    async call(method, path, body) {
      const headers = { Authorization: 'Bearer ' + token() };
      if (body) headers['Content-Type'] = 'application/json';
      const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 15000);
      let res;
      try { res = await fetch(CFG.API_URL + path, { method, headers, body: body ? JSON.stringify(body) : undefined, signal: ctl.signal, cache: 'no-store' }); }
      finally { clearTimeout(tm); }
      const ct = res.headers.get('Content-Type') || '';
      if (ct.indexOf('application/json') < 0) throw new ApiError('no_api', res.status);
      const data = await res.json();
      if (!data || !data.ok) { const er = new ApiError((data && data.error) || 'server', res.status); if (data && data.word) er.word = data.word; throw er; }
      return data;
    },
    listPosts: p => remote.call('GET', '/posts' + qs(p)),
    getPost: (id, first) => remote.call('GET', '/posts/' + id + (first ? '?v=1' : '')),     // first = 이 기기에서 처음 여는 질문(조회수 +1)
    join: (nick, invite) => remote.call('POST', '/join', { nick, invite, terms: true }),   // 화면이 동의 칸을 확인한 뒤에만 부른다
    agreeTerms: () => remote.call('POST', '/me/terms', { agree: true }),
    blockUser: id => remote.call('POST', '/blocks', { user_id: id }),
    unblockUser: id => remote.call('DELETE', '/blocks/' + id),
    reviewLogin: code => remote.call('POST', '/login/review', { code }),
    me: () => remote.call('GET', '/me'),
    rename: nick => remote.call('PATCH', '/me', { nick }),
    createPost: p => remote.call('POST', '/posts', p),
    deletePost: id => remote.call('DELETE', '/posts/' + id),
    addComment: (id, body) => remote.call('POST', '/posts/' + id + '/comments', { body }),
    deleteComment: id => remote.call('DELETE', '/comments/' + id),
    verifyCode: code => remote.call('POST', '/verify/code', { code }),
    verifyApply: b => remote.call('POST', '/verify/apply', b),
    createInvite: () => remote.call('POST', '/invites', {}),
    adminQueue: () => remote.call('GET', '/admin/queue'),
    adminDecide: (id, approve) => remote.call('POST', '/admin/decide', { id, approve }),
    adminUser: (user_id, action) => remote.call('POST', '/admin/user', { user_id, action }),
    adminInvites: (count, note) => remote.call('POST', '/admin/invites', { count, note }),
    recover: code => remote.call('POST', '/recover', { code }),
    recoveryNew: () => remote.call('POST', '/recovery/new', {}),
    logout: () => remote.call('POST', '/logout', {}),
    deleteMe: () => remote.call('DELETE', '/me', { confirm: true }),
    report: (kind, id, reason) => remote.call('POST', '/reports', { kind, id, reason }),
    seen: () => remote.call('POST', '/me/seen', {}),
    adminReport: (kind, id, action) => remote.call('POST', '/admin/report', { kind, id, action }),
    hotPosts: () => remote.call('GET', '/posts/hot'),
    qnaList: () => remote.call('GET', '/qna'),
    ask: b => remote.call('POST', '/qna', b),
    adminQna: b => remote.call('POST', '/admin/qna', b),
    verifyIdentity: id => remote.call('POST', '/verify/identity', { id }),
    kakaoStart: () => remote.call('GET', '/login/kakao/start'),
    kakaoLogin: (code, redirect_uri) => remote.call('POST', '/login/kakao', { code, redirect_uri }),
    kakaoLeave: (code, redirect_uri) => remote.call('POST', '/me/leave-kakao', { code, redirect_uri }),
    naverStart: () => remote.call('GET', '/login/naver/start'),
    naverLogin: (code, redirect_uri, state) => remote.call('POST', '/login/naver', { code, state, redirect_uri }),
    naverLeave: (code, redirect_uri, state) => remote.call('POST', '/me/leave-naver', { code, state, redirect_uri })
  };

  // 시험 모드: 견본 글 + 이 기기(localStorage). 서버와 같은 응답 꼴. 코드는 아무 글자나, 신청서는 바로 승인된다.
  const local = {
    db: null,
    load() { if (this.db) return this.db; let d = store.get('local'); if (!d || d.v !== 4) d = this.seed(); this.db = d; return d; },     // v4: 질문 주제로 바꾼 견본(11-12)
    seed() {
      const S = window.YK_SAMPLE || { users: [], posts: [], comments: [] };
      const at = h => new Date(Date.now() - (h || 0) * 3600e3).toISOString();
      const d = { v: 4, seq: { user: 100, post: 100, comment: 100 }, invites: [],
        users: S.users.map(u => ({ id: u.id, nick: u.nick, created: at(u.h), token: null, verified: true })),
        posts: S.posts.map(p => ({ id: p.id, user_id: p.user_id, cat: p.cat, age: p.age || '', title: p.title, body: p.body, created: at(p.h), deleted: null })),
        comments: S.comments.map(c => ({ id: c.id, post_id: c.post_id, user_id: c.user_id, body: c.body, created: at(c.h), deleted: null })) };
      store.set('local', d); return d;
    },
    save() { store.set('local', this.db); },
    u(uid) { return this.db.users.find(x => x.id === uid) || { nick: '?' }; },
    badge(uid) { return this.u(uid).verified ? 'dad' : ''; },
    user() { return this.load().users.find(u => u.token && u.token === token()) || null; },
    need() { const u = this.user(); if (!u) throw new ApiError('login', 401); return u; },
    needDad() { const u = this.need(); if (!u.verified) throw new ApiError('verify', 403); return u; },
    // 계급 점수: server/app.js POINTS와 같은 셈
    points(uid) {
      const d = this.db, live = d.posts.filter(p => !p.deleted), cs = d.comments.filter(c => !c.deleted && live.some(p => p.id === c.post_id)), owner = id => live.find(p => p.id === id).user_id;
      const kst = t => new Date(new Date(t).getTime() + 9 * 3600e3).toISOString().slice(0, 10), days = {}, cdays = {}, firsts = {};
      live.filter(p => p.user_id === uid).forEach(p => { const k = kst(p.created); days[k] = (days[k] || 0) + 1; });
      cs.filter(c => c.user_id === uid && owner(c.post_id) !== uid).forEach(c => { if (!firsts[c.post_id] || c.created < firsts[c.post_id]) firsts[c.post_id] = c.created; });
      Object.values(firsts).forEach(t => { const k = kst(t); cdays[k] = (cdays[k] || 0) + 1; });
      return Object.keys(days).reduce((s, k) => s + 3 * Math.min(days[k], 2), 0)
        + Object.keys(cdays).reduce((s, k) => s + 2 * Math.min(cdays[k], 5), 0)
        + new Set(cs.filter(c => c.user_id !== uid && owner(c.post_id) === uid).map(c => c.post_id + ':' + c.user_id)).size;
    },
    rank(uid) { return rankLevel(this.points(uid), serviceDays(this.u(uid).created)); },
    card(p) { const d = this.db; return { id: p.id, cat: p.cat, age: p.age || '', title: p.title, preview: p.body.slice(0, 140), created: p.created, comments: d.comments.filter(c => c.post_id === p.id && !c.deleted).length, nick: this.u(p.user_id).nick, uid: p.user_id, badge: this.badge(p.user_id), rank: this.rank(p.user_id) }; },
    async listPosts(p) {
      this.needDad();
      const d = this.load(), limit = p.limit || PAGE, words = String(p.q || '').toLowerCase().split(/\s+/).filter(Boolean);
      const bl = this.blocks();
      let rows = d.posts.filter(x => { if (x.deleted || bl.includes(x.user_id) || (p.cat && x.cat !== p.cat) || (p.age && x.age !== p.age) || (p.before && x.id >= p.before)) return false; const hay = (x.title + '\n' + x.body).toLowerCase(); return words.every(w => hay.indexOf(w) >= 0); }).sort((a, b) => b.id - a.id);
      const more = rows.length > limit; rows = rows.slice(0, limit);
      return { ok: true, posts: rows.map(x => this.card(x)), next: more ? rows[rows.length - 1].id : null };
    },
    async getPost(id) {
      this.needDad();
      const d = this.load(); const p = d.posts.find(x => x.id === id && !x.deleted); if (!p) throw new ApiError('not_found', 404);
      const bl = this.blocks(); if (bl.includes(p.user_id)) throw new ApiError('user_blocked', 403);
      const post = this.card(p); post.body = p.body;
      return { ok: true, post, comments: d.comments.filter(c => c.post_id === id && !c.deleted && !bl.includes(c.user_id)).map(c => ({ id: c.id, body: c.body, created: c.created, nick: this.u(c.user_id).nick, uid: c.user_id, badge: this.badge(c.user_id), rank: this.rank(c.user_id) })) };
    },
    async join(nick, invite) {
      const d = this.load(); const have = this.user(); if (have) return { ok: true, user: pub(have), existing: true };
      const bad = checkNick(nick); if (bad) throw new ApiError(bad);
      if (d.users.some(u => nickKey(u.nick) === nickKey(nick))) throw new ApiError('nick_taken', 409);
      const u = { id: d.seq.user++, nick, created: new Date().toISOString(), token: token(), verified: !!invite, how: invite ? 'invite' : '', recovery: this.newRec() }; d.users.push(u); this.save();
      return { ok: true, user: pub(u), recovery: u.recovery };
    },
    async report() { this.needDad(); return { ok: true }; },
    async seen() { return { ok: true }; },
    async agreeTerms() { return { ok: true, user: pub(this.need()) }; },
    // 차단: 서버 blockUser와 같은 뜻. 이 기기 시험 모드에서는 내가 차단한 번호만 둔다
    blocks() { const u = this.user(); return u ? (u.blocks || []) : []; },
    async blockUser(id) { const u = this.needDad(); u.blocks = this.blocks().filter(x => x !== id).concat(id); this.save(); return { ok: true }; },
    async unblockUser(id) { const u = this.need(); u.blocks = this.blocks().filter(x => x !== id); this.save(); return { ok: true }; },
    newRec() { const d = this.load(); d.seq.rec = (d.seq.rec || 0) + 1; return 'TEST-' + String(1000 + d.seq.rec) + '-RCVR'; },
    async recover(code) {
      const d = this.load(), c = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      const u = d.users.find(x => x.recovery && x.recovery.replace(/-/g, '') === c); if (!u) throw new ApiError('recovery_bad');
      u.token = token(); u.recovery = this.newRec(); this.save(); return { ok: true, user: pub(u), recovery: u.recovery };
    },
    async recoveryNew() { const u = this.need(); u.recovery = this.newRec(); this.save(); return { ok: true, recovery: u.recovery }; },
    async logout() { const u = this.need(); u.token = null; this.save(); return { ok: true }; },
    async deleteMe() {
      const u = this.need(), d = this.db, at = new Date().toISOString();
      d.posts.filter(p => p.user_id === u.id).forEach(p => { p.deleted = p.deleted || at; p.title = ''; p.body = ''; });
      d.comments.filter(c => c.user_id === u.id).forEach(c => { c.deleted = c.deleted || at; c.body = ''; });
      d.users = d.users.filter(x => x.id !== u.id); this.save(); return { ok: true };
    },
    async me() {
      const u = this.need(); const d = this.db;
      return { ok: true, user: pub(u), rank: this.rank(u.id), points: this.points(u.id), days: serviceDays(u.created), ref: u.verified ? { code: 'TEST-REF0', joined: 0, counted: 0 } : null, application: null, blocks: this.blocks().map(id => ({ id, nick: this.u(id).nick })), invites: d.invites, invite_max: 3,
        posts: d.posts.filter(p => p.user_id === u.id && !p.deleted).sort((a, b) => b.id - a.id).map(p => this.card(p)),
        comments: d.comments.filter(c => c.user_id === u.id && !c.deleted).sort((a, b) => b.id - a.id)
          .map(c => { const p = d.posts.find(x => x.id === c.post_id && !x.deleted); return p ? { id: c.id, body: c.body, created: c.created, post_id: c.post_id, post_title: p.title } : null; }).filter(Boolean) };
    },
    async rename(nick) { const u = this.need(); const bad = checkNick(nick); if (bad) throw new ApiError(bad); if (this.db.users.some(x => x.id !== u.id && nickKey(x.nick) === nickKey(nick))) throw new ApiError('nick_taken', 409); u.nick = nick; this.save(); return { ok: true, user: pub(u) }; },
    async createPost(p) {
      const u = this.needDad(); const bad = checkPost(p); if (bad) throw new ApiError(bad); const d = this.db;
      const post = { id: d.seq.post++, user_id: u.id, cat: p.cat, age: AGE[p.age] ? p.age : '', title: p.title, body: p.body, created: new Date().toISOString(), deleted: null }; d.posts.push(post); this.save();
      const c = this.card(post); c.body = post.body; return { ok: true, id: post.id, post: c };
    },
    async deletePost(id) { const u = this.need(); const p = this.db.posts.find(x => x.id === id && !x.deleted); if (!p) throw new ApiError('not_found', 404); if (p.user_id !== u.id) throw new ApiError('forbidden', 403); p.deleted = new Date().toISOString(); this.save(); return { ok: true }; },
    async addComment(id, body) {
      const u = this.needDad(); body = clean(body, 2000); if (len(body) < 1 || len(body) > LIM.comment[1]) throw new ApiError('comment_len');
      const d = this.db; if (!d.posts.find(x => x.id === id && !x.deleted)) throw new ApiError('not_found', 404);
      const c = { id: d.seq.comment++, post_id: id, user_id: u.id, body, created: new Date().toISOString(), deleted: null }; d.comments.push(c); this.save();
      return { ok: true, comment: { id: c.id, body, created: c.created, nick: u.nick, uid: u.id, badge: 'dad', rank: this.rank(u.id) } };
    },
    async deleteComment(id) { const u = this.need(); const c = this.db.comments.find(x => x.id === id && !x.deleted); if (!c) throw new ApiError('not_found', 404); if (c.user_id !== u.id) throw new ApiError('forbidden', 403); c.deleted = new Date().toISOString(); this.save(); return { ok: true }; },
    async verifyCode(code) { const u = this.need(); if (String(code || '').replace(/[^A-Za-z0-9]/g, '').length < 4) throw new ApiError('code_bad'); u.verified = true; u.how = 'invite'; this.save(); return { ok: true, user: pub(u) }; },
    async verifyApply() { const u = this.need(); u.verified = true; u.how = 'apply'; this.save(); return { ok: true, user: pub(u), instant: true }; },
    async createInvite() { this.needDad(); const d = this.db; if (d.invites.length >= 3) throw new ApiError('invite_max'); const c = { code: 'TEST-' + String(1000 + d.invites.length), used: false }; d.invites.push(c); this.save(); return { ok: true, invite: c }; },
    async hotPosts() {
      this.needDad(); const d = this.load();
      const heat = p => new Set(d.comments.filter(c => c.post_id === p.id && !c.deleted && c.user_id !== p.user_id).map(c => c.user_id)).size;
      return { ok: true, posts: d.posts.filter(p => !p.deleted && !this.blocks().includes(p.user_id) && heat(p) >= 2).sort((a, b) => heat(b) - heat(a) || b.id - a.id).slice(0, 3).map(p => this.card(p)) };
    },
    async qnaList() { return { ok: true, items: [] }; },
    async ask() { return { ok: true }; }
  };

  async function api(name) {
    const args = Array.prototype.slice.call(arguments, 1);
    if (mode === 'local') { if (!local[name]) throw new ApiError('server'); return local[name].apply(local, args); }
    try { return await remote[name].apply(remote, args); }
    catch (e) { if (e && e.code === 'no_api' && DEV_HOST) { setMode('local'); if (!local[name]) throw new ApiError('server'); return local[name].apply(local, args); } throw e; }
  }
  function setMode(m) { if (mode === m) return; mode = m; if (m === 'local') { const u = local.user(); setMe(u ? pub(u) : null); } }
  const identityOn = () => !!(CFG.IDENTITY && CFG.IDENTITY.storeId && CFG.IDENTITY.channelKey) && mode === 'server';
  // 로그인 입구. NAVER_LOGIN을 켜면 네이버가 그 자리에 들어가고, 안 켜면 지금까지처럼 카카오다
  const socialOn = () => !!(CFG.NAVER_LOGIN || CFG.KAKAO_LOGIN) && mode === 'server';
  const loginKind = () => (CFG.NAVER_LOGIN ? 'naver' : 'kakao');
  const LN = () => (CFG.NAVER_LOGIN ? '네이버' : '카카오');
  const startWord = () => (CFG.NAVER_LOGIN ? '네이버 로그인' : '카카오로 시작하기');
  const GENDER_HINT = '<small class="hint">남성 계정만 가입 가능. 성별은 확인만 하고 저장하지 않음.</small>';
  const KAKAO_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.9 5.2 4.700 6.600l-1 3.600c-.1.300.3.600.6.400l4.200-2.800c.5.100 1 .1 1.500.1 5.500 0 10-3.500 10-7.900S17.500 3 12 3z"/></svg>';
  const NAVER_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16.3 12.8 7.400 3H3v18h4.700v-9.800L16.600 21H21V3h-4.700z"/></svg>';
  const joinWord = () => socialOn() ? (me ? LN() + ' 연결하기' : startWord()) : (me ? '아빠 인증하기' : '시작하기');
  const loginBtn = (id, label) => '<button type="button" class="btn ' + loginKind() + '" id="' + id + '">' + (CFG.NAVER_LOGIN ? NAVER_ICON : KAKAO_ICON) + '<span>' + label + '</span></button>';
  // 동의 화면으로 갔다가 이 주소로 돌아온다(?code=…&state=…). 어디로 갔는지와 state를 기기에 남겨 두고, 돌아오면 시작 부분에서 마무리한다. again이면 네이버 동의 항목을 다시 묻는다
  async function startLogin(purpose, kind, again) {
    const k = kind || loginKind(), r = await api(k + 'Start');
    const state = randomToken().slice(0, 24);
    store.set('loginState', { kind: k, state, purpose: purpose || 'login', back: location.hash || '#/' });
    location.href = r.url + '&redirect_uri=' + encodeURIComponent(location.origin + '/') + '&state=' + encodeURIComponent(state) + (again ? '&auth_type=reprompt' : '');
  }
  const loginGo = () => { startLogin().catch(e => fail(e)); };
  const kakaoOldGo = () => { startLogin('login', 'kakao').catch(e => fail(e)); };   // 네이버로 바꾸기 전에 카카오로 가입한 회원의 입구
  // 네이버 계정 성별이 남성이 아니거나(naver_not_dad) 성별을 받지 못했을 때(naver_gender)
  function openNotDad(code) {
    const again = code === 'naver_gender';
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="' + MSG[code] + '"><div class="grip"></div><h2>' + MSG[code] + '</h2>'
      + '<p>' + (again ? '남성 회원만 가입 가능해 성별 확인 필수. 확인만 하고 저장하지 않음.' : '육아맨 질문게시판은 네이버 계정 성별이 남성인 회원만 가입 가능. 받은 정보는 저장하지 않음. 가이드 · 계산기 · 자료실은 가입 없이 보기 가능.') + '</p>'
      + (again ? '<div style="margin-top:16px">' + loginBtn('ndAgain', '다시 동의하기') + '</div>' : '')
      + '<button type="button" class="btn ghost" id="ndNo">닫기</button></div>');
    const g = $('#ndAgain'); if (g) g.addEventListener('click', () => { startLogin('login', 'naver', true).catch(e => fail(e)); });
    $('#ndNo').addEventListener('click', closeSheet);
  }
  async function finishLogin(kind, purpose, code, state) {
    const red = location.origin + '/';
    try {
      if (purpose === 'leave') { await api(kind + 'Leave', code, red, state); forgetDevice(); toast('탈퇴 완료. 그동안 감사했습니다'); go('#/', true); render(); return; }
      const r = await api(kind + 'Login', code, red, state);
      if (r.need_nick) { openSheet(() => render(), 'social'); return; }
      setMe(r.user); toast('환영합니다, ' + r.user.nick + '님!'); render();
    } catch (e) {
      if (e && (e.code === 'naver_not_dad' || e.code === 'naver_gender')) { render(); openNotDad(e.code); return; }
      toast(errText(e), 'err'); render();
    }
  }

  // ----- 알림 -----
  let toastTimer = 0;
  // 누른 수 세기(11-12 운영자 "상품 구매를 유도하도록 … 고쳐서"): 육아템으로 가는 단추(data-cta)와 판매처로 나가는 상품 링크를 날짜별 숫자로만 센다(server /api/count).
  // 누가 눌렀는지는 보내지 않는다. 시험 모드에서는 세지 않는다. 세지 못해도 화면은 그대로 간다
  function countHit(e, k) {
    if (mode !== 'server' || !CFG.API_URL || !k) return;
    try {
      const body = JSON.stringify({ e, k: String(k).slice(0, 120) });
      if (navigator.sendBeacon) navigator.sendBeacon(CFG.API_URL + '/count', new Blob([body], { type: 'application/json' }));
      else fetch(CFG.API_URL + '/count', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
    } catch (err) { /* 그대로 간다 */ }
  }
  function toast(msg, kind) { const t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (kind ? ' ' + kind : ''); clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.className = 'toast'; }, 2600); }
  // 진급 알림: 이 기기에서 마지막으로 본 계급보다 오르면 한 번. 알렸으면 true. 처음 보는 기기는 조용히 적어만 둔다
  function noteRank(level) {
    if (!RANKS[level]) return false;
    const seen = store.get('rank', null);
    store.set('rank', level);
    if (seen === null || level <= seen) return false;
    toast(RANKS[level].name + ' 진급! ' + RANKS[level].line);     // 외출증은 접어 두었다(11-12 운영 방향, drawPass 코드는 남김)
    return true;
  }
  function fail(e, after) {
    let code = 'server';
    if (e && e.name === 'ApiError') code = e.code; else if (e && (e.name === 'AbortError' || e.name === 'TypeError')) code = 'network';
    if (code === 'unknown_user') { setMe(null); toast(socialOn() ? MSG.logged_out : MSG.unknown_user, 'err'); openSheet(after); return; }
    if (code === 'login') { openSheet(after); return; }
    if (code === 'verify') { if (me) { me.verified = false; store.set('me', me); } openVerify(after); return; }
    if (code === 'terms') { openTerms(after); return; }
    toast(code === 'bad_word' && e.word ? '"' + e.word + '" 같은 말은 사용 불가. 고쳐서 다시 올리기' : MSG[code] || MSG.server, 'err');
    if (window.console && (code === 'server' || code === 'no_api')) console.warn('yukaman', e);
  }
  // 서버가 커뮤니티 읽기를 막았을 때(인증 해제·막힘·모르는 기기): 내 정보를 맞추고 true를 돌려준다. 화면은 잠금으로 바꾼다.
  function readDenied(e) {
    const code = e && e.code;
    if (code === 'verify') { if (me) { me.verified = false; store.set('me', me); } return true; }
    if (code === 'blocked') { if (me) { me.blocked = true; store.set('me', me); } return true; }
    if (code === 'unknown_user') { setMe(null); return true; }
    return code === 'login';
  }
  const errText = e => { const code = e && e.code; return MSG[code] || (e && e.name === 'TypeError' ? MSG.network : MSG.server); };
  const empty = (title, sub) => '<div class="empty"><div class="big">🍼</div>' + esc(title) + (sub ? '<br><span style="font-weight:600;font-size:13px">' + esc(sub) + '</span>' : '') + '</div>';
  const mockBadge = () => '<div class="mock" id="mockBadge"><span>🧪</span><span>시험 모드. 질문게시판 글은 지어낸 견본이고, 쓴 글은 이 기기에만 저장.</span></div>';

  // ----- 화면 틀 -----
  const view = $('#view'), appbar = $('#appbar'), app = $('#app'), fab = $('#fab');
  const bar = h => { appbar.innerHTML = h; appbar.classList.toggle('isbrand', h.indexOf('class="brand"') >= 0); };
  // PC 화면(11-06 운영자 "A안으로 제작해줘"): 창 폭 1100px부터 왼쪽 메뉴, 1280px부터 오른쪽 칸. 그보다 좁으면 지금까지의 폰 화면 그대로
  const WIDE = window.matchMedia('(min-width: 1100px)'), RAILED = window.matchMedia('(min-width: 1280px)');
  const isWide = () => WIDE.matches, hasRail = () => RAILED.matches;
  // 부제는 11-04 운영자 말씀. 오른쪽 단추가 있는 화면(커뮤니티)은 자리가 좁아 두 줄로 접는다
  const brandBar = () => '<div class="brand"><span class="logo">' + DAD + '</span><span class="wm" role="img" aria-label="육아맨">' + WORDMARK + '</span><span class="tagline"><span>아빠 육아의</span> <span>모든 정보</span></span></div><div class="fill"></div>';
  const backBtn = to => '<button class="circ" data-back="' + esc(to) + '" aria-label="뒤로">' + ICON.back + '</button>';
  // 탭 제목(11-05 운영자 "상단에 이런 제목부분이 눈에 잘 안띄어. 심지어 홈 탭에는 이런 제목도 없어"): 노란 띠 + 그림 타일 + 큰 제목. right = 오른쪽 단추
  const pageHead = (e, t, sub, right) => '<header class="phead"><span class="pe" aria-hidden="true">' + e + '</span><div class="tx"><h1>' + esc(t) + '</h1>' + (sub ? '<p>' + esc(sub) + '</p>' : '') + '</div>' + (right || '') + '</header>';
  function setTab(name) { $$('.tab').forEach(t => t.classList.toggle('on', t.dataset.tab === name)); }
  function go(h, replace) { if (replace) { if (location.hash !== h) navReplace = true; location.replace(h); } else location.hash = h; }
  // 앱 안에서 지나온 주소를 기억한다. 시스템 뒤로 가기로 돌아와도 어긋나지 않고, 앱 첫 화면이면 밖으로 나가는 대신 목록으로 간다.
  const navStack = [location.hash];
  let navReplace = false;
  function trackNav() {
    const h = location.hash;
    if (navReplace) { navReplace = false; navStack[navStack.length - 1] = h; return; }
    if (navStack.length > 1 && navStack[navStack.length - 2] === h) navStack.pop(); else navStack.push(h);
  }
  function back(to) { if (navStack.length > 1) history.back(); else go(to, true); }
  // 늦게 온 응답이 지금 화면을 덮어쓰지 않게 화면마다 번호를 둔다
  let renderSeq = 0;

  function parse() {
    const s = location.hash.replace(/^#\/?/, '').split('/').map(x => { try { return decodeURIComponent(x); } catch (e) { return x; } });
    if (s[0] === 'guide' && s[1] === 'age' && AGE[s[2]]) return { name: 'guideage', key: s[2] };
    if (s[0] === 'guide') return { name: 'guide', cat: s[1] && GCAT[s[1]] ? s[1] : '' };
    if (s[0] === 'g' && s[1]) return { name: 'garticle', id: s[1] };
    if (s[0] === 'calc' && s[1] === 'dates') return { name: 'home' };     // 옛 '내 아이 날짜' 주소(11-13 뺌)는 홈의 '지금 챙길 것'으로
    if (s[0] === 'calc') return { name: 'calc', tab: CALC_TABS.some(t => t.key === s[1]) ? s[1] : 'leave' };
    if (s[0] === 'library') return { name: 'library' };
    if (s[0] === 'shop') return { name: 'shop', cat: s[1] && SHOP_CAT[s[1]] ? s[1] : '', sub: s[2] || '' };
    if (s[0] === 'community') return { name: 'community', cat: s[1] && CAT[s[1]] ? s[1] : '' };
    if (s[0] === 'p' && /^\d+$/.test(s[1] || '')) return { name: 'post', id: +s[1] };
    if (s[0] === 'write') return { name: 'write' };
    if (s[0] === 'me') return { name: 'me' };
    if (s[0] === 'join') return { name: 'join', code: s[1] || '' };
    if (s[0] === 'admin') return { name: 'admin' };
    if (s[0] === 'terms') return { name: 'legal', kind: 'terms' };
    if (s[0] === 'privacy') return { name: 'legal', kind: 'privacy' };
    return { name: 'home' };
  }
  async function render() {
    const r = parse();
    renderSeq++;
    closeSheet(); app.classList.remove('notab', 'composing'); fab.hidden = true;
    paintShell(r);
    try {
      if (r.name === 'home') await renderHome();
      else if (r.name === 'guide') renderGuide(r.cat);
      else if (r.name === 'guideage') renderGuideAge(r.key);
      else if (r.name === 'garticle') renderGuideItem(r.id);
      else if (r.name === 'calc') renderCalc(r.tab);
      else if (r.name === 'library') await renderLibrary();
      else if (r.name === 'shop') renderShop(r.cat, r.sub);
      else if (r.name === 'community') await renderCommunity(r.cat);
      else if (r.name === 'post') await renderPost(r.id);
      else if (r.name === 'write') renderWrite();
      else if (r.name === 'me') await renderMe();
      else if (r.name === 'admin') await renderAdmin();
      else if (r.name === 'legal') renderLegal(r.kind);
      else if (r.name === 'join') { if (r.code) { keepInvite(r.code); invitePrompted = false; } go('#/me', true); }
    } catch (e) { fail(e); }
  }
  window.addEventListener('hashchange', () => { trackNav(); render(); });

  // ----- 계산기 공통 상태(이 기기에만 저장) -----
  const CALC_TABS = [
    { key: 'leave', name: '육아휴직 급여', e: '💰' },
    { key: 'reduce', name: '단축근무 급여', e: '⏰' },
    { key: 'paternity', name: '배우자 출산휴가', e: '🏥' }
    // '내 아이 날짜'는 뺐다(11-13 운영자: 홈 '지금 챙길 것'과 겹침). 그 표에만 있던 BCG · 건강검진 1차는 홈으로 옮겼고, 옛 주소 #/calc/dates는 홈으로 간다
  ];
  const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  // 기본 시작일: 회사 신청 기한(30일 전)이 아직 남은 가장 가까운 1일(11-04 검수 9 — 다음 달 1일로 두면 이미 지난 기한을 챙기라고 한다)
  function nextFirst() { const d = new Date(); let t = new Date(d.getFullYear(), d.getMonth() + 1, 1); if ((t - d) / 86400000 < 31) t = new Date(d.getFullYear(), d.getMonth() + 2, 1); return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-01'; }
  const calcS = Object.assign({ job: '', pay: 350, bong: 300, cMonths: 12, cMode: 'general', cLonger: false, start: nextFirst(), months: 12, end: '', mode: 'general', spouseMonths: 6, used: 0, spousePay: '', company: '', birth: '', due: '', before: 40, after: 30, rMonths: 12, priority: true, days: 20 }, store.get('calc', {}));
  if (!calcS.spouseJob) calcS.spouseJob = calcS.spouseInsured === false ? 'none' : 'worker';   // 옛 저장값(고용보험 가입 여부) 옮기기
  delete calcS.spouseInsured;
  if (calcS.job === 'private') calcS.job = '';                  // 잠깐 있던 값. 교원과 직원으로 나눴다
  if (!K.parse(calcS.start)) calcS.start = nextFirst();
  if (!K.parse(calcS.end)) calcS.end = K.addDays(K.addMonths(calcS.start, 12), -1);
  // 아이가 둘 이상일 때(11-05 운영자 "아이가 2명 이상인 경우에는 어떻게 해야돼?" · "추천안대로"): calcS.birth·due는 '지금 고른 아이'의 날짜라 계산기는 그대로 따른다. 아이별 날짜는 kids에 둔다(이 기기에만)
  if (!Array.isArray(calcS.kids) || !calcS.kids.length) { calcS.kids = [{ birth: calcS.birth, due: calcS.due }]; calcS.kid = 0; }
  if (!calcS.kids[calcS.kid]) { calcS.kid = 0; calcS.birth = calcS.kids[0].birth; calcS.due = calcS.kids[0].due; }
  const saveCalc = () => { calcS.kids[calcS.kid] = { birth: calcS.birth, due: calcS.due }; store.set('calc', calcS); };
  const toWon = v => Math.round((parseFloat(v) || 0) * 10000);

  // 홈·가이드의 계산기 카드: 월급만 넣으면 바로 계산된다(일반 12개월). 자세히는 #/calc/leave
  function quickCalc(man) { const s = '2027-01-01'; return K.leaveBenefit({ ordinary: toWon(man), start: s, end: K.addDays(K.addMonths(s, 12), -1) }); }
  // 직종(11-04 재검토 + 운영자 "전부다 해당이 안되면 선택에 무슨 의미가 있지? 차라리 관련 정보를 보여주거나 이동하는 버튼"). 고르면 그 직종에 맞는 계산이나 정보·이동 단추가 나온다
  const JOBS = [
    { key: 'worker', name: '회사원·계약직·공무직' },
    { key: 'civil', name: '공무원·국공립 교원' },
    { key: 'pteacher', name: '사립학교 교원' },
    { key: 'pstaff', name: '사립학교 직원' },
    { key: 'self', name: '자영업·프리랜서' },
    { key: 'unknown', name: '잘 모르겠음' }
  ];
  // 어떤 직종 기준인지 눈에 띄게(11-05 운영자 "어떤 근로자 기준인지 더 가시적으로")
  const JOB_LINE = { worker: { e: '👔', t: '회사원·계약직·공무직', s: '고용보험 근로자 기준' }, civil: { e: '🏛️', t: '공무원·국공립 교원', s: '공무원수당 규정 기준' }, pteacher: { e: '🏫', t: '사립학교 교원', s: '국공립 교원 규정 준용' } };
  const isCivilJob = () => calcS.job === 'civil' || calcS.job === 'pteacher';
  const JOB_NOTE = {
    pstaff: { t: '사립학교 직원은 학교 규정 먼저 확인', p: '사학연금 적용 대상은 고용보험 대상 아님. 육아휴직은 남녀고용평등법대로 사용 가능, 돈은 법령에 정한 금액 없이 학교법인 내부 규정을 따름. 학교 행정실에 육아휴직수당 규정 문의.',
      go: [{ t: '직종별 안내 보기', h: '#/g/leave-job' }, { t: '육아휴직 신청 순서 보기', h: '#/g/leave-apply' }] },
    self: { t: '자영업·프리랜서는 육아휴직 급여 대상 아님', p: '근로자가 아니면 고용보험에 가입했어도 육아휴직과 급여 대상 아님(고용노동부 답변). 대신 직종과 상관없이 받는 돈 있음.',
      go: [{ t: '직종 상관없이 받는 돈: 부모급여·첫만남이용권·아동수당', h: '#/g/birth-2weeks' }, { t: '서울 1인 자영업 아빠 출산휴가급여', h: '#/g/leave-job' }, { t: '지역 아빠 장려금 찾기(자료실)', h: '#/library' }, { t: '실제로 회사 지시를 받고 일했다면 1350에 전화', h: 'tel:1350' }] },
    unknown: { t: '급여명세서에서 찾아 누르기', p: '',
      pick: [{ t: '고용보험료 있음', j: 'worker' }, { t: '공무원연금 있음', j: 'civil' }, { t: '사학연금 있음 · 교사', j: 'pteacher' }, { t: '사학연금 있음 · 행정직원', j: 'pstaff' }, { t: '세금 3.3%만 뗌', j: 'self' }],
      go: [{ t: '고용24에서 내 고용보험 가입 이력 보기', h: 'https://www.work24.go.kr/', out: true }, { t: '그래도 모르면 1350에 전화', h: 'tel:1350' }] }
  };
  function jobBox() {
    const JL = JOB_LINE[calcS.job];
    if (JL) return '<div class="jobline"><span class="je" aria-hidden="true">' + JL.e + '</span><span class="tx"><b>' + esc(JL.t) + '</b><small>' + esc(JL.s) + '</small></span><button type="button" data-job="">직종 바꾸기</button></div>';
    const n = JOB_NOTE[calcS.job];
    const goes = list => (list || []).map(g => '<a class="jobgo" href="' + esc(g.h) + '"' + (g.out ? ' target="_blank" rel="noopener"' : '') + '><span>' + esc(g.t) + '</span><i>›</i></a>').join('');
    return '<div class="jobs"><b>직종 고르기</b><small>직종마다 받는 곳과 금액이 다름.</small>'
      + '<div class="catpick" role="group" aria-label="직종">' + JOBS.map(j => '<button type="button" class="chip' + (j.key === calcS.job ? ' on' : '') + '" data-job="' + j.key + '" aria-pressed="' + (j.key === calcS.job) + '">' + esc(j.name) + '</button>').join('') + '</div>'
      + (n ? '<div class="jobnote"><b>' + esc(n.t) + '</b>' + (n.p ? '<p>' + esc(n.p) + '</p>' : '')
        + (n.pick || []).map(x => '<button type="button" class="jobgo" data-job="' + x.j + '"><span>' + esc(x.t) + '</span><i>›</i></button>').join('') + goes(n.go) + '</div>' : '') + '</div>';
  }
  // 공무원·교원 수당 어림(카드용). 12개월
  const civilQuick = man => K.civilBenefit({ bong: toWon(man), months: 12 });
  const civilTotal = man => (toWon(man) ? won(civilQuick(man).total) : '—');
  // 달마다 받는 돈은 문장으로 잇지 않고 줄로 나눈다(11-04 운영자 "글자수도 너무 많고")
  const qrows = m => '<span class="qrows">' + [['1~3개월', m[0]], ['4~6개월', m[1]], ['7개월부터', m[2]]].map(x => '<span><i>' + x[0] + '</i><b>월 ' + won(x[1]) + '</b></span>').join('') + '</span>';
  function civilNote(man) {
    if (!toWon(man)) return '수당을 뺀 봉급을 넣으면 바로 계산.';
    const r = civilQuick(man);
    return qrows([r.rows[0].paid, r.rows[3].paid, r.rows[6].paid]);
  }
  // 달마다 받는 돈을 함께 보여 준다. 월 250만원을 넘으면 상한에 걸려 총액이 같으니, 고장처럼 보이지 않게 까닭을 적는다
  function quickNote(man) {
    if (!toWon(man)) return '월 통상임금을 넣으면 바로 계산.';
    const r = quickCalc(man);
    return qrows([r.rows[0].paid, r.rows[3].paid, r.rows[6].paid]) + (toWon(man) >= 2500000 ? notes(['월급이 더 많아도 법정 상한으로 금액 동일']) : '');
  }
  const quickTotal = man => (toWon(man) ? won(quickCalc(man).total) : '—');     // 0원이면 하한 70만원으로 계산된 840만원이 나와 버리니 비워 둔다
  const W24_SIM = 'https://m.work24.go.kr/cm/c/f/1100/selecSimulate12.do?systClId=SC00000251&systId=SI00000402';
  const MPM_LEAVE = 'https://www.mpm.go.kr/mpm/info/infoBiz/bizHr05/';
  // 이 계산이 어디서 나왔는지 밝힌다(운영자 "이게 고용24에서 직접 제공하는거야?"). 고용24 것이 아니라 육아맨이 법령 숫자로 만든 어림이다
  function calcSource(civil) {
    if (!civil) return notes(['법령 숫자로 만든 육아맨 어림값(고용24 제공 아님)', '고용보험 가입 180일 이상만 수급', '실제 금액은 고용센터 결정']) + '<a class="offi" href="' + W24_SIM + '" target="_blank" rel="noopener">고용24 공식 모의계산 열기</a>';
    return notes(['수당 규정 숫자로 만든 육아맨 어림값', '실제 금액은 소속 기관 결정']) + '<a class="offi" href="' + MPM_LEAVE + '" target="_blank" rel="noopener">인사혁신처 공무원 휴직 안내 열기</a>';
  }
  function calcCard() {
    const civil = isCivilJob(), worker = calcS.job === 'worker';
    const head = '<div class="gcalc" id="qcalc"><div class="top"><b>💰 ' + (civil ? '육아휴직 수당 계산기' : '육아휴직 급여 계산기') + '</b>' + (worker || civil ? '<a class="fold" href="#/calc/leave">자세히</a>' : '') + '</div>';
    if (!worker && !civil) return head + '<div class="big">' + jobBox() + '</div></div>';
    const v = civil ? calcS.bong : calcS.pay;
    return head + '<div class="big">' + jobBox() + '<label class="qpay">' + (civil ? '내 월봉급액' : '내 월 통상임금') + ' <input id="qPay" type="number" inputmode="decimal" min="0" max="3000" step="10" value="' + esc(v) + '" aria-label="' + (civil ? '월봉급액' : '월 통상임금') + '(만원)"> 만원</label>'
      + '<strong id="qTotal">' + (civil ? civilTotal(v) : quickTotal(v)) + '</strong><em>' + (civil ? '12개월 쉴 때 수당 어림' : '부부 중 한 사람만 12개월 쉴 때 어림') + '</em><div class="qnote" id="qNote">' + (civil ? civilNote(v) : quickNote(v)) + '</div>'
      + calcSource(civil) + '</div></div>';
  }
  function bindCalcCard() {
    const box = $('#qcalc'); if (!box) return;
    box.addEventListener('click', ev => { const b = ev.target.closest('[data-job]'); if (!b) return; calcS.job = b.dataset.job; saveCalc(); box.outerHTML = calcCard(); bindCalcCard(); });
    const p = $('#qPay'); if (!p) return;
    p.addEventListener('input', () => {
      const v = parseFloat(p.value) || 0;
      if (isCivilJob()) { calcS.bong = v; $('#qTotal').textContent = civilTotal(v); $('#qNote').innerHTML = civilNote(v); }
      else { calcS.pay = v; $('#qTotal').textContent = quickTotal(v); $('#qNote').innerHTML = quickNote(v); }
      saveCalc();
    });
  }

  // ----- 홈 -----
  // 내 아이 나이로 보기(검수 11). 고른 값은 이 기기에만. ids = 지금 쓸 수 있는 글
  const AGES = [
    { key: 'expect', name: '출산 전', ids: ['policy-pregnancy', 'policy-paternity', 'leave-66', 'leave-apply', 'ivf-leave', 'mind-sibling'] },
    { key: 'baby', name: '0~18개월', ids: ['birth-2weeks', 'policy-paternity', 'leave-66', 'leave-apply', 'policy-shorter-hours', 'baby-care', 'mind-dad-blues', 'play-0-12', 'mind-sleep', 'mind-leave-self', 'mind-mom-only'] },
    { key: 'kid', name: '미취학', ids: ['leave-apply', 'leave-short', 'policy-shorter-hours', 'family-care', 'play-weekend', 'mind-anger', 'mind-mom-only', 'mind-sibling', 'mind-return'] },
    { key: 'low', name: '초1~2', ids: ['leave-apply', 'leave-short', 'policy-shorter-hours', 'family-care', 'play-school', 'mind-compare'] },
    { key: 'high', name: '초3~6', ids: ['policy-shorter-hours', 'family-care', 'play-school', 'mind-anger', 'leave-rights', 'mind-teen'] },
    { key: 'teen', name: '중학생~', ids: ['family-care', 'policy-shorter-hours', 'mind-couple', 'mind-teen'] }
  ];
  const AGE = {}; AGES.forEach(a => { AGE[a.key] = a; });
  // 홈 '아이 나이 길'(UI 3안, 11-04 운영자 선택): '우리 아이'에 넣은 생일·예정일(이 기기에만, 계산기와 같은 값)로 나이 칸을 맞추고, 직접 고른 값이 있으면 그것을 쓴다
  const daysTo = s => { const t = K.parse(s); return t == null ? null : Math.round((t - K.parse(todayStr())) / 86400000); };
  const kidDates = () => ({ birth: K.parse(calcS.birth) != null ? calcS.birth : '', due: K.parse(calcS.due) != null ? calcS.due : '' });
  function kidMonths(birth) { const b = new Date(K.parse(birth)), t = new Date(K.parse(todayStr())); return (t.getUTCFullYear() - b.getUTCFullYear()) * 12 + (t.getUTCMonth() - b.getUTCMonth()) - (t.getUTCDate() < b.getUTCDate() ? 1 : 0); }
  function ageKeyAuto() {
    const k = kidDates();
    if (!k.birth) return k.due && daysTo(k.due) >= 0 ? 'expect' : '';
    const months = kidMonths(k.birth);
    if (months < 0) return 'expect';
    if (months < 18) return 'baby';
    // 초등학교는 만 6세가 되는 해의 다음 해 3월 입학(계산기와 같은 기준). 학년도는 3월에 시작한다
    const b = new Date(K.parse(k.birth)), t = new Date(K.parse(todayStr()));
    const grade = (t.getUTCMonth() >= 2 ? t.getUTCFullYear() : t.getUTCFullYear() - 1) - (b.getUTCFullYear() + 7) + 1;
    return grade < 1 ? 'kid' : grade <= 2 ? 'low' : grade <= 6 ? 'high' : 'teen';
  }
  const currentAge = () => { const m = store.get('age', ''); return AGE[m] ? m : ageKeyAuto(); };
  function kidLine() {
    const k = kidDates();
    if (k.birth) { const m = Math.max(0, kidMonths(k.birth)), b = new Date(K.parse(k.birth)); return (m < 24 ? '생후 ' + m + '개월' : '만 ' + Math.floor(m / 12) + '세') + ' · ' + b.getUTCFullYear() + '년 ' + (b.getUTCMonth() + 1) + '월생'; }
    if (k.due) { const n = daysTo(k.due); return '출산 예정 ' + dot(k.due) + (n >= 0 ? ' · D-' + n : ''); }
    return '';
  }
  const agesRow = cur => '<div class="ages" id="ages" role="group" aria-label="아이 나이">' + AGES.map(x => '<button type="button" class="chip' + (x.key === cur ? ' on' : '') + '" data-age="' + x.key + '" aria-pressed="' + (x.key === cur) + '">' + esc(x.name) + '</button>').join('') + '</div>';
  function kidCard() {
    const line = kidLine();
    // PC는 '첫째'와 '아이 추가'를 제목 띠 안에 함께 둔다
    return pageHead('👶', '우리 아이', line || '날짜 넣고 디데이 확인하기', (isWide() ? kidsBlock() : '') + '<button type="button" class="edit" id="kidEdit">' + (line ? '날짜 고치기' : '날짜 넣기') + '</button>');
  }
  const KID_NAMES = ['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째'];
  // 아이 고르기. 계산기의 날짜 칸 위에는 둘 이상일 때만, 홈에는 늘 둔다(always)
  const kidSeg = always => (always || calcS.kids.length > 1 ? '<div class="seg kidseg" role="group" aria-label="아이 고르기">' + calcS.kids.map((_, i) => '<button type="button" class="' + (i === calcS.kid ? 'on' : '') + '" data-kid="' + i + '" aria-pressed="' + (i === calcS.kid) + '">' + KID_NAMES[i] + '</button>').join('') + '</div>' : '');
  // 홈: 날짜를 넣으면 그 아래에 '첫째' 칸과 '아이 추가'가 뜬다(11-05 운영자 "'우리아이'에 날짜를 넣으면 그 아래 '아이추가'가 뜨도록"). 둘째부터는 추가로
  function kidsBlock() {
    const k = kidDates();
    if (calcS.kids.length < 2 && !k.birth && !k.due) return '';
    return '<div class="kidrow">' + kidSeg(true) + (calcS.kids.length < KID_NAMES.length ? '<button type="button" class="kidadd" id="kidAdd">+ 아이 추가</button>' : '') + '</div>';
  }
  const kidsRow = () => (isWide() ? '' : kidsBlock());
  function pickKid(i) {
    if (!calcS.kids[i] || i === calcS.kid) return;
    const y = window.scrollY;
    saveCalc(); calcS.kid = i; calcS.birth = calcS.kids[i].birth; calcS.due = calcS.kids[i].due; saveCalc();
    store.del('age');      // 손으로 고른 나이 칸은 풀고 고른 아이의 날짜를 따른다
    render(); window.scrollTo(0, y);
  }
  // 먼저 태어난 아이가 첫째. 고른 아이는 순서가 바뀌어도 그대로 따라간다
  function sortKids() { const cur = calcS.kids[calcS.kid], at = k => k.birth || k.due || '9999'; calcS.kids.sort((a, b) => (at(a) < at(b) ? -1 : at(a) > at(b) ? 1 : 0)); calcS.kid = calcS.kids.indexOf(cur); }
  // 날짜만 고치는 시트(11-04 운영자 "계산기로 이동해서 불편해"). 계산기와 같은 값(calcS)을 쓴다. 날짜를 바꾸면 손으로 고른 나이 칸은 풀고 날짜를 따른다. add = 아이 한 명 더 넣기
  function openKidDates(add) {
    const many = calcS.kids.length > 1, k = add ? { birth: '', due: '' } : kidDates();
    const title = add ? '아이 추가' : KID_NAMES[calcS.kid] + ' 날짜';
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="' + title + '"><div class="grip"></div><h2>' + title + '</h2><p>둘 중 하나만 넣어도 됨. 이 기기에만 저장, 서버로 보내지 않음.</p>'
      + '<div class="two" style="margin-top:14px">' + dateField('kBirth', '태어난 날', k.birth) + dateField('kDue', '출산 예정일', k.due) + '</div>'
      + '<div class="err" id="kErr" hidden></div>'
      + '<button type="button" class="btn primary" id="kSave">저장</button>'
      + (!add && (many || k.birth || k.due) ? '<button type="button" class="btn line" id="kClear">' + (many ? '이 아이 지우기' : '날짜 지우기') + '</button>' : '')
      + '<button type="button" class="btn ghost" id="kCancel">취소</button></div>');
    const done = msg => { saveCalc(); sortKids(); saveCalc(); store.del('age'); closeSheet(); toast(msg); render(); };
    $('#kSave').addEventListener('click', () => {
      const b = $('#kBirth').value, due = $('#kDue').value, err = $('#kErr');
      if (b && b > todayStr()) { err.hidden = false; err.textContent = '태어난 날이 오늘보다 뒤. 아직 태어나기 전이면 출산 예정일 칸에 넣기'; return; }
      if (add && !b && !due) { err.hidden = false; err.textContent = '날짜 하나 넣기'; return; }
      if (add) { saveCalc(); calcS.kids.push({ birth: b, due: due }); calcS.kid = calcS.kids.length - 1; }
      calcS.birth = b; calcS.due = due; done(add ? '아이 추가 완료' : '날짜 저장 완료');
    });
    const c = $('#kClear');
    if (c) c.addEventListener('click', () => {
      if (calcS.kids.length > 1) { calcS.kids.splice(calcS.kid, 1); calcS.kid = Math.min(calcS.kid, calcS.kids.length - 1); calcS.birth = calcS.kids[calcS.kid].birth; calcS.due = calcS.kids[calcS.kid].due; done('아이 삭제 완료'); }
      else { calcS.birth = ''; calcS.due = ''; done('날짜 삭제 완료'); }
    });
    $('#kCancel').addEventListener('click', closeSheet);
  }
  // 나이마다 지금 챙길 것, 순서대로. by = 마지막 날(날짜를 넣었을 때), from = 시작할 수 있는 날, lab = 날짜가 없을 때의 기준. 근거는 각 가이드 글에
  // 설명은 한 줄로(11-04 운영자 "글자수도 너무 많고"). 자세한 조건은 눌러서 가는 가이드 글에
  function tlItems(key, d) {
    const L = {
      expect: [
        { t: '배우자 출산휴가', s: '20일 유급, 네 번까지 나눠 쓰기', by: d.paternityFrom, from: true, lab: '예정일 50일 전부터', h: '#/g/policy-paternity' },
        { t: '임신 중 육아휴직', s: '유산·조산 위험이 있으면 사용 가능', lab: '임신 중', h: '#/g/policy-pregnancy' },
        { t: '태어나고 2주 안에 할 일', s: '출생신고 · 부모급여 · 첫만남이용권', lab: '출생 뒤', h: '#/g/birth-2weeks' },
        { t: '6+6 시작 기한', s: '부모 모두 시작하면 상한 인상', by: d.bothStartBy, lab: '생후 18개월 안', h: '#/calc/leave', go: '우리 집 금액 계산하기' }
      ],
      baby: [
        { t: '배우자 출산휴가', s: '20일 유급, 네 번까지 나눠 쓰기', by: d.paternityTo, lab: '출생 후 120일 안', h: '#/g/policy-paternity' },
        { t: '출생신고', s: '늦으면 과태료', by: d.birthReportBy, lab: '출생 후 1개월 안', h: '#/g/birth-2weeks' },
        { t: '부모급여 신청', s: '이 안에 신청하면 태어난 달부터 지급', by: d.parentPayBy, lab: '출생일 포함 60일', h: '#/g/birth-2weeks' },
        // BCG · 건강검진 1차는 계산기 '내 아이 날짜'에만 있던 것을 11-13에 옮겼다(그 계산기를 빼면서). 돈이 걸린 부모급여가 접히지 않게 그 뒤에 둔다
        { t: 'BCG 접종', s: '결핵 예방접종. 가까운 지정 의료기관에서', by: d.bcgBy, lab: '생후 4주 안', h: '#/g/baby-care' },
        { t: '영유아 건강검진 1차', s: '생후 14~35일 사이에 검진기관에서', by: d.check1To, lab: '생후 14~35일', h: '#/g/baby-care' },
        { t: '6+6 시작 기한', s: '부모 모두 시작하면 상한 인상', by: d.bothStartBy, lab: '생후 18개월 안', h: '#/calc/leave', go: '우리 집 금액 계산하기' },
        { t: '육아휴직 급여 신청', s: '시작 1개월 뒤부터 고용24에서', lab: '휴직 뒤 12개월 안', h: '#/g/leave-apply' },
        { t: '첫만남이용권', s: '2024년 이후 출생아, 신청·사용', by: d.firstVoucherBy, lab: '2년 안', h: '#/g/birth-2weeks' },
        { t: '근로시간 단축', s: '주 15~35시간, 휴직 안 쓴 기간은 2배', by: d.reduceStartBy, lab: '만 12세 또는 초6까지', h: '#/g/policy-shorter-hours' }
      ],
      kid: [
        { t: '육아휴직 시작 기한', s: '둘 중 늦은 날까지 시작', by: d.leaveStartBy, lab: '만 8세 또는 초2까지', h: '#/g/leave-apply' },
        { t: '단기 육아휴직', s: '1주 또는 2주, 해마다 한 번', lab: '휴원·방학·입원', h: '#/g/leave-short' },
        { t: '근로시간 단축', s: '주 15~35시간, 휴직 안 쓴 기간은 2배', by: d.reduceStartBy, lab: '만 12세 또는 초6까지', h: '#/g/policy-shorter-hours' },
        { t: '가족돌봄휴가', s: '아이가 아프거나 쉬는 날. 보통 무급', lab: '해마다 10일', h: '#/g/family-care' }
      ],
      high: [
        { t: '육아휴직', s: '만 8세 이하 또는 초2 이하까지만 시작', by: d.leaveStartBy, lab: '초2까지', h: '#/g/leave-apply' },
        { t: '근로시간 단축 기한', s: '둘 중 늦은 날까지 시작', by: d.reduceStartBy, lab: '만 12세 또는 초6까지', h: '#/g/policy-shorter-hours' },
        { t: '가족돌봄휴가', s: '아이가 아프거나 학교가 쉬는 날', lab: '해마다 10일', h: '#/g/family-care' },
        { t: '학교 가는 아이와 아빠', s: '방학 · 돌봄 · 학습', lab: '초등', h: '#/g/play-school' }
      ],
      teen: [
        { t: '근로시간 단축', s: '만 13세 생일 전까지만 시작 가능', by: d.reduceStartBy, lab: '만 13세 전', h: '#/g/policy-shorter-hours' },
        { t: '가족돌봄휴가', s: '아이가 아프거나 다쳤을 때. 보통 무급', lab: '해마다 10일', h: '#/g/family-care' },
        { t: '부부가 같이 버티는 법', s: '사춘기 아이 앞에서 역할 나누기', lab: '마음', h: '#/g/mind-couple' }
      ]
    };
    L.low = L.kid.map(x => (x.t === '육아휴직 시작 기한' ? Object.assign({}, x, { t: '육아휴직은 초2까지', lab: '초2 끝까지' }) : x));
    return L[key] || [];
  }
  // 먼저 4개만, 끝난 것과 나머지는 '더 보기' 뒤에(11-04 운영자 "특히 홈화면이 가독성이 떨어져")
  const TL_SHOW = 4;
  function timeline(key, d) {
    const items = tlItems(key, d);
    if (!items.length) return '<div class="about">위에서 아이 나이를 고르면 순서대로 표시.</div>';
    let shown = 0;
    const rows = items.map(x => {
      let state = '', pill = x.lab;
      const n = x.by ? daysTo(x.by) : null;
      if (n != null) {
        if (x.from) { if (n <= 0) { state = 'soon'; pill = '지금 사용 가능'; } else if (n <= 60) { state = 'soon'; pill = 'D-' + n; } else pill = dot(x.by) + '부터'; }
        else if (n < 0) { state = 'done'; pill = '끝남'; } else if (n <= 60) { state = 'soon'; pill = n ? 'D-' + n : '오늘까지'; } else pill = dot(x.by) + '까지';
      }
      const hide = state === 'done' || (shown >= TL_SHOW && !isWide());     // PC는 자리가 넉넉해 끝난 것만 접는다
      if (!hide) shown++;
      return '<a class="tli ' + state + '" href="' + x.h + '"' + (hide ? ' hidden' : '') + '><span class="top"><b>' + esc(x.t) + '</b><span class="pill ' + state + '">' + esc(pill) + '</span></span><small>' + esc(x.s) + '</small>' + (x.go ? '<span class="go">' + esc(x.go) + ' →</span>' : '') + '</a>';
    }).join('');
    const rest = items.length - shown;
    return '<div class="tl">' + rows + '</div>' + (rest ? '<button type="button" class="more" id="tlMore">' + rest + '개 더 보기</button>' : '');
  }
  function bindHomeAge() {
    const e = $('#kidEdit'); if (e) e.addEventListener('click', () => openKidDates());
    const ka = $('#kidAdd'); if (ka) ka.addEventListener('click', () => openKidDates(true));
    const m = $('#tlMore'); if (m) m.addEventListener('click', () => { $$('.tli[hidden]').forEach(x => { x.hidden = false; }); m.remove(); });
    const box = $('#ages'); if (!box) return;
    box.addEventListener('click', ev => { const b = ev.target.closest('[data-age]'); if (!b) return; store.set('age', store.get('age', '') === b.dataset.age ? '' : b.dataset.age); renderHome(); });
  }
  // 그림과 이름만 있는 타일(홈·커뮤니티 잠금)
  const tile = (e, t, h) => '<a class="tile" href="' + esc(h) + '"><span class="ge">' + esc(e) + '</span><b>' + esc(t) + '</b></a>';
  // PC 홈의 글 카드는 자리가 있어 한 줄 설명과 표시를 함께 둔다
  const wideTile = g => '<a class="tile" href="#/g/' + esc(g.id) + '"><span class="ge">' + esc(g.e) + '</span>' + (g.tag ? '<span class="tag ' + tagCls(g.tag) + '">' + esc(g.tag) + '</span>' : '') + '<b>' + esc(g.title) + '</b><small>' + esc(g.sub) + '</small></a>';
  // 질문게시판이 비어 있을 때: 솔직하게 아직 질문이 없다고 말한다(검수 15)
  const emptyCommunity = () => '<div class="lockbox recruit"><div class="lk">🙋</div><h2>아직 질문 없음</h2><p>궁금한 것 먼저 물어보기. 가입한 아빠들이 보고 답함.</p>'
    + '<a class="btn primary" href="#/write">질문하기</a>' + (socialOn() ? '' : '<a class="btn line" href="#/me">초대 코드 보내기</a>') + '<a class="btn ghost" href="#/guide/faq">자주 묻는 질문은 가이드 Q&amp;A에</a></div>';
  // 홈의 '이 나이에 챙길 용품'(11-12 운영자 "상품 구매를 유도하도록 … 모두 반영해서 고쳐서"): 지금 챙길 것 바로 아래에 둔다(예전에는 맨 아래 타일 넷).
  // 고른 나이에 맞는 용품 글(g)과 육아템 카테고리(c). 나이를 안 골랐으면 ''
  const AGE_GEAR = {
    '': { g: ['gear-car', 'gear-out'], c: ['out', 'car', 'home', 'play', 'trip', 'school'] },
    expect: { g: ['gear-car', 'gear-out'], c: ['car', 'out', 'home'] },
    baby: { g: ['gear-home', 'gear-out'], c: ['out', 'home', 'play', 'car'] },
    kid: { g: ['gear-play', 'gear-trip'], c: ['play', 'trip', 'car', 'out'] },
    low: { g: ['gear-school', 'gear-play'], c: ['school', 'play', 'trip'] },
    high: { g: ['gear-school', 'gear-trip'], c: ['school', 'trip', 'play'] },
    teen: { g: ['gear-trip'], c: ['trip', 'play'] }
  };
  // 홈의 소제목은 음영 띠로 구분한다(11-13 운영자 "소 타이틀에는 음영을 넣어서 제목 구분이 가도록")
  const homeSec = (title, right) => '<div class="sec shade"><h2>' + title + '</h2>' + (right || '') + '</div>';
  // 용품 칸은 글 두 편만(11-13 운영자: '고르는 법 전체' · 육아템 카테고리 칩 · '육아템 추천받기' 단추를 홈에서 뺌. 카테고리 c는 남겨 둔다)
  function homeGear(key) {
    const a = AGE_GEAR[key] || AGE_GEAR[''], rows = a.g.map(id => GD.items.find(x => x.id === id)).filter(Boolean);
    return homeSec(AGE[key] ? '우리 아이 나이에 챙길 용품' : '아빠가 고르는 용품')     // 11-13 운영자 "'이 나이에' 대신 '우리 아이 나이에'로"
      + '<div class="glist" style="margin-top:0">' + rows.map(grow).join('') + '</div>';
  }
  async function renderHome() {
    setTab('home');
    bar(brandBar());
    const seq = renderSeq;
    // 아이 나이 길(UI 3안): 나이 칸 → 우리 아이 → 지금 챙길 것(기한 D-데이) → 가이드로 가는 큰 버튼 → 이 나이에 맞는 글 → 또래 아빠들 글. 서버를 기다리지 않고 바로 그린다(검수 18)
    // 긴 계산기 카드는 가이드 '육아휴직' 칸에만 둔다(11-04 운영자 "특히 홈화면이 가독성이 떨어져" · "글자수도 너무 많고")
    const key = currentAge(), a = AGE[key], d = K.childDates(kidDates());
    const picks = a ? a.ids.map(id => GD.items.find(g => g.id === id)).filter(Boolean) : GD.items.filter(g => g.home).slice(0, 3);
    view.innerHTML = '<section class="pad">'
      + (mode === 'local' ? mockBadge() : '')
      + kidCard()
      + kidsRow()
      + agesRow(key)
      + homeSec(a ? esc(a.name) + ', 지금 챙길 것' : '지금 챙길 것', a ? '<span>순서대로</span>' : '')
      + (a && calcS.job !== 'worker' ? '<a class="jobhint" href="#/g/leave-job">회사원 등 고용보험 기준. <b>다른 직종 보기 ›</b></a>' : '')
      + timeline(key, d)
      + homeGear(key)
      + homeSec(a ? '우리 아이 나이에 맞는 글' : '아빠 가이드', !a ? '<a class="all" href="#/guide">전체 보기 →</a>' : picks.length > (isWide() ? 3 : 4) ? '<a class="all" href="#/guide/age/' + key + '">전체 보기 →</a>' : '')
      + '<div class="tiles" style="margin-top:0">' + (isWide() ? picks.slice(0, 3).map(wideTile) : picks.slice(0, 4).map(g => tile(g.e, g.title, '#/g/' + g.id))).join('') + '</div>'
      // '가이드 탭에서 더 많은 정보 보기' 단추는 뺐다(11-13 운영자). 가이드는 아래 탭과 위 '전체 보기'로 간다
      + '<div id="homeCom">' + (canRead() ? homeSec('최근 질문', '<a class="all" href="#/community">전체 보기 →</a>') + '<div class="loading">불러오는 중…</div>' : '') + '</div>'
      + '</section>';     // 이용약관 · 처리방침 줄은 사이트 아래 푸터로 옮겼다(11-13)
    window.scrollTo(0, 0);
    bindHomeAge();
    // 맨 아래 질문게시판: 최근 질문 3개 + 많이 본 질문 3개(11-13 운영자). 많이 본 질문은 최근 질문과 겹치지 않게, 아직 열린 질문이 없으면 그 칸은 그리지 않는다
    let recent = [], popular = [], err = null, locked = !canRead();
    if (!locked) {
      try {
        const both = await Promise.all([api('listPosts', { limit: 3 }), api('listPosts', { limit: 6, sort: 'views' })]);
        recent = both[0].posts || [];
        const ids = recent.map(p => p.id);
        popular = (both[1].posts || []).filter(p => p.views > 0 && ids.indexOf(p.id) < 0).slice(0, 3);
      } catch (e) { if (readDenied(e)) locked = true; else err = e; }
    }
    if (seq !== renderSeq) return;
    const box = $('#homeCom'); if (!box) return;
    box.innerHTML = locked
      ? homeSec('질문게시판') + '<a class="notice vcta" id="homeLock" href="#/community" style="margin-top:0"><span class="e">🔒</span><span>' + (socialOn() ? '가입한' : '인증한') + ' 아빠끼리 묻고 답하기. <b>' + joinWord() + '</b></span></a>'
      : homeSec('최근 질문', '<a class="all" href="#/community">전체 보기 →</a>')
        + '<div class="list" id="homeList">' + (err ? empty('질문 불러오기 실패', '잠시 뒤 다시 열기') : (recent.length ? recent.map(pcard).join('') : '<a class="notice vcta" href="#/write" style="margin-top:0"><span class="e">🙋</span><span>아직 질문 없음. <b>첫 질문하기</b></span></a>')) + '</div>'
        + (popular.length ? homeSec('많이 본 질문') + '<div class="list homelist">' + popular.map(pcard).join('') + '</div>' : '');
    if (err) fail(err);
  }

  // ----- 약관 · 개인정보 처리방침: 앱 안 사본을 두지 않고 Play에 적는 주소와 같은 terms.html · privacy.html로 보낸다(11-05 Play 등록). #/terms · #/privacy는 옛 링크용 -----
  function renderLegal(kind) { location.replace(kind === 'terms' ? 'terms.html' : 'privacy.html'); }

  // ----- 아빠 가이드 -----
  const tagCls = t => t === 'NEW' ? 'new' : t === '인기' ? 'hot' : t === '필수' ? '' : 'gray';
  function grow(g) {
    return '<a class="grow" href="#/g/' + esc(g.id) + '"><span class="ge">' + esc(g.e) + '</span><span class="tx"><b>' + esc(g.title) + '</b><small>' + esc(g.sub) + '</small></span>'
      + (g.tag ? '<span class="tag ' + tagCls(g.tag) + '">' + esc(g.tag) + '</span>' : '') + '</a>';
  }
  // 가이드 상단 버튼(11-05 운영자 "'계산기' 다음에 '나들이'를 넣어주고 그다음에 '놀이'" · "'정책/정보/자료실'을 하나로 합쳐줘"). 커뮤니티 잠금 화면의 타일도 이 목록을 쓴다
  const MERGED = [{ key: 'policy', name: '정책', h: '#/guide/policy' }, { key: 'info', name: '정보', h: '#/guide/info' }, { key: 'library', name: '자료실', h: '#/library' }];
  // 용품을 맨 왼쪽에 두고 가이드 탭의 기본 칸으로 한다(11-13 운영자 "'용품' 탭을 맨 왼쪽으로 옮겨서 기본으로 보여주고")
  const GUIDE_DEFAULT = 'gear';
  const GUIDE_BTNS = [
    { h: '#/guide/gear', e: '🎒', name: '용품', on: ['gear'] },        // 11-12 운영 방향 1단계: 용품 고르는 법 글 자리. 상품은 육아템 탭(#/shop)
    { h: '#/guide/leave', e: '💼', name: '육아휴직', on: ['leave'] },
    { h: '#/guide/faq', e: '🙋', name: 'Q&A', on: ['faq'] },
    { h: '#/calc', e: '💰', name: '계산기', on: ['calc'] },
    { h: '#/guide/outing', e: '🎡', name: '나들이', on: ['outing'] },
    { h: '#/guide/play', e: '🎮', name: '놀이', on: ['play'] },
    { h: '#/guide/mind', e: '🧠', name: '심리', on: ['mind'] },
    { h: '#/guide/policy', e: '🗂️', name: '정보', on: MERGED.map(m => m.key) }      // 11-05 운영자 "하나로 묶을때 단어를 '정보'로만"
  ];
  const guideChips = cur => '<div class="chips" data-keep="guide">' + GUIDE_BTNS.map(b => '<a class="chip' + (b.on.indexOf(cur) >= 0 ? ' on' : '') + '" href="' + b.h + '"><span class="e">' + b.e + '</span>' + esc(b.name) + '</a>').join('') + '</div>';
  // 합친 버튼 안에서 정책·정보·자료실을 고른다. 주소는 그대로라 글과 안내의 링크가 그대로 맞는다
  const mergedSeg = cur => (MERGED.some(m => m.key === cur) ? '<div class="seg guideseg">' + MERGED.map(m => '<a class="' + (m.key === cur ? 'on' : '') + '" href="' + m.h + '"' + (m.key === cur ? ' aria-current="page"' : '') + '>' + m.name + '</a>').join('') + '</div>' : '');
  // 가이드 탭은 표지 없이 바로 글로(11-05 운영자 "네모칸으로 버튼 누르게 하는 표지는 없는게 더 낫고"). 어느 칸이든 제목과 상단 버튼 자리가 같다
  // PC는 칩이 왼쪽 메뉴로 가므로 지금 칸 이름을 제목 아래에 적는다
  const guideCurName = cur => { const m = MERGED.find(x => x.key === cur); if (m) return m.name; const b = GUIDE_BTNS.find(x => x.on.indexOf(cur) >= 0); return b ? b.name : ''; };
  const guideHead = cur => pageHead('📚', '아빠 가이드', isWide() ? guideCurName(cur) : '') + guideChips(cur) + mergedSeg(cur);
  // 근거 법령 표시(11-05 운영자 "'2026.11.04 법령기준'은 사실이 아니지 … 실제 법령의 명칭과 유효일자를 적어서 신뢰를 확보해"). 표는 law-data.js, 글과는 출처 주소로 잇는다
  const LAW_DATA = window.YK_LAWS || { checked: '', items: [] };
  const lawsFor = list => { const urls = list.reduce((a, g) => a.concat((g.sources || []).map(s => s.u || '')), []); return LAW_DATA.items.filter(l => urls.some(u => l.match.some(m => u.indexOf(m) >= 0))); };
  function lawBox(laws) {
    if (!laws.length) return '';
    const row = l => '<li><a href="https://www.law.go.kr/법령/' + encodeURI(l.key) + '" target="_blank" rel="noopener">' + esc(l.name) + '</a><small>' + esc(l.no) + ' · ' + dotd(l.effective) + ' 시행' + (l.upcoming ? ' · ' + dotd(l.upcoming) + ' 개정 시행 예정' : '') + '</small></li>';
    const rest = laws.slice(4);     // 많으면 앞의 넷만 보이고 나머지는 접는다(글자 수를 줄이면서 다 확인할 수 있게)
    return '<div class="lawbox"><b>근거 법령과 시행일</b><ul>' + laws.slice(0, 4).map(row).join('') + '</ul>'
      + (rest.length ? '<details class="dt"><summary>법령 ' + rest.length + '개 더 보기</summary><ul>' + rest.map(row).join('') + '</ul></details>' : '')
      + '<small class="lawchk">국가법령정보센터 ' + dotd(LAW_DATA.checked) + ' 조회</small></div>';
  }
  // 글을 확인한 뒤 법령이 바뀌었거나 오래되면 스스로 알린다(최신화 장치). 시행일은 tools/check_laws.py --write가 표에 넣는다
  const daysAgo = s => Math.floor((Date.now() - new Date(s).getTime()) / 86400000);
  function lawWarn(g, laws) {
    // 용품 글은 고용센터(1350)에 물을 일이 아니라 따로 알린다
    if (g.status === '용품 기준') return g.updated && daysAgo(g.updated) > 180 ? '<div class="warn">⚠️ 확인한 지 6개월이 넘은 글. 살 때 기준과 리콜 여부 다시 확인.</div>' : '';
    const newer = laws.filter(l => g.updated && l.effective > g.updated);
    if (newer.length) return '<div class="warn">⚠️ 이 글을 확인한 뒤 ' + esc(newer[0].name) + '이 바뀜(' + dotd(newer[0].effective) + ' 시행). 내용이 다를 수 있어 1350에 확인 필요.</div>';
    if (g.status !== '일반 조언' && g.status !== '공식 안내' && g.updated && daysAgo(g.updated) > 180) return '<div class="warn">⚠️ 확인한 지 6개월이 넘은 글. 신청 전에 1350에 확인.</div>';
    return '';
  }
  // 자료 오류 제보(11-05 운영자 "자료 오류 제보"): 가이드 글 · Q&A · 계산기 · 자료실 끝에. ref = 글 번호 또는 faq · library · calc-종류
  const fixBtn = ref => '<button type="button" class="fixbtn" data-fix="' + esc(ref) + '">자료 오류 제보</button>';
  // Q&A(11-05 운영자 "Q&A인데 그냥 읽기 자료같은 느낌이야"): 질문을 누르면 답이 펼쳐진다. 저장된 Q&A는 서버 없이 보이고, 관리자가 답한 질문을 위에 더한다
  const qaItem = (q, a, more) => '<details class="qa"><summary><span class="qm">Q</span><b>' + esc(q) + '</b></summary><div class="qa-a"><span class="am">A</span><div><p>' + rich(a) + '</p>' + (more ? '<a class="lk2" href="' + esc(more) + '">자세히 보기 ›</a>' : '') + '</div></div></details>';
  async function renderQna() {
    setTab('guide');
    bar(brandBar());
    const items = GD.items.filter(g => g.cat === 'faq'), seq = renderSeq;
    view.innerHTML = '<section class="pad">' + guideHead('faq')
      + '<div class="qalist"><div id="qaNew"></div>' + items.map(g => qaItem(g.q, g.a, '#/g/' + g.id)).join('') + '</div>'
      // 운영자에게 보내던 질문하기(openAsk)는 질문게시판으로 잇는다(11-12 운영 방향: 운영자는 답을 쓰지 않는다). 저장된 Q&A는 그대로
      + '<a class="btn primary qaask" href="#/community">질문게시판에서 아빠들에게 물어보기</a>'
      + notes(['육아맨이 출처를 확인해 정리한 답', '궁금한 것은 질문게시판에서 가입한 아빠들에게 묻기', '답은 법률 자문 아님'])
      + lawBox(lawsFor(items)) + fixBtn('faq') + '</section>';
    window.scrollTo(0, 0);
    try {
      const r = await api('qnaList');
      if (seq !== renderSeq) return;
      const box = $('#qaNew'); if (box) box.innerHTML = (r.items || []).map(x => qaItem(x.question, x.answer, '')).join('');
    } catch (e) { /* 끊겨도 저장된 Q&A는 보인다 */ }
  }
  // '육아템 추천받기' 큰 파란 단추(11-12 운영자 "크게 '육아템 추천받기' 넣어주고 누르면 '육아템' 탭으로" · "파란색 버튼"): 용품 글과 용품 칸의 맨 위. key가 육아템 카테고리면 그 카테고리로 간다
  const shopGo = key => '<a class="btn primary shopgo" data-cta="go" href="#/shop' + (key && SHOP_CAT[key] ? '/' + esc(key) : '') + '">육아템 추천받기 →</a>';
  function renderGuide(cat) {
    if (!cat) cat = GUIDE_DEFAULT;
    if (cat === 'faq') { renderQna(); return; }
    setTab('guide');
    bar(brandBar());
    const items = GD.items.filter(g => g.cat === cat);
    // 용품 칸(11-12): 육아템 카테고리마다 고르는 법 글 한 편(guide-data.js '용품' 절). 맨 위에 파란 '육아템 추천받기' 단추. 광고 칸은 쿠팡 가입 뒤에
    // 11-13 운영자: 맨 위 안내 글('아빠 몸과 아빠 차에 맞춰 …')은 뺐다. 써 본 후기가 아니라는 말은 글마다 머리에 그대로 있다
    const gearEmpty = '<div class="about">용품 고르는 법 글 준비 중.</div>';
    view.innerHTML = '<section class="pad">'
      + guideHead(cat)
      + (cat === 'leave' ? calcCard() + '<a class="grow" href="#/calc" style="margin-top:16px"><span class="ge">🧮</span><span class="tx"><b>계산기 모음</b><small>단축근무 · 배우자 출산휴가</small></span></a>' : '')
      + (cat === 'gear' ? shopGo('') + (items.length ? '' : gearEmpty) : '')
      + (cat === 'gear' && !items.length ? '' : '<div class="glist">' + (items.length ? items.map(grow).join('') : empty('준비 중', '곧 글 올라옴'))
        + (cat === 'outing' ? '<a class="grow" href="#/community/play"><span class="ge">🙋</span><span class="tx"><b>아빠들에게 물어보기</b><small>질문게시판 놀이·나들이 칸</small></span></a>' : '') + '</div>')
      + lawBox(lawsFor(items))
      + '</section>';
    window.scrollTo(0, 0);
    bindCalcCard();
  }
  // 이 나이에 맞는 글 전체(홈의 '전체 보기', 11-05 운영자 "그냥 아빠가이드가 나오는데 이건 아니니까")
  function renderGuideAge(key) {
    setTab('home');
    bar(backBtn('#/') + '<div class="fill atitle">우리 아이 나이에 맞는 글</div>');
    const a = AGE[key], items = a.ids.map(id => GD.items.find(g => g.id === id)).filter(Boolean);
    view.innerHTML = '<section class="pad">' + pageHead('📖', a.name, '우리 아이 나이에 맞는 글') + '<div class="glist">' + items.map(grow).join('') + '</div></section>';
    window.scrollTo(0, 0);
  }
  function blocks(b, g) {
    // 용품 글의 작은 제목(sub = 육아템 세부 칸)에는 그 칸으로 가는 줄을 붙인다
    const hsub = x => (g && g.shop && x.sub ? '<a class="hsub" data-cta="sub" href="#/shop/' + esc(g.shop) + '/' + encodeURIComponent(x.sub) + '">육아템에서 보기 ›</a>' : '');
    return (b || []).map(x => x.h ? '<h2>' + esc(x.h) + hsub(x) + '</h2>' : x.p ? '<p>' + rich(x.p) + '</p>'
      : x.ul ? '<ul>' + x.ul.map(i => '<li>' + rich(i) + '</li>').join('') + '</ul>' : x.ol ? '<ol>' + x.ol.map(i => '<li>' + rich(i) + '</li>').join('') + '</ol>'
      : x.tip ? '<div class="tipbox">💡 ' + rich(x.tip) + '</div>' : x.tpl ? '<pre class="tpl">' + esc(x.tpl) + '</pre>'
      : x.go ? '<a class="btn primary golink" href="' + esc(x.go) + '">' + esc(x.t) + '</a>' : '').join('');
  }
  function renderGuideItem(id) {
    setTab('guide');
    const g = GD.items.find(x => x.id === id);
    if (!g) { bar(backBtn('#/guide') + '<div class="fill atitle">아빠 가이드</div>'); view.innerHTML = '<section class="pad">' + empty('글을 찾을 수 없음', '') + '</section>'; return; }
    const c = GCAT[g.cat] || {};
    bar(backBtn('#/guide/' + g.cat) + '<div class="fill atitle">아빠 가이드 · ' + esc(c.name || '') + '</div>');
    const laws = lawsFor([g]);
    const related = (g.gear || []).map(id => GD.items.find(x => x.id === id)).filter(Boolean);     // 이 글과 닿는 용품 글(guide-data.js gear)
    const note = g.status === '공식 근거' ? '<div class="draft"><span>✅</span><span>' + dotd(g.updated) + ' 법령과 정부 안내로 확인. 내 경우는 1350이나 고용센터에 문의</span></div>'
      : g.status === '공식 안내' ? '<div class="draft"><span>✅</span><span>' + dotd(g.updated) + ' 정부 안내로 확인. 번호와 조건은 바뀔 수 있음</span></div>'
      : g.status === '일반 조언' ? '<div class="draft"><span>✍️</span><span>일반적인 조언. 집마다 다를 수 있음.</span></div>'
      : g.status === '자료 정리' ? '<div class="draft"><span>🗂️</span><span>' + dotd(g.updated) + ' 출처가 있는 자료로 정리. 내 경우는 1350이나 고용센터에 문의</span></div>'
      : g.status === '용품 기준' ? '<div class="draft"><span>✅</span><span>' + dotd(g.updated) + ' 공공 자료와 전문 기관 안내로 확인한 기준. 써 본 후기 아님.</span></div>' : '';
    view.innerHTML = '<section class="pad"><article class="garticle">'
      + '<div class="meta"><span class="badge c-etc">' + esc(c.e || '') + ' ' + esc(c.name || '') + '</span>' + (g.tag ? '<span class="tag ' + tagCls(g.tag) + '">' + esc(g.tag) + '</span>' : '') + '</div>'
      + '<h1>' + esc(g.title) + '</h1><p class="gsub">' + esc(g.sub) + '</p>' + lawWarn(g, laws) + note     // 글 맨 위의 '육아템 추천받기'는 뺐다(11-13 운영자). 글 끝의 단추는 그대로
      + blocks(g.body, g)
      + (g.shop ? shopGo(g.shop) : '')     // 다 읽은 뒤에도 한 번 더(읽고 난 뒤가 누를 마음이 가장 클 때)
      + (related.length ? '<div class="gearrel"><b>이 글과 닿는 용품</b><div class="glist">' + related.map(grow).join('') + '</div><a class="lk2" data-cta="rel" href="#/shop">육아템 추천받기 ›</a></div>' : '')
      + lawBox(laws)
      + (g.sources && g.sources.length ? '<div class="srcs"><b>출처</b><ul>' + g.sources.map(s => '<li><a href="' + esc(s.u) + '" target="_blank" rel="noopener">' + esc(s.t) + '</a></li>').join('') + '</ul></div>' : '')
      + fixBtn(g.id)
      + '</article>'
      // 글 끝에서 질문게시판으로(11-12). 글의 community 값이 지금 질문 주제에 있으면 그 칸으로, 아니면 전체로
      + (g.community ? '<a class="glink" href="#/community' + (CAT[g.community] ? '/' + esc(g.community) : '') + '"><span>🙋 아빠들에게 물어보기 (질문게시판)</span><span>→</span></a>' : '')
      + '</section>';
    window.scrollTo(0, 0);
  }

  // ----- 계산기 -----
  // ----- 계산기 -----
  const CALC_HEAD = { leave: ['육아휴직 급여 계산기', '일반과 6+6 나란히 비교'], reduce: ['단축근무 급여 계산기', '단축근무 중 한 달 수입 보기'], paternity: ['배우자 출산휴가 계산기', '20일 동안 받는 돈 보기'] };
  // PC: 결과 아래의 날짜 · 안내 · 근거를 오른쪽 칸으로 옮긴다. 계산기마다 #calcOut을 다시 그리므로 그때마다 옮긴다
  let calcRailWatch = null;
  function watchCalcRail() {
    if (calcRailWatch) { calcRailWatch.disconnect(); calcRailWatch = null; }
    const box = $('#calcOut');
    if (!box || !isWide() || !hasRail()) return;
    calcRailWatch = new MutationObserver(() => {
      const rc = $('#railCalc'); if (!rc) return;
      rc.innerHTML = '';
      const dates = $$('.rdates', box), rest = $$(':scope > .nlist, :scope > .dt, :scope > .offi', box);
      dates.forEach(n => rc.appendChild(n));
      if (rest.length) { const s = document.createElement('section'); s.className = 'rbox'; s.innerHTML = '<h2>꼭 확인</h2>'; rest.forEach(n => s.appendChild(n)); rc.appendChild(s); }
      calcRailWatch.takeRecords();     // 방금 옮긴 것은 다시 세지 않는다
    });
    calcRailWatch.observe(box, { childList: true });
  }
  // PC: 일반과 6+6(한부모면 한부모)을 나란히 둔다. 고른 상황 칸을 강조하고, 칸을 누르면 그 상황으로 바뀐다. 6+6은 아이 날짜 없이는 금액을 보여 주지 않는다(휴대폰과 같은 기준)
  function leaveCompare(kid, past18) {
    const base = { ordinary: toWon(calcS.pay), start: calcS.start, end: calcS.end, usedMonths: calcS.used, companyPay: toWon(calcS.company) };
    const gen = K.leaveBenefit(base), single = calcS.mode === 'single', sj = calcS.spouseJob;
    const alt = single ? K.leaveBenefit(Object.assign({}, base, { mode: 'single' }))
      : kid.bothStartBy && !past18 ? K.leaveBenefit(Object.assign({}, base, { mode: 'both', spouseMonths: calcS.spouseMonths, spouseLeave: sj !== 'none' })) : null;
    const altKey = single ? 'single' : 'both', altOn = calcS.mode === altKey;
    const altWhy = past18 ? '시작일이 생후 18개월을 넘음. 일반 기준.' : '아이 날짜를 넣으면 계산.';
    const more = alt && alt.total > gen.total ? alt.total - gen.total : 0;
    const genCard = '<button type="button" class="rescard' + (calcS.mode === 'general' ? ' on' : '') + '" data-pick-mode="general"><small>부부 중 한 사람만 쉴 때</small><strong>' + won(gen.total) + '</strong><em>일반 ' + gen.months + '개월 어림</em></button>';
    const altCard = '<button type="button" class="rescard' + (altOn ? ' on' : '') + '" data-pick-mode="' + altKey + '"><small>' + (single ? '한부모일 때' : '부부 모두 쓸 때') + '</small>' + (more ? '<span class="up">+' + won(more) + '</span>' : '')
      + (alt ? '<strong>' + won(alt.total) + '</strong><em>' + (single ? '한부모 ' + alt.months + '개월 어림' : '6+6 ' + alt.common + '개월 포함, 내 몫 ' + alt.months + '개월 어림') + '</em>' : '<strong class="none">계산 전</strong><em>' + altWhy + '</em>') + '</button>';
    const groups = [];
    gen.rows.forEach((g, i) => {
      const a = alt ? alt.rows[i] : null, last = groups[groups.length - 1];
      if (last && g.full && last.g.full && last.g.paid === g.paid && last.g.cap === g.cap && (!a || (last.a.paid === a.paid && last.a.cap === a.cap))) { last.to = g.no; return; }
      groups.push({ from: g.no, to: g.no, g, a });
    });
    const when = x => (x.g.full ? (x.from === x.to ? x.from + '개월째' : x.from + '~' + x.to + '개월째') : x.from + '개월째 ' + x.g.days + '일');
    const cell = (m, up) => '<td' + (up ? ' class="up"' : '') + '>' + (m.full ? '월 ' : '') + won(m.paid) + '<small>' + Math.round(m.rate * 100) + '% · 상한 ' + (m.cap / 10000) + '만원' + (m.cut ? ' · ' + won(m.cut) + ' 감액' : '') + '</small></td>';
    const tbl = '<table class="calctbl twoc"><tr class="th"><td>기간</td><td>일반</td>' + (alt ? '<td>' + (single ? '한부모' : '6+6') + '</td>' : '') + '</tr>'
      + groups.map(x => '<tr><td>' + when(x) + '</td>' + cell(x.g) + (x.a ? cell(x.a, x.a.paid > x.g.paid) : '') + '</tr>').join('') + '</table>';
    return '<div class="rescmp">' + genCard + altCard + '</div><section class="result restbl"><h2>달마다 받는 돈</h2>' + tbl + '</section>';
  }
  function renderCalc(tab) {
    setTab('guide');
    bar(brandBar());
    // 스크롤 없이 한눈에(11-05 운영자 "스크롤 말고 그냥 2열 2행으로"). 11-13 '내 아이 날짜'를 빼서 셋이 한 줄
    const grid = '<div class="calcgrid">' + CALC_TABS.map(t => '<a class="chip' + (t.key === tab ? ' on' : '') + '" href="#/calc/' + t.key + '"><span class="e">' + t.e + '</span>' + esc(t.name) + '</a>').join('') + '</div>';
    const head = CALC_HEAD[tab];
    view.innerHTML = '<section class="pad">' + (isWide() ? pageHead(CALC_TABS.find(t => t.key === tab).e, head[0], head[1]) : guideHead('calc')) + grid + '<div id="calcJob"></div><div id="calcForm"></div><div id="calcOut"></div>' + fixBtn('calc-' + tab) + '</section>';
    window.scrollTo(0, 0);
    watchCalcRail();
    const fill = ({ leave: calcLeave, reduce: calcReduce, paternity: calcPaternity })[tab];
    // 고용보험 근로자는 세 계산기 모두, 공무원·교원은 육아휴직 수당을 계산한다. 그 밖의 직종은 정보와 이동 단추
    const paint = () => {
      $('#calcJob').innerHTML = '<div class="' + (JOB_LINE[calcS.job] ? 'jobflat' : 'about jobwrap') + '">' + jobBox() + '</div>';
      if (calcS.job === 'worker') { fill(); return; }
      if (isCivilJob() && tab === 'leave') { calcCivil(); return; }
      $('#calcForm').innerHTML = isCivilJob() ? civilOther(tab) : ''; $('#calcOut').innerHTML = '';
    };
    $('#calcJob').addEventListener('click', ev => { const b = ev.target.closest('[data-job]'); if (!b) return; calcS.job = b.dataset.job; saveCalc(); paint(); });
    paint();
  }
  const manField = (id, label, val, hint) => '<label class="lbl" for="' + id + '">' + esc(label) + '</label><div class="unit"><input class="inp" id="' + id + '" type="number" inputmode="decimal" min="0" step="1" value="' + esc(val) + '"><span>만원</span></div>' + (hint ? '<small class="hint">' + esc(hint) + '</small>' : '');
  const dateField = (id, label, val) => '<label class="dfield"><span>' + esc(label) + '</span><input class="inp" id="' + id + '" type="date" value="' + esc(val) + '"></label>';
  // 2024-12-19 대법원 전원합의체(2020다247190, 2023다302838)로 '고정성' 요건이 없어졌다. "매달 똑같이 받는 돈"은 옛 설명이다
  const ORD_HELP = '<details class="dt"><summary>통상임금이란?</summary><p>정해진 일의 대가로 정기적·일률적으로 주기로 한 돈. 기본급과 고정 수당이 대표적. 정기상여금도 들어갈 수 있음. 2024년 12월 대법원은 "지급일에 재직 중이어야 준다"는 조건만으로는 빠지지 않는다고 판단. 초과근무수당과 실적에 따라 달라지는 성과급은 보통 빠짐. 휴직 시작일 기준이고, 정확한 금액은 회사 인사팀에 문의.</p>'
    + '<div class="two"><label class="dfield"><span>기본급(만원)</span><input class="inp" id="ordBase" type="number" inputmode="decimal"></label><label class="dfield"><span>고정 수당·정기상여 월 환산(만원)</span><input class="inp" id="ordFix" type="number" inputmode="decimal"></label></div><button type="button" class="btn line small" id="ordAdd">더해서 넣기</button></details>';
  function bindOrd(onChange) {
    const b = $('#ordAdd'); if (!b) return;
    b.addEventListener('click', () => { const v = (parseFloat($('#ordBase').value) || 0) + (parseFloat($('#ordFix').value) || 0); const p = $('#cPay'); p.value = v; calcS.pay = v; saveCalc(); onChange(); toast('더해서 넣음'); });
  }
  function bindInputs(map, onChange) {
    Object.keys(map).forEach(id => { const el = $('#' + id); if (!el) return; const fn = () => { map[id](el); saveCalc(); onChange(); }; el.addEventListener('input', fn); el.addEventListener('change', fn); });
  }
  const WARN = {
    pay: '월 통상임금 넣기. 금액을 모르면 "통상임금이란?"을 열어 기본급과 고정 수당 더하기.',
    dates: '시작일과 끝나는 날 확인 필요.',
    short: '30일 미만이면 보통 급여 대상 아님(고용보험법 제70조). 같은 아이로 앞서 쓴 휴직이 있으면 합쳐서 보니 고용센터에 확인. 단기 육아휴직(1주 또는 2주)은 7일 이상이면 됨.',
    over12: '12개월을 넘는 기간은 부모가 각각 3개월 이상 쓰거나, 한부모·중증 장애아동의 부모일 때 사용 가능.',
    over18: '육아휴직은 가장 길어도 18개월. 끝나는 날 앞당기기.',
    noCommon: '6+6은 부모가 모두 써야 적용. 배우자 사용 기간이 없으면 일반 기준으로 계산.',
    bong: '월봉급액 넣기. 수당을 뺀 봉급.',
    over3y: '육아휴직은 자녀 1명당 3년 이내. 기간 줄이기.',
    spouseNoLeave: '배우자가 육아휴직을 쓸 수 없으면(자영업·프리랜서·전업) 부모가 모두 쓰는 경우가 아니라 일반 기준으로 계산.',
    needBirth: '6+6은 아이가 생후 18개월 안일 때 부모가 모두 휴직을 시작해야 함. 아이가 태어난 날이나 출산 예정일을 넣으면 계산.',
    hours: '단축 후 시간이 단축 전보다 짧아야 함.',
    range: '단축 후 근로시간은 주 15시간 이상 35시간 이하.',
    over36: '단축근무는 기본 1년에, 육아휴직을 안 쓴 기간의 두 배를 더해 가장 길어도 3년.'
  };
  const warnBox = list => (list || []).map(k => '<div class="warn">⚠️ ' + esc(WARN[k] || k) + '</div>').join('');
  function groupRows(rows) {
    const out = [];
    rows.forEach(r => { const g = out[out.length - 1]; if (g && r.full && g.full && g.paid === r.paid && g.rate === r.rate && g.cap === r.cap) g.to = r.no; else out.push({ from: r.no, to: r.no, paid: r.paid, rate: r.rate, cap: r.cap, full: r.full, days: r.days, special: r.special, cut: r.cut }); });
    return out;
  }
  function calcLeave() {
    // 묶음(.fg)은 폰에서는 그냥 차례대로 쌓이고, PC에서는 한 줄에 셋으로 놓인다
    $('#calcForm').innerHTML = '<div class="form fgrid">'
      + '<div class="fg">' + manField('cPay', '내 월 통상임금', calcS.pay) + ORD_HELP + '</div>'
      + '<div class="fg"><span class="lbl">휴직 기간</span><div class="two">' + dateField('cStart', '시작일', calcS.start) + dateField('cEnd', '끝나는 날', calcS.end) + '</div>'
      + '<div class="quick" id="cQuick">' + [3, 6, 12, 18].map(m => '<button type="button" class="chip" data-m="' + m + '">' + m + '개월</button>').join('') + '</div></div>'
      + '<div class="fg"><label class="lbl" for="cUsed">이 아이로 이미 쓴 육아휴직</label><div class="unit"><input class="inp" id="cUsed" type="number" inputmode="numeric" min="0" max="18" value="' + esc(calcS.used || 0) + '"><span>개월</span></div><small class="hint">처음이면 0. 나눠 쓰면 앞서 쓴 달에 이어서 계산.</small></div>'
      + '<div class="fg"><span class="lbl">내 상황</span><div class="seg" id="cMode"><button type="button" data-m="general">일반</button><button type="button" data-m="both">부모 모두(6+6)</button><button type="button" data-m="single">한부모</button></div></div>'
      // PC: 한 번 넣으면 잘 바꾸지 않는 값이라 접어 두어 결과가 첫 화면에 보이게 한다. 접힌 줄에 지금 값을 보여 준다
      + '<div id="bothBox" class="fwide" hidden>' + (isWide() ? '<details class="dt" id="bothMore"><summary id="bothSum">배우자와 아이 날짜</summary><div class="bothgrid">' : '') + '<div class="bwide"><span class="lbl">배우자는</span><div class="seg" id="cIns"><button type="button" data-s="worker">회사원 등 근로자</button><button type="button" data-s="civil">공무원·국공립 교원</button><button type="button" data-s="none">자영업·프리랜서·전업</button></div>'
      + '<details class="dt"><summary>배우자 직종에 따라 다름</summary><p>배우자가 공무원·교원이어도 근로자인 나는 6+6 적용. 신청할 때 배우자의 휴직 경력 증빙(고용노동부 답변). 배우자가 자영업·프리랜서·전업이면 육아휴직이 없어 일반 기준. 사립학교 교직원 배우자는 답변을 찾지 못해 1350에 먼저 문의.</p></details></div>'
      + '<div class="bcol"><label class="lbl" for="cSpouse">배우자가 쓰는 기간</label><div class="unit"><input class="inp" id="cSpouse" type="number" inputmode="numeric" min="0" max="18" value="' + esc(calcS.spouseMonths) + '"><span>개월</span></div></div>'
      + '<div id="spousePayBox">' + manField('cSpousePay', '배우자 월 통상임금 (선택)', calcS.spousePay, '넣으면 우리 집 합계도 표시.') + '</div>'
      + '<div class="bcol bkid"><span class="lbl">아이 날짜(6+6은 꼭 필요)</span>' + kidSeg() + '<div class="two">' + dateField('cBirth', '태어난 날', calcS.birth) + dateField('cDue', '출산 예정일', calcS.due) + '</div><small class="hint">생후 18개월 안에 시작하는지 확인. 저장은 이 기기에만.</small></div>' + (isWide() ? '</div></details>' : '') + '</div>'
      + '<div id="singleBox" class="fwide" hidden><small class="hint">한부모는 한부모가족지원법에 따라 지원 대상으로 인정된 모 또는 부. 별거 중이거나 혼자 키운다는 것만으로는 해당 없음(시행령 제95조의3 제3항).</small></div>'
      + '<details class="dt fwide"><summary>휴직 중 회사에서 돈을 받으면?</summary><p>회사에서 받는 돈과 급여를 합해 통상임금을 넘으면, 넘는 만큼 급여에서 빠짐.</p>' + manField('cCompany', '매달 받는 금액', calcS.company) + '</details>'
      + '</div>';
    const out = () => {
      const sj = calcS.spouseJob;
      // 6+6: 아이 날짜를 모르면 금액을 보여 주지 않고, 생후 18개월을 넘겨 시작하면 일반 기준으로 계산한다(11-04 재검토)
      const kid = K.childDates({ birth: calcS.birth, due: calcS.due });
      const needBirth = calcS.mode === 'both' && !kid.bothStartBy;
      const past18 = calcS.mode === 'both' && kid.bothStartBy && calcS.start > kid.bothStartBy;
      const r = K.leaveBenefit({ ordinary: toWon(calcS.pay), start: calcS.start, end: calcS.end, mode: past18 ? 'general' : calcS.mode, spouseMonths: calcS.spouseMonths, spouseLeave: sj !== 'none', usedMonths: calcS.used, companyPay: toWon(calcS.company) });
      if (needBirth) r.warnings.push('needBirth');
      const noPay = r.warnings.includes('pay');
      $$('#cMode button').forEach(b => b.classList.toggle('on', b.dataset.m === calcS.mode));
      $('#bothBox').hidden = calcS.mode !== 'both';
      $('#singleBox').hidden = calcS.mode !== 'single';
      $('#spousePayBox').hidden = sj !== 'worker';
      $$('#cIns button').forEach(b => b.classList.toggle('on', b.dataset.s === sj));
      if ($('#bothMore')) {
        const sjName = { worker: '회사원 등 근로자', civil: '공무원·국공립 교원', none: '자영업·프리랜서·전업' }[sj] || '';
        $('#bothSum').textContent = '배우자 ' + sjName + ' · ' + (+calcS.spouseMonths || 0) + '개월 · 아이 ' + (calcS.birth ? dot(calcS.birth) : calcS.due ? dot(calcS.due) + ' 예정' : '날짜 없음');
        if (!kid.bothStartBy) $('#bothMore').open = true;      // 아이 날짜가 없으면 금액을 못 보여 주니 펼쳐 둔다
      }
      let compare = '', house = '', birthNote = '';
      if (calcS.mode !== 'general' && !past18 && r.rows.length && !noPay) {
        const g = K.leaveBenefit({ ordinary: toWon(calcS.pay), start: calcS.start, end: calcS.end, usedMonths: calcS.used, companyPay: toWon(calcS.company) });
        if (r.total > g.total) compare = '<p class="cline">일반 기준보다 <b>' + won(r.total - g.total) + '</b> 더 받음.</p>';
      }
      if (calcS.mode === 'both' && sj === 'worker' && !past18 && toWon(calcS.spousePay) > 0 && +calcS.spouseMonths > 0) {
        const sEnd = K.addDays(K.addMonths(calcS.start, Math.min(18, +calcS.spouseMonths)), -1);
        const s = K.leaveBenefit({ ordinary: toWon(calcS.spousePay), start: calcS.start, end: sEnd, mode: 'both', spouseMonths: r.used + r.fullMonths });
        house = '<p class="cline">배우자 ' + s.months + '개월 <b>' + won(s.total) + '</b> · 우리 집 합계 <b>' + won(r.total + s.total) + '</b></p>';
      }
      if (calcS.mode === 'both' && sj === 'civil' && r.common) house = '<p class="cline">배우자는 공무원 수당 규정으로 따로 받음. 나는 급여 신청 때 배우자의 휴직 경력 증빙.</p>';
      if (kid.bothStartBy && calcS.mode === 'both') {
        const d = kid;
        birthNote = past18
          ? '<div class="warn">⚠️ 시작일이 생후 18개월(' + dot(d.bothStartBy) + ')을 넘음. 부모 모두 그날까지 휴직을 시작해야 6+6 적용. 그래서 일반 기준으로 계산.' + (+calcS.used ? ' 나눠 쓰는 뒤 기간이 6+6에 드는지는 고용센터에 확인.' : '') + '</div>'
          : '<p class="cline ok">시작일이 생후 18개월(' + dot(d.bothStartBy) + ') 안. 배우자도 그날까지 시작해야 함. 내가 먼저 쓰면 일단 일반 기준으로 받고, 배우자가 쉰 뒤 차액을 더 받음.</p>';
      }
      const tbl = groupRows(r.rows).map(g => '<tr><td>' + (g.full ? (g.from === g.to ? g.from + '개월째' : g.from + '~' + g.to + '개월째') : g.from + '개월째 ' + g.days + '일') + (g.special ? ' <span class="six">6+6</span>' : '') + '<small>' + Math.round(g.rate * 100) + '% · 상한 ' + (g.cap / 10000) + '만원' + (g.cut ? ' · ' + won(g.cut) + ' 감액' : '') + '</small></td><td>' + (g.full ? '월 ' : '') + won(g.paid) + '</td></tr>').join('');
      // 회사 신청 기한(시작 30일 전)이 이미 지났으면 "그날까지"가 아니라 지금 할 수 있는 일을 알려 준다(시행령 제11조 제7항: 기한 뒤 신청도 30일 안에 시작일을 정해 허용)
      const late = r.applyBy && r.applyBy < todayStr();
      const dates = '<div class="about rdates"><b>챙길 날짜</b><ul>'
        + (late ? '<li>회사 신청 기한(시작 30일 전, <b>' + dot(r.applyBy) + '</b>)은 지남. 회사와 협의하면 지금도 신청 가능하고, 기한을 넘겨 신청하면 회사는 신청일부터 30일 안에 시작일을 정해 허용해야 함.</li>'
          : '<li>회사에 신청: <b>' + dot(r.applyBy) + '</b>까지(시작 30일 전)</li>')
        + '<li>급여 신청: <b>' + dot(r.claimFrom) + '</b>부터 <b>' + dot(r.claimTo) + '</b>까지 고용24에서</li></ul></div>';
      const body = isWide()
        ? (r.rows.length && !noPay ? leaveCompare(kid, past18) + (house ? '<div class="resnote">' + house + '</div>' : '') + (needBirth ? '' : dates) : '')
        : (r.rows.length && !noPay && !needBirth ? '<div class="result"><small>' + r.months + '개월 받는 돈(어림)' + (r.mode === 'both' && r.common ? ' · 6+6 ' + r.common + '개월' : '') + '</small><strong>' + won(r.total) + '</strong>' + compare + house + '<table class="calctbl">' + tbl + '</table></div>' + dates : '');
      $('#calcOut').innerHTML = warnBox(r.warnings) + birthNote + body
        + basis('고용보험법 시행령 제95조·제95조의3·제98조(시행 2026.9.18.), 고용노동부 답변', W24_SIM, ['고용보험 가입 180일 이상만 수급', '실제 금액은 고용센터 결정'], '급여는 시작 전 고용보험 가입 기간(피보험 단위기간)이 180일 이상이어야 함. 지난 직장 기간도 합산(공백이 3년 이상이면 그 전은 빠지고, 실업급여를 받았으면 그 전은 빠짐). 그 회사에서 일한 기간이 6개월 미만이면 회사가 휴직을 거부할 수 있음. 실제 금액은 고용센터가 정함.');
    };
    const setMonths = m => { calcS.end = K.addDays(K.addMonths(calcS.start, m), -1); $('#cEnd').value = calcS.end; saveCalc(); out(); };
    bindInputs({
      cPay: el => { calcS.pay = parseFloat(el.value) || 0; }, cStart: el => { if (K.parse(el.value)) calcS.start = el.value; }, cEnd: el => { if (K.parse(el.value)) calcS.end = el.value; },
      cUsed: el => { calcS.used = parseInt(el.value, 10) || 0; }, cSpouse: el => { calcS.spouseMonths = parseInt(el.value, 10) || 0; }, cSpousePay: el => { calcS.spousePay = el.value; }, cBirth: el => { calcS.birth = el.value; }, cDue: el => { calcS.due = el.value; }, cCompany: el => { calcS.company = el.value; }
    }, out);
    $('#cQuick').addEventListener('click', ev => { const b = ev.target.closest('[data-m]'); if (b) setMonths(+b.dataset.m); });
    $('#cMode').addEventListener('click', ev => { const b = ev.target.closest('[data-m]'); if (b) { calcS.mode = b.dataset.m; saveCalc(); out(); } });
    if (isWide()) $('#calcOut').onclick = ev => { const b = ev.target.closest('[data-pick-mode]'); if (b) { calcS.mode = b.dataset.pickMode; saveCalc(); out(); } };
    $('#cIns').addEventListener('click', ev => { const b = ev.target.closest('[data-s]'); if (b) { calcS.spouseJob = b.dataset.s; saveCalc(); out(); } });
    bindOrd(out);
    out();
  }
  // 공무원·교원 육아휴직 수당(공무원수당 규정 제11조의3 등). 고용보험과 달리 월봉급액 기준이고, 나오는 기간에 끝이 있다
  function calcCivil() {
    $('#calcForm').innerHTML = '<div class="form">'
      + manField('cBong', '내 월봉급액', calcS.bong, '수당을 뺀 봉급. 급여명세서의 봉급 칸 확인. 휴직 시작일 기준.')
      + '<label class="lbl" for="cMon">쉬는 기간</label><div class="unit"><input class="inp" id="cMon" type="number" inputmode="numeric" min="1" max="36" value="' + esc(calcS.cMonths) + '"><span>개월</span></div>'
      + '<div class="quick" id="cMq">' + [6, 12, 18, 36].map(m => '<button type="button" class="chip" data-m="' + m + '">' + m + '개월</button>').join('') + '</div>'
      + '<span class="lbl">내 상황</span><div class="seg" id="cCm"><button type="button" data-m="general">일반</button><button type="button" data-m="second">두 번째로 쉼</button><button type="button" data-m="single">한부모</button></div>'
      + '<small class="hint">같은 자녀로 부모가 모두 쉬고 내가 두 번째면 첫 6개월 상한 인상. 배우자가 회사원이어도 해당.</small>'
      + '<label class="chk"><input type="checkbox" id="cLong"' + (calcS.cLonger ? ' checked' : '') + '> 부모가 각각 3개월 이상 쉬거나 장애 자녀의 부모(수당 1년 6개월까지)</label>'
      + '</div>';
    const out = () => {
      const r = K.civilBenefit({ bong: toWon(calcS.bong), months: calcS.cMonths, mode: calcS.cMode, longer: calcS.cLonger });
      $$('#cCm button').forEach(b => b.classList.toggle('on', b.dataset.m === calcS.cMode));
      const tbl = groupRows(r.rows).map(g => '<tr><td>' + (g.from === g.to ? g.from + '개월째' : g.from + '~' + g.to + '개월째') + '<small>' + Math.round(g.rate * 100) + '% · 상한 ' + (g.cap / 10000) + '만원</small></td><td>월 ' + won(g.paid) + '</td></tr>').join('');
      $('#calcOut').innerHTML = warnBox(r.warnings)
        + (r.bong && r.rows.length ? '<div class="result"><small>' + r.months + '개월 쉴 때 받는 수당(어림)</small><strong>' + won(r.total) + '</strong>'
          + (r.unpaidMonths ? '<p class="cline">수당은 ' + r.paidMonths + '개월까지. 나머지 ' + r.unpaidMonths + '개월은 수당 없음.</p>' : '')
          + '<table class="calctbl">' + tbl + '</table></div>' : '')
        + '<div class="about rdates"><b>자녀 나이와 기간</b><ul><li>일반 공무원: 12세 이하 또는 초6 이하 자녀(국가공무원법 제71조, 지방공무원법 제63조)</li><li>교사: 만 8세 이하 또는 초2 이하 자녀(교육공무원법 제44조, 사립학교법 제59조)</li><li>자녀 1명당 3년 이내</li></ul><a class="lk2" href="#/g/leave-job">직종별 안내 보기</a></div>'
        + notes(['수당 규정 숫자로 만든 육아맨 어림값(고용24 제공 아님)', '실제 금액은 소속 기관 결정'])
        + '<details class="dt"><summary>근거와 주의할 점</summary><p>' + (calcS.job === 'pteacher' ? '사립학교 교원은 국공립 교원 규정 준용(사립학교법 시행령 제24조의9). 실제 지급은 학교 행정실에 확인. ' : '') + '근거: 공무원수당 규정 제11조의3(시행 2026.10.2.), 지방공무원 수당 규정 제11조의2(시행 2026.10.1.), ' + esc(dot(K.RULES.checkedAt)) + ' 확인.</p></details>';
    };
    bindInputs({ cBong: el => { calcS.bong = parseFloat(el.value) || 0; }, cMon: el => { calcS.cMonths = parseInt(el.value, 10) || 0; }, cLong: el => { calcS.cLonger = el.checked; } }, out);
    $('#cMq').addEventListener('click', ev => { const b = ev.target.closest('[data-m]'); if (b) { calcS.cMonths = +b.dataset.m; $('#cMon').value = calcS.cMonths; saveCalc(); out(); } });
    $('#cCm').addEventListener('click', ev => { const b = ev.target.closest('[data-m]'); if (b) { calcS.cMode = b.dataset.m; saveCalc(); out(); } });
    out();
  }
  // 공무원·교원의 단축·출산휴가 칸: 근로자용 계산식이 아니라서 안내로 보낸다
  function civilOther(tab) {
    const t = tab === 'reduce' ? '공무원·교원은 육아기 근무시간 단축수당이 따로 있음(공무원수당 규정 제11조의3 제5항). 이 칸은 회사원 등 고용보험 근로자용. 금액은 소속 기관에 확인.'
      : '공무원·교원의 배우자 출산휴가는 복무 규정을 따름. 이 칸은 회사원 등 고용보험 근로자용. 소속 기관에 확인.';
    return '<div class="about">' + t + '<a class="lk2" href="#/g/leave-job" style="display:block">직종별 안내 보기</a></div>';
  }
  // 어림이라는 것과 꼭 알 것만 한 줄로 두고, 자세한 근거는 접어 둔다(11-04 운영자 "글자수도 너무 많고")
  function basis(law, simUrl, short, extra) {
    return notes(['법령 숫자로 만든 육아맨 어림값(고용24 제공 아님)'].concat(short))
      + '<details class="dt"><summary>근거와 주의할 점</summary><p>' + esc(extra || '') + ' 근거: ' + esc(law) + ', ' + esc(dot(K.RULES.checkedAt)) + ' 확인.</p></details>'
      + '<a class="offi" href="' + esc(simUrl) + '" target="_blank" rel="noopener">고용24 공식 사이트에서 확인하기</a>';
  }
  function calcReduce() {
    $('#calcForm').innerHTML = '<div class="form fgrid"><div class="fg">' + manField('cPay', '내 월 통상임금', calcS.pay) + ORD_HELP + '</div>'
      + '<div class="fg"><div class="two" style="margin-top:12px"><label class="dfield"><span>단축 전 주 근로시간</span><input class="inp" id="cBefore" type="number" inputmode="numeric" value="' + esc(calcS.before) + '"></label><label class="dfield"><span>단축 후 주 근로시간</span><input class="inp" id="cAfter" type="number" inputmode="numeric" value="' + esc(calcS.after) + '"></label></div>'
      + '<div class="quick" id="cHours">' + [35, 30, 25, 20, 15].map(h => '<button type="button" class="chip" data-h="' + h + '">주 ' + h + '시간</button>').join('') + '</div></div>'
      + '<div class="fg fg-later"><span class="lbl">하교 시간에 맞춰 퇴근 시각으로 고르기</span><div class="quick" id="cOut">' + [[14, 20], [15, 25], [16, 30], [17, 35]].map(x => '<button type="button" class="chip" data-h="' + x[1] + '">오후 ' + (x[0] - 12) + '시 퇴근</button>').join('') + '</div><small class="hint">9시 출근, 점심 1시간, 주 5일로 계산. 오후 3시 퇴근이면 주 25시간.</small></div>'
      + '<div class="fg"><label class="lbl" for="cMonths">단축 기간</label><div class="unit"><input class="inp" id="cMonths" type="number" inputmode="numeric" min="1" max="36" value="' + esc(calcS.rMonths) + '"><span>개월</span></div>'
      + '<details class="dt"><summary>마지막 달이 한 달을 못 채우면?</summary><p>못 채운 달의 급여는 그 달의 일수에 비례해 줄어듦. 그 달에 쓰는 일수를 넣으면 31일 달 기준으로 어림해 합계에 반영.</p><div class="unit"><input class="inp" id="cLast" type="number" inputmode="numeric" min="0" max="30" value="' + esc(calcS.rLast || '') + '" aria-label="마지막 달 일수"><span>일</span></div></details></div></div>';
    const out = () => {
      const r = K.reduceBenefit({ ordinary: toWon(calcS.pay), before: calcS.before, after: calcS.after, months: calcS.rMonths, lastDays: calcS.rLast });
      $('#calcOut').innerHTML = warnBox(r.warnings) + (r.cut > 0 && !r.warnings.includes('pay') ? '<div class="result"><small>단축근무 중 한 달 수입(어림)</small><strong>' + won(r.monthly) + '</strong>'
        + '<table class="calctbl"><tr><td>회사 임금<small>일한 시간에 비례한 어림값</small></td><td>' + won(r.wage) + '</td></tr>'
        + '<tr><td>정부 급여 · 첫 ' + r.firstHours + '시간<small>통상임금 100%, 상한 250만원</small></td><td>' + won(r.first) + '</td></tr>'
        + (r.restHours ? '<tr><td>정부 급여 · 나머지 ' + r.restHours + '시간<small>통상임금 80%, 상한 160만원</small></td><td>' + won(r.rest) + '</td></tr>' : '')
        + (r.reduced ? '<tr><td>감액<small>임금과 급여의 합이 통상임금을 넘는 만큼</small></td><td>-' + won(r.reduced) + '</td></tr>' : '')
        + '<tr class="sum"><td>정부 급여 ' + r.months + '개월 합계</td><td>' + won(r.totalGov) + '</td></tr></table>'
        + '<p class="cline">평소 통상임금보다 한 달에 <b>' + won(Math.max(0, r.lost)) + '</b> 줄고, 주 <b>' + r.cut + '시간</b>을 아이와 더 보냄.</p></div>' : '')
        + basis('고용보험법 시행령 제104조의2(2026.1.1.부터 상한 250만·160만원, 하한 50만원)', 'https://m.work24.go.kr/cm/c/f/1100/selecSimulate13.do?systClId=SC00000252&systId=SI00000397&systCnntId=CI00001582', ['회사 임금은 임금 규정에 따라 변동'], '회사 임금은 일한 시간에 비례해 어림. 실제 회사 임금은 임금 규정에 따라 다름.');
    };
    bindInputs({ cPay: el => { calcS.pay = parseFloat(el.value) || 0; }, cBefore: el => { calcS.before = parseFloat(el.value) || 0; }, cAfter: el => { calcS.after = parseFloat(el.value) || 0; }, cMonths: el => { calcS.rMonths = parseInt(el.value, 10) || 1; }, cLast: el => { calcS.rLast = parseInt(el.value, 10) || 0; } }, out);
    const pickH = ev => { const b = ev.target.closest('[data-h]'); if (b) { calcS.after = +b.dataset.h; $('#cAfter').value = calcS.after; saveCalc(); out(); } };
    $('#cHours').addEventListener('click', pickH); $('#cOut').addEventListener('click', pickH);
    bindOrd(out);
    out();
  }
  function calcPaternity() {
    $('#calcForm').innerHTML = '<div class="form fgrid"><div class="fg">' + manField('cPay', '내 월 통상임금', calcS.pay) + ORD_HELP + '</div>'
      + '<div class="fg"><span class="lbl">회사 규모</span><div class="seg" id="cPri"><button type="button" data-p="1">우선지원대상기업</button><button type="button" data-p="0">그 밖의 회사</button></div>'
      + '<small class="hint">우선지원대상기업은 대체로 중소기업. 업종별 기준이 있어 회사 인사팀에 물어보면 바로 확인 가능.</small></div>'
      + '<div class="fg fwide"><span class="lbl">아이 날짜</span>' + kidSeg() + '<div class="two">' + dateField('cDue', '출산 예정일', calcS.due) + dateField('cBirth', '태어난 날', calcS.birth) + '</div></div></div>';
    const out = () => {
      const r = K.paternityPay({ ordinary: toWon(calcS.pay), priority: calcS.priority });
      $$('#cPri button').forEach(b => b.classList.toggle('on', (b.dataset.p === '1') === !!calcS.priority));
      const d = K.childDates({ birth: calcS.birth, due: calcS.due });
      $('#calcOut').innerHTML = warnBox(r.warnings) + (r.warnings.length ? '' : '<div class="result"><small>20일 동안 받는 돈(통상임금 기준)</small><strong>' + won(r.total) + '</strong>'
        + '<table class="calctbl"><tr><td>정부 급여<small>' + (calcS.priority ? '20일 상한 ' + won(r.capAll) + ' · 하한 최저임금' : '우선지원대상기업이 아니면 없음') + '</small></td><td>' + won(r.gov) + '</td></tr>'
        + '<tr><td>회사가 주는 몫<small>유급 휴가라 나머지는 회사 몫</small></td><td>' + won(r.company) + '</td></tr></table></div>')
        + (d.paternityTo ? '<div class="about rdates"><b>쓸 수 있는 기간</b><ul><li>' + (d.paternityFrom ? '<b>' + dot(d.paternityFrom) + '</b>부터' : '출산 예정일 50일 전부터') + ' <b>' + dot(d.paternityTo) + '</b>까지' + (d.birth ? '' : '(예정일 기준 어림)') + '. 마지막 날이 토·일·공휴일이면 다음 날까지.</li><li>20일을 네 번까지 나눠 쓰기 가능.</li><li>날짜를 적은 문서로 회사에 알리기.</li></ul></div>' : '<div class="about">출산 예정일이나 태어난 날을 넣으면 쓸 수 있는 기간 표시.</div>')
        + basis('남녀고용평등법 제18조의2(시행 2026.9.18.), 고용노동부 2026 급여 상한', 'https://www.work24.go.kr/', ['실제 금액과 날짜는 회사에 확인'], '1일 통상임금은 월 통상임금 ÷ 209시간 × 8시간으로 어림. 끝나는 날은 태어난 날에 120일을 더한 값이라 회사와 확인 필요.');
    };
    bindInputs({ cPay: el => { calcS.pay = parseFloat(el.value) || 0; }, cDue: el => { calcS.due = el.value; }, cBirth: el => { calcS.birth = el.value; } }, out);
    $('#cPri').addEventListener('click', ev => { const b = ev.target.closest('[data-p]'); if (b) { calcS.priority = b.dataset.p === '1'; saveCalc(); out(); } });
    bindOrd(out);
    out();
  }
  // 계산기 '내 아이 날짜'(calcDates)는 11-13에 뺐다. 같은 날짜는 홈 '지금 챙길 것'(tlItems)에 있다
  // ----- 자료실 -----
  const LIB_STEP = 20;     // 유용한 순으로 20개씩(11-05 운영자). 순서는 tools/build_library.py가 정해 둔다
  const lib = { items: null, q: '', topic: '', shown: LIB_STEP };
  async function loadLibrary() {
    if (lib.items) return lib.items;
    const res = await fetch('data/library.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('library ' + res.status);
    const data = await res.json();
    lib.items = data.items || []; lib.topics = data.topics || []; lib.updated = data.updated || '';
    lib.items.forEach(x => { x._hay = [x.title, x.publisher, x.summary, x.type, x.topic, (x.facts || []).join(' ')].join(' ').toLowerCase(); });
    return lib.items;
  }
  function lcard(x) {
    // 제목 + 오른쪽 표시 + 설명 한 덩이(홈 타임라인과 같은 짜임). 세부 사실(facts)은 카드에 쓰지 않고 검색에만 쓴다
    return '<a class="lcard" href="' + esc(x.url) + '" target="_blank" rel="noopener"><span class="top"><b>' + esc(x.title) + '</b><span class="pill' + (x.official ? '' : ' done') + '">' + esc(x.official ? '공식' : x.type) + '</span></span>'
      + '<small>' + esc(x.publisher || '') + (x.date ? ' · ' + esc(dot(x.date)) : '') + '</small><p>' + esc(x.summary || '') + '</p></a>';
  }
  function paintLibrary() {
    const box = $('#libList'); if (!box) return;
    const words = lib.q.toLowerCase().split(/\s+/).filter(Boolean);
    const rows = lib.items.filter(x => (!lib.topic || x.topic === lib.topic) && words.every(w => x._hay.indexOf(w) >= 0));
    $('#libCount').textContent = rows.length + '건';
    box.innerHTML = rows.length ? rows.slice(0, lib.shown).map(lcard).join('') + (rows.length > lib.shown ? '<button type="button" class="more" id="libMore">더 보기</button>' : '') : empty('찾는 자료 없음', '다른 말로 찾아보기');
  }
  async function renderLibrary() {
    setTab('guide');
    bar(brandBar());
    view.innerHTML = '<section class="pad">' + guideHead('library') + '<div class="loading" id="libLoad">불러오는 중…</div></section>';
    window.scrollTo(0, 0);
    try { await loadLibrary(); } catch (e) { $('#libLoad').outerHTML = empty('자료 불러오기 실패', '잠시 뒤 다시 열기'); return; }
    const sec = $('#view section');
    $('#libLoad').remove();
    sec.insertAdjacentHTML('beforeend', '<div class="searchbar"><input id="libQ" type="search" placeholder="키워드 검색: 6+6, 복직, 판례, 후기" enterkeyhint="search" autocomplete="off" value="' + esc(lib.q) + '"></div>'
      + '<div class="chips" id="libTopics"><button type="button" class="chip' + (!lib.topic ? ' on' : '') + '" data-t="">전체</button>' + lib.topics.map(t => '<button type="button" class="chip' + (lib.topic === t ? ' on' : '') + '" data-t="' + esc(t) + '">' + esc(t) + '</button>').join('') + '</div>'
      + '<div class="sec" style="margin-top:4px"><h2 style="font-size:15px">' + (lib.updated ? esc(dot(lib.updated)) + ' 모음' : '자료') + '</h2><span id="libCount"></span></div><div class="list" id="libList"></div>'
      + notes(['누르면 원문으로 이동', '숫자는 그 자료가 나온 때 기준']) + fixBtn('library'));
    $('#libQ').addEventListener('input', ev => { lib.q = ev.target.value.trim(); lib.shown = LIB_STEP; paintLibrary(); });
    $('#libTopics').addEventListener('click', ev => { const b = ev.target.closest('[data-t]'); if (!b) return; lib.topic = b.dataset.t; lib.shown = LIB_STEP; $$('#libTopics .chip').forEach(x => x.classList.toggle('on', x === b)); paintLibrary(); });
    $('#libList').addEventListener('click', ev => { if (!ev.target.closest('#libMore')) return; lib.shown += LIB_STEP; paintLibrary(); });
    lib.shown = LIB_STEP;
    paintLibrary();
  }

  // ----- 아빠 육아템(11-12 운영 방향 1단계 새 탭): 쿠팡 · 광고주 판매처로 가는 링크를 카테고리 여섯으로 모은다. 육아맨이 직접 팔지 않는다 -----
  // 카테고리와 상품 목록은 shop-data.js. 상품은 아직 비어 있다(지어낸 상품을 넣지 않는다). 가격은 적지 않고, 놓인 순서는 순위가 아니다. 누구나 본다
  const SHOP = window.YK_SHOP || { cats: [], items: [] };
  const SHOP_CATS = SHOP.cats || [];
  const SHOP_CAT = {}; SHOP_CATS.forEach(c => { SHOP_CAT[c.key] = c; });
  const shopSubs = c => (c.subs || []).join(' · ');
  // 표시 문구(공정위 추천 · 보증 심사지침): 탭과 카테고리 화면 맨 위. class는 ad로 시작하지 않게(paynote · lab)
  // 쿠팡 링크가 있으면 쿠팡 파트너스가 정한 대가 문구를 그대로 쓴다(11-13 파트너스 링크 생성 화면의 '활동 시 주의 사항' 1번 문구). 다른 판매처 링크가 섞이면 한 줄을 더한다
  const SHOP_HAS_CP = (SHOP.items || []).some(p => p && p.seller === '쿠팡'), SHOP_HAS_OTHER = (SHOP.items || []).some(p => p && p.seller && p.seller !== '쿠팡');
  const SHOP_NOTE = '<div class="paynote"><span class="lab">광고</span><span>'
    + (SHOP_HAS_CP ? '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.' : '')
    + (SHOP_HAS_OTHER || !SHOP_HAS_CP ? (SHOP_HAS_CP ? ' ' : '') + '이 탭의 다른 상품 링크도 광고 · 제휴 링크. 링크로 사면 육아맨이 수수료를 받음.' : '') + '</span></div>';
  const SHOP_NOTES = () => notes(['가격은 판매처에서 확인. 자주 바뀌어 여기에 적지 않음', '놓인 순서는 순위 아님']);
  const shopReady = () => '<div class="about shopwait">상품 준비 중.</div>';
  // 상품 한 칸. 링크는 누른 사람만 판매처로 간다(새 창). 판매처 이름은 데이터에 적힌 대로
  function prodCard(p) {
    const c = SHOP_CAT[p.cat] || {};
    return '<a class="prod" data-k="' + esc([p.cat, p.sub || '', p.seller || '', p.name].join('|')) + '" href="' + esc(p.url) + '" target="_blank" rel="noopener sponsored nofollow"><span class="ppic" aria-hidden="true">' + esc(c.e || '🛍️') + '</span><b>' + esc(p.name) + '</b>'
      + (p.sub ? '<small>' + esc(p.sub) + '</small>' : '') + '<span class="pgo">' + esc(p.seller || '판매처') + '에서 보기 ›</span></a>';
  }
  const shopItems = key => (SHOP.items || []).filter(p => p && p.cat === key && /^https:\/\//.test(p.url || '') && p.name);
  let shopSub = '';
  // 광고 · 제휴 표시와 가격 안내는 상품이 있을 때만 보인다(11-12: 상품이 없는데 "수수료를 받아요"가 크게 떠 있었다). 상품이 있으면 꼭 보인다
  function renderShop(key, sub) {
    setTab('shop');
    const c = SHOP_CAT[key];
    if (!c) {
      bar(brandBar());
      const any = SHOP_CATS.some(x => shopItems(x.key).length);
      view.innerHTML = '<section class="pad">' + pageHead('🛍️', '아빠 육아템', '아빠가 고르는 육아용품') + (any ? SHOP_NOTE : '')
        + '<div class="cats">' + SHOP_CATS.map(x => '<a class="cat" href="#/shop/' + esc(x.key) + '"><span class="ge">' + esc(x.e) + '</span><b>' + esc(x.name) + '</b><small>' + esc(shopSubs(x)) + '</small></a>').join('') + '</div>'
        + (any ? SHOP_CATS.map(x => { const list = shopItems(x.key); return list.length ? '<div class="sec"><h2>' + esc(x.name) + '</h2><a class="all" href="#/shop/' + esc(x.key) + '">전체 보기 →</a></div><div class="prods">' + list.slice(0, 2).map(prodCard).join('') + '</div>' : ''; }).join('') + SHOP_NOTES()
          : shopReady())     // 아래의 '고르는 법 글 먼저 보기'는 뺐다(11-13 운영자)
        + '</section>';
      window.scrollTo(0, 0);
      return;
    }
    bar(backBtn('#/shop') + '<div class="fill atitle">아빠 육아템 · ' + esc(c.name) + '</div>');
    if (sub && (c.subs || []).indexOf(sub) >= 0) shopSub = sub;      // 용품 글의 작은 제목에서 세부 칸으로 바로 온 경우
    if (shopSub && (c.subs || []).indexOf(shopSub) < 0) shopSub = '';
    const all = shopItems(key);
    const gearGuide = GD.items.find(g => g.cat === 'gear' && g.shop === key);     // 이 카테고리의 고르는 법 글(guide-data.js)
    const paint = () => {
      const list = shopSub ? all.filter(p => p.sub === shopSub) : all;
      const box = $('#shopList'); if (box) box.innerHTML = list.length ? '<div class="prods">' + list.map(prodCard).join('') + '</div>' : shopReady();
    };
    // '추천받기'로 온 사람에게 무엇을 보고 고르는지부터 보여 준다(글의 points 세 줄)
    const crit = gearGuide && gearGuide.points
      ? '<div class="critbox"><b>아빠가 고르는 기준</b><ul>' + gearGuide.points.map(p => '<li>' + esc(p) + '</li>').join('') + '</ul><a class="lk2" href="#/g/' + esc(gearGuide.id) + '">고르는 법 자세히 보기 ›</a></div>'
      : '';     // 고르는 법 글이 없는 카테고리는 기준 상자 없이(11-13 '고르는 법 먼저 보기' 단추를 뺌)
    view.innerHTML = '<section class="pad">' + pageHead(c.e, c.name, shopSubs(c)) + (all.length ? SHOP_NOTE : '')
      + crit
      + (all.length && (c.subs || []).length ? '<div class="chips" id="shopSubs"><button type="button" class="chip' + (shopSub ? '' : ' on') + '" data-sub="">전체</button>' + c.subs.map(s => '<button type="button" class="chip' + (s === shopSub ? ' on' : '') + '" data-sub="' + esc(s) + '">' + esc(s) + '</button>').join('') + '</div>' : '')
      + '<div id="shopList" style="margin-top:16px"></div>'
      + (all.length ? SHOP_NOTES() : '')
      + '<a class="grow" href="#/community/gear" style="margin-top:14px"><span class="ge">🙋</span><span class="tx"><b>써 본 아빠들에게 물어보기</b><small>질문게시판 용품 칸</small></span></a>'
      + '</section>';
    paint();
    const subs = $('#shopSubs');
    if (subs) subs.addEventListener('click', ev => { const b = ev.target.closest('[data-sub]'); if (!b) return; shopSub = b.dataset.sub; $$('#shopSubs .chip').forEach(x => x.classList.toggle('on', x === b)); paint(); });
    window.scrollTo(0, 0);
  }

  // ----- 질문게시판(옛 커뮤니티. 주소 #/community · #/p/<번호> · #/write는 그대로) -----
  const listState = { cat: '', age: '', q: '', posts: [], next: null, scroll: 0, keep: false };   // age = 아이 나이로 거르기(UI 3안). 분류를 바꿔도 유지
  function chip(key, name, e, cur) { return '<a class="chip' + (key === cur ? ' on' : '') + '" href="#/community' + (key ? '/' + key : '') + '"><span class="e">' + e + '</span>' + esc(name) + '</a>'; }
  // 질문 카드(11-12): 글 = 질문, 댓글 = 답. 답이 0이면 '답 기다리는 중'
  function pcard(p) {
    const c = catOf(p.cat), n = p.comments || 0;
    return '<a class="pcard qcard" href="#/p/' + p.id + '" data-keep="1"><div class="meta"><span class="badges"><span class="badge c-' + esc(catCls(p.cat)) + '">' + c.e + ' ' + esc(c.name) + '</span>' + (AGE[p.age] ? '<span class="agetag">' + esc(AGE[p.age].name) + '</span>' : '') + (n ? '' : '<span class="badge c-wait">답 기다리는 중</span>') + '</span><span class="time">' + ago(p.created) + '</span></div>'
      + '<h3><span class="qm">Q</span><span class="t">' + esc(p.title) + '</span></h3><p>' + esc(p.preview || '') + '</p>'
      + '<div class="foot">' + who(p.nick, p.badge, p.rank) + '<span class="cmt">' + (p.views ? '조회 ' + p.views + ' · ' : '') + '답 ' + n + '</span></div></a>';
  }
  const BOARD_HEAD = () => pageHead('🙋', '질문게시판', '아빠끼리 묻고 답하기');
  // 커뮤니티 잠금: 인증 전에는 목록·글·검색을 열지 않고, 왜 닫혀 있는지와 인증하는 길을 보여 준다
  function renderLock() {
    fab.hidden = true;
    view.innerHTML = '<section class="pad">' + BOARD_HEAD()
      + (mode === 'local' ? mockBadge() : '')
      + '<div class="lockbox" id="lockBox"><div class="lk">🔒</div><h2>' + (socialOn() ? '가입한 아빠만 보기 가능' : '인증한 아빠만 보기 가능') + '</h2>'
      + '<p>아빠끼리 묻고 답하는 곳. 운영자는 답을 쓰지 않음.</p>'
      + (me && me.blocked ? '<div class="vstate bad">이용이 제한된 계정.</div>'
        : socialOn() ? '<div id="lockCta">' + loginBtn('lockKakao', startWord()) + (CFG.NAVER_LOGIN ? GENDER_HINT : '') + '</div>'
        : identityOn() ? '<div id="lockCta"><button type="button" class="btn primary" id="lockGo">본인인증하고 시작하기</button><small class="hint">이름·전화번호는 저장하지 않음.</small></div>'
        : '<div id="lockCta"><button type="button" class="btn primary" id="lockGo">초대 코드 있음</button><button type="button" class="btn line" id="lockNo">코드 없음 (신청서)</button><small class="hint">서류나 사진은 받지 않음.</small></div>')
      + '</div>'
      + '<div class="sec"><h2>' + (socialOn() ? '가입 전에도' : '인증 전에도') + ' 보기 가능</h2></div>'
      // 가이드 상단 버튼을 그대로 나열해 누르면 그 칸으로(11-05 운영자 "'아빠가이드' 버튼은 빼고 … 전부다 나열")
      + '<div class="tiles center" style="margin-top:0">' + GUIDE_BTNS.map(b => tile(b.e, b.name, b.h)).join('') + tile('🛍️', '아빠 육아템', '#/shop') + '</div></section>';
    window.scrollTo(0, 0);
    const after = () => render();
    const lk = $('#lockKakao'); if (lk) lk.addEventListener('click', loginGo);
    const start = $('#lockGo');
    if (start) start.addEventListener('click', () => { if (!me) openSheet(after); else openVerify(after); });
    const noCode = $('#lockNo');
    if (noCode) noCode.addEventListener('click', () => { verifyStartTab = 'apply'; if (!me) openSheet(after); else openVerify(after); });
    if (!me) return;
    // 승인·해제가 다른 곳에서 일어났을 수 있으니 서버에 맞춘다. 신청 중이면 그 상태를 보여 준다.
    const wasBlocked = !!me.blocked;
    api('me').then(r => {
      if (!$('#lockBox')) return;
      setDot(r.new_comments);
      setMe(r.user);
      if (canRead()) { render(); return; }
      if (!!me.blocked !== wasBlocked) { renderLock(); return; }
      const cta = $('#lockCta');
      if (cta && !socialOn() && r.application && r.application.status === 'pending') {
        cta.innerHTML = statusBox(r);
        const d = $('#doVerify'); if (d) d.addEventListener('click', () => openVerify(after));
      }
    }).catch(e => { if (e && e.code === 'unknown_user' && $('#lockBox')) { setMe(null); renderLock(); } });
  }
  async function renderCommunity(cat) {
    setTab('community');
    if (!canRead()) { bar(brandBar()); renderLock(); return; }
    fab.hidden = false;
    bar(brandBar());
    const reuse = listState.keep && listState.cat === cat && listState.posts.length > 0;
    listState.keep = false;
    if (!reuse) { listState.cat = cat; listState.q = ''; listState.posts = []; listState.next = null; }
    const q = listState.q;
    view.innerHTML = '<section class="pad">'
      + BOARD_HEAD()
      + '<div class="chips catchips">' + chip('', '전체', '🏠', cat) + CATS.map(c => chip(c.key, c.name, c.e, cat)).join('') + '</div>'
      // 나이 드롭다운과 검색창을 한 줄에 절반씩(11-05 운영자 "2줄로 하지 말고 칸을 절반씩 해서 1줄로"). 칸이 좁아 안내 글자를 줄였다
      + '<div class="findrow"><label class="agesel"><select id="ageSel" aria-label="아이 나이로 거르기"><option value="">전체 나이</option>' + AGES.map(x => '<option value="' + x.key + '"' + (x.key === listState.age ? ' selected' : '') + '>' + esc(x.name) + '</option>').join('') + '</select></label>'
      + '<div class="searchbar" id="searchbar"><input id="q" type="search" placeholder="키워드 검색" aria-label="키워드로 질문 찾기" enterkeyhint="search" autocomplete="off" value="' + esc(q) + '"><button type="button" class="sx" id="qx" aria-label="검색 지우기">✕</button><button type="button" class="sgo" id="qgo">찾기</button></div></div>'
      + (cat === 'gear' ? GEAR_BAR : '')
      + (mode === 'local' ? mockBadge() : '')
      + '<div id="hotBox"></div>'
      + '<div class="list" id="list"></div><button type="button" class="more" id="more" hidden>더 보기</button>'
      + '</section>';
    const syncClear = () => { $('#qx').hidden = !$('#q').value; };     // 지울 글자가 있을 때만 ✕
    syncClear();
    const doSearch = () => { const v = $('#q').value.trim(); if (!v && !listState.q) { toast('찾을 말 적기'); $('#q').focus(); return; } listState.q = v; $('#q').blur(); loadList(false); };
    $('#q').addEventListener('input', syncClear);
    $('#q').addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); doSearch(); } });
    $('#qgo').addEventListener('click', doSearch);
    $('#qx').addEventListener('click', () => { $('#q').value = ''; syncClear(); if (listState.q) { listState.q = ''; loadList(false); } });
    $('#more').addEventListener('click', () => loadList(true));
    $('#ageSel').addEventListener('change', ev => { listState.age = ev.target.value; loadList(false); });
    if (reuse) { paintList(); loadHot(); window.scrollTo(0, listState.scroll); } else { window.scrollTo(0, 0); await loadList(false); }
  }
  // 지금 뜨는 글(11-05 운영자 "핫한 글이 있으면 상위로 띄워서"). 분류·나이·검색을 고르면 그 결과만 보이게 숨긴다
  // 11-12 운영 방향: '지금 뜨는 글'은 접어 둔다(코드는 남김). 다시 켜려면 HOT_ON을 true로
  const HOT_ON = false;
  async function loadHot() {
    const box = $('#hotBox'); if (!box) return;
    if (!HOT_ON) { box.innerHTML = ''; return; }
    if (listState.cat || listState.age || listState.q || hasRail()) { box.innerHTML = ''; return; }     // 오른쪽 칸이 있으면 거기에 늘 보인다
    const seq = renderSeq;
    try {
      const r = await api('hotPosts');
      if (seq !== renderSeq || !$('#hotBox')) return;
      $('#hotBox').innerHTML = r.posts.length ? '<section class="hot"><h2>🔥 지금 뜨는 글</h2>' + r.posts.map((p, i) => '<a class="hotrow" href="#/p/' + p.id + '" data-keep="1"><i>' + (i + 1) + '</i><b>' + esc(p.title) + '</b><span>댓글 ' + (p.comments || 0) + '</span></a>').join('') + '</section>' : '';
    } catch (e) { /* 인기 글은 없어도 목록은 보인다 */ }
  }
  async function loadList(more) {
    const list = $('#list'), btn = $('#more'); if (!list) return;
    if (!more) list.innerHTML = '<div class="loading">불러오는 중…</div>';
    if (btn) { btn.disabled = true; btn.textContent = '불러오는 중…'; }
    const seq = renderSeq;
    try {
      const r = await api('listPosts', { cat: listState.cat, age: listState.age, q: listState.q, before: more ? listState.next : '', limit: PAGE });
      if (seq !== renderSeq) return;
      listState.posts = more ? listState.posts.concat(r.posts) : r.posts; listState.next = r.next;
      if (mode === 'local' && !$('#mockBadge') && $('#list')) $('#list').insertAdjacentHTML('beforebegin', mockBadge());
      paintList();
      if (!more) loadHot();
    } catch (e) {
      if (readDenied(e)) { listState.posts = []; bar(brandBar()); renderLock(); return; }
      if (!more) list.innerHTML = empty('글 불러오기 실패', '잠시 뒤 다시 열기');
      fail(e);
    }
    finally { if (btn) { btn.disabled = false; btn.textContent = '더 보기'; } }
  }
  function paintList() {
    const list = $('#list'), btn = $('#more'); if (!list) return;
    const q = listState.q;
    list.innerHTML = (q ? '<div class="sec" style="margin:4px 2px 2px"><h2 style="font-size:15px">"' + esc(q) + '" 검색 결과</h2><span>' + listState.posts.length + (listState.next ? '+' : '') + '개</span></div>' : '')
      + (listState.posts.length ? listState.posts.map(pcard).join('') : (q ? empty('검색 결과 없음', '다른 말로 찾아보기') : listState.age ? empty('우리 아이 나이대 질문 아직 없음', '첫 질문 남기기!') : listState.cat ? empty('이 주제 질문 아직 없음', '첫 질문 남기기!') : emptyCommunity()));
    if (btn) btn.hidden = !listState.next;
  }

  // 질문게시판에서 육아템으로(11-12): 용품 이야기를 하는 자리에서 고르는 법 글과 육아템으로 간다
  const GEAR_BAR = '<div class="gearbar"><a class="btn line small" href="#/guide/gear">📚 용품 고르는 법 글</a><a class="btn primary small" data-cta="board" href="#/shop">🛍️ 육아템 추천받기</a></div>';
  // 질문의 주제가 용품이거나 제목 · 본문에 품목 낱말이 있으면 그 품목의 글과 육아템 카테고리를 붙인다
  const GEAR_WORDS = [['out', /아기띠|힙시트|유모차|기저귀\s*가방/], ['car', /카시트|차량용/], ['school', /책가방|입학|헬멧|안전모/], ['trip', /캠핑|텐트|차박/], ['play', /장난감|킥보드|자전거|블록|그림책/], ['home', /안전문|모서리|침대|젖병|소독기/]];
  function gearFor(p) {
    const text = (p.title || '') + ' ' + (p.body || ''), hit = GEAR_WORDS.find(w => w[1].test(text));
    if (!hit && p.cat !== 'gear') return '';
    const g = hit ? GD.items.find(x => x.cat === 'gear' && x.shop === hit[0]) : null;
    return '<div class="gearrel qgear"><b>용품을 고르는 중이라면</b><div class="glist">' + (g ? grow(g) : '<a class="grow" href="#/guide/gear"><span class="ge">📚</span><span class="tx"><b>용품 고르는 법 글</b><small>아기띠 · 카시트 · 집 안 안전 · 장난감 · 캠핑 · 초등</small></span></a>') + '</div>' + shopGo(hit ? hit[0] : '') + '</div>';
  }

  // ----- 글 하나 + 댓글 -----
  const cmtDrafts = {};
  function cmtItem(c) {
    const mine = me && (c.uid === me.id || me.role === 'admin');
    return '<div class="cmt-item" id="c' + c.id + '"><div class="top">' + who(c.nick, c.badge, c.rank) + '<span class="right"><span class="time">' + ago(c.created) + '</span>'
      + (mine ? '<button type="button" class="del" data-del-cmt="' + c.id + '">삭제</button>' : '')
      + (me && c.uid !== me.id && canWrite() ? '<button type="button" class="del" data-report="comment" data-rid="' + c.id + '">신고</button>' : '')
      + (canBlock(c) ? '<button type="button" class="del" data-block="' + c.uid + '" data-bnick="' + esc(c.nick) + '">차단</button>' : '') + '</span></div><div class="txt">' + rich(c.body) + '</div></div>';
  }
  async function renderPost(id) {
    setTab('community');
    const lockPost = () => { app.classList.remove('notab', 'composing'); bar(backBtn('#/community') + '<div class="fill atitle">질문게시판</div>'); renderLock(); };
    if (!canRead()) { lockPost(); return; }
    app.classList.add('notab', 'composing');
    bar(backBtn('#/community') + '<div class="fill atitle">질문게시판</div><span id="postAct"></span>');
    view.innerHTML = '<section class="pad"><div class="loading">불러오는 중…</div></section>';
    window.scrollTo(0, 0);
    let r;
    const seq = renderSeq;
    // 조회수(11-13): 이 기기에서 처음 여는 질문만 센다(새로고침으로 오르지 않게). 본 글 번호는 이 기기에만 300개까지
    const seen = store.get('seenPosts', []), first = Array.isArray(seen) && seen.indexOf(id) < 0;
    try { r = await api('getPost', id, first); if (seq !== renderSeq) return; if (first) store.set('seenPosts', seen.concat(id).slice(-300)); }
    catch (e) {
      if (seq !== renderSeq) return;
      if (readDenied(e)) { lockPost(); return; }
      const hidden = e && e.code === 'user_blocked';
      view.innerHTML = '<section class="pad">' + (hidden ? empty('차단한 아빠의 질문', 'MY에서 차단 풀기 가능') : empty('질문을 찾을 수 없음', '지워졌거나 주소가 틀림')) + '</section>';
      app.classList.remove('composing');
      if (!hidden && !(e && e.code === 'not_found')) fail(e);
      return;
    }
    const p = r.post, c = catOf(p.cat), mine = me && (p.uid === me.id || me.role === 'admin');
    $('#postAct').innerHTML = (mine ? '<button type="button" class="abtn danger" id="delPost">삭제</button>' : '')
      + (me && p.uid !== me.id && canWrite() ? '<button type="button" class="abtn ghosty" data-report="post" data-rid="' + p.id + '">신고</button>' : '')
      + (canBlock(p) ? '<button type="button" class="abtn ghosty" data-block="' + p.uid + '" data-bnick="' + esc(p.nick) + '">차단</button>' : '');
    const ph = !me ? '가입하면 답 쓰기 가능' : canWrite() ? '답 쓰기' : '아빠 인증을 하면 답 쓰기 가능';
    view.innerHTML = '<section class="pad">'
      + '<article class="post qitem"><div class="meta"><span class="badges"><span class="badge c-' + esc(catCls(p.cat)) + '">' + c.e + ' ' + esc(c.name) + '</span>' + (AGE[p.age] ? '<span class="agetag">' + esc(AGE[p.age].name) + '</span>' : '') + '</span><span class="time">' + ago(p.created) + '</span></div>'
      + '<h1><span class="qm">Q</span><span>' + esc(p.title) + '</span></h1><div class="byline">' + who(p.nick, p.badge, p.rank) + '<span>' + ymd(p.created) + (p.views ? ' · 조회 ' + p.views : '') + '</span></div>'
      + '<div class="body">' + rich(p.body) + '</div></article>'
      + '<div class="sec"><h2>답 <span id="cmtN">' + r.comments.length + '</span></h2><small class="note">아빠들이 쓴 답</small></div>'
      + '<div class="cmts" id="cmts">' + (r.comments.length ? r.comments.map(cmtItem).join('') : empty('답 기다리는 중', '경험이 있다면 첫 답 남기기')) + '</div>'
      + gearFor(p)
      + '<div class="about qnote">아빠들의 경험과 의견. 육아맨이 확인한 정보는 가이드에. 아이가 아프면 소아과나 119에 먼저 문의.<br><b>욕설 · 비하 · 혐오 표현과 광고는 올리기 불가.</b> 돌려 쓰거나 띄어 써도 걸러짐.</div>'
      + '</section>'
      + '<form class="composer" id="composer"><textarea id="cbody" rows="1" placeholder="' + esc(ph) + '" maxlength="1000"></textarea><button class="send" type="submit" aria-label="보내기">' + ICON.send + '</button></form>';
    const form = $('#composer'), ta = $('#cbody');
    ta.value = cmtDrafts[id] || '';     // 인증 창을 다녀와 화면이 다시 그려져도 쓰던 댓글이 남게
    ta.addEventListener('input', () => { cmtDrafts[id] = ta.value; });
    autosize(ta);
    const submit = async () => {
      const body = ta.value.trim();
      if (!me) { openSheet(submit); return; }
      if (!canWrite()) { openVerify(submit); return; }
      if (!body) { toast('답 적기'); ta.focus(); return; }
      const btn = $('.send', form); btn.disabled = true;
      try {
        const rr = await api('addComment', id, body);
        ta.value = ''; delete cmtDrafts[id]; autosize(ta);
        const box = $('#cmts'); if (box.querySelector('.empty')) box.innerHTML = '';
        box.insertAdjacentHTML('beforeend', cmtItem(rr.comment)); $('#cmtN').textContent = box.querySelectorAll('.cmt-item').length;
        listState.posts = []; if (!noteRank(rr.comment.rank)) toast('답 등록 완료');
        $('#c' + rr.comment.id).scrollIntoView({ block: 'nearest' });
      } catch (e) { fail(e, submit); }
      finally { btn.disabled = false; }
    };
    form.addEventListener('submit', ev => { ev.preventDefault(); submit(); });
    const del = $('#delPost');
    if (del) del.addEventListener('click', async () => {
      if (!confirm('이 질문 지우기(질문과 답 내용이 바로 지워지고 되돌릴 수 없음)')) return;
      try { await api('deletePost', id); listState.posts = []; toast('질문 삭제 완료'); go('#/community', true); } catch (e) { fail(e); }
    });
  }
  async function delComment(cid) {
    if (!confirm('이 답 지우기')) return;
    try { await api('deleteComment', cid); const el = $('#c' + cid); if (el) el.remove(); const n = $('#cmtN'); if (n) n.textContent = $$('#cmts .cmt-item').length; listState.posts = []; toast('답 삭제 완료'); }
    catch (e) { fail(e); }
  }
  // 신고(11-05 운영자 "커뮤니티 신고기능도 넣어주고"): 사유를 고르면 운영자 신고함에 쌓인다. 남의 글·댓글에만 '신고' 버튼이 보인다
  const REPORT_WHY = ['욕설·비방', '아이 개인정보', '광고·도배', '잘못된 정보', '기타'];
  function reportFlow(kind, id) {
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="신고하기"><div class="grip"></div><h2>' + (kind === 'comment' ? '답' : '질문') + ' 신고하기</h2><p>운영자가 읽고 판단.</p>'
      + '<div class="catpick" id="repWhy" style="margin-top:14px">' + REPORT_WHY.map(w => '<button type="button" class="chip" data-w="' + w + '">' + w + '</button>').join('') + '</div>'
      + '<textarea class="inp" id="repMore" rows="2" maxlength="200" style="min-height:64px;margin-top:12px" placeholder="더 적을 말이 있으면 (없어도 됨)" aria-label="더 적을 말"></textarea>'
      + '<div class="err" id="repErr" hidden></div>'
      + '<button type="button" class="btn primary" id="repGo">신고하기</button><button type="button" class="btn ghost" id="repNo">취소</button></div>');
    let why = '';
    $('#repWhy').addEventListener('click', ev => { const b = ev.target.closest('[data-w]'); if (!b) return; why = b.dataset.w; $$('#repWhy .chip').forEach(x => x.classList.toggle('on', x === b)); $('#repErr').hidden = true; });
    $('#repNo').addEventListener('click', closeSheet);
    $('#repGo').addEventListener('click', async ev => {
      const err = $('#repErr');
      if (!why) { err.hidden = false; err.textContent = '사유 고르기'; return; }
      const more = $('#repMore').value.trim();
      ev.target.disabled = true;
      try { const r = await api('report', kind, id, more ? why + ': ' + more : why); closeSheet(); toast(r.already ? '이미 신고함' : '신고 접수 완료. 감사합니다'); }
      catch (e) { err.hidden = false; err.textContent = errText(e); ev.target.disabled = false; }
    });
  }
  // 사용자 차단: 내 화면에서만 숨긴다. 상대는 알 수 없고, MY에서 풀 수 있다
  async function blockFlow(uid, nick) {
    if (!confirm(nick + '님 차단하기(이 아빠의 질문과 답이 내 화면에서 사라짐. MY에서 언제든 풀기 가능)')) return;
    try {
      await api('blockUser', uid);
      listState.posts = [];
      toast('차단 완료');
      if (parse().name === 'post') render();
    } catch (e) { fail(e); }
  }
  function autosize(ta) { const fit = () => { ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'; }; ta.addEventListener('input', fit); fit(); }

  // ----- 글쓰기 -----
  // 글쓰기 양식(11-05 운영자 "아빠들은 아무래도 말을 잘 안하니까.."): 빈칸과 고르기만 채우면 제목과 내용이 저절로 만들어진다.
  // opts = 눌러서 고르기, multi = 여러 개, long = 두 줄 칸, req = 꼭 채울 칸, bare = 내용에 칸 이름 없이 그 말만. 'note'는 내용 맨 아래에 한 칸 띄워 붙는다
  const TPL_AGAIN = ['또 간다', '한 번이면 충분', '비추'];
  const POST_TPLS = [
    { key: 'trip', e: '🗺️', name: '여행코스 추천', cat: 'play', title: x => x('place') + ' 여행코스 추천', fields: [
      { k: 'place', label: '어디로', ph: '예: 강릉 1박 2일', req: true },
      { k: 'course', label: '코스', ph: '예: 아쿠아리움 → 순두부 → 해변', long: true, req: true },
      { k: 'kid', label: '아이가 좋아한 곳', ph: '없어도 됨' },
      { k: 'stroller', label: '유모차', opts: ['편함', '조금 불편', '힘듦'] },
      { k: 'again', label: '다시 갈 곳인지', opts: TPL_AGAIN },
      { k: 'note', label: '한마디', ph: '없어도 됨', long: true }] },
    { key: 'camp', e: '🏕️', name: '캠핑사이트 추천', cat: 'play', title: x => x('place') + ' ' + x('name') + ' 추천', fields: [
      { k: 'name', label: '캠핑장 이름', ph: '예: OO오토캠핑장', req: true },
      { k: 'place', label: '지역', ph: '예: 충북 괴산' },
      { k: 'site', label: '추천 자리', ph: '예: A-12, 화장실 가까운 쪽' },
      { k: 'good', label: '좋았던 점', multi: true, opts: ['화장실·샤워장 깨끗', '아이 놀이터', '물놀이', '그늘 많음', '매점 있음', '조용함', '자리 넓음'] },
      { k: 'bad', label: '아쉬운 점', ph: '없어도 됨' },
      { k: 'again', label: '다시 갈 곳인지', opts: TPL_AGAIN },
      { k: 'note', label: '한마디', ph: '없어도 됨', long: true }] },
    { key: 'leave', e: '📝', name: '육아휴직 질문', cat: 'leave', title: x => '육아휴직 질문: ' + x('q'), fields: [
      { k: 'job', label: '직종', opts: ['회사원', '계약직', '공무원', '교사', '군인', '자영업·프리랜서'] },
      { k: 'when', label: '시기', opts: ['쓰는 중', '6개월 안', '1년 안', '아직 모름'] },
      { k: 'topic', label: '궁금한 것', multi: true, opts: ['급여', '회사에 말하기', '나눠 쓰기', '6+6', '복직'] },
      { k: 'q', label: '질문 한 줄', ph: '예: 6개월 쓰고 복직한 뒤 또 쓸 수 있는지', req: true, bare: true }] },
    { key: 'food', e: '🍽️', name: '아이랑 맛집', cat: 'play', title: x => x('place') + ' ' + x('name') + ' 아이랑 추천', fields: [
      { k: 'name', label: '식당 이름', ph: '예: OO식당', req: true },
      { k: 'place', label: '지역', ph: '예: 청주 오창' },
      { k: 'good', label: '아이랑 좋은 점', multi: true, opts: ['아기의자', '유모차 OK', '주차 편함', '놀이방', '아이 메뉴', '룸 있음'] },
      { k: 'menu', label: '추천 메뉴', ph: '없어도 됨' },
      { k: 'again', label: '다시 갈 곳인지', opts: TPL_AGAIN }] },
    { key: 'gear', e: '🛒', name: '용품 후기', cat: 'gear', title: x => x('name') + ' 써 본 후기', fields: [
      { k: 'name', label: '제품', ph: '예: 휴대용 유모차', req: true },
      { k: 'price', label: '가격', ph: '예: 20만 원대' },
      { k: 'good', label: '좋은 점', ph: '없어도 됨' },
      { k: 'bad', label: '아쉬운 점', ph: '없어도 됨' },
      { k: 'again', label: '또 살지', opts: ['또 산다', '이 값이면 괜찮음', '비추'] }] },
    { key: 'ask', e: '🙋', name: '아빠들 질문', cat: 'question', title: x => x('q'), fields: [
      { k: 'q', label: '질문 한 줄', ph: '예: 돌 아기 밤중 수유 끊은 때', req: true, bare: true },
      { k: 'ctx', label: '상황', ph: '없어도 됨', long: true }] },
    { key: 'vent', e: '😮‍💨', name: '한 줄 하소연', cat: 'vent', title: x => x('what'), fields: [
      { k: 'what', label: '오늘 무슨 일', ph: '예: 이유식 세 번 다 뱉음', req: true, bare: true },
      { k: 'mood', label: '지금 상태', opts: ['버틸 만함', '한계', '웃프다', '전역하고 싶다'] }] }
  ];
  const POST_TPL = {}; POST_TPLS.forEach(t => { POST_TPL[t.key] = t; });
  function tplCompose(t, vals) {
    const x = k => { const v = vals[k]; return Array.isArray(v) ? v.join(', ') : String(v || '').trim(); };
    const lines = t.fields.filter(f => !f.bare && f.k !== 'note' && x(f.k)).map(f => f.label + (/\?$/.test(f.label) ? ' ' : ': ') + x(f.k)).join('\n');
    return { title: t.title(x).trim().slice(0, 60), body: [t.fields.filter(f => f.bare).map(f => x(f.k)).filter(Boolean).join('\n'), lines, x('note')].filter(Boolean).join('\n\n') };
  }
  function tplField(f, vals) {
    const v = vals[f.k];
    if (f.opts) return '<span class="lbl">' + esc(f.label) + (f.multi ? ' <small style="font-weight:600">(여러 개 골라도 됨)</small>' : '') + '</span><div class="catpick" data-f="' + f.k + '">'
      + f.opts.map(o => '<button type="button" class="chip' + ((f.multi ? (v || []).includes(o) : v === o) ? ' on' : '') + '" data-v="' + esc(o) + '">' + esc(o) + '</button>').join('') + '</div>';
    const attrs = ' class="inp' + (f.long ? ' short' : '') + '" id="tf-' + f.k + '" data-f="' + f.k + '" maxlength="' + (f.long ? 500 : 60) + '" placeholder="' + esc(f.ph || '') + '" autocomplete="off"';
    return '<label class="lbl" for="tf-' + f.k + '">' + esc(f.label) + (f.req ? '' : ' <small style="font-weight:600">(선택)</small>') + '</label>' + (f.long ? '<textarea' + attrs + '>' + esc(v || '') + '</textarea>' : '<input' + attrs + ' value="' + esc(v || '') + '">');
  }
  // 11-12 운영 방향: 글쓰기는 '질문하기' 하나로. 양식 여럿(POST_TPLS)은 숨기고 코드는 남긴다. 다시 켜려면 ASK_ONLY를 false로
  const ASK_ONLY = true;
  function renderWrite() {
    setTab('community'); app.classList.add('notab');
    bar(backBtn('#/community') + '<div class="fill atitle">' + (ASK_ONLY ? '질문하기' : '글쓰기') + '</div><button class="abtn" id="submitTop" type="submit" form="wform">올리기</button>');
    const d = store.get('draft', null) || {};
    if (ASK_ONLY) { d.tpl = 'free'; d.vals = {}; d.touched = false; }
    view.innerHTML = '<section class="pad">'
      + (!canWrite() ? '<button type="button" class="notice vcta" id="vcta" style="margin-bottom:8px"><span class="e">✅</span><span>질문은 ' + (socialOn() ? '가입한' : '인증한') + ' 아빠만 올리기 가능. 써 둔 질문은 이 기기에 남음. <b>' + joinWord() + '</b></span></button>' : '')
      + (ASK_ONLY ? '<p class="tplsub">가입한 아빠들이 보고 답함. 운영자는 답을 쓰지 않음.</p>' : '')
      + '<form class="form" id="wform" novalidate>'
      + '<div id="tplPick"><span class="lbl">글 종류 고르기</span><p class="tplsub">고르면 빈칸만 채워도 글 완성.</p><div class="tplgrid">'
      + POST_TPLS.map(t => '<button type="button" class="wtpl" data-tpl="' + t.key + '"><span class="e">' + t.e + '</span>' + esc(t.name) + '</button>').join('')
      + '<button type="button" class="wtpl" data-tpl="free"><span class="e">✏️</span>직접 쓰기</button></div></div>'
      + '<div id="wMain" hidden><div class="tplhead" id="tplHead"></div><div id="tplFields"></div>'
      + '<div id="catWrap"><span class="lbl">' + (ASK_ONLY ? '질문 주제' : '분류') + '</span><div class="catpick" id="catpick">' + CATS.map(c => '<button type="button" class="chip' + (d.cat === c.key ? ' on' : '') + '" data-pick="' + c.key + '"><span class="e">' + c.e + '</span>' + esc(c.name) + '</button>').join('') + '</div>'
      + '<a class="notice vcta" id="gearHint" href="#/guide/gear"' + (d.cat === 'gear' ? '' : ' hidden') + '><span class="e">📚</span><span>묻기 전에 <b>용품 고르는 법 글</b> 먼저 보기. 쓰던 질문은 이 기기에 남음.</span></a></div>'
      + '<span class="lbl">아이 나이 <small style="font-weight:600">(또래 아빠들이 찾기 쉬움)</small></span><div class="catpick" id="agepick">' + AGES.map(x => '<button type="button" class="chip' + ((d.age || currentAge()) === x.key ? ' on' : '') + '" data-age="' + x.key + '">' + esc(x.name) + '</button>').join('') + '</div>'
      + '<div class="tplprev" id="tplPrev" hidden></div>'
      + '<details id="wText"><summary id="wTextSum">제목·내용 직접 고치기</summary>'
      + '<label class="lbl" for="wtitle">' + (ASK_ONLY ? '질문' : '제목') + '</label><input class="inp" id="wtitle" maxlength="60" placeholder="' + (ASK_ONLY ? '궁금한 것 한 줄로 적기' : '한 줄로 요약하기') + '" value="' + esc(d.title || '') + '" autocomplete="off">'
      + '<label class="lbl" for="wbody">' + (ASK_ONLY ? '상황' : '내용') + '</label><textarea class="inp" id="wbody" maxlength="3000" placeholder="' + (ASK_ONLY ? '상황을 적으면 답하기 쉬움. 링크도 붙이기 가능.' : '묻고 싶은 것, 알려 주고 싶은 것 편하게 적기. 링크도 붙이기 가능.') + '">' + esc(d.body || '') + '</textarea>'
      + '<div class="cnt"><span id="wcnt">' + len(d.body || '') + '</span>/3000</div></details>'
      + '<div class="notice"><span class="e">🔒</span><span>아이 이름·어린이집 이름·회사 이름은 적지 않기.' + (ASK_ONLY ? ' 아이가 아프면 소아과나 119에 먼저 문의.' : '') + '</span></div>'
      // 비속어 규정(11-12 운영자 "비속어 규정을 강화해줘"): 쓰기 전에 보이게 한 줄. 거르기는 서버(server/badwords.js)
      + '<div class="notice"><span class="e">🚫</span><span><b>욕설 · 비하 · 혐오 표현과 광고는 올리기 불가.</b> 돌려 쓰거나 띄어 써도 걸러짐.</span></div>'
      + '<button class="btn primary" type="submit" style="margin-top:14px">올리기</button>'
      + '</div></form></section>';
    window.scrollTo(0, 0);
    const form = $('#wform'), title = $('#wtitle'), body = $('#wbody'), wText = $('#wText');
    let picked = d.cat && CAT[d.cat] ? d.cat : '', age = AGE[d.age || currentAge()] ? (d.age || currentAge()) : '';
    // 양식: tpl = ''(고르는 중) · 'free'(직접 쓰기) · 양식 이름. 제목·내용을 손으로 고치면(touched) 그 뒤로는 빈칸이 덮어쓰지 않는다
    let tpl = d.tpl === 'free' || POST_TPL[d.tpl] ? d.tpl : (d.title || d.body ? 'free' : ''), vals = d.vals || {}, touched = !!d.touched;
    const saveDraft = () => { store.set('draft', { tpl, vals, touched, cat: picked, age, title: title.value, body: body.value }); $('#wcnt').textContent = len(body.value); };
    const paintPrev = () => {
      const box = $('#tplPrev'), show = !!POST_TPL[tpl] && !wText.open && !!(body.value || title.value);
      box.hidden = !show;
      box.innerHTML = show ? '<small>올라갈 모습</small><b>' + esc(title.value) + '</b>' + (body.value ? '<p>' + esc(body.value) + '</p>' : '') : '';
    };
    const applyTpl = () => {
      const t = POST_TPL[tpl];
      if (t && !touched) { const c = tplCompose(t, vals); title.value = c.title; body.value = c.body; }
      paintPrev(); saveDraft();
    };
    const paintTpl = () => {
      $('#tplPick').hidden = !!tpl; $('#wMain').hidden = !tpl; $('#submitTop').hidden = !tpl;
      if (!tpl) return;
      const t = POST_TPL[tpl];
      $('#tplHead').innerHTML = '<span class="e">' + (t ? t.e : '✏️') + '</span><b>' + esc(t ? t.name : '직접 쓰기') + '</b><button type="button" class="edit" id="tplChange">다른 양식</button>';
      $('#tplHead').hidden = ASK_ONLY;
      $('#tplFields').innerHTML = t ? t.fields.map(f => tplField(f, vals)).join('') : '';
      $('#catWrap').hidden = !!t;
      $('#wTextSum').hidden = !t;
      wText.open = !t || touched;
      $$('#catpick .chip').forEach(x => x.classList.toggle('on', x.dataset.pick === picked));
      $('#gearHint').hidden = picked !== 'gear';
      paintPrev();
    };
    $('#tplPick').addEventListener('click', ev => {
      const b = ev.target.closest('[data-tpl]'); if (!b) return;
      tpl = b.dataset.tpl; vals = {}; touched = false; title.value = ''; body.value = '';
      picked = POST_TPL[tpl] ? POST_TPL[tpl].cat : '';
      paintTpl(); applyTpl(); window.scrollTo(0, 0);
    });
    $('#tplHead').addEventListener('click', ev => {
      if (!ev.target.closest('#tplChange')) return;
      const typed = touched || (tpl === 'free' ? !!(title.value.trim() || body.value.trim()) : Object.keys(vals).some(k => vals[k] && vals[k].length));
      if (typed && !confirm('쓰던 내용을 지우고 다른 양식으로 바꾸기')) return;
      tpl = ''; vals = {}; touched = false; title.value = ''; body.value = ''; picked = '';
      paintTpl(); saveDraft(); window.scrollTo(0, 0);
    });
    const tf = $('#tplFields');
    tf.addEventListener('input', ev => { const el = ev.target.closest('[data-f]'); if (!el) return; vals[el.dataset.f] = el.value; applyTpl(); });
    tf.addEventListener('keydown', ev => { if (ev.key === 'Enter' && ev.target.tagName === 'INPUT') ev.preventDefault(); });
    tf.addEventListener('click', ev => {
      const b = ev.target.closest('[data-v]'); if (!b) return;
      const box = b.closest('[data-f]'), k = box.dataset.f, f = POST_TPL[tpl].fields.find(x => x.k === k), o = b.dataset.v;
      if (f.multi) { const cur = vals[k] || []; vals[k] = cur.includes(o) ? cur.filter(x => x !== o) : cur.concat(o); }
      else vals[k] = vals[k] === o ? '' : o;
      $$('.chip', box).forEach(x => x.classList.toggle('on', f.multi ? vals[k].includes(x.dataset.v) : vals[k] === x.dataset.v));
      applyTpl();
    });
    wText.addEventListener('toggle', paintPrev);
    $('#catpick').addEventListener('click', ev => { const b = ev.target.closest('[data-pick]'); if (!b) return; picked = b.dataset.pick; $$('#catpick .chip').forEach(x => x.classList.toggle('on', x === b)); $('#gearHint').hidden = picked !== 'gear'; saveDraft(); });
    $('#agepick').addEventListener('click', ev => { const b = ev.target.closest('[data-age]'); if (!b) return; age = age === b.dataset.age ? '' : b.dataset.age; $$('#agepick .chip').forEach(x => x.classList.toggle('on', x.dataset.age === age)); saveDraft(); });
    const onText = () => { if (POST_TPL[tpl]) touched = true; saveDraft(); };
    title.addEventListener('input', onText); body.addEventListener('input', onText);
    title.addEventListener('keydown', ev => { if (ev.key === 'Enter') { ev.preventDefault(); body.focus(); } });
    paintTpl();
    const v = $('#vcta');
    if (v) v.addEventListener('click', () => { const after = () => render(); if (!me) openSheet(after); else openVerify(after); });
    const submit = async () => {
      const miss = POST_TPL[tpl] && !touched && POST_TPL[tpl].fields.find(f => f.req && !String(vals[f.k] || '').trim());
      if (miss) { toast("'" + miss.label + "' 칸 채우기", 'err'); const el = $('#tf-' + miss.k); el.scrollIntoView({ block: 'center' }); el.focus(); return; }
      const p = { cat: picked, age, title: clean(title.value, 200), body: clean(body.value, 5000) };
      const bad = checkPost(p);
      if (bad) { toast(MSG[bad], 'err'); if (bad !== 'cat') wText.open = true; (bad === 'cat' ? $('#catpick') : bad === 'title_len' ? title : body).scrollIntoView({ block: 'center' }); if (bad !== 'cat') (bad === 'title_len' ? title : body).focus(); return; }
      if (!me) { openSheet(submit); return; }
      if (!canWrite()) { openVerify(submit); return; }
      const btns = $$('#submitTop, #wform .btn'); btns.forEach(b => { b.disabled = true; });
      try { const r = await api('createPost', p); store.del('draft'); listState.posts = []; if (!noteRank(r.post && r.post.rank)) toast(ASK_ONLY ? '질문 등록 완료' : '글 등록 완료'); go('#/p/' + r.id, true); }
      catch (e) { fail(e, submit); }
      finally { btns.forEach(b => { b.disabled = false; }); }
    };
    form.addEventListener('submit', ev => { ev.preventDefault(); submit(); });
  }

  // ----- MY -----
  let meSeg = 'posts';
  // 11-05 운영자 "이런 어설픈건 빼주고 법적으로 필요할 때만 '이용약관'에 올려": 운영자·문의·저장 항목은 약관과 처리방침 안에 둔다. 처리방침은 공개 의무(개인정보 보호법 제30조)라 링크만 남긴다
  function aboutBox() { return ''; }     // 이용약관 · 처리방침은 모든 화면 아래 푸터에 있다(11-13)
  function themeBox() {
    const cur = store.get('theme', 'auto');
    return '<div class="about" id="themeBox"><b>화면 밝기</b><div class="seg" style="margin-top:8px">' + [['auto', '기기 따라'], ['light', '밝게'], ['dark', '어둡게']].map(x => '<button type="button" class="' + (cur === x[0] ? 'on' : '') + '" data-theme-pick="' + x[0] + '">' + x[1] + '</button>').join('') + '</div></div>';
  }
  function bindTheme() {
    const b = $('#themeBox'); if (!b) return;
    b.addEventListener('click', ev => { const x = ev.target.closest('[data-theme-pick]'); if (!x) return; store.set('theme', x.dataset.themePick); applyTheme(); $$('#themeBox button').forEach(y => y.classList.toggle('on', y === x)); });
  }
  // 새 댓글 표시(아래 탭 MY의 점, 검수 22)
  function setDot(n) { const d = $('#meDot'); if (d) d.hidden = !n; const s = $('#sideDot'); if (s) s.hidden = !n; }
  function newCommentsBox(r) {
    if (!r.new_comments) return '';
    return '<div class="sec"><h2>내 질문의 새 답</h2><span>' + r.new_comments + '개</span></div><div class="list" style="margin-top:0">'
      + (r.new_list || []).map(c => '<a class="mycmt" href="#/p/' + c.post_id + '#c' + c.id + '"><small>' + esc(c.nick) + ' · ' + esc(c.post_title) + ' · ' + ago(c.created) + '</small><p>' + esc(c.body) + '</p></a>').join('') + '</div>';
  }
  let deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });
  function installBox() {
    const standalone = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone;
    const coarse = window.matchMedia && matchMedia('(pointer: coarse)').matches;
    if (standalone || !coarse) return '';
    const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
    return '<div class="install"><span class="logo">' + LOGO + '</span><div class="tx"><b>홈 화면에 추가하면 앱처럼</b><small>' + (ios ? '공유 단추 → "홈 화면에 추가"' : '주소창 없이 바로 열림') + '</small></div>' + (ios ? '' : '<button type="button" class="inbtn" id="installBtn">추가</button>') + '</div>';
  }
  function bindInstall() { const b = $('#installBtn'); if (!b) return; b.addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); try { await deferredPrompt.userChoice; } catch (e) { /* 무시 */ } deferredPrompt = null; } else toast('브라우저 메뉴에서 "홈 화면에 추가" 누르기'); }); }
  const inviteLink = code => location.origin + location.pathname + '#/join/' + encodeURIComponent(code);
  async function shareLink(title, text, url, copied) {
    if (navigator.share) { try { await navigator.share({ title, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
    try { await navigator.clipboard.writeText(text + '\n' + url); toast(copied); }
    catch (e) { window.prompt('이 글을 복사해 보내기', text + ' ' + url); }
  }
  const shareInvite = code => shareLink('육아맨 초대', '육아맨 초대 코드: ' + code, inviteLink(code), '초대 코드와 주소 복사 완료');
  const shareRef = code => shareLink('육아맨', '충성! 육아맨 입대를 권합니다. 육아휴직 계산기부터 아빠들 이야기까지 여기에 다 있습니다.', inviteLink(code), '초대 글과 주소 복사 완료');
  function inviteBox(r) {
    const used = r.invites || [], max = r.invite_max;
    return '<div class="about" id="inviteBox"><b>아빠 초대하기</b><p class="sm">아는 아빠에게 코드를 보내면 바로 인증.' + (max ? ' 한 사람당 ' + max + '개까지.' : '') + '</p>'
      + used.map(i => '<div class="irow"><code>' + esc(i.code) + '</code>' + (i.used ? '<span class="time">' + esc(i.nick || '사용함') + ' 님이 씀</span>' : '<button type="button" class="edit" data-share="' + esc(i.code) + '">보내기</button>') + '</div>').join('')
      + (!max || used.length < max ? '<button type="button" class="btn line small" id="newInvite">초대 코드 만들기</button>' : '') + '</div>';
  }
  function statusBox(r) {
    const u = r.user || me;
    if (u.blocked) return '<div class="vstate bad">이용이 제한된 계정.</div>';
    if (u.verified || u.role === 'admin') return '<div class="vstate ok">' + CHECK + '<span><b>인증 아빠</b>' + (u.role === 'admin' ? ' · 관리자' : '') + '</span></div>';
    if (socialOn()) return '<div class="vstate"><span><b>아직 인증 전.</b><br>' + LN() + '를 연결하면 바로 질문게시판 사용 가능.</span><button type="button" class="edit" id="doVerify">' + LN() + ' 연결</button></div>';
    const ap = r.application;
    if (ap && ap.status === 'pending') return '<div class="vstate wait"><span><b>인증 신청 확인 중.</b><br>승인되면 여기에 바로 표시. 초대 코드가 생기면 먼저 쓰기도 가능.</span><button type="button" class="edit" id="doVerify">코드 넣기</button></div>';
    return '<div class="vstate"><span><b>아직 인증 전.</b><br>질문게시판은 인증한 아빠만 읽고 쓰기 가능.' + (ap && ap.status === 'rejected' ? ' 지난 신청은 승인되지 않음. 다시 신청 가능.' : '') + '</span><button type="button" class="edit" id="doVerify">인증하기</button></div>';
  }
  // MY 닉네임 왼쪽 그림(11-13 운영자 "프로필은 계급표시로 해주고 관리자는 '관'이라고 표기"): 회원은 계급장, 관리자는 '관', 그 밖(계급을 아직 모를 때)은 닉네임 첫 글자
  const profilePic = r => r.user.role === 'admin' ? '<span class="big adm" role="img" aria-label="관리자">관</span>'
    : RANKS[r.rank] ? '<span class="big rkbig" role="img" aria-label="' + RANKS[r.rank].name + '">' + rankMark(r.rank) + '</span>'
    : '<span class="big">' + esc(first(r.user.nick)) + '</span>';
  // 내 계급과 전체 계급표(11-05 운영자 "현재 나는 전체 계급중에 어디에 해당하는지"). 점수 얻는 법은 접어 둔다. r.rank === null이면 운영 계정
  const FOLD_EXTRA = true;     // 11-12 운영 방향 1단계: 외출증 · 초대 링크를 화면에서 접는다(코드와 서버는 그대로)
  const rankReq = (label, have, need, unit) => '<div class="rkreq"><span>' + label + '</span><div class="rkbar"><i style="width:' + Math.min(100, Math.round(have / need * 100)) + '%"></i></div><b>' + (have >= need ? '충족' : have + ' / ' + need + unit) + '</b></div>';
  function rankBox(r) {
    const lv = r.rank, cur = RANKS[lv], next = cur && RANKS[lv + 1], pts = r.points || 0, days = r.days || 0, ref = r.ref, req = rankReq;
    const head = cur
      ? '<div class="rkhead">' + rankMark(lv) + '<div class="tx"><b>' + cur.name + '</b><small>' + cur.line + '</small></div><span class="rkpt">' + pts + '점<small>복무 ' + days + '일</small></span></div>'
        + (next ? '<p class="rknext rkgoal">' + next.name + ' 진급 조건</p>' + req('점수', pts, next.at, '점') + req('복무', days, next.days, '일') : '<p class="rknext">최고 계급입니다.</p>')
      : '<p class="rknext" style="margin-top:0">운영 계정은 계급 없이 표시.</p>';
    return '<section class="rkbox" id="rankBox">' + head
      + '<ol class="rkladder">' + RANKS.map((x, i) => '<li class="' + (i === lv ? 'me' : cur && i < lv ? 'done' : 'todo') + '"' + (i === lv ? ' aria-current="true"' : '') + '>' + (i === lv ? '<em>나</em>' : '') + rankMark(i) + '<b>' + x.name + '</b><small>' + x.at + '점</small><small>' + (x.days ? x.days + '일' : '입대') + '</small></li>').join('') + '</ol>'
      // 초대 링크와 외출증은 접어 둔다(11-12 운영 방향). FOLD_EXTRA를 false로 하면 다시 보인다
      + (ref && !FOLD_EXTRA ? '<div class="rkinv"><div class="tx"><b>후임 데려오기</b><small>초대한 아빠가 글이나 댓글을 쓰면 <b>' + INVITE_PTS + '점</b></small>' + (ref.joined ? '<small>들어온 후임 ' + ref.joined + '명 · 점수 인정 ' + Math.min(ref.counted, INVITE_PTS_MAX) + '명</small>' : '') + '</div><button type="button" class="btn primary small" id="refBtn" data-code="' + esc(ref.code) + '">초대하기</button></div>' : '')
      + (FOLD_EXTRA ? '' : cur && cur.pass ? '<button type="button" class="btn line passbtn" id="passBtn">아내에게 보낼 외출증 받기 (' + cur.pass + ')</button>' : cur ? '<p class="rknext" style="margin-top:12px">일병이 되면 아내에게 보낼 외출증 발급</p>' : '<button type="button" class="btn line passbtn" id="passBtn">외출증 미리 보기 (상병 예시)</button>')
      + '<details class="rkhow"><summary>진급 규칙과 점수 얻는 법</summary><ul><li>진급은 점수와 복무 기간을 <b>둘 다</b> 채워야 함</li>'
      + (FOLD_EXTRA ? '' : '<li>아빠 초대 <b>' + INVITE_PTS + '점</b> (그 아빠가 글이나 댓글을 쓰면, ' + INVITE_PTS_MAX + '명까지)</li>')
      + '<li>질문하기 <b>3점</b> (하루 2개까지)</li><li>다른 아빠 질문에 답 <b>2점</b> (질문마다 1번, 하루 5개까지)</li><li>내 질문에 다른 아빠 답 <b>1점</b> (질문마다 사람당 1번)</li><li>지운 질문·답은 빠짐</li>'
      + (FOLD_EXTRA ? '' : '<li>외출증: 일병 <b>30분</b> · 상병 <b>1시간</b> · 병장 <b>2시간</b> · 예비군 <b>반나절</b> · 민방위 <b>하루</b></li>') + '</ul></details></section>';
  }
  // 외출증 카드(11-05 운영자 "아내한테 보내는 장난카드 컨셉 좋은거 같아"). 장난이라 권한과 상관없다. 닉네임의 거주지·아이 출생연도는 넣지 않고 별명만 쓴다. 그림 파일은 이 기기에서 만들고 서버로 보내지 않는다
  function drawRank(c, i, x, y, s) {
    const box = col => { c.fillStyle = col; c.beginPath(); if (c.roundRect) c.roundRect(0, 0, 20, 20, 4); else c.rect(0, 0, 20, 20); c.fill(); };
    c.save(); c.translate(x, y); c.scale(s / 20, s / 20);
    if (i < 4) { box('#3F5232'); const n = i + 1, top = (20 - (n * 2.4 + (n - 1) * 1.6)) / 2; c.fillStyle = '#FFF6D6'; for (let k = 0; k < n; k++) c.fillRect(4, top + k * 4, 12, 2.4); }
    else if (i === 4) { box('#5F6F3E'); RANK_CAMO.forEach(p => { c.fillStyle = p[1]; c.fill(new Path2D(p[0])); }); }
    else { box('#FFC914'); c.fillStyle = '#14213D'; c.fill(new Path2D(RANK_TRI)); }
    c.restore();
  }
  function drawPass(cv, lv, name) {
    const W = 1080, H = 1350, r = RANKS[lv], c = cv.getContext('2d'), ff = getComputedStyle(document.body).fontFamily, ink = '#1B1F2A', olive = '#3F5232', red = '#C8321F';
    const font = (w, px) => w + ' ' + px + 'px ' + ff;
    const text = (s, x, y, f, col, align) => { c.font = f; c.fillStyle = col; c.textAlign = align || 'left'; c.fillText(s, x, y); };
    const wrap = (s, x, y, max, lh, f, col) => { c.font = f; c.fillStyle = col; c.textAlign = 'left'; let line = '', yy = y; Array.from(s).forEach(ch => { if (c.measureText(line + ch).width > max) { c.fillText(line, x, yy); line = ch.trim(); yy += lh; } else line += ch; }); c.fillText(line, x, yy); return yy; };
    c.fillStyle = '#F4EFDF'; c.fillRect(0, 0, W, H);
    c.fillStyle = olive; c.fillRect(0, 0, W, 150);
    text('육아맨 사령부', W / 2, 96, font(800, 46), '#FFF6D6', 'center');
    text('외 출 증', W / 2, 310, font(900, 128), ink, 'center');
    c.strokeStyle = ink; c.lineWidth = 4;
    const col1 = 90, col2 = 320, right = W - 90, row = (y, label) => { c.beginPath(); c.moveTo(col1, y); c.lineTo(right, y); c.stroke(); text(label, col1, y + 66, font(700, 38), '#5F6675'); };
    row(370, '계급·성명');
    drawRank(c, lv, col2, 390, 72);
    let nameSize = 52; c.font = font(800, nameSize);
    while (nameSize > 30 && c.measureText(r.name + ' ' + name).width > right - col2 - 92) { nameSize -= 2; c.font = font(800, nameSize); }   // 별명이 길면 줄여서 칸 안에
    text(r.name + ' ' + name, col2 + 92, 444, font(800, nameSize), ink);
    row(482, '외출 시간');
    text(r.pass, col2, 556, font(900, 64), red);
    row(594, '복무 평가');
    const after = wrap(r.line, col2, 660, right - col2, 56, font(700, 42), ink);
    const y4 = Math.max(after + 44, 706);
    row(y4, '신청 사유');
    wrap('육아 전선에서 성실히 복무하여 잠시 숨을 돌리고자 함', col2, y4 + 66, right - col2, 56, font(700, 42), ink);
    const y5 = y4 + 172;
    c.beginPath(); c.moveTo(col1, y5); c.lineTo(right, y5); c.stroke();
    text('승인권자: 아내', col1, y5 + 76, font(800, 46), ink);
    const check = (x, label) => { c.lineWidth = 5; c.strokeRect(x, y5 + 38, 44, 44); c.lineWidth = 4; text(label, x + 60, y5 + 76, font(800, 46), ink); };
    check(560, '승인'); check(780, '반려');
    text('이 외출증의 효력은 아내가 승인할 때만 발생합니다.', W / 2, y5 + 160, font(700, 36), '#5F6675', 'center');
    const d = new Date();
    text(d.getFullYear() + '. ' + String(d.getMonth() + 1).padStart(2, '0') + '. ' + String(d.getDate()).padStart(2, '0') + '.', col1, H - 76, font(700, 38), ink);
    // 직인
    c.save(); c.translate(W - 190, H - 118); c.rotate(-0.2); c.strokeStyle = red; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 82, 0, Math.PI * 2); c.stroke();
    text('육아맨', 0, -8, font(900, 40), red, 'center'); text('사령부', 0, 42, font(900, 40), red, 'center'); c.restore();
  }
  function openPass(lv) {
    const r = RANKS[lv], name = nickParts(me && me.nick).name || (me ? me.nick : '');
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="외출증"><div class="grip"></div><h2>' + r.name + ' 외출증</h2>'
      + '<canvas id="passCv" class="passcv" width="1080" height="1350" role="img" aria-label="' + r.name + ' ' + esc(name) + ' 외출증 ' + r.pass + '. 승인권자 아내"></canvas>'
      + '<button type="button" class="btn primary" id="passSend">아내에게 보내기</button><button type="button" class="btn line" id="passSave">그림 저장</button><button type="button" class="btn ghost" id="passNo">닫기</button></div>');
    const cv = $('#passCv');
    let blob = null;     // 누르는 즉시 공유 창을 열어야 해서 그림 파일을 미리 만들어 둔다
    const paint = () => { if (!$('#passCv')) return; drawPass(cv, lv, name); cv.toBlob(b => { blob = b; }, 'image/png'); };
    paint();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
    const save = () => { if (!blob) return; const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'yukaman-pass.png'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); };
    $('#passNo').addEventListener('click', closeSheet);
    $('#passSave').addEventListener('click', () => { save(); toast('그림 저장 완료'); });
    $('#passSend').addEventListener('click', async () => {
      if (!blob) return;
      const file = new File([blob], 'yukaman-pass.png', { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try { await navigator.share({ files: [file], text: '충성! ' + r.name + ' ' + name + ', 외출 ' + r.pass + ' 결재 올립니다.' }); toast('결재 올렸습니다. 승인 대기'); }
        catch (e) { if (!e || e.name !== 'AbortError') { save(); toast('그림 저장 완료. 카톡으로 아내에게 보내기'); } }
      } else { save(); toast('그림 저장 완료. 카톡으로 아내에게 보내기'); }
    });
  }
  async function renderMe() {
    setTab('me');
    bar(brandBar());
    if (!me) {
      view.innerHTML = '<section class="pad">' + pageHead('😊', 'MY')
        + '<div class="profile" style="margin-top:12px"><span class="big">👋</span><div class="tx"><b>' + (socialOn() ? '아직 가입 전' : '아직 닉네임 없음') + '</b>' + (CFG.NAVER_LOGIN ? GENDER_HINT : socialOn() ? '' : '<small>이메일·서류는 받지 않음.</small>') + '</div></div>'
        + (pendingInvite ? '<div class="notice vcta" style="margin-top:12px"><span class="e">🎟️</span><span>' + (socialOn() ? '<b>초대 링크로 들어옴.</b> ' + LN() + '로 시작하면 바로 질문게시판 사용 가능.' : '받은 초대 코드 <b>' + esc(pendingInvite) + '</b> 있음. 시작하기를 누르면 바로 인증.') + '</span></div>' : '')
        + (socialOn() ? '<div style="margin-top:12px">' + loginBtn('startBtn', startWord()) + '</div>' : '<button type="button" class="btn primary" id="startBtn" style="margin-top:12px">시작하기</button>')
        + '<button type="button" class="btn ghost" id="recoverBtn">' + (socialOn() ? '복구 코드 있음' : '다른 폰에서 쓰던 닉네임 있음 (복구 코드)') + '</button>' + themeBox() + installBox() + aboutBox()
        + (CFG.NAVER_LOGIN && CFG.KAKAO_LOGIN && mode === 'server' ? '<p class="foot-note"><button type="button" class="textlink" id="kakaoOld">카카오로 가입한 회원</button></p>' : '')
        // '앱 심사용 입구'는 뺐다(11-12 웹서비스로만 운영). openReview와 서버 /login/review는 그대로 남아 있다
        + '</section>';
      bindTheme();
      $('#startBtn').addEventListener('click', () => { if (socialOn()) loginGo(); else openSheet(() => render()); });
      $('#recoverBtn').addEventListener('click', () => openRecover(() => render()));
      const rv = $('#reviewBtn'); if (rv) rv.addEventListener('click', () => openReview(() => render()));
      const ko = $('#kakaoOld'); if (ko) ko.addEventListener('click', kakaoOldGo);
      bindInstall(); window.scrollTo(0, 0);
      if (pendingInvite && !invitePrompted) { invitePrompted = true; openSheet(() => render()); }
      return;
    }
    view.innerHTML = '<section class="pad"><div class="loading">불러오는 중…</div></section>';
    let r;
    const seq = renderSeq;
    try { r = await api('me'); } catch (e) { if (seq !== renderSeq) return; view.innerHTML = '<section class="pad">' + empty('내 정보 불러오기 실패', '잠시 뒤 다시 열기') + '</section>'; fail(e, () => render()); return; }
    if (seq !== renderSeq) return;
    setMe(r.user);
    setDot(0);
    shellNoteMe(r);
    if (r.new_comments) api('seen').catch(() => {});      // 이 화면에 보였으니 다음에는 안 뜬다
    view.innerHTML = '<section class="pad">' + pageHead('😊', 'MY')
      + '<div class="profile" style="margin-top:12px">' + profilePic(r) + '<div class="tx"><b>' + esc(r.user.nick) + '</b><small>' + ymd(r.user.created) + '부터 육아맨 · 질문 ' + r.posts.length + ' · 답 ' + r.comments.length + '</small></div><button type="button" class="edit" id="editNick">닉네임 바꾸기</button></div>'
      + statusBox(r)
      + (canWrite() ? rankBox(r) : '')
      + (r.user.role === 'admin' ? '<a class="glink" href="#/admin"><span>🛠️ 관리자 화면: 신고 · 제보 · 질문 · 회원</span><span>→</span></a>' : '')
      + (canWrite() && (r.user.role === 'admin' || (!socialOn() && !FOLD_EXTRA)) ? inviteBox(r) : '')     // 회원의 초대 코드는 접어 둔다(11-12). 관리자는 그대로
      + newCommentsBox(r)
      + '<div class="seg" id="meSegs" style="margin-top:16px"><button type="button" class="' + (meSeg === 'posts' ? 'on' : '') + '" data-seg="posts">내 질문 ' + r.posts.length + '</button><button type="button" class="' + (meSeg === 'comments' ? 'on' : '') + '" data-seg="comments">내 답 ' + r.comments.length + '</button></div>'
      + '<div class="list" id="meList"></div><div id="meSide">' + accountBox(r) + blocksBox(r) + themeBox() + installBox() + aboutBox() + '</div></section>';
    { const ms = $('#meSide'), rm = $('#railMe'); if (ms && rm && hasRail()) rm.appendChild(ms); }     // PC는 계정 · 화면 밝기를 오른쪽 칸에
    const paint = () => {
      $('#meList').innerHTML = meSeg === 'posts'
        ? (r.posts.length ? r.posts.map(pcard).join('') : empty('아직 올린 질문 없음', canWrite() ? '질문게시판에서 첫 질문 남기기' : '아빠 인증을 하면 쓰기 가능'))
        : (r.comments.length ? r.comments.map(c => '<a class="mycmt" href="#/p/' + c.post_id + '"><small>' + esc(c.post_title) + ' · ' + ago(c.created) + '</small><p>' + esc(c.body) + '</p></a>').join('') : empty('아직 쓴 답 없음', ''));
    };
    paint();
    $$('#meSegs button').forEach(b => b.addEventListener('click', () => { meSeg = b.dataset.seg; $$('#meSegs button').forEach(x => x.classList.toggle('on', x === b)); paint(); }));
    bindTheme();
    $('#editNick').addEventListener('click', () => openSheet(() => render(), 'rename'));
    const dv = $('#doVerify'); if (dv) dv.addEventListener('click', () => openVerify(() => render()));
    const rb = $('#refBtn'); if (rb) rb.addEventListener('click', () => shareRef(rb.dataset.code));
    const ni = $('#newInvite');
    if (ni) ni.addEventListener('click', async () => { ni.disabled = true; try { await api('createInvite'); render(); } catch (e) { ni.disabled = false; fail(e); } });
    const ib = $('#inviteBox');
    if (ib) ib.addEventListener('click', ev => { const b = ev.target.closest('[data-share]'); if (b) shareInvite(b.dataset.share); });
    bindAccount();
    const ub = $('#blockBox');
    if (ub) ub.addEventListener('click', async ev => {
      const b = ev.target.closest('[data-unblock]'); if (!b) return;
      b.disabled = true;
      try { await api('unblockUser', +b.dataset.unblock); listState.posts = []; toast('차단 해제 완료'); render(); } catch (e) { b.disabled = false; fail(e); }
    });
    bindInstall(); window.scrollTo(0, 0);
    const pb = $('#passBtn'); if (pb) pb.addEventListener('click', () => openPass(RANKS[r.rank] ? r.rank : 2));    // 운영 계정은 계급이 없어 상병 예시로 미리 본다
    noteRank(r.rank);
    if (pendingInvite && canWrite()) {        // 이미 인증했어도 관리자 코드는 쓸 수 있다(서버가 아빠 코드는 쓰지 않고 넘긴다)
      const c = pendingInvite; clearInvite();
      api('verifyCode', c).then(x => { if (x.user && x.user.role === 'admin' && me.role !== 'admin') { setMe(x.user); toast('관리자로 변경 완료'); render(); } }).catch(() => {});
    }
    else if (pendingInvite && !invitePrompted) { invitePrompted = true; openVerify(() => render()); }
    if (r.user.verified && r.user.how === 'apply' && !store.get('welcomed')) { store.set('welcomed', true); toast('아빠 인증 승인 완료'); }
  }
  // 내 계정: 복구 코드(폰 바꿀 때) · 이 기기 로그아웃 · 탈퇴(11-04 검수 3·5). 복구 코드는 서버에 해시만 있어 이 기기에 남긴 것을 보여 준다.
  function accountBox(r) {
    const rec = store.get('recovery', '');
    if (me && (me.kakao || me.naver)) return '<div class="about" id="acctBox"><b>내 계정</b><p class="sm">' + (me.naver ? '네이버' : '카카오') + '로 로그인함. 폰을 바꿔도 ' + (me.naver ? '네이버' : '카카오') + '로 다시 들어오면 됨.</p>'
      + '<div class="two" style="margin-top:10px"><button type="button" class="btn line small" id="logoutBtn">이 기기 로그아웃</button>' + (me.role === 'admin' ? '' : '<button type="button" class="btn line small danger" id="quitBtn">탈퇴하기</button>') + '</div></div>';
    return '<div class="about" id="acctBox"><b>내 계정</b>' + (socialOn() ? '<div style="margin:8px 0 10px">' + loginBtn('kakaoLink', LN() + ' 연결하기') + '</div>' : '') + '<p class="sm">폰을 바꿔도 이 코드로 돌아오기 가능. 어딘가에 적어 두기.</p>'
      + '<div class="irow"><code>' + (rec ? esc(rec) : (r.has_recovery ? '이 기기에 코드 없음' : '코드 없음')) + '</code><button type="button" class="edit" id="recNew">' + (rec ? '새 코드' : '코드 받기') + '</button></div>'
      + '<div class="two" style="margin-top:10px"><button type="button" class="btn line small" id="logoutBtn">이 기기 로그아웃</button>' + (me && me.role === 'admin' ? '' : '<button type="button" class="btn line small danger" id="quitBtn">탈퇴하기</button>') + '</div></div>';
  }
  function blocksBox(r) {
    const list = r.blocks || [];
    return '<div class="about" id="blockBox"><b>차단한 아빠 ' + list.length + '</b>'
      + (list.length ? list.map(x => '<div class="irow"><span class="bnick">' + esc(x.nick) + '</span><button type="button" class="edit" data-unblock="' + x.id + '">풀기</button></div>').join('') : '<p class="sm">질문이나 답의 차단 단추로 내 화면에서 숨기기 가능.</p>') + '</div>';
  }
  function bindAccount() {
    const kl = $('#kakaoLink'); if (kl) kl.addEventListener('click', loginGo);
    const rn = $('#recNew');
    if (rn) rn.addEventListener('click', async () => {
      if (store.get('recovery', '') && !confirm('새 복구 코드를 만들면 지금 코드는 못 씀. 새로 만들기')) return;
      rn.disabled = true;
      try { const x = await api('recoveryNew'); store.set('recovery', x.recovery); showRecovery(x.recovery, () => render()); } catch (e) { rn.disabled = false; fail(e); }
    });
    const lo = $('#logoutBtn');
    if (lo) lo.addEventListener('click', async () => {
      const rec = store.get('recovery', '');
      if (!confirm(me && (me.kakao || me.naver) ? '이 기기에서 로그아웃하기. ' + (me.naver ? '네이버' : '카카오') + '로 다시 들어오기 가능.' : '이 기기에서 로그아웃하기. 다시 들어오려면 복구 코드 필요.' + (rec ? '' : ' 지금 이 기기에는 복구 코드 없음. 먼저 "코드 받기"를 눌러 적어 두기.'))) return;
      try { await api('logout'); } catch (e) { if (!(e && (e.code === 'unknown_user' || e.code === 'login'))) { fail(e); return; } }
      forgetDevice(); toast('로그아웃 완료'); render();
    });
    const q = $('#quitBtn');
    if (q) q.addEventListener('click', async () => {
      if (window.prompt('탈퇴하면 내 질문과 답 내용이 모두 지워지고 되돌릴 수 없음. 계속하려면 "탈퇴"라고 적기.') !== '탈퇴') return;
      if (me && (me.kakao || me.naver) && socialOn()) { startLogin('leave', me.naver ? 'naver' : 'kakao').catch(e => fail(e)); return; }      // 연결을 끊으려면 그 로그인을 한 번 거친다
      try { await api('deleteMe'); forgetDevice(); toast('탈퇴 완료. 그동안 감사했습니다'); go('#/', true); } catch (e) { fail(e); }
    });
  }
  // 이 기기의 계정 흔적을 지운다(토큰은 다음에 새로 만들어진다)
  function forgetDevice() { setMe(null); store.del('token'); store.del('recovery'); store.del('welcomed'); listState.posts = []; }

  // ----- 관리자 -----
  const admOpen = new Set();     // 열어 둔 칸. 처리한 뒤 화면을 다시 그려도 열린 채로 둔다
  async function renderAdmin() {
    setTab('me');
    bar(backBtn('#/me') + '<div class="fill atitle">관리자</div>');
    if (!me || me.role !== 'admin' || mode === 'local') { view.innerHTML = '<section class="pad">' + empty('관리자만 보기 가능', '') + '</section>'; return; }
    view.innerHTML = '<section class="pad"><div class="loading">불러오는 중…</div></section>';
    let r;
    const seq = renderSeq;
    try { r = await api('adminQueue'); } catch (e) { if (seq !== renderSeq) return; view.innerHTML = '<section class="pad">' + empty('불러오기 실패', '') + '</section>'; fail(e); return; }
    if (seq !== renderSeq) return;
    const STAGE = { raising: '아이를 키움', expecting: '곧 아빠가 됨' };
    const urow = u => {
      const state = u.role === 'admin' ? '관리자' : u.blocked ? '막힘' : u.verified ? '인증(' + ({ invite: '초대', apply: '신청', admin: '관리자', identity: '본인인증', kakao: '카카오', naver: '네이버' }[u.verified_how] || '') + ')' : '인증 전';
      const acts = u.role !== 'user' ? '' : (u.blocked ? '<button type="button" class="edit" data-u="' + u.id + '" data-a="unblock">풀기</button>'
        : (u.verified ? '<button type="button" class="edit" data-u="' + u.id + '" data-a="unverify">해제</button>' : '<button type="button" class="edit" data-u="' + u.id + '" data-a="verify">인증</button>') + '<button type="button" class="edit" data-u="' + u.id + '" data-a="block">막기</button>')
        + '<button type="button" class="edit" data-u="' + u.id + '" data-a="logout">끊기</button>'
        + (u.posts ? '<button type="button" class="edit" data-u="' + u.id + '" data-a="hide_all">글 숨김</button>' : '');
      return '<div class="urow"><div class="tx"><b>' + esc(u.nick) + '</b><small>' + state + (u.inviter ? ' · 초대: ' + esc(u.inviter) : '') + ' · 글 ' + u.posts + ' · ' + ymd(u.created) + '</small></div><div class="acts">' + acts + '</div></div>';
    };
    // Q&A 질문 · 글 제보 · 올라간 Q&A · 최신화 점검(11-05 운영자)
    const qaAll = r.qna || [], qaQ = qaAll.filter(x => x.kind !== 'fix'), qaFix = qaAll.filter(x => x.kind === 'fix'), qaPub = r.qna_published || [];
    const guideTitle = id => { if (id === 'faq') return 'Q&A'; if (id === 'library') return '자료실'; if (/^calc-/.test(id || '')) return '계산기'; const g = GD.items.find(x => x.id === id); return g ? g.title : ''; };
    const fixHref = id => (id === 'faq' ? '#/guide/faq' : id === 'library' ? '#/library' : /^calc-/.test(id) ? '#/calc/' + id.slice(5) : '#/g/' + id);
    const qaCard = x => '<div class="appl" data-qa="' + x.id + '"><div class="meta"><b>질문</b><span class="time">' + ago(x.created) + '</span></div>'
      + '<textarea class="inp" data-f="q" rows="2" maxlength="300" style="min-height:64px;margin-top:6px" aria-label="질문">' + esc(x.question) + '</textarea>'
      + '<textarea class="inp" data-f="a" rows="4" maxlength="1000" style="min-height:96px;margin-top:8px" aria-label="답변" placeholder="답을 적어 올리면 Q&amp;A에 바로 표시. 근거 법령도 함께 적기."></textarea>'
      + '<div class="two" style="margin-top:8px"><button type="button" class="btn primary small" data-qaa="answer">답변 올리기</button><button type="button" class="btn line small" data-qaa="delete">지우기</button></div></div>';
    const fixCard = x => '<div class="appl" data-qa="' + x.id + '"><div class="meta"><b>' + esc(guideTitle(x.ref) || '일반') + '</b><span class="time">' + ago(x.created) + '</span></div><p>' + esc(x.question) + '</p>'
      + '<div class="two" style="margin-top:8px">' + (x.ref ? '<a class="btn line small" href="' + esc(fixHref(x.ref)) + '" style="text-align:center">열어 보기</a>' : '') + '<button type="button" class="btn primary small" data-qaa="delete">처리 완료</button></div></div>';
    const pubCard = x => '<div class="appl" data-qa="' + x.id + '"><div class="meta"><b>' + esc(x.question) + '</b><span class="time">' + ago(x.answered_at) + '</span></div><p>' + esc(x.answer) + '</p><button type="button" class="btn line small" data-qaa="delete">내리기</button></div>';
    const oldDocs = GD.items.filter(g => g.status !== '일반 조언' && g.updated && daysAgo(g.updated) > 90);
    const upcoming = LAW_DATA.items.filter(l => l.upcoming).map(l => esc(l.name) + ' ' + dotd(l.upcoming));
    const reports = r.reports || [];
    // 항목별로 접어 두고 건수만 먼저 보인다(11-05 운영자 "다 늘어놓진 않을꺼지? 접어두거나"). 처리할 것이 있는 칸은 건수가 노랗게. 처리할 일이 있는 칸부터 놓는다
    const adm = (key, title, count, hot, body) => '<details class="adm" data-adm="' + key + '"' + (admOpen.has(key) ? ' open' : '') + '><summary><b>' + title + '</b>' + (count ? '<span class="admn' + (hot ? ' due' : '') + '">' + count + '</span>' : '') + '</summary><div class="admb">' + body + '</div></details>';
    const todo = (n, unit) => n + unit;
    view.innerHTML = '<section class="pad">'
      + adm('reports', '신고함', todo(reports.length, '건'), reports.length > 0, reports.length ? reports.map(x => '<div class="appl" data-rk="' + esc(x.kind) + '" data-rt="' + x.target_id + '"><div class="meta"><b>' + (x.kind === 'post' ? '글' : '댓글') + ' · ' + esc(x.author || '(탈퇴)') + '</b><span class="time">' + x.n + '명 · ' + ago(x.first_at) + '</span></div>'
        + (x.gone ? '<small>이미 지워진 글</small>' : '<p>' + (x.title ? '<b>' + esc(x.title) + '</b>\n' : '') + esc(x.preview || '') + '</p>') + (x.reasons ? '<small>사유: ' + esc(x.reasons) + '</small>' : '')
        + (x.post_id && !x.gone ? '<a class="lk2" href="#/p/' + x.post_id + '">글 열기</a>' : '')
        + '<div class="two"><button type="button" class="btn primary small" data-rp="hide">숨기기</button><button type="button" class="btn line small" data-rp="keep">그대로 두기</button></div></div>').join('') : '<div class="about">대기 중인 신고 없음.</div>')
      + adm('fix', '자료 오류 제보', todo(qaFix.length, '건'), qaFix.length > 0, qaFix.length ? qaFix.map(fixCard).join('') : '<div class="about">대기 중인 제보 없음.</div>')
      + adm('qna', 'Q&amp;A 질문', todo(qaQ.length, '건'), qaQ.length > 0, qaQ.length ? qaQ.map(qaCard).join('') : '<div class="about">대기 중인 질문 없음.</div>')
      + adm('queue', '인증 신청', todo(r.queue.length, '건'), r.queue.length > 0, (r.queue.length ? r.queue.map(q => '<div class="appl" data-id="' + q.id + '"><div class="meta"><b>' + esc(q.nick) + '</b><span class="time">' + ago(q.created) + '</span></div><small>' + esc(STAGE[q.stage] || '') + '</small><p>' + esc(q.answer) + '</p><div class="two"><button type="button" class="btn primary small" data-d="1">승인</button><button type="button" class="btn line small" data-d="0">거절</button></div></div>').join('') : '<div class="about">대기 중인 신청 없음.</div>')
        + '<p class="calcnote">승인·거절하면 신청 내용은 바로 지워짐.</p>')
      + (qaPub.length ? adm('pub', '올라간 Q&amp;A', todo(qaPub.length, '건'), false, qaPub.map(pubCard).join('')) : '')
      + adm('fresh', '최신화 점검', oldDocs.length ? '오래된 글 ' + oldDocs.length + '편' : '', oldDocs.length > 0, '<div class="about"><div id="watchBox"></div>' + notes(['법령 표 확인: ' + dotd(LAW_DATA.checked) + ' (' + daysAgo(LAW_DATA.checked) + '일 전)', '예고된 개정: ' + (upcoming.join(', ') || '없음'), '확인한 지 90일 넘은 글: ' + oldDocs.length + '편'])
        + oldDocs.slice(0, 20).map(g => '<a class="lk2" style="display:block" href="#/g/' + esc(g.id) + '">' + esc(g.title) + '</a>').join('') + '</div>')
      + adm('invites', '초대 코드', '', false, '<div class="about"><div class="two"><input class="inp" id="invNote" placeholder="어디에 쓸 코드인지(메모)" maxlength="60"><button type="button" class="btn primary small" id="invMake">5개 만들기</button></div>'
        + '<div id="invList">' + r.invites.map(i => '<div class="irow"><code>' + esc(i.code) + '</code><span class="time">' + (i.used ? '사용함' : esc(i.note || '안 씀')) + '</span>' + (i.used ? '' : '<button type="button" class="edit" data-share="' + esc(i.code) + '">보내기</button>') + '</div>').join('') + '</div></div>')
      + adm('users', '회원', todo(r.users.length, '명'), false, r.users.map(urow).join(''))
      + '</section>';
    window.scrollTo(0, 0);
    view.addEventListener('click', adminClick);
    paintWatch();
  }
  // 매주 도는 자동 점검(법령 조문 · 자료 링크)이 연 이슈(tools/post_issue.sh, 11-05 운영자 "1단계 시작"). 저장소가 공개라 키 없이 읽고, 칸을 다시 그릴 때마다 묻지 않게 한 번만 읽는다. 못 읽으면 목록 링크만 둔다
  const WATCH_REPO = 'virtualschoolkorea-lab/yukaman', WATCH_LABEL = encodeURIComponent('자동 점검');     // 11-13: 옛 앱 저장소를 보고 있던 것을 이 저장소로
  let watchIssues;
  async function paintWatch() {
    const list = 'https://github.com/' + WATCH_REPO + '/issues?q=is%3Aopen+label%3A%22' + WATCH_LABEL + '%22';
    if (watchIssues === undefined) {
      try {
        const res = await fetch('https://api.github.com/repos/' + WATCH_REPO + '/issues?state=open&labels=' + WATCH_LABEL);
        watchIssues = res.ok ? (await res.json()).map(x => ({ title: String(x.title || ''), url: String(x.html_url || '') })) : null;
      } catch (e) { watchIssues = null; }
    }
    const box = $('#watchBox');
    if (!box) return;
    const link = (href, text) => '<a class="lk2" style="display:block" href="' + esc(href) + '" target="_blank" rel="noopener">' + esc(text) + '</a>';
    if (watchIssues === null) { box.innerHTML = '<p class="calcnote">자동 점검 결과 읽기 실패.</p>' + link(list, '점검 결과 열기'); return; }
    if (!watchIssues.length) { box.innerHTML = '<p class="calcnote">자동 점검(매주 월요일): 확인할 것 없음</p>'; return; }
    box.innerHTML = '<p class="calcnote">자동 점검(매주 월요일): 확인할 것 ' + watchIssues.length + '건</p>' + watchIssues.map(x => link(/^https:\/\/github\.com\//.test(x.url) ? x.url : list, x.title)).join('');
    const sum = box.closest('.adm').querySelector('summary');
    if (!sum.querySelector('.watchn')) sum.insertAdjacentHTML('beforeend', '<span class="admn due watchn">자동 점검 ' + watchIssues.length + '건</span>');
  }
  async function adminClick(ev) {
    if (parse().name !== 'admin') { view.removeEventListener('click', adminClick); return; }
    const fold = ev.target.closest('.adm > summary');
    if (fold) { const box = fold.parentNode; if (box.open) admOpen.delete(box.dataset.adm); else admOpen.add(box.dataset.adm); return; }     // 눌린 뒤에 열리고 닫히므로 지금 상태의 반대로 적는다
    const d = ev.target.closest('[data-d]');
    const u = ev.target.closest('[data-u]');
    const sh = ev.target.closest('[data-share]');
    const mk = ev.target.closest('#invMake');
    const rp = ev.target.closest('[data-rp]');
    const qaa = ev.target.closest('[data-qaa]');
    try {
      if (qaa) {
        const card = qaa.closest('[data-qa]'), id = +card.dataset.qa;
        if (qaa.dataset.qaa === 'answer') {
          const answer = $('[data-f=a]', card).value.trim();
          if (len(answer) < LIM.qa[0]) { toast('답변 적기', 'err'); return; }
          await api('adminQna', { id, action: 'answer', question: $('[data-f=q]', card).value.trim(), answer });
          toast('Q&A에 등록 완료');
        } else {
          await api('adminQna', { id, action: 'delete' });
          toast('처리 완료');
        }
        view.removeEventListener('click', adminClick); render(); return;
      }
      if (rp) { const c = rp.closest('.appl'); if (rp.dataset.rp === 'hide' && !confirm('숨기면 내용이 지워지고 되돌릴 수 없음. 숨기기')) return; await api('adminReport', c.dataset.rk, +c.dataset.rt, rp.dataset.rp); toast('처리 완료'); view.removeEventListener('click', adminClick); render(); return; }
      if (d) { const card = d.closest('.appl'); await api('adminDecide', +card.dataset.id, d.dataset.d === '1'); toast(d.dataset.d === '1' ? '승인 완료' : '거절 완료'); view.removeEventListener('click', adminClick); render(); }
      else if (u) {
        if (u.dataset.a === 'block' && !confirm('이 회원 막기(인증이 풀리고 다시 신청 불가)')) return;
        if (u.dataset.a === 'logout' && !confirm('이 회원의 기기 끊기(복구 코드로만 돌아오기 가능)')) return;
        if (u.dataset.a === 'hide_all' && !confirm('이 회원의 글과 댓글 모두 숨기기(내용이 지워지고 되돌릴 수 없음)')) return;
        await api('adminUser', +u.dataset.u, u.dataset.a); toast('변경 완료'); view.removeEventListener('click', adminClick); render();
      }
      else if (sh) shareInvite(sh.dataset.share);
      else if (mk) { mk.disabled = true; await api('adminInvites', 5, $('#invNote').value.trim()); toast('코드 5개 생성 완료'); view.removeEventListener('click', adminClick); render(); }
    } catch (e) { fail(e); }
  }

  // ----- 바텀시트: 닉네임 · 아빠 인증 -----
  let sheetAfter = null, sheetDismiss = null, sheetFocus = null, verifyStartTab = 'code';
  const sheetEl = () => $('#sheet');
  function showSheet(html, after) {
    sheetAfter = typeof after === 'function' ? after : null;
    sheetDismiss = closeSheet;
    if (!sheetFocus) sheetFocus = document.activeElement;
    const sh = sheetEl(); sh.hidden = false; sh.innerHTML = html;
    sh.onclick = ev => { if (ev.target === sh && sheetDismiss) sheetDismiss(); };
    const first = sh.querySelector('button, input, textarea, a[href]'); if (first) setTimeout(() => { if (document.activeElement === document.body || !sh.contains(document.activeElement)) first.focus(); }, 80);
  }
  // 시트 안에 초점을 가두고 Esc로 닫는다(검수 17)
  document.addEventListener('keydown', ev => {
    const sh = sheetEl(); if (!sh || sh.hidden) return;
    if (ev.key === 'Escape') { if (sheetDismiss) sheetDismiss(); return; }
    if (ev.key !== 'Tab') return;
    const f = $$('button, input, textarea, select, a[href]', sh).filter(x => !x.disabled && x.offsetParent !== null);
    if (!f.length) return;
    const a = f[0], z = f[f.length - 1];
    if (ev.shiftKey && document.activeElement === a) { ev.preventDefault(); z.focus(); }
    else if (!ev.shiftKey && document.activeElement === z) { ev.preventDefault(); a.focus(); }
  });
  // 글을 쓰다가 로그인이 필요해졌을 때 등: 로그인으로 안내하는 시트. 다녀오면 지금 화면으로 돌아온다
  function openLoginSheet(after) {
    const L = LN();
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="' + L + '로 시작하기"><div class="grip"></div><h2>' + (me ? L + '를 연결하기' : L + '로 시작하기') + '</h2>'
      + '<p>' + (me ? L + '를 연결하면 바로 질문게시판 사용 가능.' : '질문게시판은 가입한 아빠만 읽고 쓰기 가능.') + '</p>' + (CFG.NAVER_LOGIN ? GENDER_HINT : '') + '<div style="margin-top:16px">' + loginBtn('kkGo', me ? L + ' 연결하기' : startWord()) + '</div>'
      + '<button type="button" class="btn ghost" id="kkNo">둘러보기만 하기</button>'
      + (CFG.NAVER_LOGIN && CFG.KAKAO_LOGIN && !me ? '<p class="foot-note" style="margin:4px 0 0"><button type="button" class="textlink" id="kkOld">카카오로 가입한 회원</button></p>' : '') + '</div>', after);
    $('#kkGo').addEventListener('click', loginGo);
    const old = $('#kkOld'); if (old) old.addEventListener('click', kakaoOldGo);
    $('#kkNo').addEventListener('click', () => { invitePrompted = true; closeSheet(); });
  }
  // 약관 동의(Play 사용자 제작 콘텐츠 정책). 링크는 새 창이라 쓰던 내용이 남는다. 가입 전에 만든 계정은 첫 글·댓글 때 openTerms로 받는다
  const TERMS_LINE = '만 18세 이상이고, <a href="terms.html" target="_blank" rel="noopener">이용약관</a>과 <a href="privacy.html" target="_blank" rel="noopener">개인정보 처리방침</a>에 동의. 아이의 이름·얼굴 같은 개인정보는 올리지 않기.';
  function openTerms(after) {
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="약관 동의"><div class="grip"></div><h2>약관 동의 필요</h2>'
      + '<p>질문과 답을 올리려면 약관 동의 필요. 비방, 음란물, 아이 개인정보 같은 글은 지우고 이용을 제한할 수 있음.</p>'
      + '<label class="chk"><input type="checkbox" id="tAgree"> <span>' + TERMS_LINE + '</span></label>'
      + '<div class="err" id="tErr" hidden></div>'
      + '<button type="button" class="btn primary" id="tGo">동의하고 계속하기</button>'
      + '<button type="button" class="btn ghost" id="tLater">나중에 하기</button></div>', after);
    $('#tLater').addEventListener('click', closeSheet);
    $('#tGo').addEventListener('click', async ev => {
      const err = $('#tErr');
      if (!$('#tAgree').checked) { err.hidden = false; err.textContent = '약관 동의에 체크하기'; return; }
      ev.target.disabled = true;
      try { const r = await api('agreeTerms'); setMe(r.user); const f = sheetAfter; closeSheet(); if (f) f(); }
      catch (e) { err.hidden = false; err.textContent = errText(e); ev.target.disabled = false; }
    });
  }
  // 앱 심사용 입구: 심사자는 카카오 계정이 없어 코드로 들어온다. 코드는 서버 비밀 값에만 있다. 복구처럼 이 기기의 옛 토큰은 버린다
  function openReview(after) {
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="앱 심사용 입구"><div class="grip"></div><h2>앱 심사용 입구</h2>'
      + '<p>앱 심사 담당자 전용. 일반 회원은 ' + LN() + '로 시작하기.</p>'
      + '<label class="lbl" for="revIn">심사용 코드</label><input class="inp code" id="revIn" maxlength="14" autocomplete="off" autocapitalize="characters">'
      + '<div class="err" id="revErr" hidden></div>'
      + '<button type="button" class="btn primary" id="revGo">들어가기</button>'
      + '<button type="button" class="btn ghost" id="revLater">취소</button></div>', after);
    $('#revLater').addEventListener('click', closeSheet);
    const run = async () => {
      const err = $('#revErr'), btn = $('#revGo');
      btn.disabled = true;
      try {
        store.del('token'); setMe(null);
        const r = await api('reviewLogin', $('#revIn').value.trim());
        setMe(r.user); const f = sheetAfter; closeSheet();
        toast('심사용 계정으로 들어옴'); if (f) f(); else render();
      } catch (e) { err.hidden = false; err.textContent = errText(e); btn.disabled = false; }
    };
    $('#revGo').addEventListener('click', run);
    $('#revIn').addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); run(); } });
    setTimeout(() => { const n = $('#revIn'); if (n) n.focus(); }, 60);
  }
  // 닉네임은 세 칸을 합쳐 만든다(11-05 운영자 "닉네임에 별명/거주지/자녀연생 끝2자리 입력"). 예: 든든이/청주/24
  const nickNow = () => ($('#nName').value.trim() || '별명') + '/' + ($('#nPlace').value.trim() || '거주지') + '/' + ($('#nYear').value.trim() || '00');
  function openSheet(after, kind) {
    if (socialOn() && kind !== 'rename' && kind !== 'social') { openLoginSheet(after); return; }
    const rename = kind === 'rename', fromSocial = kind === 'social', P = nickParts(rename && me ? me.nick : '');
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="' + (rename ? '닉네임 바꾸기' : '닉네임 정하기') + '"><div class="grip"></div>'
      + '<h2>' + (rename ? '닉네임 바꾸기' : fromSocial ? '닉네임 정하기 👋' : '육아맨에 온 걸 환영합니다 👋') + '</h2>'
      + '<p>' + (rename ? '일주일에 한 번 바꾸기 가능. 지난 글의 이름도 함께 바뀜.' : fromSocial ? '글에 이 이름으로 표시.' : '이메일이나 서류는 받지 않음.') + '</p>'
      + '<span class="lbl">닉네임</span><div class="nick3">'
      + '<label>별명<input class="inp" id="nName" maxlength="8" placeholder="든든이" autocomplete="off" enterkeyhint="next" value="' + esc(P.name) + '"></label>'
      + '<label>거주지(시/군)<input class="inp" id="nPlace" maxlength="6" placeholder="청주" autocomplete="off" enterkeyhint="next" value="' + esc(P.place) + '"></label>'
      + '<label>자녀 출생연도 <span class="nw">(막내 기준)</span><input class="inp" id="nYear" maxlength="2" inputmode="numeric" placeholder="24" autocomplete="off" enterkeyhint="done" value="' + esc(P.year) + '"></label></div>'
      + '<div class="nickshow" id="nickShow"></div>'
      + (rename ? '' : (fromSocial ? (pendingInvite ? '<input type="hidden" id="invite" value="' + esc(pendingInvite) + '">' : '') : '<label class="lbl" for="invite">초대 코드 (있으면)</label><input class="inp code" id="invite" maxlength="12" placeholder="없으면 비워 두기" autocomplete="off" autocapitalize="characters" value="' + esc(pendingInvite) + '">')
        + '<label class="chk"><input type="checkbox" id="agree"> <span>' + TERMS_LINE + '</span></label>')
      + '<div class="err" id="nickErr" hidden></div>'
      + '<button type="button" class="btn primary" id="joinBtn">' + (rename ? '바꾸기' : '다음') + '</button>'
      + '<button type="button" class="btn ghost" id="laterBtn">' + (rename ? '취소' : '둘러보기만 하기') + '</button></div>', after);
    const show = () => { $('#nickShow').textContent = '글에 이렇게 표시: ' + (!me || me.role === 'user' ? RANKS[store.get('rank', 0)].name + ' ' : '') + nickNow(); };
    show();
    $('#laterBtn').addEventListener('click', () => { invitePrompted = true; closeSheet(); });
    $('#joinBtn').addEventListener('click', () => doJoin(rename));
    ['nName', 'nPlace', 'nYear'].forEach(id => {
      const el = $('#' + id);
      el.addEventListener('input', show);
      el.addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); doJoin(rename); } });
    });
    setTimeout(() => { const n = $('#nName'); if (n) n.focus(); }, 60);
  }
  async function doJoin(rename) {
    const nameEl = $('#nName'), err = $('#nickErr'); if (!nameEl) return;
    const say = m => { err.hidden = false; err.textContent = m; };
    const name = nameEl.value.trim(), place = $('#nPlace').value.trim(), year = $('#nYear').value.trim();
    if (!/^[가-힣A-Za-z0-9]{2,8}$/.test(name)) return say('별명은 띄어쓰기 없이 2~8자로 적기');
    if (!/^[가-힣]{2,6}$/.test(place)) return say('거주지는 한글 2~6자로 적기(예: 청주)');
    if (!/^\d{2}$/.test(year)) return say('자녀 출생연도 끝 2자리를 숫자로 적기(예: 24)');
    const nick = name + '/' + place + '/' + year;
    const bad = checkNick(nick); if (bad) return say(MSG[bad]);
    if (!rename && !$('#agree').checked) return say('약관 동의에 체크하기');
    const btn = $('#joinBtn'); btn.disabled = true;
    try {
      const inv = $('#invite'), invite = rename || !inv ? '' : (inv.value || '').trim();
      const r = rename ? await api('rename', nick) : await api('join', nick, invite);
      setMe(r.user);
      const f = sheetAfter;
      if (rename) { toast('닉네임 변경 완료'); closeSheet(); if (f) f(); else render(); return; }
      if (r.recovery) store.set('recovery', r.recovery);
      if (!r.existing && r.invite_error !== 'limit') clearInvite();     // 썼거나 못 쓰는 코드. 횟수 제한에 걸렸을 때만 남겨 둔다
      const next = () => {
        if (r.user.verified) { clearInvite(); if (!r.existing) store.set('rank', 0); toast(r.existing ? '환영합니다, ' + r.user.nick + '님!' : '입대를 환영합니다, ' + r.user.nick + '님!'); if (f) f(); else render(); return; }
        if (r.invite_error) toast(MSG[r.invite_error] || MSG.code_bad, 'err');
        openVerify(f);
      };
      closeSheet();
      if (r.recovery) showRecovery(r.recovery, next); else next();     // 가입 직후 복구 코드를 한 번 보여 준다(서버는 해시만 둔다)
    } catch (e) {
      // 다른 기기에서 로그인해 이 기기가 끊긴 경우: 닉네임 칸에 머물지 않고 로그아웃 상태로 돌려 다시 로그인하게 한다(11-13)
      if (rename && e && e.code === 'unknown_user') { closeSheet(); setMe(null); toast(socialOn() ? MSG.logged_out : MSG.unknown_user, 'err'); render(); return; }
      say(errText(e));
    }
    finally { btn.disabled = false; }
  }
  // 복구 코드 보여 주기(가입 직후 · 새로 만들 때 · 복구 뒤). 배경을 눌러 닫아도 다음 단계로 간다.
  function showRecovery(code, next, title) {
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="복구 코드"><div class="grip"></div><h2>' + esc(title || '복구 코드 적어 두기') + '</h2>'
      + '<p>폰을 바꾸거나 브라우저 저장소가 지워졌을 때 이 코드로 같은 닉네임에 돌아오기 가능. 이메일이 없어 이 코드가 유일한 길. 한 번 쓰면 새 코드로 바뀜.</p>'
      + '<div class="reccode" id="recCode">' + esc(code) + '</div>'
      + '<button type="button" class="btn line" id="recCopy">복사하기</button>'
      + '<button type="button" class="btn primary" id="recOk">적어 두었음</button></div>', null);
    const done = () => { closeSheet(); if (next) next(); };
    sheetDismiss = done;
    $('#recCopy').addEventListener('click', async () => { try { await navigator.clipboard.writeText(code); toast('복사 완료. 메모 앱에 붙여 두기'); } catch (e) { window.prompt('이 코드 적어 두기', code); } });
    $('#recOk').addEventListener('click', done);
  }
  // 복구 코드로 이어 쓰기: 이 기기에 남은 옛 토큰은 버리고 새 토큰으로 그 계정에 붙는다(이전 폰은 끊김)
  function openRecover(after) {
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="복구 코드로 이어 쓰기"><div class="grip"></div><h2>복구 코드로 이어 쓰기</h2>'
      + '<p>가입할 때 받은 12자 복구 코드를 넣으면 그 닉네임을 이 폰에서 이어 쓰기. 이전 폰은 그 순간 로그아웃.</p>'
      + '<label class="lbl" for="recIn">복구 코드</label><input class="inp code" id="recIn" maxlength="14" placeholder="ABCD-EFGH-2345" autocomplete="off" autocapitalize="characters">'
      + '<div class="err" id="recErr" hidden></div>'
      + '<button type="button" class="btn primary" id="recGo">이어 쓰기</button>'
      + '<button type="button" class="btn ghost" id="recLater">취소</button></div>', after);
    $('#recLater').addEventListener('click', closeSheet);
    const run = async () => {
      const err = $('#recErr'), btn = $('#recGo'), code = $('#recIn').value.trim();
      if (code.replace(/[^A-Za-z0-9]/g, '').length !== 12) { err.hidden = false; err.textContent = '복구 코드는 12자'; return; }
      btn.disabled = true;
      try {
        store.del('token'); setMe(null);
        const r = await api('recover', code);
        setMe(r.user); store.set('recovery', r.recovery); clearInvite();
        const f = sheetAfter; closeSheet();
        showRecovery(r.recovery, () => { toast('다시 환영합니다, ' + r.user.nick + '님'); if (f) f(); else render(); }, '새 복구 코드');
      } catch (e) { err.hidden = false; err.textContent = errText(e); btn.disabled = false; }
    };
    $('#recGo').addEventListener('click', run);
    $('#recIn').addEventListener('keydown', ev => { if (ev.key === 'Enter' && !ev.isComposing) { ev.preventDefault(); run(); } });
    setTimeout(() => { const n = $('#recIn'); if (n) n.focus(); }, 60);
  }
  // 본인인증(포트원). config.js IDENTITY가 채워져야 켜진다. 폰은 인증 화면으로 넘어갔다가 이 주소로 돌아오니(?identityVerificationId=…) 시작할 때도 마무리한다
  function loadPortOne() { return new Promise((done, bad) => { if (window.PortOne) { done(); return; } const s = document.createElement('script'); s.src = 'https://cdn.portone.io/v2/browser-sdk.js'; s.onload = () => done(); s.onerror = () => bad(new ApiError('identity_bad')); document.head.appendChild(s); }); }
  async function finishIdentity(id) { const r = await api('verifyIdentity', id); setMe(r.user); toast('본인인증 완료. 환영합니다!'); return r; }
  async function startIdentity() {
    await loadPortOne();
    const id = 'yk-' + randomToken().slice(0, 28);
    const res = await window.PortOne.requestIdentityVerification({ storeId: CFG.IDENTITY.storeId, identityVerificationId: id, channelKey: CFG.IDENTITY.channelKey, redirectUrl: location.origin + location.pathname });
    if (res && res.code) throw new ApiError('identity_bad');
    return finishIdentity(id);
  }
  function openIdentity(after) {
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="본인인증"><div class="grip"></div><h2>본인인증</h2>'
      + '<p>휴대폰 본인인증(PASS)을 마치면 바로 질문게시판 사용 가능. 이름·전화번호는 저장하지 않음.</p>'
      + '<div class="err" id="vErr" hidden></div><button type="button" class="btn primary" id="idGo">본인인증 하기</button>'
      + '<label class="lbl" for="vcode">초대 코드가 있다면</label><div class="two"><input class="inp code" id="vcode" maxlength="12" placeholder="ABCD-2345" autocomplete="off" autocapitalize="characters" value="' + esc(pendingInvite) + '"><button type="button" class="btn line small" id="vCodeGo" style="margin-top:0">코드 넣기</button></div>'
      + '<button type="button" class="btn ghost" id="vLater">나중에 하기</button></div>', after);
    const show = e => { const err = $('#vErr'); err.hidden = false; err.textContent = errText(e); };
    const finish = () => { const f = sheetAfter; closeSheet(); if (f) f(); else render(); };
    $('#vLater').addEventListener('click', () => { invitePrompted = true; closeSheet(); if (['me', 'community', 'home'].includes(parse().name)) render(); });
    $('#idGo').addEventListener('click', async ev => { ev.target.disabled = true; try { await startIdentity(); finish(); } catch (e) { show(e); ev.target.disabled = false; } });
    $('#vCodeGo').addEventListener('click', async () => { try { const r = await api('verifyCode', $('#vcode').value.trim()); if (r.user) setMe(r.user); clearInvite(); toast('인증 완료. 환영합니다!'); finish(); } catch (e) { show(e); } });
  }
  // 아빠 인증: 초대 코드(바로) · 신청서(운영자 승인). 본인인증을 켜면 본인인증과 초대 코드만
  function openVerify(after) {
    if (!me) { openSheet(after); return; }
    if (socialOn()) { openLoginSheet(after); return; }
    if (identityOn()) { openIdentity(after); return; }
    let tab = 'code', stage = '';
    const startApply = verifyStartTab === 'apply'; verifyStartTab = 'code';
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="아빠 인증"><div class="grip"></div><h2>아빠 인증</h2>'
      + '<p>질문게시판은 인증한 아빠만 읽고 쓰기 가능. 서류나 사진은 받지 않음.</p>'
      + '<div class="seg" id="vTabs"><button type="button" class="on" data-t="code">초대 코드</button><button type="button" data-t="apply">코드 없음</button></div>'
      + '<div id="vCode"><label class="lbl" for="vcode">초대 코드</label><input class="inp code" id="vcode" maxlength="12" placeholder="ABCD-2345" autocomplete="off" autocapitalize="characters" value="' + esc(pendingInvite) + '"><small class="hint">먼저 가입한 아빠에게 받은 코드를 넣으면 바로 인증.</small></div>'
      + '<div id="vApply" hidden><span class="lbl">지금 상황</span><div class="catpick" id="vStage"><button type="button" class="chip" data-s="raising">아이를 키움</button><button type="button" class="chip" data-s="expecting">곧 아빠가 됨</button></div>'
      + '<label class="lbl" for="vans">요즘 육아 이야기를 두세 문장으로</label><textarea class="inp" id="vans" maxlength="500" rows="4" placeholder="요즘 가장 힘든 일이나 좋은 일 적기. 운영자가 읽고 승인."></textarea>'
      + '<small class="hint">아이 이름·어린이집처럼 알아볼 수 있는 정보는 적지 않기. 승인·거절 뒤 이 글은 지워짐.</small>'
      + '<label class="chk"><input type="checkbox" id="vpledge"> 아이를 키우거나 곧 태어날 아이를 기다리는 아빠임. 거짓이면 인증 취소에 동의.</label></div>'
      + '<div class="err" id="vErr" hidden></div>'
      + '<button type="button" class="btn primary" id="vGo">인증하기</button>'
      + '<button type="button" class="btn ghost" id="vLater">나중에 하기</button></div>', after);
    const setTabV = t => { tab = t; $$('#vTabs button').forEach(b => b.classList.toggle('on', b.dataset.t === t)); $('#vCode').hidden = t !== 'code'; $('#vApply').hidden = t !== 'apply'; $('#vGo').textContent = t === 'code' ? '인증하기' : '신청하기'; $('#vErr').hidden = true; };
    $('#vTabs').addEventListener('click', ev => { const b = ev.target.closest('[data-t]'); if (b) setTabV(b.dataset.t); });
    if (startApply) setTabV('apply');
    $('#vStage').addEventListener('click', ev => { const b = ev.target.closest('[data-s]'); if (!b) return; stage = b.dataset.s; $$('#vStage .chip').forEach(x => x.classList.toggle('on', x === b)); });
    $('#vLater').addEventListener('click', () => { invitePrompted = true; closeSheet(); if (['me', 'community', 'home'].includes(parse().name)) render(); });
    $('#vGo').addEventListener('click', async () => {
      const err = $('#vErr'), btn = $('#vGo'); err.hidden = true;
      const show = m => { err.hidden = false; err.textContent = m; };
      let body = null;
      if (tab === 'code') { if (!$('#vcode').value.trim()) return show('초대 코드 넣기'); }
      else {
        const answer = $('#vans').value.trim();
        if (!stage) return show(MSG.stage);
        if (len(answer) < LIM.answer[0]) return show(MSG.answer_len);
        if (!$('#vpledge').checked) return show(MSG.pledge);
        body = { stage, answer, pledge: true };
      }
      btn.disabled = true;
      try {
        const r = tab === 'code' ? await api('verifyCode', $('#vcode').value.trim()) : await api('verifyApply', body);
        if (r.user) setMe(r.user);
        const f = sheetAfter;
        if (tab === 'code') clearInvite();
        if (canWrite()) { toast(r.instant ? '시험 모드라 바로 인증' : '인증 완료. 환영합니다!'); closeSheet(); if (f) f(); else render(); }
        else { closeSheet(); toast('신청 접수 완료. 승인되면 MY에 표시'); render(); }
      } catch (e) { show(errText(e)); }
      finally { btn.disabled = false; }
    });
  }
  // 질문하기 · 글 제보(서버에 쌓이고 관리자가 본다. 쓴 사람은 저장하지 않는다)
  function openAsk(kind, ref) {
    const fix = kind === 'fix';
    showSheet('<div class="sheet" role="dialog" aria-modal="true" aria-label="' + (fix ? '자료 오류 제보' : '질문하기') + '"><div class="grip"></div><h2>' + (fix ? '자료 오류 제보' : '질문하기') + '</h2>'
      + '<p>' + (fix ? '틀리거나 바뀐 곳 적기. 확인해서 고침.' : '운영자가 확인해 답을 Q&amp;A에 올림.') + '</p>'
      + '<label class="lbl" for="askIn">' + (fix ? '틀린 곳' : '궁금한 것') + '</label><textarea class="inp" id="askIn" rows="4" maxlength="300" style="min-height:112px" placeholder="' + (fix ? '예: 상한액이 바뀜, 링크가 안 열림' : '예: 육아휴직 중 이사해도 되는지') + '"></textarea>'
      + '<small class="hint">아이 이름·회사 이름은 적지 않기.</small><div class="err" id="askErr" hidden></div>'
      + '<button type="button" class="btn primary" id="askGo">보내기</button><button type="button" class="btn ghost" id="askNo">취소</button></div>');
    $('#askNo').addEventListener('click', closeSheet);
    $('#askGo').addEventListener('click', async ev => {
      const text = $('#askIn').value.trim(), err = $('#askErr');
      if (len(text) < LIM.ask[0]) { err.hidden = false; err.textContent = MSG.ask_len; return; }
      ev.target.disabled = true;
      try { await api('ask', { kind, ref: ref || '', text }); closeSheet(); toast(fix ? '감사합니다. 확인 후 반영' : '접수 완료. 답이 달리면 Q&A에 올라옴'); }
      catch (e) { err.hidden = false; err.textContent = errText(e); ev.target.disabled = false; }
    });
  }
  function closeSheet() {
    const sh = sheetEl(); if (!sh) return;
    const wasOpen = !sh.hidden;
    sh.hidden = true; sh.innerHTML = ''; sheetAfter = null; sheetDismiss = null;
    if (wasOpen && sheetFocus && sheetFocus.focus && document.contains(sheetFocus)) sheetFocus.focus();
    sheetFocus = null;
  }

  // ----- 공통 클릭 -----
  document.addEventListener('click', ev => {
    if (!ev.target || !ev.target.closest) return;
    const keep = ev.target.closest('a[data-keep]'); if (keep) { listState.keep = true; listState.scroll = window.scrollY; }
    const ct = ev.target.closest('[data-cta]'); if (ct) countHit('cta', ct.dataset.cta + '|' + (location.hash.replace(/^#\/?/, '') || 'home'));
    const pr = ev.target.closest('a.prod'); if (pr) countHit('out', pr.dataset.k || '');
    const b = ev.target.closest('[data-back]'); if (b) { ev.preventDefault(); back(b.dataset.back); return; }
    const dc = ev.target.closest('[data-del-cmt]'); if (dc) { delComment(+dc.dataset.delCmt); }
    const rb = ev.target.closest('[data-report]'); if (rb) { reportFlow(rb.dataset.report, +rb.dataset.rid); }
    const bl = ev.target.closest('[data-block]'); if (bl) { blockFlow(+bl.dataset.block, bl.dataset.bnick); }
    if (ev.target.closest('[data-ask]')) openAsk('question');
    const fx = ev.target.closest('[data-fix]'); if (fx) openAsk('fix', fx.dataset.fix);
    const kb = ev.target.closest('[data-kid]'); if (kb) pickKid(+kb.dataset.kid);
  });

  // 옆으로 밀리는 칩 줄의 양쪽 화살표(11-05 운영자 "다시 왼쪽으로 돌아가는 버튼이 없어"). 그쪽에 더 있을 때만 보이고, 누르면 밀린다
  const syncMore = el => {
    const w = el.parentNode;
    w.querySelector('.hsmore.prev').hidden = el.scrollLeft <= 8;
    w.querySelector('.hsmore.next').hidden = el.scrollLeft + el.clientWidth >= el.scrollWidth - 8;
  };
  function markScrollers() {
    $$('#view .chips, #view .ages').forEach(el => {
      if (!el.parentNode.classList.contains('hs')) {
        const w = document.createElement('div'); w.className = 'hs';
        el.parentNode.insertBefore(w, el); w.appendChild(el);
        [['prev', '왼쪽으로 돌아가기', '‹', -1], ['next', '오른쪽으로 더 보기', '›', 1]].forEach(([side, label, mark, dir]) => {
          const b = document.createElement('button');
          b.type = 'button'; b.className = 'hsmore ' + side; b.setAttribute('aria-label', label); b.innerHTML = '<span aria-hidden="true">' + mark + '</span>';
          b.addEventListener('click', () => el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: 'smooth' }));
          w.appendChild(b);
        });
        el.addEventListener('scroll', () => syncMore(el), { passive: true });
      }
      syncMore(el);
    });
  }
  // 상단 버튼을 눌러 화면이 다시 그려져도 옆으로 민 자리를 지킨다(11-05 운영자 "맨 왼쪽으로 돌아가지 않게"). 가이드 줄은 칸을 옮겨도 같은 줄로 친다. 눌린 버튼이 가려져 있으면 보이게 민다
  const chipPos = {};
  const chipKey = el => el.dataset.keep || parse().name + ':' + $$('#view .chips, #view .ages').indexOf(el);
  view.addEventListener('scroll', ev => { const t = ev.target; if (t.classList && (t.classList.contains('chips') || t.classList.contains('ages'))) chipPos[chipKey(t)] = t.scrollLeft; }, true);
  function restoreChips() {
    $$('#view .chips, #view .ages').forEach(el => {
      if (el.chipKept) return;
      el.chipKept = true;
      el.scrollLeft = chipPos[chipKey(el)] || 0;
      const on = el.querySelector('.on');
      if (on) {
        const a = on.getBoundingClientRect(), b = el.getBoundingClientRect(), clear = 66;     // 왼쪽 화살표에 가리지 않을 만큼
        if (a.right > b.right - 8 || (el.scrollLeft > 8 && a.left < b.left + clear)) el.scrollLeft += a.left - b.left - clear;
      }
      syncMore(el);
    });
  }
  // 그려지는 즉시(화면에 나오기 전에) 돌려놓는다. 묶음을 씌우면 위치가 지워지니 묶은 다음에
  new MutationObserver(() => { markScrollers(); restoreChips(); }).observe(view, { childList: true, subtree: true });
  window.addEventListener('resize', markScrollers);

  // ----- PC 왼쪽 메뉴와 오른쪽 칸(11-06 운영자 A안). 창이 좁으면 비워 두고 서버에도 묻지 않는다 -----
  const shell = { me: null, meAt: 0, hot: null, hotAt: 0 };
  const FRESH = 60000;     // 화면을 옮겨 다닐 때마다 서버에 묻지 않게 1분은 그대로 쓴다
  const tabIcon = t => { const s = $('.tab[data-tab="' + t + '"] svg'); return s ? s.outerHTML : ''; };
  function shellPlace(r) {
    const n = r.name;
    if (n === 'guide' || n === 'calc' || n === 'library' || n === 'garticle') {
      const g = n === 'garticle' ? GD.items.find(x => x.id === r.id) : null;
      return { top: 'guide', sub: n === 'calc' ? 'calc' : n === 'library' ? 'library' : g ? g.cat : r.cat || GUIDE_DEFAULT };
    }
    if (n === 'community' || n === 'post' || n === 'write') return { top: 'community', sub: n === 'community' ? (r.cat || 'all') : '' };
    if (n === 'shop') return { top: 'shop', sub: r.cat || 'all' };
    if (n === 'me' || n === 'admin') return { top: 'me', sub: '' };
    return { top: 'home', sub: '' };
  }
  function paintSide(r) {
    const at = shellPlace(r), lv = shell.me ? shell.me.rank : store.get('rank', null);
    const nv = (t, h, name, extra) => '<a class="nv' + (at.top === t ? ' on' : '') + '" href="' + h + '"' + (at.top === t ? ' aria-current="page"' : '') + '>' + tabIcon(t) + '<span>' + name + '</span>' + (extra || '') + '</a>';
    const guide = '<div class="subs">' + GUIDE_BTNS.map(b => '<a class="sv' + (at.top === 'guide' && b.on.indexOf(at.sub) >= 0 ? ' on' : '') + '" href="' + b.h + '"><span class="e">' + b.e + '</span>' + esc(b.name) + '</a>').join('') + '</div>';
    const com = '<div class="subs">' + [{ key: '', name: '전체', e: '🏠' }].concat(CATS).map(c => '<a class="sv' + (at.sub === (c.key || 'all') ? ' on' : '') + '" href="#/community' + (c.key ? '/' + c.key : '') + '"><span class="e">' + c.e + '</span>' + esc(c.name) + '</a>').join('') + '</div>';
    const shop = '<div class="subs">' + [{ key: '', name: '전체', e: '🛍️' }].concat(SHOP_CATS).map(c => '<a class="sv' + (at.sub === (c.key || 'all') ? ' on' : '') + '" href="#/shop' + (c.key ? '/' + c.key : '') + '"><span class="e">' + c.e + '</span>' + esc(c.name) + '</a>').join('') + '</div>';
    const open = at.top === 'community' ? 'community' : at.top === 'shop' ? 'shop' : 'guide', dotHidden = $('#meDot') ? $('#meDot').hidden : true, side = $('#side');
    const focused = side.contains(document.activeElement) ? document.activeElement.getAttribute('href') : null;     // 다시 그려도 키보드 자리를 잃지 않게
    // 메뉴는 아래 탭과 같은 다섯(11-12): 홈 · 가이드 · 육아템 · 질문 · MY(육아템을 가운데로)
    side.innerHTML = '<a class="sbrand" href="#/"><span class="logo">' + DAD + '</span><span class="bt"><span class="wm" role="img" aria-label="육아맨">' + WORDMARK + '</span><small>아빠 육아의 모든 정보</small></span></a>'
      + nv('home', '#/', '홈')
      + nv('guide', '#/guide', '가이드') + (open === 'guide' ? guide : '')
      + nv('shop', '#/shop', '육아템') + (open === 'shop' ? shop : '')
      + nv('community', '#/community', '질문') + (open === 'community' ? com : '')
      + nv('me', '#/me', 'MY', '<i class="dot" id="sideDot" aria-label="새 답"' + (dotHidden ? ' hidden' : '') + '></i>')
      + '<div class="fill"></div>'
      + (canWrite() ? '<a class="wbtn" href="#/write">' + ($('#fab svg') ? $('#fab svg').outerHTML : '') + '질문하기</a><a class="meb" href="#/me">' + who(me.nick, me.role === 'admin' ? 'admin' : 'dad', lv) + '</a>'
        : '<a class="wbtn" href="#/me">' + (me ? '인증하기' : '시작하기') + '</a>');
    if (focused) { const el = side.querySelector('a[href="' + focused + '"]'); if (el) el.focus(); }
  }
  const railCalcTiles = () => '<section class="rbox"><h2>계산기</h2><div class="rtiles">' + CALC_TABS.map(t => '<a class="rt" href="#/calc/' + t.key + '"><span class="ge">' + t.e + '</span>' + esc(t.name) + '</a>').join('') + '</div></section>';
  // 오른쪽 칸의 육아템 상자(11-12): 예전에는 계산기와 계급만 있었다. 육아템 화면에서는 고르는 법 글을 보여 준다
  const railShop = () => '<section class="rbox"><h2>아빠 육아템</h2><div class="rlinks">' + SHOP_CATS.map(c => '<a data-cta="rail" href="#/shop/' + esc(c.key) + '"><span class="e">' + esc(c.e) + '</span><span>' + esc(c.name) + '</span></a>').join('') + '</div><a class="btn primary small" data-cta="rail" href="#/shop">육아템 추천받기 →</a></section>';
  const railGear = () => '<section class="rbox"><h2>고르는 법 글</h2><div class="rlinks">' + GD.items.filter(g => g.cat === 'gear').map(g => '<a href="#/g/' + esc(g.id) + '"><span class="e">' + esc(g.e) + '</span><span>' + esc(g.title) + '</span></a>').join('') + '</div></section>';
  function railSameCat(id) {
    const g = GD.items.find(x => x.id === id); if (!g) return '';
    const rest = GD.items.filter(x => x.cat === g.cat && x.id !== g.id).slice(0, 6), c = GCAT[g.cat] || {};
    return rest.length ? '<section class="rbox"><h2>' + esc(c.name || '') + ' 다른 글</h2><div class="rlinks">' + rest.map(x => '<a href="#/g/' + esc(x.id) + '"><span class="e">' + esc(x.e) + '</span><span>' + esc(x.title) + '</span></a>').join('') + '</div></section>' : '';
  }
  const railRank = r => {
    const lv = r.rank, cur = RANKS[lv]; if (!cur) return '';
    const next = RANKS[lv + 1], pts = r.points || 0, days = r.days || 0, ref = r.ref;
    return '<section class="rkbox"><div class="rkhead">' + rankMark(lv) + '<div class="tx"><b>' + cur.name + '</b><small>' + cur.line + '</small></div></div>'
      + (next ? '<p class="rknext rkgoal">' + next.name + ' 진급 조건</p>' + rankReq('점수', pts, next.at, '점') + rankReq('복무', days, next.days, '일') : '<p class="rknext">최고 계급입니다.</p>')
      + (ref && !FOLD_EXTRA ? '<div class="rkinv"><div class="tx"><b>후임 데려오기</b><small>초대한 아빠가 글이나 댓글을 쓰면 <b>' + INVITE_PTS + '점</b></small></div><button type="button" class="btn primary small" data-ref="' + esc(ref.code) + '">초대하기</button></div>' : '') + '</section>';
  };
  function paintRailRank() { const b = $('#railRank'); if (b && shell.me) b.innerHTML = railRank(shell.me); }
  async function fillShellMe() {
    if (!canWrite() || parse().name === 'me') return;      // MY는 화면이 직접 묻고 shellNoteMe로 알려 준다
    if (shell.me && Date.now() - shell.meAt < FRESH) { paintRailRank(); return; }
    try { shellNoteMe(await api('me')); } catch (e) { /* 계급은 없어도 화면은 보인다 */ }
  }
  function shellNoteMe(r) {
    if (!isWide()) return;
    const was = shell.me ? shell.me.rank : null;
    shell.me = r; shell.meAt = Date.now();
    if (was !== r.rank) paintSide(parse());
    paintRailRank();
  }
  async function fillRailHot() {
    if (!$('#railHot') || !canRead() || !HOT_ON) return;
    try {
      if (!shell.hot || Date.now() - shell.hotAt > FRESH) { shell.hot = (await api('hotPosts')).posts; shell.hotAt = Date.now(); }
      const b = $('#railHot');
      if (b) b.innerHTML = shell.hot.length ? '<section class="hot"><h2>🔥 지금 뜨는 글</h2>' + shell.hot.map((p, i) => '<a class="hotrow" href="#/p/' + p.id + '" data-keep="1"><i>' + (i + 1) + '</i><b>' + esc(p.title) + '</b><span>댓글 ' + (p.comments || 0) + '</span></a>').join('') + '</section>' : '';
    } catch (e) { /* 인기 글은 없어도 된다 */ }
  }
  function paintRail(r) {
    const n = r.name, rail = $('#rail'), off = n === 'write' || n === 'admin' || n === 'legal';
    app.classList.toggle('norail', off);
    rail.hidden = off || !hasRail();
    if (rail.hidden) { rail.innerHTML = ''; return; }
    const guest = canRead() ? '' : '<section class="rbox"><h2>질문게시판</h2><p class="rnote">' + (socialOn() ? '가입한' : '인증한') + ' 아빠끼리 묻고 답하기.</p><a class="btn line small" href="#/community">질문게시판 보기</a></section>';
    rail.innerHTML = n === 'calc' ? '<div id="railCalc"></div>'
      : n === 'me' ? (me ? '<div id="railMe"></div>' : railCalcTiles())
      : n === 'community' || n === 'post' ? (canRead() ? '<div id="railHot"></div><div id="railRank"></div>' + railShop() : railCalcTiles() + railShop())
      : n === 'garticle' ? railSameCat(r.id) + railShop() + railCalcTiles()
      : n === 'shop' ? railGear() + railCalcTiles()
      : n === 'home' ? railShop() + railCalcTiles() + '<div id="railRank"></div><div id="railHot"></div>' + guest
      : railCalcTiles() + railShop() + '<div id="railHot"></div>' + guest;
    paintRailRank();
    fillRailHot();
  }
  function paintShell(r) {
    const side = $('#side');
    if (!isWide()) { if (!side.hidden) { side.hidden = true; side.innerHTML = ''; $('#rail').hidden = true; $('#rail').innerHTML = ''; app.classList.remove('norail'); } return; }
    side.hidden = false;
    if (!me || (shell.me && shell.me.user && shell.me.user.id !== me.id)) shell.me = null;      // 로그아웃하거나 계정이 바뀌면 지난 계급을 버린다
    paintSide(r);
    paintRail(r);
    fillShellMe();
  }
  $('#rail').addEventListener('click', ev => { const b = ev.target.closest('[data-ref]'); if (b) shareRef(b.dataset.ref); });
  // 창 크기가 경계를 넘으면 그 폭에 맞는 화면으로 다시 그린다. 쓰던 글과 댓글은 저장돼 있어 그대로 돌아온다
  WIDE.addEventListener('change', () => render());
  RAILED.addEventListener('change', () => render());

  // ----- 시작 -----
  if (mode === 'local') { const u = local.user(); setMe(u ? pub(u) : null); }
  // 카카오·네이버에서 돌아왔을 때(?code=…&state=… 또는 ?error=…): 주소를 먼저 깨끗이 하고 원래 화면을 그린 뒤 마무리한다
  const loginBack = (function () {
    const p = new URLSearchParams(location.search), code = p.get('code'), err = p.get('error');
    if (p.has('identityVerificationId') || (!code && !err)) return null;     // 본인인증 복귀도 code를 쓴다
    invitePrompted = true;                                                    // 돌아온 순간 로그인 안내 시트가 다시 뜨지 않게
    const k = store.get('loginState', null); store.del('loginState');
    history.replaceState(null, '', location.pathname + ((k && k.back) || '#/'));
    if (!k || k.state !== p.get('state')) return { bad: !!code };     // 이 기기에서 시작한 로그인이 아니다
    return err ? {} : { kind: k.kind, purpose: k.purpose, code, state: k.state };
  })();
  render();
  if (loginBack) { if (loginBack.code) finishLogin(loginBack.kind, loginBack.purpose, loginBack.code, loginBack.state); else if (loginBack.bad) toast(MSG[loginKind() + '_bad'], 'err'); }
  // 본인인증 화면에서 돌아왔을 때(폰): ?identityVerificationId=…&code=…
  (function () {
    const p = new URLSearchParams(location.search), id = p.get('identityVerificationId');
    if (!id) return;
    history.replaceState(null, '', location.pathname + '#/me');
    if (p.get('code')) { toast(MSG.identity_bad, 'err'); render(); return; }
    finishIdentity(id).then(() => render()).catch(e => { toast(errText(e), 'err'); render(); });
  })();
  // 승인·해제가 다른 기기에서 일어나도 다음에 열 때 맞춘다(화면을 막지 않는다)
  // 읽기 자격이 바뀌었으면 커뮤니티가 보이는 화면을 다시 그린다(잠금 ↔ 글 목록)
  const syncMe = next => { const was = canRead(); setMe(next); if (!!was !== !!canRead() && ['home', 'community', 'post'].includes(parse().name)) render(); else if (isWide()) paintSide(parse()); };
  if (me && mode === 'server' && !(loginBack && loginBack.code)) api('me').then(r => { syncMe(r.user); if (parse().name !== 'me') setDot(r.new_comments); }).catch(e => { if (e && e.code === 'unknown_user') syncMe(null); });
  if ('serviceWorker' in navigator && location.protocol !== 'file:') window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
})();
