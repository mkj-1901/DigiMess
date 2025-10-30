# Add Opt-Out Feature to StudentDashboard

## Information Gathered

- Opt-out allows students to request skipping meals for date ranges with reason, needs admin approval.
- Backend services and types are ready (optoutService, OptOut interface).
- StudentDashboard has sections for meals, rebates, reviews.

## Plan

- [ ] Import optoutService in StudentDashboard.tsx
- [ ] Add state variables: optOuts (OptOut[]), optOutForm ({startDate, endDate, reason}), optOutLoading (boolean)
- [ ] Fetch opt-outs in useEffect alongside other data
- [ ] Add new section "Opt-Out Requests" after Reviews section
- [ ] Create form with date inputs and textarea for reason
- [ ] Add submit button with loading state
- [ ] Add table to display past opt-out requests with status
- [ ] Handle form submission and refresh data

## Dependent Files to Edit

- Frontend/src/components/StudentDashboard.tsx

## Followup Steps

- [ ] Test submitting opt-out request
- [ ] Verify opt-outs appear in history table
- [ ] Check form validation and error handling
