import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT || 5000),
  nodeEnv: process.env.NODE_ENV || 'development',
  appBaseUrl: process.env.APP_BASE_URL || 'http://localhost:5000',
  frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'dev-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  internalApiKey: process.env.INTERNAL_API_KEY || 'dev-internal-api-key',
  passwordTokenTtlHours: Number(process.env.PASSWORD_TOKEN_TTL_HOURS || 72),
  brevo: {
    apiKey: process.env.BREVO_API_KEY || '',
    senderEmail: process.env.BREVO_SENDER_EMAIL || 'no-reply@tvaritacollective.com',
    senderName: process.env.BREVO_SENDER_NAME || 'Tvarita',
  },
  artistShareRate: 0.7,
};
