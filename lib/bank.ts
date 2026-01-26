export type Bank = {
  key: string;
  name: string;
  icon: string;
};

export const BANKS: Bank[] = [
  { key: 'nh', name: 'NH농협', icon: '/images/bank/농협.png' },
  { key: 'kakao', name: '카카오뱅크', icon: '/images/bank/카카오뱅크.png' },
  { key: 'kb', name: 'KB국민은행', icon: '/images/bank/국민은행.png' },
  { key: 'toss', name: '토스뱅크', icon: '/images/bank/토스뱅크.png' },
  { key: 'sh', name: '신한은행', icon: '/images/bank/신한은행.png' },
  { key: 'wr', name: '우리은행', icon: '/images/bank/우리은행.png' },
  { key: 'ibk', name: 'IBK기업은행', icon: '/images/bank/기업은행.png' },
  { key: 'hn', name: '하나은행', icon: '/images/bank/하나은행.png' },
  { key: 'mg', name: '새마을금고', icon: '/images/bank/새마을금고.png' },
  { key: 'bnk', name: '부산은행', icon: '/images/bank/부산은행.png' },
  { key: 'im', name: 'IM뱅크(대구)', icon: '/images/bank/im뱅크.png' },
  { key: 'k', name: '케이뱅크', icon: '/images/bank/케이뱅크.png' },
  // 필요하면 더 추가
];
