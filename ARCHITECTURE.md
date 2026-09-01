# Architecture: MERN Role-Based Modular CRM

## 1. Monorepo/Project Structure
We will use a monorepo approach with separate directories for `frontend` and `backend` to keep the codebase unified but decoupled in deployment.

```text
/
├── backend/
│   ├── src/
│   │   ├── config/       # Environment, Database configs
│   │   ├── controllers/  # Route handlers
│   │   ├── middlewares/  # Auth, Error handling, RBAC
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API route definitions
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helpers
│   │   └── index.js      # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── assets/       # Images, global styles
│   │   ├── components/   # Reusable UI components
│   │   ├── contexts/     # React context (Auth)
│   │   ├── hooks/        # Custom hooks
│   │   ├── layouts/      # Dashboard layouts (Admin vs Manager)
│   │   ├── pages/        # Route pages
│   │   ├── services/     # API client (Axios)
│   │   ├── utils/        # Helper functions
│   │   ├── App.jsx       # Root component
│   │   ├── index.css     # Global styles and variables
│   │   └── main.jsx      # Entry point
│   ├── package.json
│   └── .env.example
└── README.md
```

## 2. Frontend Architecture
- **Framework**: React (Vite for fast build and optimal developer experience).
- **State Management**: React Context API for Auth and global state (e.g., active modules). Local state for component-specific data.
- **Routing**: React Router DOM v6.
- **Styling**: Vanilla CSS utilizing CSS variables (custom properties) to establish a design system for a premium SaaS dashboard aesthetic without external utility libraries, ensuring total flexibility.
- **API Client**: Fetch API or Axios with interceptors for attaching JWT tokens and handling 401/403 errors globally.

## 3. Backend Architecture
- **Framework**: Express.js on Node.js.
- **Design Pattern**: MVC-like architecture (Routes -> Controllers -> Services -> Models) ensuring a clear separation of concerns.
- **Database**: MongoDB with Mongoose ODM.
- **Security**: Helmet for HTTP headers, CORS, express-rate-limit for abuse prevention, and secure JWT-based authentication.

## 4. MongoDB/Mongoose Schemas
Schemas will represent Users (Admins, Managers) and Modules. A generic schema will handle dummy data for dynamic modules.

### User Schema
```javascript
{
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Hashed securely via bcrypt
  role: { type: String, enum: ['ADMIN', 'MANAGER'], required: true },
  assignedModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }] // Present for MANAGERS
}
```

### Module Schema
```javascript
{
  name: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true }, // e.g., 'sales'
  description: { type: String },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Dummy Data Schema (Generic for dynamic modules)
```javascript
{
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }, // Flexible JSON for dynamic CRUD
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
}
```

## 5. Authentication Architecture
- **Method**: JSON Web Tokens (JWT).
- **Flow**: User authenticates via separate login endpoints -> Server validates credentials -> Issues JWT -> Client stores JWT.
- **Passwords**: Hashed before persistence using `bcrypt`.
- **Security**: Strict validation on login; separate portals ensure distinct entry points and security perimeters for admins vs managers.

## 6. RBAC (Role-Based Access Control) Architecture
- **Admin**: Has overarching global access. Bypasses module-specific restrictions to manage system configuration, users, and overall schemas.
- **Manager**: Access is strictly sandboxed to their `assignedModules`.
- **Middleware**: `requireAuth` (verifies JWT presence and validity), `requireRole(roles)` (restricts route access to specified roles).

## 7. Module-Permission Architecture
- Modules are stored as documents in the `modules` collection.
- Admin UI interfaces with the backend to perform CRUD operations on `modules`.
- Newly created modules are automatically queryable and assignable to Managers without any code changes or redeployments.
- **Backend Enforcement**: When a Manager attempts to fetch/create dummy data for a `moduleId`, a permission middleware inspects `req.user.assignedModules`. If the ID is missing, the backend strictly returns a `403 Forbidden`.
- **Frontend Enforcement**: Upon login, the API returns the user's allowed modules. The frontend dynamically populates the sidebar navigation based entirely on this authoritative list.

## 8. API Routes

### Auth Routes
- `POST /api/auth/admin/login`
- `POST /api/auth/manager/login`
- `GET /api/auth/me` (Fetch current user context and permissions)

### Admin Routes (Protected: Admin only)
- `GET/POST/PUT/DELETE /api/admin/managers` (Manage manager accounts)
- `GET/POST/PUT/DELETE /api/admin/modules` (Manage dynamic modules)
- `PUT /api/admin/managers/:id/permissions` (Assign modules to managers)

### Module Data Routes (Protected: Admin or Assigned Manager)
- `GET /api/modules` (List active modules the user has access to)
- `GET /api/modules/:slug/data`
- `POST /api/modules/:slug/data`
- `PUT /api/modules/:slug/data/:id`
- `DELETE /api/modules/:slug/data/:id`

## 9. Frontend Routing
```text
/                 -> Redirects appropriately to login based on intended access or current session
/admin/login      -> Dedicated Admin Login View
/manager/login    -> Dedicated Manager Login View

/admin/*          -> Protected Admin Application Layout
  /admin/dashboard
  /admin/managers
  /admin/modules

/manager/*        -> Protected Manager Application Layout
  /manager/dashboard
  /manager/m/:slug  -> Dynamic module view (e.g., /manager/m/sales, /manager/m/finance)
```

## 10. Reusable UI Components
- `Button`: Primary, secondary, danger variants; interactive hover states; disabled/loading states.
- `InputField`: Standardized text inputs, selects, and textareas with inline validation and error state styling.
- `Card`: Container for dashboard metrics, forms, and data blocks.
- `Modal`: Overlay for creation/editing interfaces to maintain user context.
- `DataTable`: Generic robust table supporting empty states, loading skeletons, pagination, and action menus.
- `SidebarNavigation`: Dynamic list rendering based on authenticated permissions.
- `PageLoader`/`Spinner`: Visual feedback for asynchronous operations.
- `EmptyState`/`ErrorState`: Graceful fallback UI for lack of data or authorization failures.

## 11. Error Handling Strategy
- **Backend**: A global error handling middleware captures all unhandled exceptions and promise rejections. It formats responses uniformly: `{ success: false, message: "...", code: "..." }`.
- **Frontend**: Interceptors manage 401 (triggering local session clear and redirect to login) and 403 (displaying unauthorized UI). Component-level try/catch blocks paired with Toast notifications handle transient API errors, ensuring the user is always informed.

## 12. Environment Variables

### Backend (`.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/crm?retryWrites=true&w=majority
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=1d
NODE_ENV=development
```

### Frontend (`.env`)
```env
VITE_API_URL=http://localhost:5000/api
```
