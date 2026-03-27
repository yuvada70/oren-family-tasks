import webpush from 'web-push';
import { createClient } from 'redis';

const redis = createClient({ url: process.env.REDIS_URL });

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { target, title, body } = req.body;

    await redis.connect();
    const raw = await redis.get(`sub:${target}`);
    await redis.disconnect();

    if (!raw) {
      return res.status(404).json({ 
        message: `${target} עדיין לא הפעיל התראות 😅` 
      });
    }

    const subscription = JSON.parse(raw);

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body })
    );

    return res.status(200).json({ message: `✅ נדנוד נשלח ל${target}!` });
  }
  res.status(405).end();
}
