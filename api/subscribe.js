import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { subscription, name } = req.body;

    await redis.connect();
    await redis.set(`sub:${name}`, JSON.stringify(subscription));
    await redis.disconnect();

    console.log(`✅ ${name} נרשם לפוש`);
    return res.status(200).json({ success: true });
  }
  res.status(405).end();
}
