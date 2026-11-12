-- 만들어지는 파일: tools/build_seed.py. 이미 들어 있는 자료실 글의 제목·본문을 seed/official-posts.json과 같게 맞춘다(user_id = 1인 글만).
UPDATE posts SET cat = 'tip', title = '숫자로 보는 아빠 육아휴직 (2026년 11월 현재)', body = '숫자마다 뜻이 달라요. 섞어 읽지 않도록 나눠 적었어요.

육아휴직 급여 받는 사람 중 아빠 비중(고용보험)
- 2024년 41,829명, 31.6%
- 2025년 67,200명, 36.5%. 전년보다 60.7% 늘었어요.
- 2026년 상반기 40,320명, 38.8%

그해 태어난 아이의 아빠 중 쉰 사람 비율(국가데이터처, 2024년 출생아 잠정)
- 아빠 10.2%, 엄마 72.2%
- 아빠 사용률은 300인 이상 기업 12.5%, 4인 이하 6.2%

얼마나 쉬나(국회예산정책처)
- 2024년 평균 수급기간 남성 7.6개월, 여성 9.4개월

공무원은 다른 통계예요
- 2025년 국가공무원 육아휴직자 중 남성 56.0%로 처음 여성보다 많았어요.

눈치는 여전해요
- 2026년 6월 직장갑질119 설문에서 육아휴직을 자유롭게 쓸 수 있다는 답은 53.3%였어요.

출처
https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=19652
https://www.moel.go.kr/news/enews/report/enewsView.do?news_seq=18987
https://mods.go.kr/board.es?mid=a10301030600&bid=11814&act=view&list_no=442470
https://www.nabo.go.kr/ko/periodical/focusView.do?idx=8672&key=2507040015&idx=8671
https://www.newsis.com/view/NISX20260717_0003713305' WHERE id = 1 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 2 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'tip', title = '먼저 쓴 아빠들의 책 12권', body = '육아휴직을 다녀온 아빠들이 쓴 책이에요. 서점 페이지에서 있는 책인지 확인했어요. 추천 순서는 아니에요.

- 아빠가 육아휴직을 결정했다 (임아영·황경상, 2020)
- 엄마도 아빠도 육아휴직 중 (김호종, 2024)
- 육아휴직, 또 다녀왔습니다 (장현수, 2026)
- 썬데이 파더스 클럽 (강혁진 외, 2023)
- 육아휴직 쓰고 제주로 왔습니다 (이희성, 2024)
- 아무래도 잘한 것 같아 (신지훈, 2022)
- 전지적 아빠 육아 시점 (홍윤표, 2024)
- 아빠, 육아휴직해도 괜찮아 (손정환, 2018)
- 아빠의 긍정 육아가 아이의 행복을 만든다 (세준세환 아빠, 2023)
- 아빠, 잘 좀 키워줘 봐! (김진성, 2018)
- 남편이 육아휴직을 했어요 (최현아, 2020)
- 내 생애 가장 아름다운 365일 (강상구, 2007)

서점 링크는 가이드 > 자료실에서 "책"을 고르면 있어요. 오래된 책의 급여 숫자는 지금과 달라요. 어떤 책이 좋았는지 궁금하면 질문게시판에서 아빠들에게 물어보세요.' WHERE id = 3 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'tip', title = '연구로 본 아빠 육아: 알아 두면 좋은 네 가지', body = '연구마다 결과가 다르고, 대부분 원인이 아니라 관련성을 본 연구예요. 그 점을 감안해 읽어 주세요.

1. 아빠도 산후우울을 겪어요. 메타분석에서 임신~출산 후 1년 사이 아빠의 우울은 약 10%로 나왔어요(Paulson & Bazemore, JAMA 2010, 10.4%).
2. 아빠가 직접 돌보면 아이에게 좋다는 연구가 많아요. 문헌 고찰 24편 중 22편에서 긍정적 결과가 보고됐어요(Sarkadi 외, 2008).
3. 휴가를 쓴 아빠는 이후 육아 참여가 늘었다는 독일 연구가 있어요(Bünning 2015, Tamm 2019). 다만 같은 개혁을 보고 늘지 않았다는 연구도 있어요(Kluve & Tamm 2013).
4. 경력에 대한 결과는 엇갈려요. 노르웨이에서 4주 아빠 휴가 뒤 소득이 낮아졌다는 연구가 있어요(Rege & Solli 2013). 한국 남성의 휴직 뒤 임금·승진을 직접 분석한 연구는 이번 자료 모음에서 찾지 못했어요.

원문 링크는 가이드 > 자료실에서 "연구", "해외"를 골라 보세요.' WHERE id = 4 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 5 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 휴직 중 회사에서 돈을 받으면 급여가 줄어드나요?', body = 'A. 합이 통상임금을 넘을 때만 줄어요.

육아휴직을 이유로 회사에서 받은 돈과 육아휴직 급여를 달마다 합해서, 휴직 시작일 기준 월 통상임금을 넘으면 넘는 만큼 급여에서 빼요. 예를 들어 통상임금 300만원, 급여 250만원인 달에 회사에서 100만원을 받으면 합이 350만원이라 50만원이 줄어요.

육아맨 계산기(가이드 > 계산기)에 금액을 넣으면 계산돼요.

출처
https://www.law.go.kr/법령/고용보험법시행령/제98조' WHERE id = 6 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 휴직 중에 아르바이트나 부업을 해도 되나요?', body = 'A. 조건을 넘으면 급여가 제한돼요.

고용24 안내 기준으로, 급여 받는 기간에 주 소정근로시간이 15시간 이상이거나 자영업 소득·근로 대가가 월 150만원 이상이면 지급이 제한돼요. 일한 사실은 신청서에 적어야 해요. 사실과 다르게 받으면 돌려줘야 하고 처벌받을 수 있어요.

애매하면 신청 전에 고용센터나 1350에 물어보세요.

출처
https://m.work24.go.kr/cm/c/f/1100/selecSystInfo.do?systClId=SC00000251&systId=SI00000402
https://www.law.go.kr/법령/고용보험법/제73조' WHERE id = 7 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 입사한 지 5개월인데 육아휴직을 쓸 수 있나요?', body = 'A. 기준은 신청하는 날이 아니라 휴직을 시작하는 날 전날이에요. 그날까지 6개월이 되게 시작일을 잡으면 회사는 허용해야 해요.

- 법의 예외: 휴직 시작 전날까지 그 회사에서 일한 기간이 6개월 미만이면 허용 의무에서 빠져요. 신청일이 아니라 시작 예정일 기준이에요.
- 그래서 입사 5개월이면 시작일을 입사 6개월이 되는 날 이후로 잡고, 그 30일 전에 신청하면 돼요.
- 급여 조건은 따로 있어요: 시작일 이전 고용보험 피보험 단위기간이 합해서 180일 이상이어야 해요. 이전 직장 기간을 합칠 수 있는지는 고용센터에 확인해 주세요.

출처
https://www.law.go.kr/법령/남녀고용평등과일ㆍ가정양립지원에관한법률시행령/제11조
https://www.law.go.kr/법령/고용보험법/제70조' WHERE id = 8 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 아이가 곧 9살이 되는데 아직 쓸 수 있나요?', body = 'A. 휴직을 시작하는 날에 조건을 채우면 돼요.

대상은 만 8세 이하 또는 초등학교 2학년 이하 자녀예요. 고용노동부 상담 답변은 시작일을 기준으로 판단하고, 이미 시작한 휴직은 도중에 나이를 넘어도 쓸 수 있다고 안내해요.

홈 ''우리 아이''에 아이 날짜를 넣으면 시작 마지막 날이 나와요. 단축근무는 만 12세 이하 또는 초6 이하까지예요.

출처
https://www.moel.go.kr/minwon/fastcounsel/fastcounselView.do?inetDcssMngId=202511100916287560745
https://www.law.go.kr/법령/남녀고용평등과일ㆍ가정양립지원에관한법률/제19조' WHERE id = 9 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 승진에서 빠졌는데 육아휴직 때문인 것 같아요', body = 'A. 휴직 기간은 근속에 들어가요. 다만 불리한 처우인지는 구체적으로 따져요.

- 법: 육아휴직 기간은 근속기간에 포함돼요.
- 고용노동부 설명(2024): 휴직 기간을 근속에서 빼 승진 평가에서 배제하면 법 위반으로 볼 수 있고, 불리한 처우인지는 승진평가 기준과 결과를 구체적으로 봐서 판단해요.
- 인정되지 않은 판결도 있어요: 서울행정법원 2023구합83097(2025. 9. 25.)은 평가 항목에 휴직에 따라 점수가 달라지는 요소가 없다는 점 등을 들어 차별로 보지 않았어요. 판결 페이지에 항소 표시가 있어 확정 여부는 확인하지 못했어요.

평가 기준, 결과 통지, 면담 기록을 모아 1350이나 고용평등 상담 1551-9811에 물어보세요.

출처
https://moel.go.kr/news/enews/explain/enewsView.do?news_seq=16090
https://www.law.go.kr/LSW/precInfoP.do?precSeq=612973&mode=0
https://www.bokjiro.go.kr/ssis-tbu/cms/pc/news/promotion/1308080_1118.html' WHERE id = 10 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 복직했더니 전혀 다른 일을 시켜요', body = 'A. 임금이 같아도 불리한 처우가 될 수 있어요.

- 법: 휴직 전과 같은 업무 또는 같은 수준의 임금을 주는 직무로 복귀시켜야 해요.
- 대법원 2017두76005(2022. 6. 30.): 복귀 후 업무가 휴직 전과 크게 달라 휴직 신청이나 복귀를 꺼리게 한다면 불리한 처우가 될 수 있다고 봤어요.
- 중증 시각장애가 있는 한부모 근로자에게 복직 후 오후 4시~새벽 1시 근무를 통보한 사건에서, 지시를 위법으로 보고 해고를 무효로 본 판결이 확정됐어요(경향신문 2025. 9. 2.). 개별 사정이 크게 반영된 판단이에요.

할 수 있는 일
- 해고·전보·전직은 상시 근로자 5인 이상 사업장이면 그 일이 있은 날부터 3개월 안에 지방노동위원회에 구제신청을 할 수 있어요.
- 서울시 직장맘지원센터 안내에 따르면 월평균 임금 300만원 미만이면 무료 대리인을 지원받을 수 있어요.

이 글은 법률 자문이 아니에요. 기한이 짧으니 빨리 상담받으세요.

출처
https://www.law.go.kr/LSW/precInfoP.do?precSeq=223311
https://www.khan.co.kr/article/202509021422001
https://nlrc.go.kr/nlrc/commIntro/minwon/workGuide03.do
https://gworkingmom.net/working_parents/parenting/single/17' WHERE id = 11 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 회사가 육아휴직을 안 된다고 해요. 어떻게 하나요?', body = 'A. 예외는 근속 6개월 미만뿐이에요. 기록을 남기고 신고할 수 있어요.

순서
1. 신청서를 메일이나 문서로 내서 날짜를 남겨요. 시작 30일 전까지예요.
2. 회사가 14일 안에 허용 사실을 알리지 않으면 신청한 대로 허용한 것으로 봐요.
3. 고용노동부 노동포털에서 익명으로 신고하거나, 1350·고용평등 상담 1551-9811에 물어봐요.
4. 관할 고용노동청에 진정이나 고소를 해요. 허용하지 않은 사업주는 500만원 이하 벌금 대상이에요.

알아 둘 것
- 고용노동부 답변에 따르면 진정을 낸다고 휴직이 바로 시작되는 것은 아니에요.
- 2019~2023년 육아지원제도 신고 2,335건 중 기소·과태료는 159건(6.8%)이었어요. 신고인 취하 등 종결은 595건이었어요. 그래서 증거를 미리 남기는 게 중요해요.

출처
https://www.law.go.kr/법령/남녀고용평등과일ㆍ가정양립지원에관한법률시행령/제11조
https://labor.moel.go.kr/reportCntr/maternityProtect.do
https://www.moel.go.kr/minwon/fastcounsel/fastcounselView.do?inetDcssMngId=202410301210549050130
https://moel.go.kr/news/enews/explain/enewsView.do?news_seq=16182' WHERE id = 12 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 부부가 같은 기간에 같이 쉬어도 되나요?', body = 'A. 돼요. 번갈아 써도 되고요.

시행령이 정한 육아휴직 제외 사유는 근속 6개월 미만이에요. 배우자가 쉬고 있다는 것은 사유가 아니에요. 6+6 특례도 기간이 겹치든 겹치지 않든 적용돼요. 다만 아이가 태어나 18개월이 될 때까지 두 사람 모두 휴직을 시작해야 해요. 특례는 고용보험에 가입한 근로자에게 적용돼요. 배우자가 공무원·교원이면 근로자인 쪽만 받아요(고용노동부 답변).

출처
https://www.law.go.kr/법령/고용보험법시행령/제95조의3
https://www.moel.go.kr/minwon/fastcounsel/fastcounselView.do?inetDcssMngId=202501080525450040945
https://www.moel.go.kr/minwon/fastcounsel/fastcounselView.do?inetDcssMngId=202503181109200080639' WHERE id = 13 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 아내가 전업주부인데 아빠가 육아휴직을 쓸 수 있나요?', body = 'A. 쓸 수 있어요.

법은 만 8세 이하 또는 초2 이하 자녀를 키우는 근로자라면 허용하라고 정해요. 고용노동부도 남녀 구분 없이 부여해야 한다고 답했어요. 시행령이 정한 제외 사유는 근속 6개월 미만이에요. 배우자의 직업은 조건이 아니에요.

다만 급여는 달라요. 6+6 특례는 부모가 모두 육아휴직을 쓰는 경우라서, 아내가 전업주부·자영업자면 아빠는 일반 기준(1~3개월 상한 250만원, 4~6개월 200만원, 7개월째부터 80%에 상한 160만원)으로 받아요. 아내가 공무원·교원이고 휴직을 쓰면 근로자인 아빠는 6+6을 받아요(고용노동부 답변). 계산기에서 ''부모 모두''를 고르고 배우자를 고르면 그렇게 계산돼요.

출처
https://www.law.go.kr/법령/남녀고용평등과일ㆍ가정양립지원에관한법률/제19조
https://www.moel.go.kr/minwon/fastcounsel/fastcounselView.do?inetDcssMngId=202305121436150931000
https://www.law.go.kr/법령/고용보험법시행령/제95조의3
https://www.moel.go.kr/minwon/fastcounsel/fastcounselView.do?inetDcssMngId=202502031122161240281' WHERE id = 14 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 15 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 16 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'leave', title = '우리 지역 아빠 육아휴직 장려금, 있는지 확인해 보세요', body = '일부 지자체가 아빠 육아휴직 장려금을 따로 줘요. 보도·공지 기준 사례예요. 조건과 예산이 바뀌니 신청 전에 꼭 확인해 주세요.

- 서울 강남구: 월 30만원, 최대 1년. 6+6 대상자는 제외(2026. 1.)
- 세종시: 월 30만원, 최대 6개월, 지역화폐(2026. 6.)
- 경기 파주시: 월 30만원, 3개월(2026. 2.)
- 충남 아산시: 월 30만원, 최대 6개월, 6개월 이상 거주. 지금도 하는지는 시청에 확인해 주세요

끝난 사업도 있어요. 서울형 육아휴직장려금은 2024년 말, 경기도 사업은 2025년 말로 종료 표시돼 있어요.

대부분 그 지역에 일정 기간 주민등록이 있어야 해요. 공무원·교원·자영업자는 빠지는 곳이 많아요. 우리 동네 제도가 궁금하면 질문게시판에서 아빠들에게 물어보세요.

출처
https://www.gangnam.go.kr/board/B_000031/1074904/view.do?mid=ID01
https://www.sejong.go.kr/bbs/R0071/view.do?nttId=B000000154984Lk5kK2j
https://www.bokjiro.go.kr/ssis-tbu/cms/pc/news/news/1309328_1114.html
https://www.asan.go.kr/main/cms/?no=433' WHERE id = 17 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 18 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 19 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 20 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 21 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 22 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 23 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET deleted = '2026-11-13T00:00:00.000Z', title = '', body = '' WHERE id = 24 AND user_id = 1 AND deleted IS NULL;
UPDATE posts SET cat = 'question', title = 'Q. 둘째가 생기면 육아휴직을 또 쓸 수 있나요?', body = 'A. 네. 육아휴직은 아이마다 따로 봐요. 첫째 때 1년을 다 썼어도 둘째로 다시 쓸 수 있어요.

아이마다 따로 보는 것
- 육아휴직: 아이 한 명당 아빠 1년. 같은 아이로 부모가 각각 3개월 이상 쓰면 6개월 더 써요.
- 시작 기한: 그 아이가 만 8세 이하 또는 초2 이하일 때까지예요.
- 6+6: 그 아이 생후 18개월 안에 부모가 각각 시작해야 해요.
- 단기 육아휴직: 사유에 해당하면 아이마다 1년에 1번 써요.

쌍둥이도 마찬가지예요. 고용노동부는 생후 18개월 안의 두 아이로 부모가 번갈아 쉬면 아이마다 6+6을 적용받을 수 있다고 답했어요.

첫째 휴직 중에 둘째가 태어나는 경우처럼 기간이 겹치면 신청 전에 1350에 물어보세요.

출처
https://www.moel.go.kr/minwon/fastcounsel/fastcounselView.do?inetDcssMngId=202502061042079620224
https://edrm.ei.go.kr/ei/eim/eg/ei/eiEminsr/retrievePb0302Info.do
https://www.moel.go.kr/news/cardinfo/view.do?bbs_seq=20260800522
https://www.law.go.kr/법령/남녀고용평등과일ㆍ가정양립지원에관한법률/제19조' WHERE id = 25 AND user_id = 1 AND deleted IS NULL;
