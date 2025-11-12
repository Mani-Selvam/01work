# Leave System Integration - Admin & User Connection

## Problem Identified
The leave section was not displaying properly for admins because the frontend expected an `appliedDate` field, but the backend was only providing `createdAt`.

## Solution Implemented
Updated the backend storage layer to map `createdAt` to `appliedDate` for both user and admin leave queries, matching the integration pattern used in the correction requests system.

---

## Integration Pattern (Following Attendance Monitor & Correction Requests)

### 1. User Side - Leave Management
**Location**: `client/src/pages/user/LeaveManagement.tsx`

**Features**:
- Users can submit leave requests with:
  - Start date and end date
  - Leave type (casual, sick, annual, emergency)
  - Reason for leave
- View all their leave requests with status (pending, approved, rejected)
- Display statistics for each status

**API Endpoints Used**:
- `POST /api/leaves` - Submit new leave request
- `GET /api/leaves/me` - Fetch user's own leave requests

**Data Flow**:
1. User fills out leave form
2. Form data submitted to backend
3. Backend creates leave record with `status: 'pending'`
4. Leave appears in user's leave list

---

### 2. Admin Side - Leave Approval
**Location**: `client/src/pages/admin/LeaveApproval.tsx`

**Features**:
- Admins can view all company leave requests
- Requests are separated into:
  - **Pending Requests**: Awaiting approval/rejection
  - **Processed Requests**: Already approved or rejected
- Each request shows:
  - Employee name (userName)
  - Leave type
  - Date range (startDate - endDate)
  - Submission date (appliedDate)
  - Reason for leave
- Approve or reject buttons for pending requests

**API Endpoints Used**:
- `GET /api/leaves/company/:companyId` - Fetch all leaves for company (with userName joined)
- `PATCH /api/leaves/:leaveId/approve` - Approve a leave request
- `PATCH /api/leaves/:leaveId/reject` - Reject a leave request

**Data Flow**:
1. Admin views all company leave requests
2. Backend joins `leaves` table with `users` table to include `userName`
3. Returns leave data with employee names
4. Admin approves/rejects requests
5. Status updates in database
6. Changes reflect in both admin and user views

---

## Backend Integration Details

### Database Schema
**Table**: `leaves`
- `id` - Serial primary key
- `userId` - Reference to user who submitted
- `companyId` - Reference to company
- `leaveType` - Type of leave (casual, sick, annual, emergency)
- `startDate` - Leave start date
- `endDate` - Leave end date
- `reason` - Reason for leave request
- `status` - Current status (pending, approved, rejected)
- `approvedBy` - ID of admin who approved/rejected
- `remarks` - Admin remarks (optional)
- `createdAt` - When request was submitted
- `updatedAt` - Last update timestamp

### Storage Layer (server/storage.ts)

**Key Methods**:

1. `createLeave(leave)` - Creates new leave request
2. `getLeavesByUserId(userId)` - Fetches user's leaves with `appliedDate` mapped from `createdAt`
3. `getLeavesByCompanyId(companyId)` - **Joins with users table** to include `userName`, maps `appliedDate`
4. `updateLeaveStatus(leaveId, status, approvedBy, remarks)` - Updates leave status
5. `getLeaveById(id)` - Fetches single leave by ID

**Integration Fix**:
```typescript
// Both methods now map createdAt to appliedDate for frontend compatibility
return results.map(r => ({
  ...r,
  appliedDate: r.createdAt,
}));
```

### API Routes (server/routes.ts)

**User Routes**:
- `POST /api/leaves` - Requires auth, creates leave request
- `GET /api/leaves/me` - Requires auth, returns user's leaves

**Admin Routes** (Role-based access):
- `GET /api/leaves/company/:companyId` - Requires company_admin or super_admin role
- `PATCH /api/leaves/:leaveId/approve` - Requires admin role, approves leave
- `PATCH /api/leaves/:leaveId/reject` - Requires admin role, rejects leave

**Security**:
- All routes require authentication
- Admin routes verify role (`company_admin` or `super_admin`)
- Admins can only manage leaves for their own company

---

## Comparison with Other Integrated Systems

### Correction Requests Pattern
| Feature | Correction Requests | Leave Management |
|---------|-------------------|------------------|
| User submits | Attendance correction | Leave request |
| Admin views | All pending corrections | All company leaves |
| User name joined | ✓ Yes | ✓ Yes |
| Approve/Reject | ✓ Yes | ✓ Yes |
| Status tracking | pending, approved, rejected | pending, approved, rejected |
| Review comments | ✓ Yes (reviewComments) | ✓ Yes (remarks) |

### Attendance Monitor Pattern
| Feature | Attendance Monitor | Leave Management |
|---------|-------------------|------------------|
| Admin views all | Daily attendance records | Company leave requests |
| User name included | ✓ Yes | ✓ Yes |
| Date filtering | ✓ By date | ✓ By status |
| Statistics shown | Present, Late, Absent counts | Pending, Approved, Rejected counts |
| Individual history | ✓ User attendance history | ✓ User leave history |

---

## How It Works Now

### User Journey:
1. User logs in → Navigate to "Leave Management"
2. Click "Request Leave" button
3. Fill out form:
   - Select start and end dates
   - Choose leave type
   - Provide reason
4. Submit request
5. Request appears with "PENDING" status
6. User can track status changes

### Admin Journey:
1. Admin logs in → Navigate to "Leave Approvals"
2. View pending requests section
3. Each request shows:
   - Employee name
   - Leave type and dates
   - When it was submitted
   - Reason provided
4. Click "Approve" or "Reject" button
5. Request moves to "Processed Requests" section
6. User sees updated status in their leave list

### Integration Connection:
- **Database**: Leaves stored with userId and companyId
- **Backend**: Joins users table to add userName to leave data
- **API**: Separate endpoints for users (my leaves) and admins (company leaves)
- **Frontend**: User component shows own leaves, Admin component shows all with names
- **Real-time sync**: Both views invalidate cache after mutations, ensuring consistency

---

## Summary

The leave system is now **fully integrated** following the same pattern as:
- **Attendance Monitor**: Admin views all users' data with names joined
- **Correction Requests**: Users submit, admins approve/reject with status tracking

**Key Fix**: Added `appliedDate` field mapping in backend to match frontend expectations, ensuring submission timestamps display correctly for both users and admins.

The integration is complete and follows best practices for role-based access control and data joining.
