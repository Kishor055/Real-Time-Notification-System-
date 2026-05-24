'use server';
/**
 * @fileOverview An AI agent that suggests optimal routing paths for incoming notifications.
 *
 * - suggestNotificationRouting - A function that handles the notification routing suggestion process.
 * - SuggestNotificationRoutingInput - The input type for the suggestNotificationRouting function.
 * - SuggestNotificationRoutingOutput - The return type for the suggestNotificationRouting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestNotificationRoutingInputSchema = z.object({
  messageContent: z
    .string()
    .describe('The main content or body of the incoming notification.'),
  eventType: z
    .string()
    .describe(
      'The type of event that triggered the notification (e.g., "trading_alert", "system_monitoring", "user_activity").'
    ),
  sourceSystem: z
    .string()
    .describe(
      'The system or application from which the notification originated (e.g., "TradingEngine", "IoTPlatform", "AuthService").'
    ),
  severity: z
    .enum(['low', 'medium', 'high', 'critical'])
    .describe('The perceived severity of the notification.'),
  metadata: z
    .record(z.any())
    .optional()
    .describe('Additional metadata associated with the notification.'),
});
export type SuggestNotificationRoutingInput = z.infer<
  typeof SuggestNotificationRoutingInputSchema
>;

const SuggestNotificationRoutingOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the notification.'),
  categorization: z
    .string()
    .describe(
      'A category for the notification (e.g., "Financial", "System Health", "Security", "Customer Support").'
    ),
  priorityLevel: z
    .enum(['low', 'medium', 'high', 'critical'])
    .describe('The determined priority level for this notification.'),
  suggestedRoutes: z
    .array(z.string())
    .describe(
      'An array of suggested routing paths (topics, channels, or user groups) for the notification.'
    ),
});
export type SuggestNotificationRoutingOutput = z.infer<
  typeof SuggestNotificationRoutingOutputSchema
>;

export async function suggestNotificationRouting(
  input: SuggestNotificationRoutingInput
): Promise<SuggestNotificationRoutingOutput> {
  return suggestNotificationRoutingFlow(input);
}

const suggestNotificationRoutingPrompt = ai.definePrompt({
  name: 'suggestNotificationRoutingPrompt',
  input: {schema: SuggestNotificationRoutingInputSchema},
  output: {schema: SuggestNotificationRoutingOutputSchema},
  prompt: `You are an expert AI assistant for NovaPulse, a real-time notification service platform.
Your task is to analyze incoming notification details and suggest the most optimal routing paths (topics, channels, or user groups), provide a concise summary, categorize the event, and assign a priority level.

Consider the following information to make your suggestions:

Notification Content: {{{messageContent}}}
Event Type: {{{eventType}}}
Source System: {{{sourceSystem}}}
Severity: {{{severity}}}

{{#if metadata}}
Additional Metadata: {{{JSON.stringify metadata}}}
{{/if}}

Based on the above, please provide:
1. A concise 'summary' of the notification.
2. A 'categorization' (e.g., "Financial", "System Health", "Security").
3. An appropriate 'priorityLevel' (low, medium, high, critical).
4. An array of 'suggestedRoutes' (e.g., "trading-alerts", "devops-incidents", "security-breaches", "all-users"). Focus on accuracy and efficiency to ensure messages reach the most relevant recipients.

Ensure the output is a valid JSON object matching the schema you were trained on.`,
});

const suggestNotificationRoutingFlow = ai.defineFlow(
  {
    name: 'suggestNotificationRoutingFlow',
    inputSchema: SuggestNotificationRoutingInputSchema,
    outputSchema: SuggestNotificationRoutingOutputSchema,
  },
  async input => {
    const {output} = await suggestNotificationRoutingPrompt(input);
    return output!;
  }
);
