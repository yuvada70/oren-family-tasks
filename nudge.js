import webpush from 'web-push';
import { createClient } from 'redis';

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export default async function handler(req, res) {
  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();

  try {
    if (req.method === 'POST') {
      const { target, title, body, sender } = req.body;

      const raw = await redis.get(`sub:${target}`);
      if (!raw) {
        return res.status(404).json({ 
          message: `${target} עדיין לא הפעיל התראות 😅` 
        });
      }

      const subscription = JSON.parse(raw);

      await webpush.sendNotification(
        subscription,
        JSON.stringify({ title, body, sender, type: 'nudge' })
      );

      // שמירת סטטוס "נשלח" ב-Redis
      await redis.set(`nudge_status:${sender}:${target}`, 'sent', { EX: 3600 });

      return res.status(200).json({ message: `נדנוד נשלח ל${target}! 🔔` });
    }

    if (req.method === 'GET') {
      // בדיקת סטטוס אישור קבלה
      const { sender, target } = req.query;
      const status = await redis.get(`nudge_status:${sender}:${target}`);
      return res.status(200).json({ status: status || 'unknown' });
    }

    res.status(405).end();
  } finally {
    await redis.disconnect();
  }
}
