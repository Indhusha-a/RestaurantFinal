# AIML Project Stabilization Plan

## Summary
Stabilize the project by fixing the regressions introduced after Member 6 integration, then restore the missing analytics and leaderboard surfaces without rewriting working Member 1-5 flows. The implementation should prioritize backend/data-contract hotfixes first, because several UI failures are downstream effects of broken notification inserts and mismatched API payloads rather than standalone frontend bugs.

## Key Changes
- **Fix notification pipeline first**
  - Align the `notifications` table schema with the current `Notification` entity (`recipientId`, `recipientType`) and remove the legacy hard requirement on `user_id`.
  - Centralize notification creation into `NotificationService` and replace direct `notificationRepository.save(...)` calls in `RestaurantService` with that service.
  - Add user-safe error responses so raw SQL exceptions do not leak into the UI.

- **Repair individual/explore flow regressions**
  - Re-test `POST /api/restaurants/filter`, `POST /api/restaurants/{id}/select`, restaurant-side visit confirmation, and user notification refresh as one end-to-end path.
  - Keep the current restaurant filtering logic, but verify approved restaurants are returned from approved+active queries after admin approval.
  - Confirm newly approved restaurants propagate to all expected surfaces:
    - `GET /api/restaurants`
    - individual mode results when filters match
    - Explore search
    - newly added section

- **Restore missing Member 6 user-facing features**
  - In Explore Mode, add the missing “Newly Added Restaurants” section using `/api/explore/new` and reuse the existing restaurant card style.
  - In Group Mode, expose the weekly group leaderboard in the main user journey instead of leaving it as a disconnected route.
  - In the public business dropdown, add the missing `Admin Login` entry so admin analytics are discoverable.

- **Fix leaderboard contract drift**
  - Make frontend and backend agree on one leaderboard endpoint path.
    - Preferred: update frontend to use `/api/leaderboard/groups`.
    - Optional safety alias: also support `GET /api/leaderboard`.
  - Normalize leaderboard payload usage in the UI to the actual backend shape:
    - use `groupId` as the stable key
    - use `groupName`, `points`, `memberCount`, `rank`
    - remove unsupported assumptions like `group.createdBy.username`
  - Keep the existing points logic; only fix data flow and rendering.

- **Replace fake admin monitoring metrics with real ones**
  - Keep the existing monitoring page and routes, but replace placeholder values in `AdminService`.
  - Compute activity metrics from live tables:
    - total registered users
    - currently active users
    - total registered restaurants
    - active group sessions
    - completed group sessions
  - Compute TOPSIS metrics from stored group session outcomes:
    - rank-1 success rate
    - top-3 containment
    - confirmed visit rate
    - outcome distribution by winning rank
  - Compute CF metrics from available ratings/interactions data.
    - If prediction-history data does not exist, use a transparent fallback metric and label it clearly instead of pretending it is true prediction accuracy.

- **Tighten requirement mismatches without broad refactors**
  - Decide and standardize admin credentials across backend seed data and UI expectations.
    - Default chosen for implementation: keep one credential pair only and make login screens/messages match it everywhere.
  - Clean low-risk frontend warnings in touched files only.
  - Do not expand the architecture or add unnecessary new files unless a migration/helper file is genuinely needed.

## Public/API/Type Adjustments
- `GET /api/leaderboard/groups` becomes the canonical leaderboard endpoint used by the frontend.
- Optional compatibility alias: `GET /api/leaderboard` returns the same data for older callers.
- Notification creation becomes service-based instead of ad hoc repository writes.
- Monitoring endpoints keep their current paths, but their payload values become real rather than placeholder.
- If a fallback CF metric is used, its response field name or label must clearly indicate it is an engagement/observed metric, not true model accuracy.

## Test Plan
- **Notifications**
  - User selects a restaurant in Individual Mode and no SQL error appears.
  - Restaurant receives the arrival notification.
  - Restaurant confirms the visit and user receives the confirmation notification.
  - User unread count and mark-as-read still work.

- **Restaurant approval propagation**
  - Approve a pending restaurant in admin.
  - Confirm it appears in `/api/restaurants`.
  - Confirm it appears in Explore search.
  - Confirm it appears in the newly added list.
  - Confirm it appears in Individual Mode when its specialties/budget/tags match the chosen filters.

- **Leaderboard**
  - Weekly leaderboard page loads without 404 or empty-contract failures.
  - Group cards render using backend fields only.
  - Group Mode exposes the leaderboard entry point.

- **System monitoring**
  - Admin can reach monitoring from the UI.
  - Monitoring cards and charts load from real repository data.
  - No hardcoded placeholder percentages remain unless explicitly labeled as fallback.

- **Regression safety**
  - User registration/login/profile still work.
  - Restaurant registration, pending login, approval, and rejection still work.
  - Group creation, invite, session start, preference submit, TOPSIS generation, and voting still work.
  - Restaurant portal activities and performance tabs still load.

## Assumptions And Defaults
- The current missing analytics/leaderboard issue is a mix of “feature exists but is not linked” and “feature linked to broken/placeholder data”; the fix plan treats both.
- Minimal-change strategy is preferred over redesign.
- Existing working Member 1-5 flows must be preserved, so fixes should be localized to notification plumbing, contract mismatches, monitoring queries, and missing UI links/sections.
- A DB migration or manual schema-alignment script is allowed because the notification failure is a schema/code mismatch, not just a frontend bug.
- `implementationplan.md` should be replaced with this plan content during the implementation phase after your confirmation.
