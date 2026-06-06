# AI Novel Studio

AI Novel Studio는 한국어 웹소설 초고를 빠르게 만들고 이어서 써 내려갈 수 있는 AI 창작 앱입니다.  
사용자는 제목, 장르, 등장인물, 줄거리를 입력한 뒤 장면 단위로 스토리를 생성하고, 저장된 작품을 다시 열어 계속 집필할 수 있습니다.

실서비스 배포 주소:

- https://ai-novel-app.vercel.app/

## 주요 기능

- AI 기반 한국어 소설 생성
- 작품 설정 입력
  제목, 장르, 등장인물, 초기 줄거리를 바탕으로 첫 장면 생성
- 이어쓰기 흐름
  사용자 지시문을 입력하거나 다음 장면 생성을 눌러 스토리 확장
- 작품 히스토리
  생성한 작품을 브라우저에 저장하고 다시 불러오기 가능
- 사용자 인증
  Supabase 기반 로그인 및 회원가입
- 구독 플랜
  무료 크레딧과 Stripe 기반 유료 플랜 업그레이드 지원

## 사용자 흐름

1. 홈에서 작품 설정을 입력합니다.
2. 생성 페이지에서 AI가 첫 장면을 작성합니다.
3. 이어질 내용이나 원하는 방향을 입력해 다음 장면을 생성합니다.
4. 작업한 작품은 히스토리에서 다시 열어 이어서 작성할 수 있습니다.

## 기술 스택

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Supabase
- Stripe
- OpenAI SDK 호환 Groq API

## 프로젝트 구조

```text
src/
  app/
    api/                 API 라우트
    auth/                인증 콜백
    generate/            소설 생성 화면
    history/             작품 히스토리
    login/               로그인
    signup/              회원가입
  components/            UI 및 도메인 컴포넌트
  lib/                   AI, 인증, 저장소, Stripe 유틸
  styles/                전역 스타일
```

## 로컬 실행

```bash
npm install
npm run dev
```

브라우저에서 아래 주소를 열면 됩니다.

- http://localhost:3000

## 환경 변수

`.env.local`에 아래 값을 설정해야 합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GROQ_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 배포

이 프로젝트는 Vercel에 배포되어 운영 중입니다.

- Production: https://ai-novel-app.vercel.app/

배포 시에는 `NEXT_PUBLIC_APP_URL`을 실제 도메인으로 맞춰야 하며, Stripe와 Supabase 관련 환경 변수도 함께 설정해야 합니다.

## 참고 사항

- 현재 작품 데이터는 브라우저 `localStorage`에 저장됩니다.
- 인증과 결제 상태는 Supabase 및 Stripe 흐름에 연결되어 있습니다.
- 장기적으로는 작품 본문까지 서버 DB에 저장하도록 확장할 수 있습니다.
