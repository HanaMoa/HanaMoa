import { saveLiveToGallery } from '@/lib/server/live';
import { useRoomContext } from '@livekit/components-react';
import { RoomEvent } from 'livekit-client';
import { useCallback, useEffect, useState } from 'react';

export function useLiveRoom(eventId: string) {
  const room = useRoomContext();
  const [viewerCount, setViewerCount] = useState(0);

  // 🔥 [기능 1] 실시간 하객 수 카운팅
  useEffect(() => {
    if (!room) return;
    const updateCount = () => {
      let count = 0;
      // 1. 원격 참여자 중 'viewer-'로 시작하는 사람만 카운트
      Array.from(room.remoteParticipants.values()).forEach((p) => {
        if (p.identity.startsWith('viewer-')) count++;
      });
      // 2. 나(로컬)도 'viewer-'라면 카운트
      if (room.localParticipant.identity.startsWith('viewer-')) {
        count++;
      }
      // 3. 기본 20명 추가
      setViewerCount(count + 20);
    };

    updateCount();
    room.on(RoomEvent.ParticipantConnected, updateCount);
    room.on(RoomEvent.ParticipantDisconnected, updateCount);

    return () => {
      room.off(RoomEvent.ParticipantConnected, updateCount);
      room.off(RoomEvent.ParticipantDisconnected, updateCount);
    };
  }, [room]);

  // 🔥 [기능 2 & 3] 방송 종료 및 Gallery 저장
  const endBroadcast = useCallback(async () => {
    if (!room) return;

    try {
      // 1. Gallery에 저장 (Mocking: 실제로는 LiveKit Egress 결과 URL 사용)
      const mockVideoKey = `recordings/events/${eventId}/${Date.now()}.mp4`;
      await saveLiveToGallery(eventId, mockVideoKey);

      // 2. 방 연결 종료
      await room.disconnect();
      console.log('방송이 종료되고 갤러리에 저장되었습니다.');

      // 3. (선택) 종료 페이지로 이동 로직은 컴포넌트에서 처리
    } catch (error) {
      console.error('방송 종료 중 오류:', error);
    }
  }, [room, eventId]);

  return { viewerCount, endBroadcast };
}
