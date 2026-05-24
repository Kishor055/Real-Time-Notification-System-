import { config } from 'dotenv';
config();

import '@/ai/flows/summarize-notification-flow.ts';
import '@/ai/flows/suggest-notification-routing-flow.ts';
import '@/ai/flows/prioritize-notification-flow.ts';
import '@/ai/flows/categorize-notification-flow.ts';