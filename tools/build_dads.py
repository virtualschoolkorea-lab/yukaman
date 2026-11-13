# 아빠단 탭 자료 만들기(2026-11-13). data-src/dads/*.json(조사 결과)을 검사해 public/dad-data.js로 묶는다.
# 쓰는 법: tools/python -I -X utf8 tools/build_dads.py [--check]
# 검사: 갈래(kind) · 시도 이름 · http(s) 주소만 · 출처 하나 이상 · id 겹침 · 달 1~12 · 숨은 글자 빼기. 걸린 항목은 빼고 까닭을 찍는다.
import json, glob, os, re, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'data-src', 'dads')
OUT = os.path.join(ROOT, 'public', 'dad-data.js')
REGIONS = ['전국', '서울', '인천', '경기', '강원', '대전', '세종', '충북', '충남', '광주', '전북', '전남', '부산', '대구', '울산', '경북', '경남', '제주']
KINDS = {'public', 'org', 'self'}
TYPES = {'아빠단', '아빠 교육', '아빠 모임'}
HIDDEN = re.compile('[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f​-‏‪-‮⁠-⁤﻿]')
URL = re.compile(r'^https?://[^\s<>"\']+$', re.I)


def clean(s, n=200):
    s = HIDDEN.sub('', str(s or '')).strip()
    s = re.sub(r'\s+', ' ', s)
    return s[:n]


def months(v):
    out = []
    for m in v or []:
        try:
            m = int(m)
        except (TypeError, ValueError):
            continue
        if 1 <= m <= 12 and m not in out:
            out.append(m)
    return sorted(out)


def item(x, why):
    d = {}
    d['id'] = re.sub(r'[^a-z0-9-]', '', clean(x.get('id'), 60).lower())
    d['name'] = clean(x.get('name'), 60)
    d['kind'] = clean(x.get('kind'), 10)
    d['type'] = clean(x.get('type'), 10)
    d['region'] = clean(x.get('region'), 10)
    if not d['id'] or not d['name']:
        return why('id · 이름 없음')
    if d['kind'] not in KINDS:
        return why('갈래가 이상함: ' + d['kind'])
    if d['type'] not in TYPES:
        d['type'] = '아빠 모임' if d['kind'] != 'public' else '아빠단'
    if d['region'] not in REGIONS:
        return why('시도 이름이 이상함: ' + d['region'])
    for k, n in (('area', 40), ('host', 60), ('target', 120), ('size', 40), ('recruit', 80), ('active', 80), ('note', 160)):
        v = clean(x.get(k), n)
        if v:
            d[k] = v
    if 'http' in ' '.join(d.get(k, '') for k in ('area', 'host', 'target', 'size', 'recruit', 'active', 'note')):
        return why('글 칸에 주소가 있음')
    try:
        y = int(x.get('year') or 0)
        if 2000 <= y <= 2030:
            d['year'] = y
    except (TypeError, ValueError):
        pass
    d['recruit_months'] = months(x.get('recruit_months'))
    d['active_months'] = months(x.get('active_months'))
    d['does'] = [clean(w, 20) for w in (x.get('does') or []) if clean(w, 20)][:6]
    d['links'] = []
    for l in x.get('links') or []:
        u = clean(l.get('url'), 400)
        if URL.match(u) and not any(u == z['url'] for z in d['links']):
            d['links'].append({'label': clean(l.get('label'), 12) or '공식 누리집', 'url': u})
    d['sources'] = []
    for s in x.get('sources') or []:
        u = clean(s.get('url'), 400)
        if not URL.match(u):
            continue
        date = clean(s.get('date'), 10)
        if not re.match(r'^\d{4}-\d{2}-\d{2}$', date):
            date = ''
        d['sources'].append({'title': clean(s.get('title'), 90), 'url': u, 'publisher': clean(s.get('publisher'), 30), 'date': date, 'kind': '기사' if clean(s.get('kind')) == '기사' else '공식'})
    if not d['sources']:
        return why('출처 없음')
    if not d['links']:      # 바로가기 단추가 하나는 있게: 공식 출처를 공고로
        off = [s for s in d['sources'] if s['kind'] == '공식'] or d['sources']
        d['links'].append({'label': '모집 공고' if d['kind'] == 'public' else '공식 누리집' if off[0]['kind'] == '공식' else '관련 기사', 'url': off[0]['url']})
    return d


def main():
    items, ids, dropped = [], set(), []
    for f in sorted(glob.glob(os.path.join(SRC, '*.json'))):
        try:
            data = json.load(open(f, encoding='utf-8'))
        except Exception as e:
            print('[멈춤] 읽기 실패', os.path.basename(f), e)
            sys.exit(1)
        for x in data:
            name = os.path.basename(f) + ' · ' + str(x.get('name'))
            d = item(x, lambda w, name=name: dropped.append(name + ' — ' + w))
            if not d:
                continue
            key = re.sub(r'[\s()·,\-]', '', d['name'])
            if d['id'] in ids or key in ids:
                dropped.append(name + ' — 겹침')
                continue
            ids.add(d['id']); ids.add(key)
            items.append(d)
    for w in dropped:
        print('[뺌]', w)
    by = {}
    for d in items:
        by[d['kind']] = by.get(d['kind'], 0) + 1
    print('모음', len(items), by, '시도', len({d['region'] for d in items}))
    if '--check' in sys.argv:
        return
    body = json.dumps({'updated': datetime.date.today().isoformat(), 'items': items}, ensure_ascii=False, indent=0, separators=(',', ':'))
    js = '// 아빠단 탭 자료(tools/build_dads.py가 data-src/dads/*.json에서 만든다. 손으로 고치지 않는다). app.js 앞에 읽는다.\nwindow.YK_DADS = ' + body + ';\n'
    with open(OUT, 'w', encoding='utf-8', newline='\n') as fp:
        fp.write(js)
    print('썼다', OUT, len(js), '바이트')


main()
