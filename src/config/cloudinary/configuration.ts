import { registerAs } from '@nestjs/config';

export const cloudinaryConfiguration = registerAs('cloudinary', () => ({
  cloudName: process.env.CLOUDINARY_NAME,
  apiKey: process.env.CLOUDINARY_KEY,
  apiSecret: process.env.CLOUDINARY_SECRET,
}));
