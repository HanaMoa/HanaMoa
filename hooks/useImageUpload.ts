import { useState } from 'react';
export function useImageUpload() {
  const [loading, setLoading] = useState(false);

  async function upload(files: File[], eventId: string) {
    if (files.length === 0) return;

    setLoading(true);

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

    const presigned: { url: string; key: string }[] = await res.json();

    // 2. S3 PUT
    await Promise.all(
      presigned.map((item, index) =>
        fetch(item.url, {
          method: 'PUT',
          headers: {
            'Content-Type': files[index].type,
          },
          body: files[index],
        }),
      ),
    );

    // 3. DB 저장
    await fetch('/api/gallery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventId,
        keys: presigned.map((p) => p.key),
      }),
    });

    setLoading(false);
  }

  return { upload, loading };
}
