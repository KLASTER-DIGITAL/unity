# Book Creation Wizard Logic

## Overview
The Book Creation Wizard is a 5-step process that allows users to create a printable PDF book from their diary entries.
It supports both Free and Premium users with different capabilities.

## Steps
1. **Plan Type** (Step 0):
   - Users select between Free (Monthly) and Premium (Quarterly/Annual) plans.
   - Premium users skip this step and default to Premium plan.
2. **Period** (Step 1):
   - Users select the date range for the book.
   - Validates that the end date is after the start date.
3. **Contexts** (Step 2):
   - Users can filter entries by specific categories/contexts.
   - Optional step.
4. **Style** (Step 3):
   - Users select the narrative style (e.g., Warm Family, Biographical).
   - **Premium Only**: Free users can see options but cannot select them (locked).
   - Default for Free: `warm_family`.
5. **Layout** (Step 4):
   - Users select the visual layout (e.g., Photo+Text, Text Only).
   - **Premium Only**: Free users can see options but cannot select them (locked).
   - Default for Free: `photo_text`.

## Logic & Validation
- **Minimum Entries**: Users must have at least 5 entries in the selected period.
- **Free Tier Limit**: Free users can generate 1 book per month.
- **Premium Users**: Unlimited generation, access to all styles and layouts.

## Technical Details
- **State Management**: `useBookCreation` hook manages the wizard state.
- **API**: Calls Supabase Edge Functions (`generate-book-pdf`, `generate-book-free`).
- **Storage**: Generated PDFs are stored in Supabase Storage bucket `books`.
