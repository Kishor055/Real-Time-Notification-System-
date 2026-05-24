'use server';
/**
 * @fileOverview An AI agent that prioritizes incoming notifications based on their content, source, and category.
 *
 * - prioritizeNotification - A function that handles the notification prioritization process.
 * - PrioritizeNotificationInput - The input type for the prioritizeNotification function.
 * - PrioritizeNotificationOutput - The return type for the prioritizeNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PrioritizeNotificationInputSchema = z.object({
  message: z.string().describe('The content of the notification message.'),
  source: z
    .string()
    .describe(
      "The system or service that generated the notification (e.g., 'trading-engine', 'security-scanner', 'monitoring-dashboard')."
    ),
  category: z
    .enum([
      'alert',
      'system-event',
      'information',
      'security',
      'financial',
      'operational',
      'customer-support'
    ])
    .describe('The broad category of the notification.'),
  metadata: z
    .record(z.any())
    .optional()
    .describe('Optional: Additional structured metadata relevant to the notification.'),
});
export type PrioritizeNotificationInput = z.infer<
  typeof PrioritizeNotificationInputSchema
>;

const PrioritizeNotificationOutputSchema = z.object({
  priority: z
    .enum(['Critical', 'High', 'Medium', 'Low'])
    .describe('The assigned priority level for the notification.'),
  reasoning: z
    .string()
    .describe('A brief explanation for the assigned priority.'),
});
export type PrioritizeNotificationOutput = z.infer<
  typeof PrioritizeNotificationOutputSchema
>;

export async function prioritizeNotification(
  input: PrioritizeNotificationInput
): Promise<PrioritizeNotificationOutput> {
  return prioritizeNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'prioritizeNotificationPrompt',
  input: {schema: PrioritizeNotificationInputSchema},
  output: {schema: PrioritizeNotificationOutputSchema},
  prompt: `You are an intelligent notification prioritization system for NovaPulse, an enterprise-grade Real-Time Notification Service Platform.
Your task is to analyze incoming notification details and assign an appropriate priority level (Critical, High, Medium, Low).

Consider the following:
- **Source:** Notifications from core systems (e.g., 'trading-engine', 'security-scanner') or critical infrastructure generally indicate higher priority.
- **Category:** 'alert' and 'security' categories often signify higher urgency.
- **Message Content:** Look for keywords or phrases that suggest urgency, impact, or potential for disruption.
- **Metadata:** If provided, use additional structured data to inform your decision.

Your goal is to highlight critical alerts so that administrators and users can address the most important information promptly.

Input Notification Details:
Message: {{{message}}}
Source: {{{source}}}
Category: {{{category}}}
{{#if metadata}}
Metadata: {{{JSON metadata}}}
{{/if}}

Based on the above, assign a priority level and provide a concise reasoning.
`,
});

const prioritizeNotificationFlow = ai.defineFlow(
  {
    name: 'prioritizeNotificationFlow',
    inputSchema: PrioritizeNotificationInputSchema,
    outputSchema: PrioritizeNotificationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to prioritize notification: No output from AI model.');
    }
    return output;
  }
);
