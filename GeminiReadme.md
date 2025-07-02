# 🧠 IMPLEMENTATION PROMPT: New Features for the Barber Booking System

You’re working on a fully structured SaaS platform for barber shops, with a monorepo that includes a **backend (Express + Prisma)** and a **frontend (Next.js App Router with Shadcn UI)**.

Before starting, make sure to:
- ✅ Read the `README.md` in both the **frontend** and **backend** folders to understand the architecture.
- ✅ Use the existing structure and patterns when introducing new logic or UI.
- ❗ Avoid introducing breaking changes to already working appointment logic.

## 🆕 Features to Implement

### 1. 🧱 Flexible Manual Booking & Blocking

**Current limitation:** The barber can only manually add a client or block a slot that aligns exactly with their shop’s default `serviceDuration` (e.g., 60 minutes).

**New logic:**
- Allow **custom time blocks**, e.g., 12:00 to 13:30.
- These flexible blocks should prevent clients from booking in *any* overlapping range.
- Blocks should no longer be tied to `serviceDuration`.

> ⚠ Update the appointment availability logic to respect these flexible ranges.

---

### 2. 🔁 Recurring Time Blocks

Allow barbers to create **recurring blocks** (e.g., lunch every day at 12:00), and delete them individually or in batch.

Extend the `BlockedTime` model:
```prisma
model BlockedTime {
  id             String   @id @default(cuid())
  shopId         String
  shop           Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  date           DateTime?
  startTime      String   // "HH:MM"
  endTime        String   // "HH:MM"
  recurring      Boolean  @default(false)
  recurrenceType String?  // "daily", "weekly", "custom"
  daysOfWeek     String[] // e.g., ["monday", "friday"]
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
Create logic to generate virtual instances of recurring blocks when checking availability or rendering the schedule.

Add UI in the dashboard modal to choose recurrence: "once" | "daily" | "weekly", with optional days of week.

3. ✂️ Define Services Per Shop (Hair, Beard, Combo)
Extend the Shop model to include multiple services:

prisma
Copy
Edit
model Shop {
  ...
  services Service[]
}

model Service {
  id        String   @id @default(cuid())
  shopId    String
  shop      Shop     @relation(fields: [shopId], references: [id], onDelete: Cascade)
  name      String   // "Hair", "Beard", "Combo"
  price     Float
  duration  Int      // in minutes
  createdAt DateTime @default(now())
}
Add CRUD for services inside the dashboard (admin only).

Link services to appointments via selectedServices: String[] on the Appointment model.

When booking, clients select one or more services. The system auto-calculates:

✅ Price total

✅ Total duration (sum of selected services)

4. 💇 Haircut Style Selection (Client Side)
Let clients choose from a few haircut styles like "fade", "classic", "buzz cut".

Update the Appointment model:

prisma
Copy
Edit
model Appointment {
  ...
  selectedServices String[]
  haircutStyle     String?  // "fade" | "classic" | "buzz"
}
In the booking UI:

Add a <Select> or <RadioGroup> with 3 fixed options for haircut style.

Optionally, show a small preview/tooltip for each style.

Show haircut style on the barber dashboard too.

5. 💡 UI Enhancements
In appointment cards and block previews:

Show time range clearly: e.g. 13:00 - 14:00

Use badge indicators:

Gray striped for blocked times

Yellow for manual bookings

Blue for completed

Add hoverable tooltips on blocked times with recurrence info if applicable.

On service creation form, use <Dialog> with date picker + time picker and clean inputs with shadcn/ui.

🧾 README Update
At the end of your changes, update README.md to include:

✅ How recurring and flexible time blocks work

✅ How to define and assign services (and prices)

✅ How haircut style selection works

✅ Mention that all availability logic respects flexible/recurring blocks and service durations

💡 Tips & Constraints
Do not break the current booking system.

Keep API changes backward-compatible by marking new fields as optional.

Add sensible defaults (e.g., 60 minutes if duration is not defined).

Reuse shadcn UI and existing components/ui styles.

Structure everything cleanly inside the existing folders:

dashboard/ for UI

routes/ + controllers/ for API

prisma/ for schema and migrations

✅ Once the new features are implemented, test:

 Booking with different service combinations

 Viewing recurring blocked times

 Preventing overlaps

 Booking a haircut with selected style