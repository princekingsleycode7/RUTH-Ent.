
// noinspection ES6ConvertVarToLetConst
'use server';
/**
 * @fileOverview Generates a personalized check-in confirmation message using GenAI.
 *
 * - generateCheckInConfirmation - A function that generates the confirmation message.
 * - GenerateCheckInConfirmationInput - The input type for the generateCheckInConfirmation function.
 * - GenerateCheckInConfirmationOutput - The return type for the generateCheckInConfirmation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateCheckInConfirmationInputSchema = z.object({
  attendeeName: z.string().describe('The name of the attendee.'),
  eventName: z.string().describe('The name of the event.'),
  timeSinceLastVisit: z.string().optional().describe("The time since the attendee last visited the event, e.g., 'first visit', 'a few months', 'last year'"),
});
export type GenerateCheckInConfirmationInput = z.infer<typeof GenerateCheckInConfirmationInputSchema>;

const GenerateCheckInConfirmationOutputSchema = z.object({
  confirmationMessage: z.string().describe('A friendly and personalized check-in confirmation message for the attendee.'),
});
export type GenerateCheckInConfirmationOutput = z.infer<typeof GenerateCheckInConfirmationOutputSchema>;

export async function generateCheckInConfirmation(input: GenerateCheckInConfirmationInput): Promise<GenerateCheckInConfirmationOutput> {
  return smartCheckInConfirmationFlow(input);
}

const checkInPrompt = ai.definePrompt({
  name: 'smartCheckInConfirmationPrompt',
  input: { schema: GenerateCheckInConfirmationInputSchema },
  output: { schema: GenerateCheckInConfirmationOutputSchema },
  prompt: `You are a friendly event assistant for {{eventName}}.
An attendee named {{attendeeName}} has just checked in.
{{#if timeSinceLastVisit}}
Their last visit was {{timeSinceLastVisit}}.
{{else}}
This is their first time checking in, or we don't have their previous visit information.
{{/if}}
Generate a short, welcoming, and slightly personalized confirmation message for the event staff to see or say to {{attendeeName}}.
Make it enthusiastic and appropriate for the event.
For example: "Welcome back, {{attendeeName}}! So glad to see you again at {{eventName}}!" or "Great to have you, {{attendeeName}}! Enjoy {{eventName}}!"
`,
});

const smartCheckInConfirmationFlow = ai.defineFlow(
  {
    name: 'smartCheckInConfirmationFlow',
    inputSchema: GenerateCheckInConfirmationInputSchema,
    outputSchema: GenerateCheckInConfirmationOutputSchema,
  },
  async (input) => {
    const { output } = await checkInPrompt(input);
    if (!output) {
      // This case should ideally be handled by Genkit's schema validation or model response,
      // but an explicit check provides a fallback.
      console.error('AI model did not return a valid confirmation message for input:', input);
      return { confirmationMessage: `Welcome, ${input.attendeeName}! Enjoy ${input.eventName}!` };
    }
    return output;
  }
);
