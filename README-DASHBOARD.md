# Web Dashboard Component

This is a standalone Next.js dashboard component for the Rein horse training application.

## Setup

If you want to use this in a Next.js project:

1. **Create a Next.js project:**
   ```bash
   npx create-next-app@latest rein-dashboard --typescript --tailwind --app
   cd rein-dashboard
   ```

2. **Install Lucide React:**
   ```bash
   npm install lucide-react
   ```

3. **Install fonts (optional but recommended):**
   ```bash
   npm install @next/font
   ```

4. **Update your layout.tsx to include fonts:**
   ```tsx
   import { Playfair_Display, Inter } from 'next/font/google'

   const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' })
   const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

   export default function RootLayout({ children }) {
     return (
       <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
         <body className="font-sans">{children}</body>
       </html>
     )
   }
   ```

5. **Update tailwind.config.js:**
   ```js
   module.exports = {
     theme: {
       extend: {
         fontFamily: {
           serif: ['var(--font-serif)', 'serif'],
           sans: ['var(--font-sans)', 'sans-serif'],
         },
       },
     },
   }
   ```

6. **Copy dashboard-web.tsx to app/page.tsx** (or create a route as needed)

## Features

- ✅ Responsive navigation bar with mobile menu
- ✅ Cinematic hero section with background image
- ✅ Floating stats cards (Skills, Sessions, Streak)
- ✅ Quick action cards (New Plan, Ask Trainer, Log Session, All Lessons)
- ✅ Trainer's Tip sidebar widget
- ✅ Up Next calendar widget
- ✅ Modern, warm, equestrian-themed design
- ✅ Hover effects and smooth transitions

## Customization

- Update `USER_DATA` object with real user data from your API
- Replace placeholder background image URL with your preferred image
- Connect the navigation links and action cards to your routes
- Integrate with your authentication system
- Fetch real stats and data from your backend API

## Design System

- **Colors:** Warm neutrals (stone-50, stone-600, stone-900)
- **Typography:** Serif for headings (Playfair Display), Sans-serif for body (Inter)
- **Spacing:** Consistent spacing using Tailwind's default scale
- **Shadows:** Subtle shadows (shadow-sm, shadow-md) for depth
- **Borders:** Soft rounded corners (rounded-xl)

