export class AppError extends Error {
  constructor(message, status = 400, details = null) {
    super(message);
    this.status = status;
    this.details = details;
    this.name = 'AppError';
  }
}

export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

export function publicArtist(artist) {
  if (!artist) return null;
  return {
    id: artist.id,
    email: artist.email,
    name: artist.name,
    phone: artist.phone,
    art_form: artist.artForm,
    region: artist.region,
    bio: artist.bio,
    status: artist.status,
    password_set: artist.passwordSet,
    rating_avg: artist.ratingAvg,
    rating_count: artist.ratingCount,
    created_at: artist.createdAt,
    updated_at: artist.updatedAt,
  };
}
