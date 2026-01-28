import { useState } from 'react';

export function useImageUpload() {
  const [loading, setLoading] = useState(false);

  async function upload(files: File[], eventId: string): Promise<string[]> {
    if (files.length === 0) return [];

    setLoading(true);

    try {
      // 1. presign
      const res = await fetch('/api/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          files: files.map((file) => ({
            contentType: file.type,
          })),
        }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`presign 실패 (${res.status}) ${text}`);
      }

      const presigned: { url: string; key: string }[] = await res.json();

      // 2. S3 PUT
      await Promise.all(
        presigned.map((item, index) =>
          fetch(item.url, {
            method: 'PUT',
            headers: { 'Content-Type': files[index].type },
            body: files[index],
          }).then(async (r) => {
            if (!r.ok) {
              const text = await r.text().catch(() => '');
              throw new Error(`S3 업로드 실패 (${r.status}) ${text}`);
            }
          }),
        ),
      );

      // 3. DB 저장
      const saveRes = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, keys: presigned.map((p) => p.key) }),
      });

      if (!saveRes.ok) {
        const text = await saveRes.text().catch(() => '');
        throw new Error(`gallery 저장 실패 (${saveRes.status}) ${text}`);
      }

      return presigned.map((p) => p.key);
    } finally {
      setLoading(false);
    }
  }

  return { upload, loading };
}
