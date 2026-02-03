# <img width="151" height="39" alt="image" src="https://github.com/user-attachments/assets/c6edbe7f-3fc3-4fb0-96a3-753cf44feec5" />
**하나모아**는 '디지털 경조사 금융 플랫폼'으로서, 경조사의 복잡함은 줄이고 감정과 관계에 집중할 수 있는 서비스

<br>


---
## 🧑🏻‍💻 팀원 구성

| **김선주** | **박성원** | **설지윤** | **유지현** | **이동현** | **전유진** | **정그린** | **허 혁** |
| :------: |  :------: | :------: | :------: | :------: | :------: | :------: | :------: |
| 팀원 | 팀원 | 팀장 | 팀원 | 팀원 | 부팀장 | 팀원 | 팀원 |
| [<img src="https://avatars.githubusercontent.com/u/157812913?v=4" height=150 width=150> <br/>](https://github.com/seonjuuu) | [<img src="https://avatars.githubusercontent.com/u/153745270?v=4" height=150 width=150> <br/>](https://github.com/Solid9966) | [<img src="https://avatars.githubusercontent.com/u/85937340?v=4" height=150 width=150> <br/>](https://github.com/SeolJiyun) | [<img src="https://avatars.githubusercontent.com/u/95465048?v=4" height=150 width=150> <br/>](https://github.com/ujii) | [<img src="https://avatars.githubusercontent.com/u/117627976?v=4" height=150 width=150> <br/>](https://github.com/dhlee777) | [<img src="https://avatars.githubusercontent.com/u/83286706?v=4" height=150 width=150> <br/>](https://github.com/Yujin0827) | [<img src="https://avatars.githubusercontent.com/u/139318504?v=4" height=150 width=150> <br/>](https://github.com/Green-JEONG) | [<img src="https://avatars.githubusercontent.com/u/121746158?v=4" height=150 width=150> <br/>](https://github.com/hyeok1028) |

<br>


---
## 👩🏻‍💻 Roles & Responsibilities
| 이름 | R & R |
|---|---|
| 김선주 | - 프로젝트 초기 ERD 및 DB 구조 설계<br>- 경조사 대시보드 UI 및 메시지 DB 연동 구현<br>- AI 메시지 추천 프롬프트 설계 및 OpenAI API 연동<br>- OCR 기반 경조사 내역 등록 기능 구현<br>- 사용자 시나리오 기반 발표 자료(PPT·스크립트) 제작 |
| 박성원 | - 경조사비 관리 기능 설계 및 구현<br>- 경조사 송금 기능 DB 연동 및 비즈니스 로직 구현<br>- 송금·이벤트 도메인 ERD 설계 및 DB 리팩토링<br>- GitHub Actions 기반 CI 파이프라인 구축<br>- 프로젝트 시연 영상 제작 |
| 설지윤 | - 프로젝트 총괄 및 기술·기획 조율<br>- 프로젝트 구조 설계<br>- 라이브 스트리밍 캐릭터 동기화 구현<br>- 결혼식 영상·사진 피드 구현<br>- 사용자 시나리오 기반 발표 자료(PPT·스크립트) 제작<br>- 발표 |
| 유지현 | - 스플래시 화면 자동 전환 로직 구현<br>- 온보딩·홈·경조사 등록 UI 및 DB 연동<br>- 소셜 로그인(Google, Kakao) 기반 인증 구현<br>- 인증 상태별 접근 제어 및 로그인 처리<br>- 사용자 시나리오 기반 발표 자료(PPT·스크립트) 제작<br>- Vercel 배포 및 환경 변수 설정 |
| 이동현 | - 모바일 청첩장 UI 구현 및 DB 연동<br>- AWS S3 인프라 구축<br>- 경조사 갤러리 사진·영상 업로드/조회 기능 구현<br>- 경조사 리스트 UI 구현<br>- 프로젝트 시연 영상 제작 |
| 전유진 | - 서비스 기획 및 개발 전반적인 방향성 설정<br>- 프로젝트 초기 세팅 및 브랜치 전략 수립<br>- 개발 인프라 구축 및 GitHub 운영 관리<br>- 라운지 메인 UI 구현 및 DB 연동<br>- 초대장(부고장) UI 구현 및 DB 연동<br>- 프로젝트 시연 영상 기획 및 제작 |
| 정그린 | - 경조사 참여 리스트 구현<br>- 갤러리 로딩·정렬·무한 스크롤 구현<br>- 녹음·헌화 인터랙션 기능 개발<br>- 경조사 송금 콘텐츠 조회 기능 구현<br>- Figma 인터랙티브 프로토타입 제작 및 설계 |
| 허혁 | - LiveKit·WebRTC 기반 실시간 스트리밍 인프라 구축<br>- 실시간 알림 시스템 구현<br>- Figma 인터랙티브 프로토타입 제작 및 설계 |

<br>


---
## 📚 프로젝트 개요
**하나모아**는 결혼과 장례 등 경조사 라이프 이벤트를 하나로 연결하는 '디지털 경조사 금융 플랫폼'입니다. <br>
기존의 단순 송금 중심 경조사 경험에서 벗어나, 송금 · 메시지 · 기록 · 관계 관리를 하나의 흐름으로 통합합니다.

현대의 경조사는 모바일 청첩장, 메신저, 계좌 송금, 수기 기록 등 여러 서비스로 분산되어 있어 경험과 맥락이 단절되어 왔습니다. <br>
그 결과, 감정이 중심이 되어야 할 순간에 오히려 복잡함과 피로감이 커지고 있습니다.

하나모아는 이러한 문제를 해결하기 위해 경조사의 중심에 있는 **송금**을 기준으로 메시지, 참여 기록, 관계 정보를 자동으로 연결·저장하는 구조를 설계했습니다.

이를 통해 사용자는
* 함께하지 못해도 마음과 감정을 전달할 수 있고
* 경조사 이후에도 기록과 관계를 지속적으로 관리할 수 있으며
* 반복되는 라이프 이벤트 속에서 자연스러운 재방문 경험을 얻게 됩니다.

하나모아는 MZ세대의 라이프 이벤트를 출발점으로, 장기 고객 전환과 가족 단위 확장까지 고려한 라이프 이벤트 기반 금융·비금융 통합 플랫폼을 목표로 합니다.

<br>


---
## ✨ 핵심 기능

#### 1️⃣ 경조사 전용 이벤트 공간 생성
* 결혼식 · 장례식 등 경조사별 전용 이벤트 페이지를 생성하여 행사 유형에 따라 맞춤 UI와 플로우를 제공합니다.
* 이벤트별 정보(날짜, 장소, 주최자 등)를 한 번에 관리할 수 있습니다.
* 송금과 함께 축하·추모 메시지를 직접 작성할 수 있습니다.
* 참여자가 남긴 메시지는 시각적 요소(오브젝트 등)로 표현되어 참여감과 감정 전달을 강화합니다.

#### 2️⃣ 온라인 참여 및 실시간 스트리밍
* 현장에 참석하지 못한 경우에도 온라인 스트리밍을 통해 실시간 참여가 가능합니다.
* 실시간 채팅, 메시지 참여를 통해 물리적 거리와 관계없이 행사에 함께하는 경험을 제공합니다.
* 특히 장례식의 경우, 비대면 추모 수단으로 활용할 수 있습니다.

#### 3️⃣ 경조사 기록 자동 관리 (디지털 치부)
* 송금, 메시지, 참여 이력이 자동으로 경조사 DB에 기록됩니다.
* 수동으로 관리하던 치부책을 대체하여 누락·오류 없는 경조사 기록 관리가 가능합니다.
* 향후 정산, 관계 관리, 가계부 기능으로 확장 가능한 구조입니다.

<br>


---
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


---
## ⚙️ 시스템 구성도
<img width="2491" height="860" alt="image" src="https://github.com/user-attachments/assets/ed6ef3ac-f1ce-4a09-9535-51cc832e3e34" />


<br>


---
## ERD
<img width="1390" height="1496" alt="image" src="https://github.com/user-attachments/assets/b5940ed8-a655-4983-978a-ae296930db69" />

<br>


---
## 📌 Git convention

#### ✓ Commit Type
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

<br>


