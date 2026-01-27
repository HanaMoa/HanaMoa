type EventType = 'funeral' | 'wedding';

const keyOf = (event: EventType) => `draftEid:${event}`;

export const eventCache = {
  get(event: EventType) {
    return localStorage.getItem(keyOf(event));
  },
  set(event: EventType, eid: string) {
    localStorage.setItem(keyOf(event), eid);
  },
  clear(event: EventType) {
    localStorage.removeItem(keyOf(event));
  },
};
