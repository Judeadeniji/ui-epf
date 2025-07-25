# University English Proficiency Application Management System

A comprehensive web application for managing English proficiency certificate applications at the University of Ibadan. Built with Next.js, TypeScript, and modern web technologies.

## 🎯 Overview

This system streamlines the process of applying for, reviewing, and managing English proficiency certificates. It features role-based access control with separate interfaces for applicants, officers, and administrators, along with automated email notifications and document management.

## ✨ Key Features

### For Applicants

- **Online Application Submission** - Complete digital application form with file uploads
- **Document Upload** - Secure upload for certificates and payment receipts
- **Email Notifications** - Automated status updates and confirmations
- **Multiple Delivery Options** - Email delivery, hand collection, or physical delivery

### For Officers & Administrators

- **Application Review System** - Streamlined approval workflow with pre-approval and final approval stages
- **Dashboard Analytics** - Real-time statistics and application insights
- **Advanced Filtering** - Search and filter applications by status, department, applicant name, etc.
- **Document Processing** - Upload and manage processed documents for approved applications
- **User Management** (Admin only) - Manage officer accounts and permissions

### Technical Features

- **Role-Based Access Control** - Admin, Officer, and Applicant roles with appropriate permissions
- **Email Integration** - Resend API for automated notifications
- **File Management** - Secure file upload and storage system
- **Database Integration** - SQLite with Drizzle ORM
- **Authentication** - Better Auth with passkey support
- **Responsive Design** - Modern UI with Tailwind CSS and shadcn/ui components

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Hono.js API routes, Better Auth
- **Database**: SQLite with Drizzle ORM
- **Email**: Resend API
- **Routing**: React Router (for admin dashboard)
- **Styling**: Tailwind CSS with custom design system
- **File Upload**: Native file handling with validation

## 📱 Application Workflow

1. **Application Submission** - Students submit applications with required documents
2. **Initial Review** - Officers review and can pre-approve applications
3. **Final Approval** - Administrators provide final approval and process documents
4. **Notification System** - Automated emails sent at each stage
5. **Document Delivery** - Based on selected delivery method (email/collection/delivery)

## 🔐 Security Features

- JWT-based authentication with Better Auth
- Role-based authorization
- File upload validation and sanitization
- CSRF protection
- Input validation with Zod schemas

## 📊 Dashboard Features

- **Application Statistics** - Total, pending, and approved application counts
- **Recent Activity** - Latest application submissions and updates
- **User Management** - Admin tools for managing officers and users
- **Filtering & Search** - Advanced application filtering capabilities

## 🚀 Getting Started

```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install
# or
bun install

# Set up environment variables
cp .env.example .env.local

# Run database migrations
npm run db:migrate

# Start development server
npm run dev
```

## 📁 Project Structure

```text
src/
├── admin-app/          # Admin dashboard components
├── app/               # Next.js app router pages
├── components/        # Reusable UI components
├── contexts/          # React contexts
├── drizzle/          # Database schema and migrations
├── hooks/            # Custom React hooks
├── lib/              # Utilities and configurations
└── server/           # API routes and server logic
```

## 🤝 Contributing

This is an internal university system. For feature requests or bug reports, please contact the development team.

## 📄 License

Internal university software - All rights reserved.

---

*Built for the University of Ibadan to streamline English proficiency certificate processing.*
