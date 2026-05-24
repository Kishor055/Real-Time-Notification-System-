'use server';
/**
 * @fileOverview An AI agent that provides concise summaries of lengthy or complex notifications.
 *
 * - summarizeNotification - A function that handles the notification summarization process.
 * - SummarizeNotificationInput - The input type for the summarizeNotification function.
 * - SummarizeNotificationOutput - The return type for the summarizeNotification function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const SummarizeNotificationInputSchema = z.object({
  notificationContent: z.string().describe('The content of the notification to be summarized.'),
});
export type SummarizeNotificationInput = z.infer<typeof SummarizeNotificationInputSchema>;

const SummarizeNotificationOutputSchema = z.object({
  summary: z.string().describe('A concise, AI-generated summary of the notification content.'),
});
export type SummarizeNotificationOutput = z.infer<typeof SummarizeNotificationOutputSchema>;

export async function summarizeNotification(input: SummarizeNotificationInput): Promise<SummarizeNotificationOutput> {
  return summarizeNotificationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeNotificationPrompt',
  input: { schema: SummarizeNotificationInputSchema },
  output: { schema: SummarizeNotificationOutputSchema },
  prompt: `You are an AI assistant specialized in summarizing technical and critical notifications.
Your goal is to provide a concise, clear, and actionable summary of the provided notification content.
Identify the key information, any urgent actions required, and the most important details, omitting extraneous information.
Format the summary as a single paragraph or a short bulleted list if necessary, ensuring it is easy to grasp quickly.

Notification Content:
{{{notificationContent}}}

Provide the summary in the 'summary' field of the output JSON.`,
});

const summarizeNotificationFlow = ai.defineFlow(
  {
    name: 'summarizeNotificationFlow',
    inputSchema: SummarizeNotificationInputSchema,
    outputSchema: SummarizeNotificationOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
