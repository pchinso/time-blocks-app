# Time Blocks App

A modern, intuitive time management application built with React, TypeScript, and Tailwind CSS. Plan your day in 10-minute intervals with a visual bubble grid interface.

##  Features

- **10-Minute Time Grid**  Visualize your entire day from 5:00 AM to 4:00 AM the next day, divided into 6 time slots per hour
- **Bubble-Based Planning**  Click any bubble to create a task, or drag to extend tasks across multiple time slots
- **Visual Task Merging**  Continuous time blocks for the same task automatically merge into a single visual entity
- **Dynamic Categories**  Create unlimited task categories on-the-fly with auto-assigned colors
- **Drag-to-Extend**  Seamlessly drag task bubbles to adjacent empty slots to extend task duration
- **Overlap Prevention**  Prevents overlapping tasks for a clean schedule
- **High-Resolution PDF Export**  Export your daily schedule as a professional PDF
- **Dark/Light Mode**  Glassmorphism-inspired theme system
- **Floating Labels**  Category names appear above active time blocks
- **Fully Responsive**  Optimized for desktop, tablet, and mobile

##  Tech Stack

- React 19 with TypeScript
- Vite
- Tailwind CSS v4
- Zustand (State Management)
- Framer Motion (Animations)
- Radix UI (Components)
- html-to-image + jsPDF (PDF Export)
- date-fns (Date Utilities)

##  Getting Started

`ash
git clone https://github.com/pchinso/time-blocks-app.git
cd time-blocks-app
npm install
npm run dev
`

##  Deployment

Deploy easily to Vercel, Netlify, GitHub Pages, or any static hosting.

##  How to Use

1. Click empty bubbles to create tasks
2. Drag to extend task duration
3. View category totals in the sidebar
4. Export as PDF with one click

##  License

MIT

##  Author

[pchinso](https://github.com/pchinso)
