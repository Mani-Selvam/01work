# Overview

WorkLogix is a multi-tenant task management system designed for Super Admins, Company Admins, and Company Members. It provides comprehensive task management, time tracking, and reporting within a hierarchical organizational framework. Key features include role-based access control, data isolation per company, member slot limitations, an automated attendance and reward system, and real-time communication. The system aims to be a robust solution for diverse organizational needs, offering a modern, efficient platform for workforce management.

# User Preferences

I prefer a clear, modern UI with a clean aesthetic, drawing inspiration from tools like Linear and Notion. The design should prioritize responsiveness and include dark mode support. For development, I favor an iterative approach, focusing on core functionalities first and then expanding. I appreciate detailed explanations, especially for complex architectural decisions. Please ensure that all changes are well-documented and follow best practices for security and maintainability.

# System Architecture

## UI/UX Decisions

The UI/UX design emphasizes a clean, modern interface inspired by Linear and Notion, utilizing a professional deep blue primary color and "Inter" for UI typography. It features a mobile-first, responsive design with dark mode support, built with Shadcn UI components. The application includes a comprehensive public landing page with a professional navbar, hero section, platform stats, features showcase, access hierarchy, quick access portals, and a contact section.

## Technical Implementations

The frontend is built with React and TypeScript, styled using Tailwind CSS, and the backend runs on Express.js. State management uses React Query and Context API. Authentication is handled by Firebase Authentication with Google Sign-In, supporting Super Admin, Company Admin, and Company Member roles. Authorization is role-based and company-scoped. Multi-tenancy is implemented with a three-tier hierarchy, `companyId` foreign keys for data isolation, and configurable `maxAdmins` and `maxMembers` slot limits.

A fully functional real-time messaging system with a WhatsApp-style split-view design is implemented across all user roles, featuring real-time message delivery via WebSockets and push notifications via Firebase Cloud Messaging, including deep linking.

The system includes a fully automated attendance tracking and reward system configurable per company. This system tracks work timings, marks attendance (present, late, absent), calculates working hours, manages streaks, and automatically awards points and badges based on performance. Company Admins have access to real-time monitoring, analytics, and reports. All automated processes are handled by cron jobs.

Company registration offers both manual and Google OAuth options, with email verification for manual registrations and immediate access for Google OAuth. A critical security note highlights the need for server-side Firebase ID token verification for Google OAuth in production.

A comprehensive payment system with advanced Stripe integration supports multiple payment methods (cards, UPI, PaymentRequest API), UPI QR code generation, secure webhooks for slot allocation, and smart payment polling for real-time status updates. Automated email notifications and payment history are also included.

## Feature Specifications

Key features include Super Admin management of companies (creation, editing, removal, slot purchase), user dashboards with time tracking, tasks, messages, and reports. Admin dashboards provide user and task management, reporting, and communication tools. Data archiving and email notifications for report submissions are also supported.

## System Design Choices

The system uses a PostgreSQL database with tables for `companies`, `users`, `tasks`, `reports`, `messages`, `ratings`, `file_uploads`, `company_payments`, `adminActivityLogs`, `archive_reports`, and `deviceTokens`. All multi-tenant tables include a `companyId` foreign key for data isolation. A RESTful API provides endpoints for all functionalities, with company-based authorization.

# External Dependencies

-   **Authentication**: Firebase (Google Sign-In)
-   **Database**: PostgreSQL
-   **Email Service**: Resend
-   **Payment Gateway**: Stripe
-   **Push Notifications**: Firebase Cloud Messaging (FCM)