import nodemailer from 'nodemailer';
import { prisma } from '../config/db.js';
import { config } from '../config/index.js';
import { AppError } from '../utils/helpers.js';

/**
 * POST /internal/notifications/send — owned by Person B.
 * Dispatches email/SMS via nodemailer SMTP, or console fallback when
 * EMAIL_MODE=console / SMTP is unset.
 */
export async function sendNotification({ channel = 'email', to, template, data = {} }) {
  if (!to || !template) {
    throw new AppError('to and template are required', 400);
  }

  const payload = JSON.stringify({ template, data });
  let status = 'sent';
  let error = null;

  try {
    if (channel === 'email') {
      await dispatchEmail(to, template, data);
    } else if (channel === 'sms') {
      await dispatchSms(to, template, data);
    } else {
      throw new AppError('Unsupported channel', 400);
    }
  } catch (err) {
    status = 'failed';
    error = err.message;
    await prisma.notificationLog.create({
      data: { channel, to, template, payload, status, error },
    });
    throw err;
  }

  const log = await prisma.notificationLog.create({
    data: { channel, to, template, payload, status, error },
  });

  return { id: log.id, status, channel, to, template };
}

let transporter;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.pass,
      },
    });
  }
  return transporter;
}

async function sendEmail({ to, subject, html }) {
  if (config.smtp.emailMode === 'console' || !config.smtp.user) {
    console.log(`[email:console-fallback] to=${to} subject="${subject}"`);
    console.log(html);
    return { success: true, mode: 'console' };
  }

  const info = await getTransporter().sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
  });

  return { success: true, mode: 'smtp', messageId: info.messageId };
}

async function dispatchEmail(to, template, data) {
  const subject = subjectForTemplate(template);
  const html = htmlForTemplate(template, data);

  const result = await sendEmail({ to, subject, html });
  if (result.mode === 'smtp') {
    console.log(`[email:smtp] to=${to} template=${template} messageId=${result.messageId}`);
  }
}

async function dispatchSms(to, template, data) {
  const body = textForTemplate(template, data);
  console.log(`[notification:sms] to=${to} template=${template}\n${body}`);
}

function subjectForTemplate(template) {
  switch (template) {
    case 'artist_set_password':
      return 'Set your Tvarita artist password';
    case 'password_reset':
      return 'Reset your Tvarita password';
    case 'payout_confirmation':
      return 'Your Tvarita payout has been processed';
    case 'feedback_status':
      return 'Your Tvarita feedback status update';
    case 'artist_invite':
      return 'Welcome to Tvarita Arts Collective';
    case 'guest_otp':
      return 'Your Tvarita login code';
    case 'booking_confirmation':
      return 'Your Tvarita booking is confirmed';
    case 'payment_window':
      return 'Complete your Tvarita payment';
    default:
      return 'Tvarita notification';
  }
}

/** Plain-text body (SMS + HTML fallback content). */
function textForTemplate(template, data) {
  switch (template) {
    case 'artist_set_password':
    case 'artist_invite':
      return [
        `Hello ${data.name || 'Artist'},`,
        '',
        'Your Tvarita artist account is ready.',
        `Set your password using this single-use link (expires in ${data.ttl_hours || 72} hours):`,
        data.link || '',
        '',
        'If you did not expect this email, ignore it.',
      ].join('\n');
    case 'guest_otp':
      return [
        `Hello ${data.name || 'Guest'},`,
        '',
        `Your Tvarita OTP is ${data.otp}.`,
        `It expires in ${data.ttl_minutes || 5} minutes.`,
      ].join('\n');
    case 'booking_confirmation':
      return [
        `Hello ${data.name || 'Guest'},`,
        '',
        `Your booking ${data.booking_id || ''} is confirmed.`,
        `Amount paid: ₹${data.amount ?? ''}.`,
      ].join('\n');
    case 'payment_window':
      return [
        `Hello ${data.name || 'Guest'},`,
        '',
        `An artist has been assigned to booking ${data.booking_id || ''}.`,
        `Please complete payment within ${data.window_hours || 48} hours.`,
      ].join('\n');
    case 'payout_confirmation':
      return [
        `Hello ${data.name || 'Artist'},`,
        '',
        `Your payout of ₹${data.amount ?? ''} for event ${data.event_id || ''} is marked as paid.`,
      ].join('\n');
    case 'feedback_status':
      return [
        `Hello,`,
        '',
        `Your feedback for event ${data.event_id || ''} is now ${data.status || 'updated'}.`,
      ].join('\n');
    default:
      return JSON.stringify(data, null, 2);
  }
}

/** HTML email bodies — nodemailer has no Brevo template IDs. */
function htmlForTemplate(template, data) {
  const text = textForTemplate(template, data);
  const paragraphs = text
    .split('\n')
    .map((line) => (line.trim() === '' ? '<br/>' : `<p style="margin:0 0 8px;">${escapeHtml(line)}</p>`))
    .join('');

  return `<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; color: #222; line-height: 1.5;">
    ${paragraphs}
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;" />
    <p style="font-size:12px;color:#888;">Tvarita Arts Collective</p>
  </body>
</html>`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}
