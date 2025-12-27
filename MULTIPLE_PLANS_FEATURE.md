# Multiple Training Plans Feature

## Overview

The SaddleUp backend now supports:
- **Multiple training plans per user** (removed unique constraint)
- **Horse assignment to plans** (up to 20 horses per plan)
- **Plan management** (create, read, update, delete)
- **Horse assignment management** (add/remove horses from plans)

## Database Schema Changes

### TrainingPlan Model Updates

**Removed:**
- `userId @unique` constraint → Changed to allow multiple plans per user

**Added:**
- `name: String?` - Optional plan name
- `description: String?` - Optional plan description
- `isActive: Boolean @default(true)` - Active/archived flag
- `planHorses: PlanHorse[]` - Relation to assigned horses

### New PlanHorse Model (Junction Table)

```prisma
model PlanHorse {
  id              String       @id @default(cuid())
  planId          String
  trainingPlan    TrainingPlan @relation(fields: [planId], references: [id], onDelete: Cascade)
  horseId         String
  horse           Horse        @relation(fields: [horseId], references: [id], onDelete: Cascade)
  assignedAt      DateTime     @default(now())
  isActive        Boolean      @default(true)

  @@unique([planId, horseId])
  @@index([planId])
  @@index([horseId])
}
```

### User Model Update

**Changed:**
- `trainingPlan: TrainingPlan?` → `trainingPlans: TrainingPlan[]` (one-to-many)

### Horse Model Update

**Added:**
- `planHorses: PlanHorse[]` - Relation to plans this horse is assigned to

## API Endpoints

### Training Plans

#### 1. Create New Training Plan
**POST** `/api/training/generate-plan`

**Request Body:**
```json
{
  "name": "Optional plan name",
  "description": "Optional description",
  "horseIds": ["horse-id-1", "horse-id-2"] // Optional, max 20 horses
}
```

**Response:** Complete plan with lessons and assigned horses

**Changes:**
- Removed "plan already exists" check
- Can create multiple plans
- Optionally assign horses during creation (max 20)

#### 2. Get All Training Plans
**GET** `/api/training/plans?isActive=true`

**Query Parameters:**
- `isActive` (optional): Filter by active status

**Response:** Array of plans with lesson counts and assigned horses

#### 3. Get Single Training Plan
**GET** `/api/training/plan/:planId`

**Response:** Complete plan with lessons and assigned horses

#### 4. Get Active Plan (Backward Compatibility)
**GET** `/api/training/plan`

**Response:** Most recent active plan (maintains backward compatibility)

#### 5. Update Training Plan
**PATCH** `/api/training/plan/:planId`

**Request Body:**
```json
{
  "name": "Updated plan name",
  "description": "Updated description",
  "isActive": true,
  "currentPhase": 2,
  "currentModule": 3
}
```

**Response:** Updated plan

#### 6. Delete Training Plan
**DELETE** `/api/training/plan/:planId`

**Response:** Success message

**Note:** Cascades to delete all lessons and plan-horse assignments

### Horse Assignment

#### 7. Assign Horses to Plan
**POST** `/api/training/plan/:planId/horses`

**Request Body:**
```json
{
  "horseIds": ["horse-id-1", "horse-id-2", ...] // Max 20 horses
}
```

**Response:** Updated plan with assigned horses

**Note:** Replaces all existing assignments (removes old, adds new)

#### 8. Add Single Horse to Plan
**POST** `/api/training/plan/:planId/horses/:horseId`

**Response:** Updated plan with assigned horses

**Note:** Adds horse if not already assigned (checks 20 horse limit)

#### 9. Remove Horse from Plan
**DELETE** `/api/training/plan/:planId/horses/:horseId`

**Response:** Success message

### Updated Endpoints

#### Lesson Endpoints (Updated for Multiple Plans)

**GET** `/api/training/lesson/:lessonId?planId=plan-id`
- Optional `planId` query parameter
- If not provided, uses most recent active plan (backward compatibility)

**PATCH** `/api/training/lesson/:lessonId/complete`
- Request body can include `planId`
- If not provided, uses most recent active plan

**GET** `/api/training/suggested-questions?planId=plan-id`
- Optional `planId` query parameter

## Backward Compatibility

All existing endpoints maintain backward compatibility:
- `/api/training/plan` (GET) - Returns most recent active plan
- Lesson endpoints work with active plan if `planId` not provided
- User profile includes `trainingPlans[0]` for backward compatibility

## Migration Notes

1. **Run Prisma migration:**
   ```bash
   cd backend
   npx prisma migrate dev --name add_multiple_plans
   ```

2. **Update frontend:**
   - Update API calls to use new endpoints
   - Handle multiple plans in UI
   - Add plan selection UI
   - Add horse assignment UI

## Example Usage

### Create a plan with horses:
```javascript
POST /api/training/generate-plan
{
  "name": "Foundation Training for My Horses",
  "description": "Basic training plan for my three horses",
  "horseIds": ["horse-1", "horse-2", "horse-3"]
}
```

### List all plans:
```javascript
GET /api/training/plans
```

### Assign more horses to existing plan:
```javascript
POST /api/training/plan/plan-id/horses
{
  "horseIds": ["horse-1", "horse-2", ..., "horse-20"] // Up to 20
}
```

### Update plan details:
```javascript
PATCH /api/training/plan/plan-id
{
  "name": "Updated Plan Name",
  "isActive": true
}
```

## Frontend Integration Notes

When updating the frontend:
1. Replace single plan references with plan arrays
2. Add plan selection UI (dropdown/modal)
3. Add horse assignment UI (checkboxes, max 20)
4. Update dashboard to show multiple plans
5. Add plan management screens (create, edit, delete)
