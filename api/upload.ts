import type { VercelRequest, VercelResponse } from '@vercel/node';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '15mb',
    },
  },
};

function getClient() {
  const accountId = process.env.VITE_R2_ACCOUNT_ID;
  const accessKeyId = process.env.VITE_R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.VITE_R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials are not configured');
  }
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

function extFromMime(mime: string): string {
  const map: Record<string, string> = {
    'image/webp': 'webp',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/svg+xml': 'svg',
    'image/gif': 'gif',
  };
  return map[mime] || 'bin';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ url: null, error: 'Method not allowed' });
  }

  try {
    const bucket = process.env.VITE_R2_BUCKET_NAME;
    const publicUrl = process.env.VITE_R2_PUBLIC_URL;
    if (!bucket || !publicUrl) {
      return res.status(500).json({ url: null, error: 'R2 bucket/public URL not configured' });
    }

    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { dataUrl, folder } = body as { dataUrl?: string; folder?: string };

    if (!dataUrl || !dataUrl.startsWith('data:')) {
      return res.status(400).json({ url: null, error: 'dataUrl (base64) is required' });
    }

    const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ url: null, error: 'Malformed data URL' });
    }
    const mime = match[1];
    const base64 = match[2];
    const buffer = Buffer.from(base64, 'base64');

    const safeFolder = (folder || 'general').replace(/[^a-z0-9_-]/gi, '') || 'general';
    const ext = extFromMime(mime);
    const key = `${safeFolder}/${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`;

    const client = getClient();
    await client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: buffer,
        ContentType: mime,
        CacheControl: 'public, max-age=31536000, immutable',
      })
    );

    const url = `${publicUrl.replace(/\/$/, '')}/${key}`;
    return res.status(200).json({ url, error: null });
  } catch (err: any) {
    console.error('[api/upload] error:', err);
    return res.status(500).json({ url: null, error: err?.message || String(err) });
  }
}
