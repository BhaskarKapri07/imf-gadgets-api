# IMF Gadget API

A secure API for managing IMF gadgets with status tracking, self-destruct capabilities, and JWT authentication.

## Features

- Complete gadget lifecycle management
- Status transition validation
- Soft delete (decommissioning)
- Self-destruct sequence with confirmation codes
- JWT authentication
- Random mission success probability generation
- Unique codename generation
- Comprehensive testing
- Swagger API documentation

## Technology Stack

- Node.js
- TypeScript
- Express
- PostgreSQL
- Prisma ORM
- Jest (testing)
- Swagger (documentation)

## Setup Instructions

### Prerequisites

- Node.js (v16+)
- PostgreSQL (v13+)
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd imf-gadget-api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Create a .env file with the following variables:
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/imf_gadgets"
JWT_SECRET="your-secret-key"
```

4. Setup database
   - Create a PostgreSQL database named `imf_gadgets`
   - Update the DATABASE_URL in your .env file with your credentials

5. Run database migrations
```bash
npx prisma migrate dev
```

6. Start the development server
```bash
npm run dev
```

## API Documentation

Once the server is running, access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

### Authentication

The API uses JWT tokens for authentication. To get a token:

```
GET /auth/token
```

**Note:** For this assignment, a simplified authentication to focus on the gadget management functionality is used. Instead of implementing a full user registration/login flow, a simple endpoint that generates valid JWT tokens is provided. In a production environment, proper user authentication would be implemented.

## API Usage

### Gadget Lifecycle

Gadgets follow a specific lifecycle with controlled status transitions:

1. **Creation**: Gadgets are created with status `AVAILABLE`
2. **Deployment**: `AVAILABLE` gadgets can be `DEPLOYED`
3. **Return**: `DEPLOYED` gadgets can return to `AVAILABLE`
4. **Destruction**: Only `DEPLOYED` gadgets can be `DESTROYED` (requires confirmation)
5. **Decommission**: Only `AVAILABLE` gadgets can be `DECOMMISSIONED`

These rules ensure logical consistency (e.g., destroyed gadgets cannot be reactivated).

### Key Endpoints

- `GET /gadgets` - List all gadgets with random success probabilities
- `GET /gadgets?status={status}` - Filter gadgets by status
- `POST /gadgets` - Create a new gadget (auto-generates unique codename)
- `PATCH /gadgets/{id}` - Update gadget information (validates status transitions)
- `DELETE /gadgets/{id}` - Decommission a gadget (soft delete)
- `POST /gadgets/{id}/self-destruct` - Initiate self-destruct sequence
- `POST /gadgets/{id}/self-destruct/confirm` - Complete self-destruct with confirmation code

## Testing

The project includes comprehensive unit and integration tests.

```bash
# Run all tests
npm test

# Run specific test files
npm test -- gadget.test.ts
```

## Design Decisions

### Simplified Authentication
A token-only authentication system is implemented to focus on the core gadget management functionality while still demonstrating JWT security. This approach provides necessary security without the complexity of user management.

### Status Transitions
Status transitions are strictly controlled to maintain data integrity:
- AVAILABLE → DEPLOYED or DECOMMISSIONED
- DEPLOYED → AVAILABLE or DESTROYED
- DESTROYED → No further transitions allowed
- DECOMMISSIONED → No further transitions allowed

### Self-Destruct Mechanism
The two-step self-destruct process with confirmation codes follows security best practices:
1. Request generates a temporary 6-character code (valid for 5 minutes)
2. Confirmation requires the exact code to execute
3. Only deployed gadgets can self-destruct

### Soft Delete
We implement decommissioning as a soft delete because:
1. Maintains historical record of all gadgets
2. Supports audit requirements
3. Prevents accidental data loss
4. Allows for reporting on decommissioned gadgets

### Mission Success Probability
Probabilities are dynamically calculated on retrieval rather than stored:
1. Ensures fresh assessment for each mission
2. Ranges from 30-95% (never 100% as no mission is guaranteed)
3. Changes with each retrieval to reflect varying conditions

