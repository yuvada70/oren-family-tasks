import { createClient } from 'redis';

export default async function handler(req, res) {
  const redis = createClient({ url: process.env.REDIS_URL });
  await redis.connect();

  try {
    // קריאת משימות
    if (req.method === 'GET') {
      const raw = await redis.get('tasks');
      const tasks = raw ? JSON.parse(raw) : [
        { id: 1, title: "להוציא את לוסי 🐶", assignee: "יולי" },
        { id: 2, title: "לרוקן מדיח 🍽️", assignee: "רומי" }
      ];
      return res.status(200).json({ tasks });
    }

    // שמירת משימות
    if (req.method === 'POST') {
      const { tasks } = req.body;
      await redis.set('tasks', JSON.stringify(tasks));
      return res.status(200).json({ success: true });
    }

    res.status(405).end();
  } finally {
    await redis.disconnect();
  }
}
