This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.


Improve this Contacts page UI while preserving the existing modern SaaS design language. Do not redesign from scratch. Keep the same clean, minimal, premium aesthetic with the purple accent color.

Requirements:

1. Sidebar
- Reduce the large empty space.
- Add a small "Quick Actions" section with:
  - Add Contact
  - Import CSV
  - Create Campaign
- Add a small statistics card at the bottom showing:
  - Total Contacts
  - Active Campaigns
- Keep the user profile fixed at the bottom.
- Replace the fully purple active menu with a subtle purple background and a left accent border.

2. Header
- Keep the title hierarchy.
- Add small statistics cards below the heading:
  - Total Contacts
  - Companies
  - Pending Outreach
  - Follow Ups Due
- Make them compact and aligned horizontally.

3. Search & Filters
- Keep the existing search bar.
- Add a keyboard shortcut hint (Ctrl + K) inside the search field.
- Add filter dropdowns beside the search:
  - Role
  - Location
  - Tags
  - Company

4. Action Buttons
- Keep "Import CSV" and "Add Contact".
- Add a dropdown on Add Contact:
  - Add Manually
  - Import CSV
  - Import LinkedIn CSV

5. Table
- Make table headers slightly darker and semi-bold.
- Add row hover animation.
- Add subtle background highlight on hover.
- Make the first column sticky.
- Keep header sticky while scrolling.

6. Contact Row
- Replace plain initials with colored circular avatars using random pastel backgrounds.
- Improve spacing between columns.
- Truncate long text with tooltips.
- Show company logo if available.

7. Tags
- Use different colors based on category:
  Purple → Remote
  Blue → City
  Green → Applied
  Yellow → Follow Up
  Red → Urgent
- Keep the pill design.

8. Row Actions
Replace the current actions with:
- View
- Edit
- Delete
- More Options

Use icon buttons with hover effects.

9. Empty State
If no contacts exist:
- Show a clean illustration.
- Message:
  "No contacts yet."
- CTA buttons:
  - Add Contact
  - Import CSV

10. Pagination
Add pagination at the bottom:
Showing 1–20 of 248 contacts
Previous
1 2 3
Next

11. Visual Improvements
- Increase page horizontal padding slightly.
- Improve vertical spacing.
- Add subtle shadows only where needed.
- Keep rounded corners consistent.
- Use smooth hover animations (150–200ms).
- Maintain excellent whitespace.

12. Responsiveness
Desktop:
- Keep the current table layout.

Tablet:
- Reduce spacing.

Mobile:
- Convert rows into cards instead of a table.

13. Accessibility
- Proper hover states.
- Keyboard navigation.
- Visible focus rings.
- High contrast text.

14. Keep Existing Design
Do not change:
- Brand color
- Typography style
- Overall layout
- Minimal aesthetic

Only refine and polish the interface to make it feel like a premium production SaaS such as Linear, Vercel, Notion, Stripe Dashboard, or GitHub.