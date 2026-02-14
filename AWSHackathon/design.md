# ReferKaro Technical Design

## Overview

ReferKaro is a two-sided marketplace platform built with Next.js 15 that connects Job Seekers with Employees for paid referral opportunities. The platform acts as an escrow system for both money (via tokens) and information (via secure resume storage), ensuring trust between parties.

The architecture leverages Next.js App Router with React Server Components for optimal performance, Supabase for backend services (authentication, database, storage), and implements a token-based economy where Job Seekers pay for guaranteed referral attempts and Employees earn for making those attempts.

Key design principles:
- **Atomic transactions** for token deduction and application creation
- **Row Level Security (RLS)** for data access control at the database level
- **Secure file storage** with signed URLs for resume access
- **Role-based access control** separating Job Seeker and Employee workflows
- **Server-side rendering** for improved performance and SEO

## Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  (Next.js 15 App Router + React Server Components)          │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Landing    │  │     Auth     │  │  Dashboard   │     │
│  │     Page     │  │    Pages     │  │    Pages     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│              (Next.js API Routes + Server Actions)           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Auth Logic  │  │ Token System │  │  Application │     │
│  │              │  │              │  │   Workflow   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│                    (Supabase Services)                       │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │  Supabase    │  │   Storage    │     │
│  │   Database   │  │     Auth     │  │   (Resumes)  │     │
│  │   (+ RLS)    │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- Next.js 15 (App Router with React Server Components)
- React 18
- Tailwind CSS v3.4 for styling
- Shadcn UI for component library
- Lucide React for icons

**Backend:**
- Next.js API Routes (serverless functions)
- Next.js Server Actions for mutations
- Supabase Client SDK

**Database & Services:**
- PostgreSQL (via Supabase)
- Supabase Auth (Google OAuth)
- Supabase Storage (file uploads)
- Row Level Security (RLS) policies

**State Management:**
- React Server Components (RSC) for server state
- React hooks for client state
- Server Actions for mutations

## Components and Interfaces

### Authentication Components

**AuthProvider**
- Manages authentication state across the application
- Provides user context to child components
- Handles session persistence and refresh

**LoginPage**
- Displays Google OAuth sign-in button
- Redirects authenticated users to dashboard
- Handles OAuth callback flow

**RoleSelectionModal**
- Prompts first-time users to select role (Job Seeker or Employee)
- Updates user profile with selected role
- Redirects to appropriate dashboard after selection

**LegalDisclaimerModal**
- Displays terms of service and privacy policy
- Blocks platform access until terms are accepted
- Records acceptance timestamp in user profile

### Job Seeker Components

**JobSeekerDashboard**
- Displays token balance prominently
- Shows list of submitted applications with status
- Provides navigation to marketplace

**JobMarketplace**
- Lists all available job postings
- Implements search and filter functionality
- Displays job cards with company, role, and Employee info

**JobDetailsModal**
- Shows full job description and requirements
- Displays official job URL for verification
- Provides "Apply" button with token cost indicator

**ApplicationForm**
- Collects resume file (PDF/DOCX)
- Accepts optional LinkedIn URL, portfolio URL, cover letter
- Validates form inputs before submission
- Handles file upload to secure storage

**TokenPurchaseModal**
- Displays token package options with pricing
- Processes payment transaction (placeholder in MVP)
- Updates token balance after successful purchase

**ApplicationList**
- Displays all applications submitted by Job Seeker
- Shows application status (pending, accepted, rejected)
- Provides links to original job postings

### Employee Components

**EmployeeDashboard**
- Displays earnings summary
- Shows pending application count
- Lists active job postings
- Displays referral success rate statistics

**JobListingForm**
- Collects company name, role title, description
- Validates official job URL format
- Creates or updates job listings

**JobListingManager**
- Lists all job postings created by Employee
- Provides edit and view functionality
- Shows application count per listing

**ApplicationReviewPanel**
- Lists all applications for Employee's job postings
- Filters by status (pending, accepted, rejected)
- Displays candidate information preview

**ApplicationDetailsModal**
- Shows full candidate profile (LinkedIn, portfolio, cover letter)
- Provides secure resume download link
- Includes Accept/Reject action buttons

**ResumeViewer**
- Generates signed URL for secure resume access
- Displays resume in browser or triggers download
- Enforces access control (only authorized users)

### Shared UI Components

**Navigation**
- Role-based navigation menu
- Displays user avatar and name
- Provides logout functionality

**TokenBadge**
- Displays current token balance for Job Seekers
- Shows visual indicator when balance is low

**StatusBadge**
- Color-coded application status indicator
- Displays pending (yellow), accepted (green), rejected (red)

**LoadingSpinner**
- Consistent loading state across application
- Used during data fetching and mutations

## Data Models

### Database Schema

**profiles**
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('job_seeker', 'employee')),
  token_balance INTEGER DEFAULT 3 CHECK (token_balance >= 0),
  has_accepted_terms BOOLEAN DEFAULT FALSE,
  terms_accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**jobs**
```sql
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role_title TEXT NOT NULL,
  description TEXT NOT NULL,
  job_url TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**applications**
```sql
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  job_seeker_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  cover_letter TEXT,
  linkedin_url TEXT,
  portfolio_url TEXT,
  resume_url TEXT NOT NULL,
  applied_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  UNIQUE(job_id, job_seeker_id)
);
```

### Storage Structure

**Bucket: resumes**
- Path format: `{user_id}/{application_id}/{filename}`
- Allowed file types: PDF, DOCX
- Max file size: 5MB
- Access: Private with signed URLs

### Row Level Security Policies

**profiles table:**
```sql
-- Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

**jobs table:**
```sql
-- Anyone can view active jobs
CREATE POLICY "Anyone can view active jobs"
  ON jobs FOR SELECT
  USING (is_active = TRUE);

-- Employees can insert their own jobs
CREATE POLICY "Employees can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (auth.uid() = employee_id);

-- Employees can update their own jobs
CREATE POLICY "Employees can update own jobs"
  ON jobs FOR UPDATE
  USING (auth.uid() = employee_id);
```

**applications table:**
```sql
-- Job Seekers can view their own applications
CREATE POLICY "Job Seekers can view own applications"
  ON applications FOR SELECT
  USING (auth.uid() = job_seeker_id);

-- Employees can view applications to their jobs
CREATE POLICY "Employees can view applications to their jobs"
  ON applications FOR SELECT
  USING (auth.uid() = employee_id);

-- Job Seekers can create applications
CREATE POLICY "Job Seekers can create applications"
  ON applications FOR INSERT
  WITH CHECK (auth.uid() = job_seeker_id);

-- Employees can update applications to their jobs
CREATE POLICY "Employees can update applications"
  ON applications FOR UPDATE
  USING (auth.uid() = employee_id);
```

**Storage policies (resumes bucket):**
```sql
-- Job Seekers can upload resumes
CREATE POLICY "Job Seekers can upload resumes"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view their own resumes
CREATE POLICY "Users can view own resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Employees can view resumes for applications to their jobs
CREATE POLICY "Employees can view applicant resumes"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'resumes' AND
    EXISTS (
      SELECT 1 FROM applications
      WHERE applications.resume_url = name
      AND applications.employee_id = auth.uid()
    )
  );
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: New Job Seeker accounts initialize with correct token balance

*For any* new Job Seeker account created, the token balance should be initialized to exactly 3 tokens.

**Validates: Requirements 3.1**

### Property 2: Token deduction is atomic with application creation

*For any* application submission, the token deduction and application record creation should either both succeed or both fail (atomic transaction). If application creation fails, the token balance should remain unchanged.

**Validates: Requirements 6.6, 6.7**

### Property 3: Zero token balance prevents application submission

*For any* Job Seeker with zero tokens, attempting to submit an application should be rejected and no application record should be created.

**Validates: Requirements 3.7**

### Property 4: Duplicate applications are prevented

*For any* Job Seeker and job listing combination, attempting to submit a second application to the same job should be rejected, maintaining exactly one application per job-seeker pair.

**Validates: Requirements 6.9**

### Property 5: Job URL validation accepts valid URLs and rejects invalid ones

*For any* job listing submission, the job URL field should accept properly formatted URLs (with http/https protocol) and reject malformed URLs.

**Validates: Requirements 4.7**

### Property 6: Resume file type validation

*For any* resume upload, the system should accept only PDF and DOCX file types and reject all other file types.

**Validates: Requirements 7.7**

### Property 7: Authorized resume access

*For any* resume file, access should be granted if and only if the requesting user is either the resume owner (Job Seeker who uploaded it) or the Employee who owns the job listing for that application.

**Validates: Requirements 7.3, 7.4, 7.6**

### Property 8: Application status transitions update timestamp

*For any* application status change (pending to accepted, or pending to rejected), the system should update both the status field and record the review timestamp.

**Validates: Requirements 8.5, 8.6**

### Property 9: Status changes are visible to Job Seekers

*For any* application status update, querying the application as the Job Seeker should return the updated status, ensuring data consistency across user views.

**Validates: Requirements 9.4**

### Property 10: Role selection updates profile

*For any* valid role selection (job_seeker or employee), the user's profile should be updated with the selected role and the role should persist across sessions.

**Validates: Requirements 1.4**

### Property 11: Terms acceptance updates profile with timestamp

*For any* user accepting terms, the profile should be updated with has_accepted_terms set to true and terms_accepted_at set to the current timestamp.

**Validates: Requirements 2.4**

### Property 12: Job listing creation associates with creator

*For any* job listing created by an Employee, the listing should be associated with that Employee's user ID and should appear in their job listing management view.

**Validates: Requirements 4.2, 4.3**

### Property 13: Filter operations return matching subset

*For any* filter applied to job listings (by company, role, or department), the returned results should be a subset of all listings where every result matches the filter criteria.

**Validates: Requirements 5.3**

### Property 14: RLS enforces profile data isolation

*For any* user querying the profiles table, the query should return only their own profile data and never return other users' profiles.

**Validates: Requirements 11.1**

### Property 15: RLS enforces application ownership on creation

*For any* application creation attempt, the system should only allow creation if the job_seeker_id matches the authenticated user's ID, preventing users from creating applications as someone else.

**Validates: Requirements 11.6**

### Property 16: Session persistence across navigation

*For any* authenticated user navigating between pages within the application, their authentication state should remain valid without requiring re-authentication.

**Validates: Requirements 12.2**

### Property 17: Unauthenticated access redirects to login

*For any* unauthenticated user attempting to access a protected route, the system should redirect them to the login page and prevent access to the protected content.

**Validates: Requirements 12.6**

### Property 18: Authentication creates or retrieves profile

*For any* successful Google OAuth authentication, the system should either create a new profile (for first-time users) or retrieve the existing profile (for returning users), ensuring every authenticated user has a profile record.

**Validates: Requirements 1.2**


## Error Handling

### Authentication Errors

**OAuth Failure**
- Scenario: Google OAuth authentication fails or is cancelled
- Handling: Display user-friendly error message, provide retry option, log error details for debugging
- User Experience: "Authentication failed. Please try again."

**Session Expiration**
- Scenario: User session expires during active use
- Handling: Redirect to login page, preserve intended destination for post-login redirect
- User Experience: "Your session has expired. Please log in again."

**Role Selection Error**
- Scenario: Role update fails during onboarding
- Handling: Retry role update, fallback to manual role selection prompt
- User Experience: "Unable to save role selection. Please try again."

### Token System Errors

**Insufficient Tokens**
- Scenario: User attempts to apply with zero tokens
- Handling: Prevent application submission, display token purchase modal
- User Experience: "You need tokens to apply. Purchase tokens to continue."

**Token Deduction Failure**
- Scenario: Database error during token deduction
- Handling: Roll back entire transaction, preserve token balance, log error
- User Experience: "Application failed. Your tokens have not been deducted. Please try again."

**Concurrent Token Usage**
- Scenario: Multiple simultaneous applications attempt to use the same tokens
- Handling: Use database-level locking or optimistic concurrency control
- User Experience: First request succeeds, subsequent requests fail with "Insufficient tokens"

### Application Submission Errors

**Resume Upload Failure**
- Scenario: File upload to storage fails (network error, storage quota exceeded)
- Handling: Retry upload with exponential backoff, display progress indicator
- User Experience: "Upload failed. Retrying..." or "Upload failed. Please try again."

**Invalid File Type**
- Scenario: User attempts to upload non-PDF/DOCX file
- Handling: Validate file type before upload, reject with clear message
- User Experience: "Please upload a PDF or DOCX file."

**File Size Exceeded**
- Scenario: Resume file exceeds 5MB limit
- Handling: Validate file size before upload, reject with clear message
- User Experience: "File size must be under 5MB. Please compress your resume."

**Duplicate Application**
- Scenario: User attempts to apply to the same job twice
- Handling: Check for existing application before submission, prevent duplicate
- User Experience: "You have already applied to this job."

**Transaction Rollback**
- Scenario: Application creation fails after token deduction
- Handling: Roll back token deduction, restore original balance, log error
- User Experience: "Application failed. Your tokens have been restored. Please try again."

### Data Access Errors

**Unauthorized Resume Access**
- Scenario: User attempts to access resume they don't own
- Handling: RLS policy denies access at database level, return 403 Forbidden
- User Experience: "You don't have permission to access this file."

**Expired Signed URL**
- Scenario: User attempts to access resume with expired signed URL
- Handling: Generate new signed URL, redirect to updated URL
- User Experience: Seamless re-authentication, or "Link expired. Generating new link..."

**RLS Policy Violation**
- Scenario: User attempts unauthorized database operation
- Handling: Database rejects operation, return appropriate error code
- User Experience: "You don't have permission to perform this action."

### Job Listing Errors

**Invalid Job URL**
- Scenario: Employee submits job listing with malformed URL
- Handling: Validate URL format before submission, reject with clear message
- User Experience: "Please enter a valid URL starting with http:// or https://"

**Missing Required Fields**
- Scenario: Employee submits incomplete job listing
- Handling: Client-side validation prevents submission, highlight missing fields
- User Experience: "Please fill in all required fields."

**Job Listing Update Failure**
- Scenario: Database error during job listing update
- Handling: Retry operation, display error message if retry fails
- User Experience: "Unable to save changes. Please try again."

### Network and Database Errors

**Database Connection Failure**
- Scenario: Unable to connect to Supabase database
- Handling: Retry with exponential backoff, display loading state, show error after timeout
- User Experience: "Unable to connect. Please check your internet connection."

**API Rate Limiting**
- Scenario: Too many requests to Supabase API
- Handling: Implement client-side rate limiting, queue requests, display wait message
- User Experience: "Please wait a moment before trying again."

**Timeout Errors**
- Scenario: Database query or API call exceeds timeout threshold
- Handling: Cancel request, display timeout error, provide retry option
- User Experience: "Request timed out. Please try again."

### General Error Handling Strategy

**Error Logging**
- All errors logged with context (user ID, action attempted, timestamp)
- Sensitive information (passwords, tokens) excluded from logs
- Error logs stored for debugging and monitoring

**User Feedback**
- Clear, non-technical error messages for users
- Actionable guidance (e.g., "Please try again" vs "Error 500")
- Visual indicators (error toast notifications, inline form errors)

**Graceful Degradation**
- Application remains functional when non-critical features fail
- Fallback UI states for missing data
- Offline detection and appropriate messaging

**Error Recovery**
- Automatic retry for transient errors (network issues)
- Manual retry options for user-initiated actions
- Transaction rollback for data consistency

## Testing Strategy

### Overview

ReferKaro employs a dual testing approach combining unit tests for specific scenarios and property-based tests for universal correctness guarantees. This strategy ensures both concrete bug detection and comprehensive input coverage.

### Testing Approach

**Unit Tests:**
- Verify specific examples and edge cases
- Test integration points between components
- Validate error handling and boundary conditions
- Focus on concrete scenarios with known inputs and outputs

**Property-Based Tests:**
- Verify universal properties across all inputs
- Use randomized input generation for comprehensive coverage
- Validate invariants and correctness properties
- Each test runs minimum 100 iterations

**Balance:**
- Avoid excessive unit tests for scenarios covered by property tests
- Use unit tests for specific examples that demonstrate correct behavior
- Use property tests for universal rules that should hold for all inputs
- Both approaches are complementary and necessary

### Property-Based Testing Configuration

**Library:** fast-check (for TypeScript/JavaScript)

**Configuration:**
- Minimum 100 iterations per property test
- Each test tagged with feature name and property number
- Tag format: `Feature: aws-hackathon, Property {N}: {property description}`

**Test Organization:**
- Each correctness property implemented as a single property-based test
- Tests placed close to implementation to catch errors early
- Property tests run as part of CI/CD pipeline

### Test Coverage by Component

**Authentication & Authorization:**
- Unit tests: OAuth callback handling, session creation, role selection flow
- Property tests:
  - Property 18: Authentication creates or retrieves profile
  - Property 10: Role selection updates profile
  - Property 11: Terms acceptance updates profile with timestamp
  - Property 16: Session persistence across navigation
  - Property 17: Unauthenticated access redirects to login

**Token System:**
- Unit tests: Token purchase flow, balance display, insufficient token handling
- Property tests:
  - Property 1: New Job Seeker accounts initialize with correct token balance
  - Property 2: Token deduction is atomic with application creation
  - Property 3: Zero token balance prevents application submission

**Application Workflow:**
- Unit tests: Form validation, file upload UI, status display
- Property tests:
  - Property 4: Duplicate applications are prevented
  - Property 8: Application status transitions update timestamp
  - Property 9: Status changes are visible to Job Seekers

**Job Listings:**
- Unit tests: Job creation form, listing display, edit functionality
- Property tests:
  - Property 5: Job URL validation accepts valid URLs and rejects invalid ones
  - Property 12: Job listing creation associates with creator
  - Property 13: Filter operations return matching subset

**Resume Management:**
- Unit tests: File upload UI, download functionality, signed URL generation
- Property tests:
  - Property 6: Resume file type validation
  - Property 7: Authorized resume access

**Data Security:**
- Unit tests: RLS policy configuration, access control scenarios
- Property tests:
  - Property 14: RLS enforces profile data isolation
  - Property 15: RLS enforces application ownership on creation

### Example Property Test Structure

```typescript
// Feature: aws-hackathon, Property 1: New Job Seeker accounts initialize with correct token balance
import fc from 'fast-check';

describe('Token System Properties', () => {
  it('Property 1: New Job Seeker accounts initialize with 3 tokens', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.emailAddress(),
        fc.string({ minLength: 1, maxLength: 100 }),
        async (email, fullName) => {
          // Create new Job Seeker account
          const profile = await createJobSeekerProfile({ email, fullName });
          
          // Verify token balance is exactly 3
          expect(profile.token_balance).toBe(3);
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Integration Testing

**End-to-End Flows:**
- Complete application submission flow (login → browse → apply → review)
- Job listing creation and management flow
- Token purchase and usage flow

**Database Integration:**
- Test RLS policies with different user contexts
- Verify atomic transactions and rollback behavior
- Test concurrent access scenarios

**Storage Integration:**
- Test file upload and download with various file types and sizes
- Verify signed URL generation and expiration
- Test access control for storage objects

### Manual Testing Checklist

**User Acceptance Testing:**
- Role-based navigation and feature access
- UI responsiveness across devices
- Error message clarity and helpfulness
- Overall user experience and flow

**Security Testing:**
- Attempt unauthorized data access
- Test session expiration and re-authentication
- Verify RLS policies prevent data leakage
- Test file access controls

**Performance Testing:**
- Page load times under normal conditions
- Database query performance with large datasets
- File upload/download speed
- Concurrent user handling

### Continuous Integration

**Automated Test Execution:**
- All unit tests run on every commit
- Property-based tests run on every pull request
- Integration tests run before deployment
- Test coverage reports generated automatically

**Quality Gates:**
- Minimum 80% code coverage required
- All property tests must pass
- No critical security vulnerabilities
- Linting and type checking must pass

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page with OAuth
│   │   ├── callback/
│   │   │   └── route.ts              # OAuth callback handler
│   │   └── onboarding/
│   │       └── page.tsx              # Role selection page
│   │
│   ├── (dashboard)/
│   │   ├── job-seeker/
│   │   │   ├── page.tsx              # Job Seeker dashboard
│   │   │   ├── applications/
│   │   │   │   └── page.tsx          # Application list
│   │   │   └── marketplace/
│   │   │       └── page.tsx          # Job marketplace
│   │   │
│   │   └── employee/
│   │       ├── page.tsx              # Employee dashboard
│   │       ├── jobs/
│   │       │   ├── page.tsx          # Job listing manager
│   │       │   ├── new/
│   │       │   │   └── page.tsx      # Create job listing
│   │       │   └── [id]/
│   │       │       └── edit/
│   │       │           └── page.tsx  # Edit job listing
│   │       └── applications/
│   │           └── page.tsx          # Application review panel
│   │
│   ├── api/
│   │   ├── applications/
│   │   │   ├── create/
│   │   │   │   └── route.ts          # Application submission API
│   │   │   └── [id]/
│   │   │       └── status/
│   │   │           └── route.ts      # Update application status
│   │   ├── tokens/
│   │   │   └── purchase/
│   │   │       └── route.ts          # Token purchase API
│   │   └── resumes/
│   │       └── [id]/
│   │           └── download/
│   │               └── route.ts      # Generate signed URL for resume
│   │
│   ├── layout.tsx                    # Root layout
│   └── page.tsx                      # Landing page
│
├── components/
│   ├── auth/
│   │   ├── AuthProvider.tsx          # Authentication context provider
│   │   ├── LegalDisclaimerModal.tsx  # Terms acceptance modal
│   │   └── RoleSelectionModal.tsx    # Role selection modal
│   │
│   ├── dashboard/
│   │   ├── job-seeker/
│   │   │   ├── ApplicationCard.tsx   # Application status card
│   │   │   ├── ApplicationList.tsx   # List of applications
│   │   │   ├── JobCard.tsx           # Job listing card
│   │   │   ├── JobMarketplace.tsx    # Marketplace component
│   │   │   ├── TokenBadge.tsx        # Token balance display
│   │   │   └── TokenPurchaseModal.tsx # Token purchase modal
│   │   │
│   │   └── employee/
│   │       ├── ApplicationReviewPanel.tsx  # Application review UI
│   │       ├── ApplicationDetailsModal.tsx # Application details
│   │       ├── JobListingCard.tsx    # Job listing card
│   │       ├── JobListingForm.tsx    # Job creation/edit form
│   │       ├── ResumeViewer.tsx      # Resume download component
│   │       └── StatsCard.tsx         # Dashboard statistics
│   │
│   ├── ui/
│   │   ├── button.tsx                # Shadcn button component
│   │   ├── card.tsx                  # Shadcn card component
│   │   ├── dialog.tsx                # Shadcn dialog component
│   │   ├── form.tsx                  # Shadcn form components
│   │   ├── input.tsx                 # Shadcn input component
│   │   ├── badge.tsx                 # Shadcn badge component
│   │   └── ...                       # Other Shadcn components
│   │
│   └── shared/
│       ├── Navigation.tsx            # Main navigation component
│       ├── StatusBadge.tsx           # Application status badge
│       └── LoadingSpinner.tsx        # Loading indicator
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Supabase client (browser)
│   │   ├── server.ts                 # Supabase client (server)
│   │   └── middleware.ts             # Supabase middleware helpers
│   │
│   ├── actions/
│   │   ├── applications.ts           # Server actions for applications
│   │   ├── jobs.ts                   # Server actions for jobs
│   │   ├── tokens.ts                 # Server actions for tokens
│   │   └── profile.ts                # Server actions for profile
│   │
│   ├── utils/
│   │   ├── validation.ts             # Input validation utilities
│   │   ├── formatting.ts             # Data formatting utilities
│   │   └── constants.ts              # Application constants
│   │
│   └── types/
│       ├── database.ts               # Database type definitions
│       └── application.ts            # Application type definitions
│
├── middleware.ts                     # Next.js middleware (auth protection)
│
└── __tests__/
    ├── unit/
    │   ├── components/               # Component unit tests
    │   ├── actions/                  # Server action unit tests
    │   └── utils/                    # Utility function unit tests
    │
    ├── properties/
    │   ├── token-system.test.ts      # Token system property tests
    │   ├── applications.test.ts      # Application property tests
    │   ├── security.test.ts          # Security property tests
    │   └── auth.test.ts              # Authentication property tests
    │
    └── integration/
        ├── application-flow.test.ts  # End-to-end application flow
        ├── job-listing.test.ts       # Job listing integration tests
        └── resume-access.test.ts     # Resume access integration tests
```

## Implementation Notes

### Key Technical Decisions

**Server Components by Default:**
- Use React Server Components for data fetching and rendering
- Client components only when interactivity is required
- Reduces JavaScript bundle size and improves performance

**Server Actions for Mutations:**
- Use Next.js Server Actions for data mutations
- Provides type-safe API without separate API routes
- Simplifies error handling and loading states

**Atomic Transactions:**
- Critical for token deduction + application creation
- Use Supabase transactions or database-level constraints
- Ensure data consistency even under failure conditions

**Signed URLs for Resume Access:**
- Generate time-limited signed URLs (e.g., 1 hour expiration)
- Prevents unauthorized access via URL sharing
- Regenerate URLs as needed for legitimate access

**Row Level Security:**
- Enforce all access control at database level
- Prevents data leakage even if application logic has bugs
- Simplifies security auditing and compliance

### Performance Considerations

**Database Indexing:**
- Index foreign keys (employee_id, job_seeker_id, job_id)
- Index frequently queried fields (status, created_at)
- Composite index on (job_id, job_seeker_id) for duplicate prevention

**Caching Strategy:**
- Cache job listings with short TTL (5 minutes)
- Cache user profile data for session duration
- Invalidate cache on data mutations

**File Upload Optimization:**
- Client-side file size validation before upload
- Progress indicators for large file uploads
- Compress files if possible before upload

**Query Optimization:**
- Use pagination for large result sets
- Limit query results (e.g., 50 jobs per page)
- Use database views for complex queries

### Security Considerations

**Authentication:**
- Use Supabase Auth for secure OAuth implementation
- Implement CSRF protection via Supabase middleware
- Secure session storage with httpOnly cookies

**Authorization:**
- RLS policies as primary authorization mechanism
- Server-side validation of all user actions
- Never trust client-side data

**Data Protection:**
- Encrypt sensitive data at rest (handled by Supabase)
- Use HTTPS for all communications
- Sanitize user inputs to prevent XSS attacks

**File Security:**
- Validate file types and sizes server-side
- Scan uploaded files for malware (future enhancement)
- Use private storage buckets with signed URLs

### Scalability Considerations

**Database:**
- PostgreSQL can handle thousands of concurrent users
- Connection pooling via Supabase
- Vertical scaling available through Supabase plans

**Storage:**
- Supabase Storage scales automatically
- CDN distribution for static assets
- File size limits prevent storage abuse

**Serverless Functions:**
- Next.js API routes scale automatically on Vercel
- Cold start optimization through edge functions
- Rate limiting to prevent abuse

**Future Enhancements:**
- Implement caching layer (Redis) for high-traffic scenarios
- Add read replicas for database scaling
- Implement queue system for async processing
