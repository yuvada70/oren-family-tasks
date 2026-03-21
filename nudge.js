// קובץ השרת שירוץ ב-Vercel
export default function handler(req, res) {
  if (req.method === 'POST') {
    const { taskId, target } = req.body;
    
    // כאן בעתיד נחבר את Firebase Cloud Messaging (FCM) 
    // כדי שהטלפון של אמא ממש ירטוט
    console.log(`🔔 נשלח נדנוד למשימה ${taskId} עבור ${target}`);

    return res.status(200).json({ 
      success: true, 
      message: `הנדנוד ל-${target} נרשם במערכת!` 
    });
  } else {
    // אם מישהו סתם נכנס לכתובת בדפדפן
    res.status(200).json({ status: 'Server is running', owner: 'Oren' });
  }
}