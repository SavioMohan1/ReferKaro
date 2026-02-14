# Requirements Document

## Introduction

ReferKaro is a two-sided marketplace platform that monetizes the referral attempt. Job Seekers pay for guaranteed referral attempts through a token-based system, while Employees earn money for making those referral attempts. The platform acts as an escrow system for both money and information, ensuring trust and transparency between parties.

The MVP focuses on core marketplace functionality: job listing creation, token-based applications, resume management, and application review workflows. Future enhancements will include automated verification systems and advanced trust mechanisms.

## Glossary

- **Job_Seeker**: A user who purchases tokens to apply for referral opportunities
- **Employee**: A user who creates job listings and reviews applications for referral
- **Token**: A digital credit that represents one application attempt (purchased by Job Seekers)
- **Application**: A referral request submitted by a Job Seeker to an Employee
- **Referral_Attempt**: The act of an Employee submitting a candidate's information to their company's hiring process
- **Job_Listing**: A referral opportunity posted by an Employee with company and role details
- **Resume_Storage**: Secure file storage system for candidate resumes
- **Application_Status**: The current state of an application (pending, accepted, rejected)
- **RLS**: Row Level Security policies that enforce data access rules at the database level
- **Atomic_Transaction**: A database operation that either completes fully or rolls back entirely

## Requirements

### Requirement 1: User Authentication and Onboarding

**User Story:** As a new user, I want to securely sign in and select my role, so that I can access the appropriate features for my needs.

#### Acceptance Criteria

1. WHEN a user visits the login page, THE System SHALL display a Google OAuth sign-in option
2. WHEN a user successfully authenticates via Google OAuth, THE System SHALL create or retrieve their profile from the database
3. WHEN a first-time user completes authentication, THE System SHALL prompt them to select a role (Job Seeker or Employee)
4. WHEN a user selects their role, THE System SHALL update their profile with the selected role
5. WHEN a user completes role selection, THE System SHALL redirect them to the appropriate dashboard
6. WHEN an authenticated user returns to the platform, THE System SHALL maintain their session and direct them to their dashboard

### Requirement 2: Legal Compliance and Terms Acceptance

**User Story:** As a platform operator, I want users to acknowledge legal terms, so that the platform has documented consent for liability and privacy policies.

#### Acceptance Criteria

1. WHEN a user logs in for the first time, THE System SHALL check if they have accepted terms
2. IF a user has not accepted terms, THEN THE System SHALL display a mandatory legal disclaimer modal
3. WHEN a user views the legal disclaimer, THE System SHALL present liability and privacy policy information
4. WHEN a user accepts the terms, THE System SHALL update their profile with acceptance status and timestamp
5. WHEN a user accepts the terms, THE System SHALL allow them to proceed to the platform
6. IF a user closes the modal without accepting, THEN THE System SHALL prevent access to platform features

### Requirement 3: Token Management System

**User Story:** As a Job Seeker, I want to purchase and manage tokens, so that I can apply for referral opportunities.

#### Acceptance Criteria

1. WHEN a new Job Seeker account is created, THE System SHALL initialize their token balance to 3
2. WHEN a Job Seeker views their dashboard, THE System SHALL display their current token balance
3. WHEN a Job Seeker clicks to purchase tokens, THE System SHALL display token package options
4. WHEN a Job Seeker selects a token package, THE System SHALL process the payment transaction
5. WHEN a payment is successful, THE System SHALL increment the Job Seeker's token balance by the purchased amount
6. WHEN a Job Seeker submits an application, THE System SHALL decrement their token balance by 1
7. IF a Job Seeker has zero tokens, THEN THE System SHALL prevent application submission and prompt token purchase

### Requirement 4: Job Listing Creation and Management

**User Story:** As an Employee, I want to create and manage job listings, so that Job Seekers can apply for referrals at my company.

#### Acceptance Criteria

1. WHEN an Employee accesses the job creation page, THE System SHALL display a form with fields for company, role title, description, and official job URL
2. WHEN an Employee submits a job listing with all required fields, THE System SHALL create the listing in the database
3. WHEN a job listing is created, THE System SHALL associate it with the Employee's user ID
4. WHEN an Employee views their dashboard, THE System SHALL display all their active job listings
5. WHEN an Employee clicks on a job listing, THE System SHALL display the full listing details
6. WHEN an Employee edits a job listing, THE System SHALL update the listing in the database
7. WHEN a job listing is saved, THE System SHALL validate that the job URL is a properly formatted URL

### Requirement 5: Job Marketplace Browsing and Search

**User Story:** As a Job Seeker, I want to browse and search job listings, so that I can find relevant referral opportunities.

#### Acceptance Criteria

1. WHEN a Job Seeker accesses the marketplace, THE System SHALL display all available job listings
2. WHEN job listings are displayed, THE System SHALL show company name, role title, and Employee information
3. WHEN a Job Seeker applies filters, THE System SHALL filter listings by company, role, or department
4. WHEN a Job Seeker searches for keywords, THE System SHALL return listings matching the search terms
5. WHEN a Job Seeker clicks on a job listing, THE System SHALL display the full listing details including description and official job URL
6. WHEN a Job Seeker views a job listing, THE System SHALL display a link to the official job posting for verification


### Requirement 6: Application Submission with Resume Upload

**User Story:** As a Job Seeker, I want to submit applications with my resume and profile information, so that Employees can review my qualifications for referral.

#### Acceptance Criteria

1. WHEN a Job Seeker clicks to apply for a job, THE System SHALL verify they have at least 1 token
2. IF a Job Seeker has insufficient tokens, THEN THE System SHALL prevent application submission and display a token purchase prompt
3. WHEN a Job Seeker submits an application, THE System SHALL require resume upload (PDF or DOCX format)
4. WHEN a Job Seeker submits an application, THE System SHALL accept optional LinkedIn URL, portfolio URL, and cover letter
5. WHEN a resume is uploaded, THE System SHALL store it securely in the Resume_Storage bucket
6. WHEN an application is submitted, THE System SHALL execute an Atomic_Transaction that deducts 1 token and creates the application record
7. IF the application creation fails, THEN THE System SHALL roll back the token deduction
8. WHEN an application is successfully created, THE System SHALL set its status to pending
9. WHEN a Job Seeker attempts to apply to the same job twice, THE System SHALL prevent duplicate application submission
10. WHEN an application is created, THE System SHALL record the application timestamp

### Requirement 7: Resume Security and Access Control

**User Story:** As a Job Seeker, I want my resume to be stored securely and only accessible to relevant parties, so that my personal information is protected.

#### Acceptance Criteria

1. WHEN a resume is uploaded, THE System SHALL store it in a private storage bucket
2. WHEN a Job Seeker uploads a resume, THE System SHALL associate the file with their user ID
3. WHEN a Job Seeker views their own applications, THE System SHALL allow them to download their resume
4. WHEN an Employee views an application to their job listing, THE System SHALL allow them to download the applicant's resume
5. WHEN a resume is accessed, THE System SHALL generate a signed URL with time-limited access
6. WHEN a user attempts to access a resume they don't own or isn't for their job listing, THE System SHALL deny access
7. WHEN a resume file is uploaded, THE System SHALL validate the file type is PDF or DOCX

### Requirement 8: Application Review and Status Management

**User Story:** As an Employee, I want to review applications and update their status, so that I can manage the referral process effectively.

#### Acceptance Criteria

1. WHEN an Employee accesses their dashboard, THE System SHALL display the count of pending applications
2. WHEN an Employee views their applications, THE System SHALL display all applications for their job listings
3. WHEN an Employee views an application, THE System SHALL display candidate details including LinkedIn URL, portfolio URL, and cover letter
4. WHEN an Employee views an application, THE System SHALL provide a secure link to download the candidate's resume
5. WHEN an Employee accepts an application, THE System SHALL update the Application_Status to accepted and record the review timestamp
6. WHEN an Employee rejects an application, THE System SHALL update the Application_Status to rejected and record the review timestamp
7. WHEN an application status is updated, THE System SHALL make the new status visible to the Job Seeker

### Requirement 9: Job Seeker Application Tracking

**User Story:** As a Job Seeker, I want to track the status of my applications, so that I know which referrals are being processed.

#### Acceptance Criteria

1. WHEN a Job Seeker accesses their dashboard, THE System SHALL display all their submitted applications
2. WHEN applications are displayed, THE System SHALL show the job title, company, and current Application_Status
3. WHEN a Job Seeker views an application, THE System SHALL display the application submission timestamp
4. WHEN an application status changes, THE System SHALL reflect the updated status in the Job Seeker's dashboard
5. WHEN a Job Seeker views an application, THE System SHALL provide a link to the original job posting

### Requirement 10: Employee Dashboard and Analytics

**User Story:** As an Employee, I want to view my earnings and referral statistics, so that I can track my performance on the platform.

#### Acceptance Criteria

1. WHEN an Employee accesses their dashboard, THE System SHALL display their total earnings
2. WHEN an Employee accesses their dashboard, THE System SHALL display the count of pending applications
3. WHEN an Employee accesses their dashboard, THE System SHALL display their referral success rate
4. WHEN an Employee accesses their dashboard, THE System SHALL display the total number of applications received
5. WHEN an Employee accesses their dashboard, THE System SHALL display the number of accepted applications
6. WHEN an Employee accesses their dashboard, THE System SHALL display the number of rejected applications

### Requirement 11: Data Security and Row Level Security

**User Story:** As a platform operator, I want to enforce data access rules at the database level, so that users can only access data they are authorized to view.

#### Acceptance Criteria

1. WHEN a user queries the profiles table, THE System SHALL only return their own profile data
2. WHEN a user updates the profiles table, THE System SHALL only allow updates to their own profile
3. WHEN a user queries the jobs table, THE System SHALL return all job listings for reading
4. WHEN an Employee creates a job listing, THE System SHALL only allow creation with their own user ID
5. WHEN an Employee updates a job listing, THE System SHALL only allow updates to their own listings
6. WHEN a Job Seeker creates an application, THE System SHALL only allow creation with their own user ID
7. WHEN a Job Seeker queries applications, THE System SHALL only return applications they created
8. WHEN an Employee queries applications, THE System SHALL only return applications for their job listings
9. WHEN RLS policies are evaluated, THE System SHALL enforce all access rules at the database level

### Requirement 12: Session Management and Authentication State

**User Story:** As a user, I want my login session to persist across page refreshes, so that I don't have to re-authenticate frequently.

#### Acceptance Criteria

1. WHEN a user successfully authenticates, THE System SHALL create a secure session
2. WHEN a user navigates between pages, THE System SHALL maintain their authentication state
3. WHEN a user refreshes the page, THE System SHALL preserve their session
4. WHEN a session expires, THE System SHALL redirect the user to the login page
5. WHEN a user logs out, THE System SHALL terminate their session and clear authentication state
6. WHEN an unauthenticated user attempts to access protected routes, THE System SHALL redirect them to the login page

## Out of Scope for MVP

The following features are explicitly excluded from the MVP scope:

1. **Mobile Applications**: Native iOS or Android apps (web interface is responsive but web-only)
2. **Social Networking Features**: User-to-user chat, activity feeds, friend connections, or messaging
3. **AI-Powered Matching**: Automated candidate-job matching algorithms or recommendation systems
4. **Automated Verification System**: Proxy email system for verifying successful referrals (planned for future release)
5. **Payment Processing**: Full payment gateway integration (token purchases are placeholder for MVP)
6. **Advanced Analytics**: Detailed reporting, data visualization, or business intelligence features
7. **Multi-Language Support**: Internationalization or localization features
8. **Email Notifications**: Automated email alerts for application status changes
9. **Real-Time Updates**: WebSocket-based live notifications (dashboard updates on page refresh)
10. **Advanced Search**: Full-text search, fuzzy matching, or complex query builders
