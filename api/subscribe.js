import { createClient } from 'redis';

export default async function handler(req, res) {
  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();

  try {
    if (req.method === 'POST') {
      const { subscription, name } = req.body;

      await redis.set(`sub:${name}`, JSON.stringify(subscription));

      console.log(`${name} נרשם לפוש`);
      return res.status(200).json({ success: true });
    }

    // אישור קבלת נדנוד
    if (req.method === 'PATCH') {
      const { sender, receiver } = req.body;

      await redis.set(`nudge_status:${sender}:${receiver}`, 'received', { EX: 3600 });

      // שליחת push חזרה לשולח עם אישור
      const raw = await redis.get(`sub:${sender}`);
      if (raw) {
        const { default: webpush } = await import('web-push');
        webpush.setVapidDetails(
          `mailto:${process.env.VAPID_EMAIL}`,
          process.env.VAPID_PUBLIC_KEY,
          process.env.VAPID_PRIVATE_KEY
        );

        await webpush.sendNotification(
          JSON.parse(raw),
          JSON.stringify({
            title: `${receiver} קיבל את הנדנוד ✅`,
            body: `ההתראה הגיעה ל${receiver}!`,
            type: 'confirmation'
          })
        );
      }

      return res.status(200).json({ success: true });
    }

    res.status(405).end();
  } finally {
    await redis.disconnect();
  }
}
