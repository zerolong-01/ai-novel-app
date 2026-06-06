# AI Novel App

AI를 활용해 한국어 웹소설 초고를 만들고 이어서 집필할 수 있는 Next.js 앱입니다. 사용자는 제목, 장르, 등장인물, 줄거리를 입력한 뒤 장면 단위로 생성하고, 브라우저에 저장된 작업 이력을 다시 불러와 계속 작성할 수 있습니다.

## 주요 기능

- 한국어 소설 생성 스트리밍
- 로컬 저장 기반 작품 이력 관리
- Supabase 인증 연동
- Stripe 구독 업그레이드 흐름

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`을 열어 확인합니다.

## 필요한 환경 변수

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`
- `STRIPE_SECRET_KEY`

## 개선 메모

- 작품 데이터는 현재 브라우저 `localStorage`에 저장됩니다.
- 장기적으로는 Supabase DB에 작품 본문과 챕터를 저장하도록 확장하는 편이 좋습니다.
