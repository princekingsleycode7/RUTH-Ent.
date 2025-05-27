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
  timeSinceLastVisit: z.string().optional().describe('The time since the attendee last visited the event, e.g., 