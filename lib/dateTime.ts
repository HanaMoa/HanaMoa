export type Meridiem = '오전' | '오후';

export function formatDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function formatKoreaDate(date: string) {
  if (!date) return '';
  const [y, m, d] = date.split('-');
  return `${y}년 ${m}월 ${d}일`;
}

export function formatKoreaTime(time24: string) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? '오후' : '오전';
  const h12 = ((h + 11) % 12) + 1;
  return `${period} ${String(h12).padStart(2, '0')} : ${String(m).padStart(2, '0')}`;
}

// db에 24시간으로 저장해야 함
export function to24Hour(meridiem: Meridiem, hour12: number) {
  const h = hour12 % 12;
  return meridiem === '오후' ? h + 12 : h;
}

export function from24Hour(hour24: number): {
  meridiem: Meridiem;
  hour12: number;
} {
  const meridiem: Meridiem = hour24 >= 12 ? '오후' : '오전';
  const h = hour24 % 12;
  return { meridiem, hour12: h === 0 ? 12 : h };
}
