# UniReverse

A modern booking and management platform for university clubs and administrators, built with Next.js, TypeScript, Tailwind CSS, and Firebase. This app is designed for university clubs to reserve stadiums, with access restricted to registered clubs approved by the admin.

## Features

- **User Authentication**: Secure login with role-based access (admin, club)
- **Multi-language Support**: Easily switch between languages (LTR/RTL, e.g., Arabic)
- **Theme Toggle**: Light and dark mode support
- **Booking System**: Clubs can book time slots via an interactive calendar
- **User Reservations**: View and manage your own reservations
- **Friendly Matches**: Organize and join friendly matches
- **Admin Dashboard**: Manage clubs, reservations, stadiums, time slots, and auto-assignments
- **Notifications**: Real-time updates and alerts
- **Responsive UI**: Mobile-friendly and accessible design

## Tech Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [Tailwind CSS](https://tailwindcss.com/) (with custom themes)
- [Radix UI](https://www.radix-ui.com/), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- [Firebase](https://firebase.google.com/) (for backend/auth/database)

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm
- Firebase project

### Installation

```bash
npm install
# or
pnpm install
```

### Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Copy your Firebase configuration
5. Create a `.env.local` file with your Firebase config:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Development

```bash
npm run dev
# or
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the app.

### Database Setup

1. Open `setup-database.html` in your browser
2. Click "Run Complete Setup" to populate the database with initial data
3. Login with admin credentials: `admin` / `admin123`

### Build for Production

```bash
npm run build
npm start
# or
pnpm build
pnpm start
```

## Project Structure

- `app/` — Main application pages (user, booking, admin dashboard)
- `components/` — UI and feature components
- `lib/` — Contexts and utilities (auth, language, etc.)
- `public/` — Static assets
- `styles/` — Global styles

## Features Overview

### Admin Features
- Manage clubs and users
- Manage stadiums and time slots
- View and manage all reservations
- Auto-assign functionality

### Club Features
- Book stadium time slots
- View personal reservations
- Cancel bookings
- Organize friendly matches

## Contributing

1. Fork this repo
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a Pull Request

## License

MIT

---

> Made with ❤️ using Next.js, Tailwind CSS, and Firebase. 