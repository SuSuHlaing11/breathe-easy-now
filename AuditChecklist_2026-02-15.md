# Audit Checklist (2026-02-15)

## High Impact
- [ ] Decide and unify auth flow: keep either `Login.tsx` or `SignIn.tsx`/`SignUp.tsx`; remove or redirect the others.
- [ ] Replace mock/placeholder data on production pages:
  - [ ] Landing announcements (`Index.tsx`) use mock data.
  - [ ] Admin overview (`admin/AdminOverview.tsx`) uses mock metrics.
  - [ ] Admin data uploads (`admin/AdminDataUploads.tsx`) uses mock + localStorage.
  - [ ] History (`History.tsx`) uses static arrays.
  - [ ] Saved (`Saved.tsx`) uses static arrays.
  - [ ] Prediction (`Prediction.tsx`) uses placeholder response.
  - [ ] Export (`Export.tsx`) uses hardcoded countries + alert.

## Encoding / UI
- [ ] Fix password placeholder mojibake (`â€¢â€¢â€¢â€¢`) in:
  - [ ] `Login.tsx`
  - [ ] `SignIn.tsx`
  - [ ] `SignUp.tsx`

## UX / Data Wiring
- [ ] Wire History “Save/Open” to real saved analysis data (or label as demo).
- [ ] Wire Saved page to user’s saved analyses and delete action.
- [ ] Implement Export backend flow (or disable Export action with message).

## Admin
- [ ] Replace AdminDataUploads mock data with backend upload records.
- [ ] Replace AdminOverview mock metrics with backend stats.

