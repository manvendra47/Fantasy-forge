import nodemailer from 'nodemailer';



async function sendWelcomeEmail(userEmail, userName) {
  // 1. Configure the sender (your app's dedicated email)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE, // Use the email service from environment variables
    auth: {
      user: process.env.EMAIL_USER, // Your dedicated app email address
      // You must use a 16-character App Password, NOT your normal login password
      pass: process.env.EMAIL_PASS 
    }
  });


  // 2. Define the email content
  const mailOptions = {
    from: '"Fantasy Forge" <' + process.env.EMAIL_USER + '>', // Sender name and address
    to: userEmail,
    subject: 'Welcome to Fantasy Forge!',
    text: `Hi ${userName},\n\nThanks for registering! We are thrilled to have you on board.\n\nBest,\nThe Fantasy Forge Team`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: radial-gradient(circle at top, #1b153d 0%, #05040f 100%); color: #f8f0d8; padding: 24px; border-radius: 24px;">
        <div style="max-width: 740px; margin: 0 auto; background: rgba(8, 5, 21, 0.9); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);">
          <img src="cid:fantasyBanner" alt="Fantasy Forge Banner" style="width: 100%; display: block; object-fit: cover; max-height: 260px;" />
          <div style="padding: 28px;">
            <h1 style="margin: 0 0 12px; font-size: 32px; letter-spacing: 1px; color: #ffda6a;">Welcome, ${userName} !</h1>
            <p style="margin: 0 0 20px; line-height: 1.7; color: #e7d8c1;">The gates of Fantasy Forge have opened just for you. Your adventure begins here, and we’re thrilled you joined our realm of stories, quests, and magic.</p>
            <p style="margin: 0 0 24px; line-height: 1.7; color: #d2c5a3;">Explore the world, craft your tale, and let your imagination soar through enchanted forests, ancient kingdoms, and star-lit skies.</p>
            <div style="padding: 18px 20px; background: rgba(255, 255, 255, 0.04); border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.08);">
              <p style="margin: 0; font-size: 16px; color: #fff;">Your username:</p>
              <p style="margin: 8px 0 0; font-size: 20px; font-weight: 700; color: #ffd86e;">${userName}</p>
            </div>
            <p style="margin: 24px 0 0; color: #c8b58a;">To begin, visit Fantasy Forge and start your first story. The world awaits.</p>
            <p style="margin: 8px 0 0; color: #a99a74;">— The Fantasy Forge Team</p>
          </div>
        </div>
      </div>
    `
  };

  try {
    // 3. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully:', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

export default sendWelcomeEmail;