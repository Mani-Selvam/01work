# Overview

WorkLogix is a multi-tenant task management system designed for Super Admins, Company Admins, and Company Members. It offers comprehensive task management, time tracking, and reporting within a hierarchical organizational framework. The system emphasizes role-based access control, data isolation per company, member slot limitations, and a fully automated attendance and reward system. Its purpose is to provide a robust solution for diverse organizational needs, streamlining operations and enhancing productivity.

# User Preferences

I prefer a clear, modern UI with a clean aesthetic, drawing inspiration from tools like Linear and Notion. The design should prioritize responsiveness and include dark mode support. For development, I favor an iterative approach, focusing on core functionalities first and then expanding. I appreciate detailed explanations, especially for complex architectural decisions. Please ensure that all changes are well-documented and follow best practices for security and maintainability.

# System Architecture

## UI/UX Decisions

The design prioritizes a clean, modern interface inspired by Linear and Notion, using a deep blue primary color and "Inter" for UI typography. It features a mobile-first, responsive design with dark mode support, built with Shadcn UI components. A persistent left sidebar supports multi-page navigation.

The application includes a public landing page at the root route ("/") with a professional navbar, hero section with call-to-action, platform statistics, a showcase of 6 key features, a visual representation of the three-tier access hierarchy, quick access links for user types, and a contact section footer.

## Technical Implementations

The frontend uses React and TypeScript with Tailwind CSS, while the backend is Express.js. State management is handled by React Query and Context API. Authentication is via Firebase Authentication with Google Sign-In, supporting Super Admin, Company Admin, and Company Member roles. Role-based and company-scoped authorization ensures data access control. Multi-tenancy is implemented with `companyId` foreign keys for data isolation and configurable `maxAdmins`/`maxMembers` slot limits.

Key features include Super Admin management of companies, user dashboards with time tracking, tasks, messages, and reports, and admin dashboards for user/task management, reporting, and communication. Data archiving and email notifications for report submissions are also supported.

A real-time messaging system with a WhatsApp-like interface is implemented, featuring an admin chat dashboard with split-view layout, real-time chat via WebSockets, direct conversations, group announcements, and Firebase Cloud Messaging (FCM) push notifications.

The WorkLogix Attendance & Reward Management System is fully automated, configurable per company with core work timings, and provides automatic attendance tracking for employees, including late entry detection, streak tracking, and monthly reports. It also features an automated reward system with badges and points for good attendance, and automated email notifications for achievements. Company Admins can monitor live attendance, view analytics, and access reports. Automated backend processes (cron jobs) handle daily, weekly, and monthly tasks like marking absentees, calculating points, and assigning rewards. Data is isolated per company using `company_id`.

Company registration supports both manual registration with email verification and Google OAuth for instant signup. The system includes a comprehensive payment system with advanced Stripe integration for slot purchases, supporting multiple payment methods (cards, UPI), UPI QR code generation, secure webhooks for automatic slot allocation, smart payment polling, and email notifications.

**Security Note:** The current Google OAuth implementation relies on client-supplied `x-user-id` headers and does NOT verify Firebase ID tokens server-side. Server-side token verification using Firebase Admin SDK is critical for production to prevent privilege escalation.

## System Design Choices

The system uses a PostgreSQL database with tables for `companies`, `users`, `tasks`, `reports`, `messages`, `ratings`, `file_uploads`, `company_payments`, `adminActivityLogs`, `archive_reports`, and `deviceTokens`. All multi-tenant tables include a `companyId` foreign key. A RESTful API provides endpoints with company-based authorization.

# External Dependencies

-   **Authentication**: Firebase (Google Sign-In)
-   **Database**: PostgreSQL
-   **Email Service**: Resend
-   **Payment Gateway**: Stripe
-   **Push Notifications**: Firebase Cloud Messaging (FCM)