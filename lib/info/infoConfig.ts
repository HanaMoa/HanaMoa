export const infoConfig = {
  funeral: {
    totalSteps: 4,
    headerTitle: '부고장 생성',
    step2: {
      indicator: '고인 정보를 입력하세요.',
      title: '고인의',
      subtitle: '정보를 입력해 주세요',
    },
    step3: {
      indicator: '상주 정보를 입력하세요.',
      title: '상주 측',
      subtitle: '정보를 입력해 주세요',
      addLabel: '상주 추가',
      role: '대표',
    },
    step4: {
      indicator: '날짜와 장소를 입력하세요',
      title: '장례식 날짜와',
      subtitle: '장소를 입력해 주세요',
    },
  },
  wedding: {
    totalSteps: 5,
    headerTitle: '청첩장 생성',
    step2: {
      indicator: '신랑 정보를 입력하세요.',
      title: '신랑 측',
      subtitle: '정보를 입력해 주세요',
      addLabel: '혼주 추가',
      role: '신랑',
    },
    step3: {
      indicator: '신부 정보를 입력하세요.',
      title: '신부 측',
      subtitle: '정보를 입력해 주세요',
      addLabel: '혼주 추가',
      role: '신부',
    },
    step4: {
      indicator: '날짜와 장소를 입력하세요',
      title: '결혼식 날짜와',
      subtitle: '장소를 입력해 주세요',
    },
    step5: {
      indicator: '웨딩 사진을 업로드하세요',
      title: '웨딩 사진을',
      subtitle: '업로드 해주세요',
    },
  },
} as const;
