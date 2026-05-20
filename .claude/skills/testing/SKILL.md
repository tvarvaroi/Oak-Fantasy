# Testing Skill — Oak-Fantasy

> Scaffold ported from a prior project. Replace the `<...>` placeholders with
> Oak-Fantasy's real roles, flows, and known issues as the app takes shape.

## Testing Conventions

- Always use dedicated test accounts, never production data
- Test every distinct user role: `<role-1>`, `<role-2>`, `<role-3>`
- Check the browser console after every navigation and form submission
- Test edge cases: empty inputs, very long strings, special characters
- Verify mobile responsiveness at 375px, 768px, and 1024px widths

## Common Test Flows

1. Auth Flow: Register → Login → Session persistence → Logout
2. `<core-domain-flow>`: `<step>` → `<step>` → `<step>` → view history
3. Data-entry Flow: create record → edit record → verify persistence → view aggregate
4. `<secondary-flow>`: `<steps>`
5. Profile Flow: Edit profile → Change settings → Verify persistence

## Known Issues to Verify

- `<add known flaky areas / browser quirks as they are discovered>`
