# RSC Admin Mission Control

Enterprise-grade admin system for RSC Chain built with Next.js, NestJS, and modern web technologies.

## 🏗️ Architecture

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend**: NestJS + GraphQL + PostgreSQL + Prisma
- **Infrastructure**: Docker + Redis + PostgreSQL
- **Security**: JWT + RBAC + Audit Logging
- **Real-time**: WebSocket + GraphQL Subscriptions

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+
- pnpm

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd rsc-admin-mission-control
   pnpm install
   ```

2. **Start the development environment:**
   ```bash
   # Start all services (PostgreSQL, Redis, API, Frontend)
   docker-compose up -d

   # Or run services individually
   docker-compose up postgres redis -d  # Database services
   pnpm run dev                         # Start both frontend and backend
   ```

3. **Initialize the database:**
   ```bash
   # Generate Prisma client
   pnpm run db:generate

   # Push schema to database
   pnpm run db:push

   # Seed with sample data
   pnpm run db:seed
   ```

4. **Access the application:**
   - **Admin Login**: http://localhost:3000/admin-login.html
   - **Admin Dashboard**: http://localhost:3000/admin/index.html (after login)
   - **GraphQL API**: http://localhost:4000/api/graphql
   - **Admin Accounts**: See admin login page for 5 unique accounts with different roles

## 📁 Project Structure

```
rsc-admin-mission-control/
├── apps/
│   ├── admin-frontend/     # Next.js admin dashboard
│   └── admin-api/         # NestJS GraphQL API
├── packages/
│   ├── ui/               # Shared UI components
│   └── config/           # Shared configuration
├── docker-compose.yml    # Development environment
└── turbo.json           # Build orchestration
```

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Start development servers
pnpm run dev

# Build all applications
pnpm run build

# Run tests
pnpm run test

# Database operations
pnpm run db:generate    # Generate Prisma client
pnpm run db:push        # Push schema changes
pnpm run db:migrate     # Run migrations
pnpm run db:seed        # Seed database
pnpm run db:studio      # Open Prisma Studio
```

## 🔐 Authentication

The system uses role-based access control (RBAC) with **5 unique admin accounts**:

### Admin Accounts & Permissions

| Email | Password | Role | Department | Permissions |
|-------|----------|------|------------|-------------|
| `orion.ops@rsc-chain.com` | `admin123` | **SUPER_ADMIN** | Executive Operations | Full system access (`*`) |
| `nova.ops@rsc-chain.com` | `nova2024` | **OPS_LEAD** | Operations Lead | Users R/W, Follow Bonus *, Events *, Audit Read |
| `centauri.ops@rsc-chain.com` | `centauri2024` | **ANALYST** | Manual Review Team | Users Read, Follow Bonus R/W, Events Read, Audit Read |
| `lyra.ops@rsc-chain.com` | `lyra2024` | **AUDITOR** | Compliance & Audit | Audit logs only |
| `phoenix.ops@rsc-chain.com` | `phoenix2024` | **VIEWER** | Technical Support | Read-only access to all modules |

### Permission Details
- **Users**: Create, read, update user accounts and profiles
- **Follow Bonus**: Approve/reject manual verification requests, bulk operations
- **Events**: Create and manage campaign events
- **Audit**: View system activity logs and admin actions

## 🎯 Key Features

### Follow Bonus Queue Management
- Real-time queue monitoring
- Bulk approve/reject operations
- Advanced filtering and search
- Proof attachment viewing
- Audit trail for all actions

### Enterprise Security
- JWT-based authentication
- Role-based permissions
- Comprehensive audit logging
- Rate limiting and input validation
- Secure API endpoints

### Modern UX
- Responsive design with dark mode
- Command palette for power users
- Real-time notifications
- Keyboard shortcuts
- Accessible components

## 🧪 Testing

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run e2e tests
pnpm run test:e2e

# Test admin accounts (after starting services)
node scripts/test-admin-accounts.js
```

### Admin Account Testing

The system includes automated testing for all 5 admin accounts:

```bash
# Run comprehensive admin account tests
node scripts/test-admin-accounts.js
```

This script validates:
- ✅ Login functionality for all accounts
- ✅ Role-based permissions
- ✅ GraphQL access control
- ✅ Permission boundaries

See `docs/ADMIN_ACCOUNTS_TESTING.md` for detailed testing procedures and permission matrices.

## 🚀 Deployment

### Development
```bash
docker-compose up -d
```

### Production
The system is designed for containerized deployment:

1. Build Docker images
2. Deploy to Kubernetes with Helm charts
3. Use managed PostgreSQL and Redis
4. Configure environment variables
5. Set up CI/CD pipelines

## 📚 API Documentation

- **GraphQL Playground**: http://localhost:4000/api/graphql
- **REST API**: Available at `/api` endpoints
- **Health Check**: `GET /api/health`

## 🤝 Contributing

1. Follow the established code style
2. Write tests for new features
3. Update documentation
4. Use conventional commits

## 📄 License

This project is proprietary software for RSC Chain internal use only.

## 🆘 Support

For issues and questions:
1. Check the logs in Docker containers
2. Review GraphQL errors in the playground
3. Check database connectivity
4. Verify environment variables

---

Built with ❤️ for RSC Chain's mission to democratize blockchain technology.
