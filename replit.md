# Overview

WorkLogix is a multi-tenant task management system designed for Super Admins, Company Admins, and Company Members. It offers comprehensive task management, time tracking, reporting, and automated attendance and reward systems within a hierarchical organizational structure. The system emphasizes role-based access control, data isolation, and member slot limitations to provide a robust solution for diverse organizational needs, aiming to streamline operations and enhance productivity.

# User Preferences

I prefer a clear, modern UI with a clean aesthetic, drawing inspiration from tools like Linear and Notion. The design should prioritize responsiveness and include dark mode support. For development, I favor an iterative approach, focusing on core functionalities first and then expanding. I appreciate detailed explanations, especially for complex architectural decisions. Please ensure that all changes are well-documented and follow best practices for security and maintainability.

# System Architecture

## UI/UX Decisions

The design philosophy adopts a clean, modern interface inspired by Linear and Notion, using a deep blue primary color and "Inter" for UI typography, with "JetBrains Mono" for data. It supports mobile-first, responsive design with dark mode, built with Shadcn UI components. Navigation is multi-page with a persistent left sidebar. A public landing page at the root route includes a professional navbar, hero section, platform statistics, features showcase, access hierarchy, quick access links, and a contact section.

## System Design Choices

The system utilizes a PostgreSQL database with multi-tenant tables, each including a `companyId` foreign key for data isolation. A RESTful API provides all functionalities with company-based authorization. Authentication is handled by Firebase Authentication with Google Sign-In, supporting Super Admin, Company Admin, and Company Member roles.

## Technical Implementations

The frontend uses React and TypeScript with Tailwind CSS for styling. The backend is built with Express.js. State management employs React Query and Context API. Multi-tenancy is implemented with a three-tier hierarchy and configurable slot limits. Key features include task management (priority, deadline, status, real-time timer), time-based reporting, private messaging, and group announcements. Real-time messaging and push notifications are implemented using WebSockets and Firebase Cloud Messaging (FCM), respectively, providing instant updates and deep linking from notifications.

## Feature Specifications

WorkLogix includes:
- **Super Admin functionalities**: company creation, editing, removal, and slot purchase.
- **User dashboards**: time tracking, task management, messaging, and reports.
- **Admin dashboards**: user and task management, reporting, and communication.
- **Automated Attendance & Reward System**: Configurable work timings, automatic attendance tracking, late entry detection, overtime calculation, and a point-based reward system with badges. This system operates via daily, weekly, and monthly cron jobs, ensuring fully automated processing and rewards without manual intervention.
- **Company Registration**: Manual registration with email verification and Google OAuth registration for instant signup, ensuring a secure onboarding process (with a note on server-side token verification for production Google OAuth).
- **Payment System**: Advanced Stripe integration supporting various payment methods (cards, UPI), UPI QR code generation, secure webhooks for automatic slot allocation, smart payment polling, and email notifications for transactions.

# External Dependencies

-   **Authentication**: Firebase (Google Sign-In)
-   **Database**: PostgreSQL
-   **Email Service**: Resend
-   **Payment Gateway**: Stripe
-   **Push Notifications**: Firebase Cloud Messaging (FCM)