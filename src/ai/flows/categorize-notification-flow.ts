'use server';
/**
 * @fileOverview An AI agent that categorizes incoming notifications based on their content and metadata.
 *
 * - categorizeNotification - A function that handles the notification categorization process.
 * - CategorizeNotificationInput - The input type for the categorizeNotification function.
 * - CategorizeNotificationOutput - The return type for the categorizeNotification function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeNotificationInputSchema = z.object({
  notificationContent: z.string().describe('The main content or message of the incoming notification.'),
  metadata: z.record(z.string(), z.any()).optional().describe('Additional metadata associated with the notification, such as source system, event type, or timestamps.'),
});
export type CategorizeNotificationInput = z.infer<typeof CategorizeNotificationInputSchema>;

const CategorizeNotificationOutputSchema = z.object({
  category: z.enum(['trading', 'alerts', 'monitoring', 'system_health', 'critical_event', 'info', 'other']).describe('The primary category of the notification. Choose from: trading, alerts, monitoring, system_health, critical_event, info, other.'),
  summary: z.string().describe('A concise, one-sentence summary of the notification.'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).describe('The priority level of the notification.'),
  routingPath: z.string().describe('An optimal topic or channel for routing this notification (e.g., "trading/price-changes", "alerts/critical", "monitoring/server-status").'),
});
export type CategorizeNotificationOutput = z.infer<typeof CategorizeNotificationOutputSchema>;

export async function categorizeNotification(input: CategorizeNotificationInput): Promise<CategorizeNotificationOutput> {
  return categorizeNotificationFlow(input);
}

// This schema represents the actual input *to the prompt* after preprocessing in the flow.
const CategorizeNotificationPromptInputSchema = z.object({
  notificationContent: z.string().describe('The main content or message of the incoming notification.'),
  metadataString: z.string().optional().describe('Additional metadata associated with the notification, stringified for the prompt.'),
});
type CategorizeNotificationPromptInput = z.infer<typeof CategorizeNotificationPromptInputSchema>;

const prompt = ai.definePrompt({
  name: 'categorizeNotificationPrompt',
  input: {schema: CategorizeNotificationPromptInputSchema},
  output: {schema: CategorizeNotificationOutputSchema},
  prompt: `You are an intelligent notification categorization system for the NovaPulse platform. Your task is to analyze incoming notifications and their associated metadata, then categorize, summarize, assign a priority, and suggest an optimal routing path.\n\nAnalyze the following notification:\n\nNotification Content:\n{{{notificationContent}}}\n\n{{#if metadataString}}\nMetadata:\n{{{metadataString}}}\n{{/if}}\n\nBased on the content and metadata, perform the following:\n1.\t**Categorize** the notification into one of the following types: 'trading', 'alerts', 'monitoring', 'system_health', 'critical_event', 'info', 'other'.\n2.\tProvide a **concise, one-sentence summary**.\n3.\tAssign a **priority** level: 'low', 'medium', 'high', or 'critical'.\n4.\tSuggest an **optimal routing path** (e.g., "trading/price-changes", "alerts/critical", "monitoring/server-status").\n\nReturn your response in JSON format according to the output schema.`,
});

const categorizeNotificationFlow = ai.defineFlow(
  {
    name: 'categorizeNotificationFlow',
    inputSchema: CategorizeNotificationInputSchema, // This is the public-facing input for the flow
    outputSchema: CategorizeNotificationOutputSchema,
  },
  async input => {
    // Construct the input for the prompt based on the flow's input
    let promptInput: CategorizeNotificationPromptInput = {
      notificationContent: input.notificationContent,
    };

    if (input.metadata) {
      promptInput.metadataString = JSON.stringify(input.metadata, null, 2); // Pretty print JSON for readability by LLM
    }

    const {output} = await prompt(promptInput);
    if (!output) {
      throw new Error('Failed to categorize notification: LLM returned no output.');
    }
    return output;
  }
);
