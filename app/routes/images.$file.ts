import { promises as fs } from 'fs';
import path from 'path';

export async function loader({ params }: any) {
  const fname = params?.file;
  if (!fname) return new Response('Not found', { status: 404 });

  const safeName = path.basename(fname);
  const filePath = path.join(process.cwd(), 'public', 'images', safeName);
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(safeName).toLowerCase();
    const map: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml',
    };
    const type = map[ext] ?? 'application/octet-stream';
    return new Response(data, { status: 200, headers: { 'Content-Type': type } });
  } catch (err) {
    return new Response('Not found', { status: 404 });
  }
}
