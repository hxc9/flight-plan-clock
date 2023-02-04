import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

export const { PORT, REDIS_URL, AUTOROUTER_API_URL } = process.env;
