# 하나모아 (HanaMoa)
<img width="512" height="134" alt="image" src="https://github.com/user-attachments/assets/401b8c48-a6f1-4b62-ae1c-5b33a22d9bcc" />

<br>

## 📌 Git convention
```
main
├─ dev
│  ├─ feature/app/login-add-user-profile
│  ├─ feature/components/login-form
├─ fix
```
### ✓ Commit Type
```
`feat` : 기능 추가
`fix` : 에러 수정, 버그 수정
`chore` : gradle 세팅, 빌드 업무 수정 등 이외의 모든 것
`main` : 최종 배포, 메인 브랜치
`refactor` : 코드 리팩토링
`test` : 테스트 코드 추가
`revert` : 이전 커밋 되돌리기
`remove` : 파일 삭제
`rename` : 파일 또는 폴더 이름 수정
`ci` : CI 설정 파일 및 스크립트 변경 (ex. GitHub Actions, CircleCI 등)
```

### ✓ issue 이름 규칙
```
[커밋 타입] 이슈 제목
```

### ✓ branch 규칙

#### ▶︎ branch 네이밍 규칙
```
- 영소문자 사용 : 모든 브랜치 이름은 영어 + 소문자로 작성합니다.
- 하이픈(-) 사용 : 단어 구분은 하이픈(-)으로 합니다 (예: `feature-login`).
- 간결하고 의미 있게 : 브랜치의 목적을 명확히 드러내도록 간결하게 짓습니다.
```

#### ▶︎ 기본 원칙
```
커밋 타입/브랜치명
※ 단, hotfix일 경우, 이슈로 관리 → hotfix/#이슈번호/브랜치명

* 예시 *
기능 추가: feature/add-user-profile
버그 수정: fix/fix-login-error
문서 작업: docs/update-readme
hotfix: fix/#1/hotfix-login-error
```

#### ▶︎ 하위 브랜치 만드는 방법
##### 1️⃣ develop 브랜치에서 시작
```
git checkout develop
git pull
```
##### 2️⃣ feature 브랜치 생성
```
git checkout -b feature/login
or
git switch -c feature/login
```
⇒ 병합 끝나면 삭제.

<br>

### ✓ commit 메시지 규칙
```
커밋 타입: 커밋 메시지

→ `feat: 로그인 기능 추가`
→ `refactor: 일부 코드 리팩토링`
```

<br>

## 📄 서비스 소개

<br>

## 🛠️ Tech Stack
<div>
  <img src="https://img.shields.io/badge/Next.js-000000" />
  <img src="https://img.shields.io/badge/React-61DAFB" />
  <img src="https://img.shields.io/badge/Typescript-F7DF1E" />
  <img src="https://img.shields.io/badge/TailwindCSS-00b7d6" />
  <img src="https://img.shields.io/badge/Prisma-ffffff" />
  <img src="https://img.shields.io/badge/MySQL-496D90" />
  <img src="https://img.shields.io/badge/Vitest-6DBE45" />
</div>
<div>
  <img src="https://img.shields.io/badge/Git-E94B35" />
  <img src="https://img.shields.io/badge/Vercel-ffffff" />
  <img src="https://img.shields.io/badge/Notion-000000" />
  <img src="https://img.shields.io/badge/Slack-E6005C" />
  <img src="https://img.shields.io/badge/Figma-8B5CF6" />
</div>

<br>

## ⚙️ 시스템 구성도
<img width="768" height="512" alt="image" src="https://github.com/user-attachments/assets/73587f8f-8883-4b93-8d10-0d40f752f4fe" />

<br>
<br>

## setting
```
pnpm install
→ pnpm version : 10.21.0
```

### .env
```
DATABASE_URL="mysql://hanamoa:12345678@127.0.0.1:3333/hanamoadb"
```
