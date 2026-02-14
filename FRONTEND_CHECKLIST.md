# Frontend Checklist (Air Pollution × Health DAM)

Mark items as `done` / `blocked` / `missing`.

## 1. Environment & Config
- [ ] `VITE_API_BASE_URL` set for backend.
- [ ] Frontend runs locally (`npm run dev`).

## 2. Auth Flow
- [ ] Login works with backend (`/auth/login`).
- [ ] `getAuthMe` hydrates session correctly.
- [ ] Forgot/reset password flow works end-to-end.
- [ ] Role-based routing for admin/org dashboards.

## 3. Organization Onboarding
- [ ] Organization request form submits to `/org-applications`.
- [ ] File upload to `/files/applications/{id}` works.
- [ ] Admin review works (`/org-applications` list + review).

## 4. Organization Dashboard
- [ ] Upload data uses backend (no localStorage).
- [ ] Upload history uses backend (no localStorage).
- [ ] Profile update uses backend.

## 5. Admin Dashboard
- [ ] Overview stats use backend (no mock data).
- [ ] Organizations list uses backend (done).
- [ ] Data uploads list uses backend (no mock data).
- [ ] Create admin/org user works (done).

## 6. Data Views
- [ ] Analysis page wired to backend/analytics.
- [ ] Prediction page wired to backend/AI.
- [ ] Health map uses country name matching (upgrade to ISO later).
- [ ] Age group filter sourced from IMHE.
- [ ] Age group dropdown sorted and cleaned.
- [ ] Sex filter sourced from IMHE.
- [ ] Health area (cause) list sourced from IMHE.

## 7. UI/UX Cleanup
- [ ] Remove demo credentials before production.
- [ ] Normalize enum labels in UI.
- [ ] Fix encoding issues (e.g., µg/m³).
