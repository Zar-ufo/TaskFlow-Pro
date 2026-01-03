# TaskFlow — Quick User Manual

## 1) Sign up
1. Open the app and go to `/auth`.
2. Choose **Sign up**.
3. Enter your name, email, and password.

After signup:
- A default workspace (**My Workspace**) and category (**General**) are created for you.
- A verification email is sent.
  - In development (no SMTP configured), the server prints the email + link in its console.

## 2) Verify your email
1. Open the verification link you received.
2. You should see “Email verified successfully.”

If you didn’t receive it:
- Use **Verify email (Resend)** in the header, or
- Go to **Settings → Resend verification email**.

## 3) Create tasks
1. Select a workspace from the left sidebar.
2. Click **New Task** in the header.
3. Choose a category and status, then save.

Notes:
- Tasks are only available to logged-in users.
- Tasks are scoped to your workspaces.

## 4) Admin (system owner)
Admin user (bootstrapped automatically):
- Email: `abdullahzarif050@gmail.com`
- Password: `Zariffatiha11`

Admin capabilities:
- View all users (verified and non-verified) via **Settings → Admin → View all users**.

## 5) Onboarding guide (Skip)
After logging in, a short guide appears once per user.
- Click **Skip** to hide it.