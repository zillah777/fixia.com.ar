# FIXIA DATABASE QUICK REFERENCE GUIDE
**Date:** November 1, 2025
**Purpose:** Fast lookup for database structure and fields

---

## TABLE STRUCTURE AT A GLANCE

### Core User Tables
```
users (34 fields)
├── id: UUID
├── email: String (UNIQUE)
├── password_hash: String
├── name: String
├── user_type: Enum(client, professional, dual)
├── verified: Boolean
├── email_verified: Boolean
├── subscription_status: String
├── subscription_type: String
├── is_professional_active: Boolean
└── [30 more fields for profile, social, notifications, preferences]

professional_profiles (13 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── bio: String
├── specialties: String[]
├── years_experience: Int
├── level: Enum(Nuevo, ProfesionalVerificado, TopRatedPlus, TecnicoCertificado)
├── rating: Float
├── review_count: Int
├── availability_status: Enum(available, busy, unavailable)
└── response_time_hours: Int
```

### Marketplace Tables
```
categories (8 fields)
├── id: UUID
├── name: String (UNIQUE)
├── slug: String (UNIQUE)
├── description: String
├── icon: String
├── popular: Boolean
└── service_count: Int

services (17 fields)
├── id: UUID
├── professional_id: UUID (FOREIGN KEY → users)
├── category_id: UUID (FOREIGN KEY → categories)
├── title: String
├── description: String
├── price: Float
├── currency: String (default: "ARS")
├── main_image: String
├── gallery: String[]
├── tags: String[]
├── delivery_time_days: Int
├── revisions_included: Int
├── active: Boolean
├── featured: Boolean
└── view_count: Int

projects (14 fields)
├── id: UUID
├── client_id: UUID (FOREIGN KEY → users)
├── category_id: UUID (FOREIGN KEY → categories)
├── title: String
├── description: String
├── budget_min: Decimal(12,2)
├── budget_max: Decimal(12,2)
├── deadline: DateTime
├── status: Enum(open, in_progress, completed, cancelled)
├── location: String
├── skills_required: String[]
├── proposals_count: Int
└── [created_at, updated_at]

proposals (9 fields)
├── id: UUID
├── project_id: UUID (FOREIGN KEY → projects)
├── professional_id: UUID (FOREIGN KEY → users)
├── message: String
├── quoted_price: Decimal(12,2)
├── delivery_time_days: Int
├── status: Enum(pending, accepted, rejected, withdrawn)
└── [created_at, updated_at]
```

### Work Management Tables
```
jobs (16 fields)
├── id: UUID
├── project_id: UUID (FOREIGN KEY → projects, UNIQUE)
├── client_id: UUID (FOREIGN KEY → users)
├── professional_id: UUID (FOREIGN KEY → users)
├── proposal_id: UUID (FOREIGN KEY → proposals, UNIQUE)
├── title: String
├── description: String
├── agreed_price: Decimal(12,2)
├── currency: String
├── delivery_date: DateTime
├── progress_percentage: Int (0-100)
├── started_at: DateTime
├── completed_at: DateTime
├── status: Enum(not_started, in_progress, milestone_review, completed, cancelled, disputed)
└── [created_at, updated_at]

job_milestones (11 fields)
├── id: UUID
├── job_id: UUID (FOREIGN KEY → jobs)
├── title: String
├── description: String
├── amount: Decimal(12,2)
├── due_date: DateTime
├── completed: Boolean
├── completed_at: DateTime
├── approved_by_client: Boolean
├── approved_at: DateTime
└── created_at: DateTime

job_status_updates (7 fields)
├── id: UUID
├── job_id: UUID (FOREIGN KEY → jobs)
├── message: String
├── updated_by_user_id: UUID (FOREIGN KEY → users)
├── status_from: Enum(JobStatus)
├── status_to: Enum(JobStatus)
└── created_at: DateTime
```

### Payment Tables
```
payments (27 fields)
├── id: UUID
├── job_id: UUID (FOREIGN KEY → jobs)
├── service_id: UUID (FOREIGN KEY → services)
├── amount: Decimal(12,2)
├── currency: String
├── payment_method: String
├── user_id: UUID (FOREIGN KEY → users) - Payer
├── professional_id: UUID (FOREIGN KEY → users) - Payee
├── status: Enum(pending, approved, authorized, in_process, in_mediation, rejected, cancelled, refunded, charged_back, paid, released, disputed)
├── mp_payment_id: String (UNIQUE) - MercadoPago ID
├── mp_preference_id: String
├── external_reference: String (UNIQUE)
├── paid_at: DateTime
├── released_at: DateTime
├── refunded_at: DateTime
├── platform_fee: Decimal(12,2)
├── professional_amount: Decimal(12,2)
├── transaction_data: Json
└── [6 more fields + created_at, updated_at]

payment_preferences (22 fields)
├── id: UUID
├── mp_preference_id: String (UNIQUE)
├── amount: Decimal(12,2)
├── currency: String
├── user_id: UUID (FOREIGN KEY → users)
├── professional_id: UUID (FOREIGN KEY → users)
├── job_id: UUID (FOREIGN KEY → jobs)
├── service_id: UUID (FOREIGN KEY → services)
├── init_point: String
├── sandbox_init_point: String
├── success_url: String
├── failure_url: String
├── used: Boolean
├── used_at: DateTime
└── [8 more fields + created_at, updated_at]
```

### Review & Trust Tables
```
reviews (19 fields)
├── id: UUID
├── service_id: UUID (FOREIGN KEY → services)
├── reviewer_id: UUID (FOREIGN KEY → users)
├── professional_id: UUID (FOREIGN KEY → users)
├── rating: Int (1-5)
├── comment: String
├── verified_purchase: Boolean
├── job_id: UUID (FOREIGN KEY → jobs)
├── moderation_status: Enum(pending, approved, rejected, flagged, spam)
├── moderated_by: UUID (FOREIGN KEY → users)
├── moderated_at: DateTime
├── flagged_count: Int
├── trust_score: Float
├── communication_rating: Int
├── quality_rating: Int
├── timeliness_rating: Int
├── professionalism_rating: Int
├── helpful_count: Int
└── [created_at, updated_at]

trust_scores (19 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users, UNIQUE)
├── overall_score: Float (0-100)
├── review_score: Float
├── completion_score: Float
├── communication_score: Float
├── reliability_score: Float
├── verification_score: Float
├── total_jobs_completed: Int
├── average_rating: Float
├── response_time_hours: Float
├── completion_rate: Float
├── verified_identity: Boolean
├── verified_skills: Boolean
├── verified_business: Boolean
├── background_checked: Boolean
└── [4 more fields + created_at, updated_at]

review_helpful_votes (5 fields)
├── id: UUID
├── review_id: UUID (FOREIGN KEY → reviews)
├── user_id: UUID (FOREIGN KEY → users)
├── is_helpful: Boolean
└── created_at: DateTime

review_flags (9 fields)
├── id: UUID
├── review_id: UUID (FOREIGN KEY → reviews)
├── flagger_id: UUID (FOREIGN KEY → users)
├── reason: Enum(inappropriate_language, fake_review, spam, harassment, irrelevant, personal_information, other)
├── description: String
├── resolved: Boolean
├── resolved_by: UUID (FOREIGN KEY → users)
├── resolved_at: DateTime
└── created_at: DateTime
```

### Communication Tables
```
conversations (8 fields)
├── id: UUID
├── project_id: UUID (FOREIGN KEY → projects, UNIQUE)
├── client_id: UUID (FOREIGN KEY → users)
├── professional_id: UUID (FOREIGN KEY → users)
├── whatsapp_chat_url: String
├── status: Enum(active, archived)
├── last_message_at: DateTime
└── created_at: DateTime

contact_interactions (12 fields)
├── id: UUID
├── client_id: UUID (FOREIGN KEY → users)
├── professional_id: UUID (FOREIGN KEY → users)
├── service_id: UUID (FOREIGN KEY → services)
├── project_id: UUID (FOREIGN KEY → projects)
├── contact_method: String
├── message: String
├── contact_data: Json
├── converted_to_job: Boolean
├── job_id: String
├── conversion_value: Decimal(12,2)
└── created_at: DateTime

notifications (8 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── type: Enum(new_project, proposal_received, review_received, message, system, job_started, job_milestone, job_completed, payment_received)
├── title: String
├── message: String
├── read: Boolean
├── action_url: String
└── created_at: DateTime
```

### Verification & Security Tables
```
verification_requests (12 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── verification_type: Enum(identity, skills, business, background_check, phone, email, address)
├── status: Enum(pending, approved, rejected, expired, cancelled)
├── documents: String[]
├── additional_info: Json
├── reviewed_by: UUID (FOREIGN KEY → users)
├── reviewed_at: DateTime
├── rejection_reason: String
├── notes: String
└── [created_at, updated_at]

password_reset_tokens (6 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── token: String (UNIQUE)
├── expires_at: DateTime
├── used: Boolean
└── created_at: DateTime

email_verification_tokens (6 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── token: String (UNIQUE)
├── expires_at: DateTime
├── used: Boolean
└── created_at: DateTime

password_history (4 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── password_hash: String
└── created_at: DateTime
```

### System & Operational Tables
```
user_sessions (7 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── refresh_token: String
├── expires_at: DateTime
├── ip_address: String
├── user_agent: String
└── created_at: DateTime

user_activity (7 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── action: String
├── resource_type: String
├── resource_id: String
├── metadata: Json
└── created_at: DateTime

service_views (6 fields)
├── id: UUID
├── service_id: UUID (FOREIGN KEY → services)
├── viewer_id: UUID (FOREIGN KEY → users)
├── ip_address: String
├── user_agent: String
└── viewed_at: DateTime

favorites (5 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── service_id: UUID (FOREIGN KEY → services)
├── professional_id: UUID (FOREIGN KEY → users)
└── created_at: DateTime

feedbacks (10 fields)
├── id: UUID
├── from_user_id: UUID (FOREIGN KEY → users)
├── to_user_id: UUID (FOREIGN KEY → users)
├── comment: String
├── has_like: Boolean
├── job_id: UUID (FOREIGN KEY → jobs)
├── service_id: UUID (FOREIGN KEY → services)
├── to_user_role: String
└── [created_at, updated_at]

role_trust_scores (8 fields)
├── id: UUID
├── user_id: UUID (FOREIGN KEY → users)
├── role: String (client/professional)
├── total_likes: Int
├── total_feedback: Int
├── trust_percentage: Float
├── last_calculated_at: DateTime
└── [created_at, updated_at]

review_templates (7 fields)
├── id: UUID
├── category: String
├── title: String
├── description: String
├── questions: Json
├── active: Boolean
└── created_at: DateTime
```

---

## ENUM REFERENCE

```
UserType: client, professional, dual
ProfessionalLevel: Nuevo, ProfesionalVerificado, TopRatedPlus, TecnicoCertificado
AvailabilityStatus: available, busy, unavailable
ProjectStatus: open, in_progress, completed, cancelled
ProposalStatus: pending, accepted, rejected, withdrawn
JobStatus: not_started, in_progress, milestone_review, completed, cancelled, disputed
PaymentStatus: pending, approved, authorized, in_process, in_mediation, rejected, cancelled, refunded, charged_back, paid, released, disputed
ReviewModerationStatus: pending, approved, rejected, flagged, spam
ReviewFlagReason: inappropriate_language, fake_review, spam, harassment, irrelevant, personal_information, other
VerificationType: identity, skills, business, background_check, phone, email, address
VerificationStatus: pending, approved, rejected, expired, cancelled
ConversationStatus: active, archived
NotificationType: new_project, proposal_received, review_received, message, system, job_started, job_milestone, job_completed, payment_received
```

---

## MOST IMPORTANT QUERIES

### Get Professional Profile
```sql
SELECT u.*, pp.* FROM users u
LEFT JOIN professional_profiles pp ON u.id = pp.user_id
WHERE u.id = $1;
```

### Get Service with Professional Info
```sql
SELECT s.*, pp.rating, pp.review_count
FROM services s
LEFT JOIN professional_profiles pp ON s.professional_id = pp.user_id
WHERE s.id = $1;
```

### Get Project with Proposals
```sql
SELECT p.*, array_agg(pr.*) as proposals
FROM projects p
LEFT JOIN proposals pr ON p.id = pr.project_id
WHERE p.id = $1
GROUP BY p.id;
```

### Get Job with Milestones
```sql
SELECT j.*, array_agg(jm.*) as milestones
FROM jobs j
LEFT JOIN job_milestones jm ON j.id = jm.job_id
WHERE j.id = $1
GROUP BY j.id;
```

### Get User Trust Score
```sql
SELECT u.*, ts.overall_score, ts.review_score, ts.completion_score
FROM users u
LEFT JOIN trust_scores ts ON u.id = ts.user_id
WHERE u.id = $1;
```

### Get User Notifications
```sql
SELECT * FROM notifications
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 50;
```

### Get User Activity Log
```sql
SELECT * FROM user_activity
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 100;
```

### Get Professional Rankings
```sql
SELECT u.id, u.name, COUNT(r.id) as reviews, AVG(r.rating)::float as avg_rating
FROM users u
LEFT JOIN reviews r ON u.id = r.professional_id
WHERE u.user_type IN ('professional', 'dual')
GROUP BY u.id, u.name
ORDER BY avg_rating DESC, COUNT(r.id) DESC
LIMIT 20;
```

---

## INDEX QUICK LOOKUP

| Table | Key Indexes |
|-------|-------------|
| users | email (UNIQUE), user_type, location, verified, subscription_status |
| professional_profiles | user_id (UNIQUE), rating, level |
| services | professional_id, category_id, price, active, featured |
| projects | client_id, category_id, status, budget_min/max |
| jobs | client_id, professional_id, status, created_at |
| payments | job_id, service_id, user_id, professional_id, status, mp_payment_id |
| reviews | professional_id, service_id, rating, moderation_status |
| notifications | user_id (no other indexes needed) |
| verification_requests | user_id, status, verification_type |

---

## CONSTRAINT QUICK LOOKUP

| Table | Unique Constraints |
|-------|-------------------|
| users | email, phone |
| proposals | project_id + professional_id |
| payment_preferences | mp_preference_id |
| payments | transaction_id, mp_payment_id, external_reference |
| review_helpful_votes | review_id + user_id |
| review_flags | review_id + flagger_id |
| favorites | user_id + service_id, user_id + professional_id |
| feedbacks | from_user_id + to_user_id + job_id |
| role_trust_scores | user_id + role |

---

## COMMON OPERATIONS

### Create User with Profile
```typescript
const user = await prisma.user.create({
  data: {
    email, password_hash, name, user_type,
    professional_profile: {
      create: {
        bio, specialties, years_experience,
        level: 'Nuevo'
      }
    }
  },
  include: { professional_profile: true }
});
```

### Create Job from Proposal
```typescript
const job = await prisma.job.create({
  data: {
    project_id, client_id, professional_id,
    proposal_id, title, description,
    agreed_price, currency: 'ARS',
    status: 'not_started'
  }
});
```

### Create Payment
```typescript
const payment = await prisma.payment.create({
  data: {
    job_id, service_id,
    user_id: payer_id,
    professional_id: payee_id,
    amount, currency,
    mp_payment_id, status: 'pending'
  }
});
```

### Create Notification
```typescript
const notification = await prisma.notification.create({
  data: {
    user_id,
    type: 'proposal_received',
    title: 'Nueva propuesta',
    message: `${proposer_name} ha enviado una propuesta`,
    action_url: `/projects/${project_id}`
  }
});
```

---

## QUICK STATS

- **Total Tables:** 29
- **Total Fields:** 230+
- **Total Indexes:** 89
- **Enum Types:** 12
- **Foreign Keys:** 78
- **Unique Constraints:** 9
- **Migrations:** 5 (all applied)

---

**Last Updated:** November 1, 2025
**Database Status:** ✅ PRODUCTION READY
