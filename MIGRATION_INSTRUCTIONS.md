# User Profile Migration Instructions

## Overview
This document provides instructions for migrating the users table to include comprehensive profile fields from the Excel intake form.

## Files Modified/Created

### Database Migration
- `scripts/004_add_comprehensive_user_profile_fields.sql` - SQL migration script

### Backend/API
- `app/api/user/profile/route.ts` - Updated to handle all new profile fields
- `lib/profile-validation.ts` - Client and server-side validation utilities

### Frontend
- `app/profile/page.tsx` - Comprehensive profile form with conditional logic
- `app/dashboard/page.tsx` - Updated to display contact/location info on adopter cards
- `lib/us-states-cities.ts` - US states and cities dataset for dynamic dropdowns

## Database Migration Steps

### Step 1: Connect to Neon Database
1. Go to your Neon Dashboard: https://console.neon.tech
2. Select your project: **PetAdoptionMatcher1**
3. Navigate to the **SQL Editor** tab

### Step 2: Run the Migration Script
1. Open the file `scripts/004_add_comprehensive_user_profile_fields.sql`
2. Copy the entire contents of the file
3. Paste into the Neon SQL Editor
4. Click **Run** to execute the migration

### Step 3: Verify Migration
Run this query to verify all new columns were added:

\`\`\`sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
\`\`\`

You should see all the new columns including:
- first_name, last_name
- home_phone, cell_phone
- address_line, city, state, zip_code
- has_pets, pets_types, pets_good_with_others
- home_type, landlord_allows_pets, landlord_phone, landlord_email
- has_children, children_count, children_ages
- And many more...

## New Profile Fields

### Personal Information (Required)
- First Name *
- Last Name *
- Email *
- Cell Phone *
- Birthday *
- Home Phone (optional)
- Gender (optional)

### Address (Required)
- Street Address *
- City * (dynamic dropdown based on state)
- State * (US states dropdown)
- ZIP Code *
- Willing to adopt out of state (checkbox)

### Housing Information
- Home Type (Rent House/Apartment, Own House/Apartment/Condo, Other)
- Has Fenced Yard (checkbox)
- **Conditional:** If renting:
  - Landlord Allows Pets (checkbox)
  - Landlord Phone
  - Landlord Email
- **Conditional:** If own condo:
  - HOA/Association Restrictions (checkbox)

### Current Pets
- Has Pets (checkbox)
- **Conditional:** If has pets:
  - Pet Types (multi-select: Dog, Cat, Bird, Fish, Reptile, Other)
  - Pets Good With Others (checkbox)

### Work & Pet Care
- Works Outside Home (checkbox)
- Hours Pet Would Be Home Alone (dropdown)
- Where Pets Stay When Away (dropdown)

### Family Information
- Has Children (checkbox)
- **Conditional:** If has children:
  - Number of Children
  - Children's Ages
- Number of Adults in Home
- Home Activity Level (dropdown)

### Pet Preferences
- Where Pet Will Live (Inside/Outside/Both)
- Adoption Timeline (dropdown)
- Preferred Dog Breed
- Preferred Cat Type
- Preferred Age (dropdown)
- Preferred Weight (dropdown)
- Preferred Energy Level (dropdown)
- Preferred Temperament (multi-select)
- Undesired Characteristics (multi-select)

### Veterinary Care
- Takes Pets to Vet (checkbox)
- **Conditional:** If takes pets to vet:
  - Veterinarian Name
  - Veterinarian Phone
  - Veterinarian Email
- Plan for Vet Costs (dropdown)

### References
- Reference 1: Name, Phone, Email
- Reference 2: Name, Phone, Email

### Pet Ownership History
- Adopted Before (checkbox)
- Owned Pet Before (checkbox)
- Spayed/Neutered Previous Pets (checkbox)
- Vaccinated Previous Pets (checkbox)
- Willing to Attend Behavior Training (checkbox)
- What Happened to Previous Pets (textarea)
- Circumstances for Giving Up Pet (textarea)

### Additional Information
- Additional Comments (textarea)

## Validation Rules

### Client-Side Validation
- Required fields are enforced with inline error messages
- Email format validation
- Phone number format validation (10+ digits)
- ZIP code format validation (5 digits or 5+4 format)

### Server-Side Validation
- All client-side validations are re-checked on the server
- Structured error responses with field-level messages
- Type checking for all fields

## Testing the Implementation

### Test 1: Profile Form Submission
1. Log in to the application
2. Navigate to the Profile page
3. Fill out all required fields (marked with *)
4. Test conditional fields:
   - Select "Rent House" for Home Type → Verify landlord fields appear
   - Check "I have children" → Verify children count/ages fields appear
   - Check "I currently have pets" → Verify pet type fields appear
   - Check "I take my pets to the vet" → Verify vet info fields appear
5. Click "Save Profile"
6. Verify success message appears
7. Reload the page
8. Verify all data persists correctly

### Test 2: State/City Dynamic Dropdown
1. On the Profile page, select a State (e.g., "Texas")
2. Verify the City dropdown populates with major cities for that state
3. Select a city from the dropdown
4. Save the profile
5. Reload and verify the state and city are correctly saved

### Test 3: Dashboard Adopter Card Display
1. Navigate to the Dashboard
2. Select a pet that has applications
3. Verify adopter cards display:
   - Phone number (cell phone or home phone)
   - Email address
   - Full address (street, city, state)
   - Home type
   - Experience level
4. Verify "Why This Match Works" section shows 4 static reasons

### Test 4: API Endpoint Testing
Use a tool like Postman or curl to test the API:

\`\`\`bash
# Get user profile
curl -X GET "http://localhost:3000/api/user/profile?userId=USER_ID"

# Update user profile
curl -X PUT "http://localhost:3000/api/user/profile" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "USER_ID",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "cellPhone": "555-123-4567",
    "birthday": "1990-01-01",
    "addressLine": "123 Main St",
    "city": "Austin",
    "state": "TX",
    "zipCode": "78701",
    "hasPets": true,
    "petsTypes": ["Dog", "Cat"]
  }'
\`\`\`

## Backwards Compatibility

The migration script uses `ADD COLUMN IF NOT EXISTS` to safely add new columns without breaking existing data. All new columns are nullable or have default values, so existing user records will continue to work.

## Data Sources

### US States
All 50 US states plus District of Columbia are included in `lib/us-states-cities.ts`.

### Cities
Major cities for each state are provided in a static JSON structure. If a user's city is not listed, they can enter it manually using the "Other" option or the custom city input field.

## Troubleshooting

### Issue: Migration fails with "column already exists"
**Solution:** The script uses `IF NOT EXISTS`, so this shouldn't happen. If it does, check if a previous migration already added some columns.

### Issue: Profile data not saving
**Solution:** 
1. Check browser console for errors
2. Verify the API endpoint is receiving the data (check Network tab)
3. Check server logs for database errors
4. Verify the user is authenticated (userId is present)

### Issue: Conditional fields not showing
**Solution:**
1. Verify the parent checkbox/dropdown is properly set
2. Check the conditional logic in `app/profile/page.tsx`
3. Ensure state updates are triggering re-renders

### Issue: City dropdown not populating
**Solution:**
1. Verify a state is selected first
2. Check that `lib/us-states-cities.ts` contains cities for that state
3. Use the custom city input as a fallback

## Next Steps

After running the migration and testing:

1. **Update Matching Algorithm:** The new profile fields are now available for the matching algorithm to use. Consider updating the algorithm to factor in:
   - Housing type and fenced yard for pet compatibility
   - Family composition (children, adults) for temperament matching
   - Experience level for special needs pets
   - Activity level matching

2. **Add Profile Completeness Indicator:** Consider adding a progress bar showing how complete the user's profile is.

3. **Email Notifications:** Set up email notifications when users complete their profile or when new matches are found.

4. **Admin Dashboard:** Create an admin view to review and approve applications based on the comprehensive profile data.

## Support

If you encounter any issues during migration or testing, please check:
1. Neon database connection is active
2. Environment variables are correctly set
3. All dependencies are installed (`npm install`)
4. The application is running on the correct port

For additional help, contact the development team or refer to the Next.js and Neon documentation.
