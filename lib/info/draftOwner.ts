// 다른 아이디라면 draft 지우기

const OWNER_KEY = 'draftOwnerUserId';

export function syncDraftOwner(currentUserId: string) {
  if (typeof window === 'undefined') return;

  const prev = localStorage.getItem(OWNER_KEY);

  if (prev && prev !== currentUserId) {
    // 다른 아이디 draft 제거
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (!key) continue;
      if (key.startsWith('draftEid:')) {
        localStorage.removeItem(key);
      }
    }
  }

  localStorage.setItem(OWNER_KEY, currentUserId);
}
