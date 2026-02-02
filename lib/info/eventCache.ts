'use client';

type EventType = 'funeral' | 'wedding';

const keyOf = (userId: string, event: EventType) =>
  `draftEid:${userId}:${event}`;

export const eventCache = {
  get(userId: string, event: EventType) {
    return localStorage.getItem(keyOf(userId, event));
  },
  set(userId: string, event: EventType, eid: string) {
    localStorage.setItem(keyOf(userId, event), eid);
  },
  clear(userId: string, event: EventType) {
    localStorage.removeItem(keyOf(userId, event));
  },
};
