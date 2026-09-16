import { z } from 'zod';

export const artistFieldsSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(200),
  phone: z.string().min(7).max(20).optional().or(z.literal('')),
  art_form: z.string().min(1).max(100),
  region: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(2000).optional().or(z.literal('')),
});

export const artistLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const setPasswordSchema = z.object({
  token: z.string().min(10),
  password: z.string().min(8).max(128),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const feedbackCreateSchema = z.object({
  artist_id: z.string().min(1),
  event_id: z.string().min(1),
  guest_email: z.string().email(),
  guest_name: z.string().max(200).optional(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

export const feedbackStatusQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
});

export const timeslotItemSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  start_time: z.string().regex(/^\d{2}:\d{2}$/),
  end_time: z.string().regex(/^\d{2}:\d{2}$/),
  available: z.boolean().optional().default(true),
});

export const timeslotsPutSchema = z.object({
  timeslots: z.array(timeslotItemSchema).min(1),
});

export const availableArtistsQuerySchema = z.object({
  art_form: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const assignArtistSchema = z.object({
  artist_id: z.string().min(1),
});

export const notificationSendSchema = z.object({
  channel: z.enum(['email', 'sms']).default('email'),
  to: z.string().min(1),
  template: z.string().min(1),
  data: z.record(z.string(), z.any()).optional().default({}),
});

export const schoolCsvRowSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
  contact: z.string().optional().or(z.literal('')),
});

export const corporateCsvRowSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  org_id: z.string().optional().or(z.literal('')),
  company_name: z.string().min(1),
  phone: z.string().optional().or(z.literal('')),
});

export function validateArtistRow(data) {
  const parsed = artistFieldsSchema.safeParse({
    email: data.email,
    name: data.name,
    phone: data.phone || undefined,
    art_form: data.art_form || data.artForm,
    region: data.region || undefined,
    bio: data.bio || undefined,
  });
  if (!parsed.success) {
    return {
      error: parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`),
    };
  }
  return {
    data: {
      email: parsed.data.email.toLowerCase(),
      name: parsed.data.name,
      phone: parsed.data.phone || null,
      artForm: parsed.data.art_form,
      region: parsed.data.region || null,
      bio: parsed.data.bio || null,
    },
  };
}
