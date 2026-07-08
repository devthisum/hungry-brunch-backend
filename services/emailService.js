// services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter — uses Gmail by default
// Set SMTP_USER and SMTP_PASS in Railway environment variables
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Gmail App Password (not your regular password)
    },
  });
};

// Beautiful HTML email template
const reservationConfirmationHTML = (data) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reservation Confirmed — Hungry Brunch</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #f5f0e8; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #fff; }
    .header { background: linear-gradient(135deg, #0F0F0F 0%, #1C1C1C 100%); padding: 40px 30px; text-align: center; }
    .logo { color: #D97706; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
    .logo span { color: #F4C26B; }
    .tagline { color: rgba(255,248,231,0.5); font-size: 12px; letter-spacing: 3px; text-transform: uppercase; }
    .hero { background: linear-gradient(135deg, #D97706, #b45309); padding: 30px; text-align: center; }
    .hero-icon { font-size: 48px; margin-bottom: 12px; }
    .hero-title { color: white; font-size: 24px; font-weight: 700; margin-bottom: 6px; }
    .hero-sub { color: rgba(255,255,255,0.8); font-size: 14px; }
    .body { padding: 36px 30px; }
    .greeting { font-size: 18px; color: #1C1C1C; font-weight: 600; margin-bottom: 12px; }
    .message { color: #555; font-size: 14px; line-height: 1.6; margin-bottom: 28px; }
    .details-card { background: #faf7f2; border: 1px solid #e8dfc8; border-radius: 12px; padding: 24px; margin-bottom: 28px; }
    .details-title { font-size: 12px; font-weight: 700; color: #D97706; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 16px; }
    .detail-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #e8dfc8; }
    .detail-row:last-child { border-bottom: none; }
    .detail-icon { font-size: 18px; width: 28px; text-align: center; }
    .detail-label { color: #888; font-size: 12px; margin-bottom: 2px; }
    .detail-value { color: #1C1C1C; font-size: 14px; font-weight: 600; }
    .note-card { background: #fff8e7; border: 1px solid #f4c26b; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
    .note-title { color: #D97706; font-size: 13px; font-weight: 700; margin-bottom: 8px; }
    .note-text { color: #666; font-size: 13px; line-height: 1.5; }
    .contact-section { text-align: center; margin-bottom: 28px; }
    .contact-title { color: #1C1C1C; font-size: 15px; font-weight: 600; margin-bottom: 16px; }
    .contact-buttons { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
    .btn { display: inline-block; padding: 12px 24px; border-radius: 50px; font-size: 13px; font-weight: 600; text-decoration: none; }
    .btn-primary { background: #D97706; color: white; }
    .btn-outline { background: transparent; color: #D97706; border: 2px solid #D97706; }
    .map-section { background: #f5f0e8; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 28px; }
    .map-title { color: #1C1C1C; font-size: 14px; font-weight: 600; margin-bottom: 8px; }
    .map-address { color: #666; font-size: 13px; margin-bottom: 12px; }
    .map-link { color: #D97706; font-size: 13px; font-weight: 600; text-decoration: none; }
    .footer { background: #1C1C1C; padding: 24px 30px; text-align: center; }
    .footer-text { color: rgba(255,248,231,0.4); font-size: 12px; line-height: 1.6; }
    .footer-brand { color: #D97706; font-weight: 700; }
    .divider { border: none; border-top: 1px solid #e8dfc8; margin: 8px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <!-- Header -->
    <div class="header">
      <div class="logo">Hungry Brunch</div>
      <div class="tagline">Café & Restaurant · Kandy</div>
    </div>

    <!-- Hero -->
    <div class="hero">
      <div class="hero-icon">🍽️</div>
      <div class="hero-title">Reservation Request Received!</div>
      <div class="hero-sub">We'll confirm your booking within 2 hours</div>
    </div>

    <!-- Body -->
    <div class="body">
      <div class="greeting">Dear ${data.name},</div>
      <div class="message">
        Thank you for choosing Hungry Brunch! We've received your reservation request and are thrilled to host you.
        Our team will confirm your booking shortly. If you have any urgent queries, please call us directly.
      </div>

      <!-- Booking Details -->
      <div class="details-card">
        <div class="details-title">📋 Your Booking Details</div>
        <div class="detail-row">
          <div class="detail-icon">👤</div>
          <div>
            <div class="detail-label">Guest Name</div>
            <div class="detail-value">${data.name}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">📅</div>
          <div>
            <div class="detail-label">Date</div>
            <div class="detail-value">${data.date ? new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'To be confirmed'}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">🕐</div>
          <div>
            <div class="detail-label">Time</div>
            <div class="detail-value">${data.time || 'To be confirmed'}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">👥</div>
          <div>
            <div class="detail-label">Number of Guests</div>
            <div class="detail-value">${data.guests} ${data.guests === 1 ? 'Guest' : 'Guests'}</div>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-icon">📞</div>
          <div>
            <div class="detail-label">Contact Number</div>
            <div class="detail-value">${data.phone || 'Not provided'}</div>
          </div>
        </div>
        ${data.message ? `
        <div class="detail-row">
          <div class="detail-icon">💬</div>
          <div>
            <div class="detail-label">Special Requests</div>
            <div class="detail-value">${data.message}</div>
          </div>
        </div>` : ''}
      </div>

      <!-- Note -->
      <div class="note-card">
        <div class="note-title">⚠️ Please Note</div>
        <div class="note-text">
          This is a <strong>reservation request</strong>. Your booking will be confirmed via a follow-up call or email from our team within 2 hours during operating hours.
          Walk-ins are also welcome based on availability.
        </div>
      </div>

      <!-- Contact -->
      <div class="contact-section">
        <div class="contact-title">Need to make changes? Contact us directly</div>
        <div class="contact-buttons">
          <a href="tel:0776057554" class="btn btn-primary">📞 Call 077 605 7554</a>
          <a href="mailto:hello@hungrybrunch.lk" class="btn btn-outline">✉️ Email Us</a>
        </div>
      </div>

      <!-- Map -->
      <div class="map-section">
        <div class="map-title">📍 Find Us</div>
        <div class="map-address">No 99, 2 DS Senanayake Veediya, Kandy, Sri Lanka</div>
        <a href="https://maps.google.com/?q=DS+Senanayake+Veediya+Kandy" class="map-link">
          Open in Google Maps →
        </a>
      </div>

      <hr class="divider">
      <div class="message" style="text-align:center; margin-top:20px;">
        We look forward to welcoming you to <strong>Hungry Brunch</strong>. 
        Get ready for an unforgettable dining experience! 🌟
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-text">
        <span class="footer-brand">Hungry Brunch Café & Restaurant</span><br>
        No 99, 2 DS Senanayake Veediya, Kandy, Sri Lanka<br>
        Open daily 8:00 AM – 10:00 PM · 077 605 7554<br><br>
        © ${new Date().getFullYear()} Hungry Brunch. All rights reserved.
      </div>
    </div>
  </div>
</body>
</html>
`;

// Send reservation confirmation email
const sendReservationConfirmation = async (reservationData) => {
  // If email credentials not set, skip silently
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('📧 Email skipped — SMTP credentials not configured');
    return { success: false, reason: 'not_configured' };
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from:    `"Hungry Brunch" <${process.env.SMTP_USER}>`,
      to:      reservationData.email,
      subject: `✅ Reservation Request Received — Hungry Brunch, Kandy`,
      html:    reservationConfirmationHTML(reservationData),
    });

    console.log(`📧 Confirmation email sent to ${reservationData.email}`);
    return { success: true };
  } catch (error) {
    console.error('📧 Email send failed:', error.message);
    return { success: false, reason: error.message };
  }
};

// Send notification to admin when new reservation arrives
const sendAdminNotification = async (reservationData) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.ADMIN_EMAIL) {
    return { success: false, reason: 'not_configured' };
  }

  try {
    const transporter = createTransporter();

    await transporter.sendMail({
      from:    `"Hungry Brunch System" <${process.env.SMTP_USER}>`,
      to:      process.env.ADMIN_EMAIL,
      subject: `🍽️ New Reservation — ${reservationData.name} (${reservationData.guests} guests)`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:500px;margin:0 auto;padding:20px;">
          <h2 style="color:#D97706;">🍽️ New Reservation Request</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr><td style="padding:8px;color:#666;">Name</td><td style="padding:8px;font-weight:bold;">${reservationData.name}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;color:#666;">Email</td><td style="padding:8px;">${reservationData.email}</td></tr>
            <tr><td style="padding:8px;color:#666;">Phone</td><td style="padding:8px;font-weight:bold;">${reservationData.phone || '—'}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;color:#666;">Date</td><td style="padding:8px;">${reservationData.date || '—'}</td></tr>
            <tr><td style="padding:8px;color:#666;">Time</td><td style="padding:8px;">${reservationData.time || '—'}</td></tr>
            <tr style="background:#f9f9f9"><td style="padding:8px;color:#666;">Guests</td><td style="padding:8px;font-weight:bold;">${reservationData.guests}</td></tr>
            ${reservationData.message ? `<tr><td style="padding:8px;color:#666;">Notes</td><td style="padding:8px;">${reservationData.message}</td></tr>` : ''}
          </table>
          <a href="${process.env.FRONTEND_URL}/admin/reservations" 
             style="display:inline-block;margin-top:20px;padding:12px 24px;background:#D97706;color:white;text-decoration:none;border-radius:8px;font-weight:bold;">
            View in Admin Panel →
          </a>
        </div>
      `,
    });

    console.log(`📧 Admin notification sent to ${process.env.ADMIN_EMAIL}`);
    return { success: true };
  } catch (error) {
    console.error('📧 Admin email failed:', error.message);
    return { success: false };
  }
};

module.exports = { sendReservationConfirmation, sendAdminNotification };
