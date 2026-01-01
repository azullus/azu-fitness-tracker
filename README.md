# Fitness Tracker

Personal fitness management system for individuals and households. Track workouts, nutrition, weight, pantry inventory, and meal planning all in one place.

## Project Structure

```
FITNESS-TRACKER/
├── web-app/                    # Production Next.js PWA (PRIMARY APP)
│   ├── app/                    # Next.js 14 App Router pages
│   ├── components/             # React components
│   ├── lib/                    # Utilities, database, security
│   ├── __tests__/              # Jest test suites (119 tests)
│   ├── Dockerfile              # Production container
│   ├── docker-compose.yml      # Full deployment stack
│   ├── DEPLOY.md               # Deployment guide
│   └── README.md               # Web app documentation
├── .claude/                    # Claude Code agents
│   └── agents/                 # Specialized planning agents
│       ├── meal-planner.md     # Weekly meal planning
│       ├── workout-planner.md  # Exercise scheduling
│       ├── nutritionist.md     # Nutrition analysis
│       └── data-manager.md     # Data reporting
├── Pantry/                     # Recipe knowledge base
│   ├── Recipes/                # 70+ markdown recipes
│   │   ├── Breakfast/          # High-protein breakfasts
│   │   ├── Lunch/              # Quick lunch options
│   │   ├── Dinner/             # Main meals
│   │   └── Snacks/             # Protein snacks
│   └── dietary-preferences.md  # Dietary customization guide
├── Tracking/                   # Historical tracking examples
│   ├── WEEKLY-OVERVIEW.md      # Weekly summary template
│   └── nutrition-review.md     # Nutrition analysis template
├── Weekly-Plans/               # Meal planning templates
│   └── Current/                # Example meal plans
├── Workout-Planner/            # Training schedule templates
│   ├── Example Plan/           # Sample workout schedules
│   └── current-week-*.md       # Template files
├── CLAUDE.md                   # Project context for AI
├── COMPLETION-PLAN.md          # Implementation checklist
├── MCP-RECOMMENDATIONS.md      # Model Context Protocol docs
└── TROUBLESHOOTING-WORKFLOW.md # Debugging guide
```

## Quick Start

### Development

```bash
cd web-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and click "Skip for now" for demo mode.

### Production Deployment

See [web-app/DEPLOY.md](web-app/DEPLOY.md) for comprehensive deployment guide.

**Docker deployment (standalone):**

```bash
cd web-app
cp .env.production .env
# Edit .env with your domain and configuration
docker-compose -f docker-compose.standalone.yml up -d
```

## Features

- **Dashboard**: Daily nutrition, workout, and weight overview
- **Workout Tracking**: 30+ pre-built routines (strength, cardio, mobility)
- **Nutrition Tracking**: 100+ recipes with macro breakdowns
- **Meal Planning**: Weekly meal plans and grocery lists
- **Pantry Management**: Inventory tracking with low-stock alerts
- **Weight Tracking**: Historical charts and trend analysis
- **Household Support**: Multiple users with individual tracking
- **Progressive Web App**: Installable, offline-capable
- **Demo Mode**: Full functionality without authentication

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: SQLite (production) with optional Supabase auth
- **Security**: Rate limiting, CSRF protection, API authentication
- **Testing**: Jest + React Testing Library (119 tests passing)
- **Deployment**: Docker with Traefik reverse proxy
- **Monitoring**: Error tracking, health checks, automated backups

## Use Cases

### Individual Fitness
- Track personal workouts and nutrition
- Set and monitor fitness goals
- Log weight and body metrics
- Plan meals and manage pantry

### Household Fitness
- Support multiple household members
- Individual tracking and goals per person
- Shared pantry and recipe library
- Family meal planning

### Fitness Coaches
- Self-hosted client tracking
- Customizable workout routines
- Nutrition planning tools
- Progress monitoring

## Documentation

- **[web-app/README.md](web-app/README.md)** - Web application documentation
- **[web-app/DEPLOY.md](web-app/DEPLOY.md)** - Production deployment guide
- **[CLAUDE.md](CLAUDE.md)** - Project context for AI development
- **[COMPLETION-PLAN.md](COMPLETION-PLAN.md)** - Feature implementation checklist
- **[MCP-RECOMMENDATIONS.md](MCP-RECOMMENDATIONS.md)** - Model Context Protocol setup
- **[TROUBLESHOOTING-WORKFLOW.md](TROUBLESHOOTING-WORKFLOW.md)** - Debugging workflows

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                        │
│              (Desktop, Mobile, Tablet)                   │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Reverse Proxy (Traefik)                     │
│        (Auto HTTPS, Load Balancing, Routing)             │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ Port 3000
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Fitness Tracker Container                   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         Next.js Application                       │   │
│  │  - Server-Side Rendering (SSR)                    │   │
│  │  - API Routes (rate limited, CSRF protected)      │   │
│  │  - React Components                               │   │
│  └──────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────┐   │
│  │         SQLite Database                           │   │
│  │  - Workouts, Meals, Weight, Pantry, Persons       │   │
│  │  - Stored in persistent volume                    │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                            │
                            │ Daily backup
                            ▼
┌─────────────────────────────────────────────────────────┐
│                   Backup Container                       │
│          (7-day retention, automated)                    │
└─────────────────────────────────────────────────────────┘
```

## Security

- **Multi-Layer Defense**: Reverse proxy → Application → Database
- **Rate Limiting**: 100 req/min (read), 30 req/min (write), 20 req/min (delete)
- **CSRF Protection**: Double-submit cookie pattern
- **Authentication**: Supabase auth with secure demo mode
- **Ownership Verification**: Users can only access their own data
- **Input Validation**: Comprehensive validators on all inputs
- **Docker Isolation**: Non-root user, minimal attack surface
- **Automated Backups**: Daily SQLite backups with 7-day retention

## Customization

The app is designed to be flexible and customizable:

### Dietary Preferences
- Edit `Pantry/dietary-preferences.md` to document your household's preferences
- Add custom recipes with your preferred ingredients
- Filter recipes by dietary restrictions

### Training Focus
- Choose from strength, cardio, mobility, or general fitness
- Customize workout days per week (1-7 days)
- Create custom workout routines
- Track multiple training goals

### Household Management
- Add unlimited household members
- Individual calorie and macro targets
- Separate tracking for each person
- Shared recipe and pantry library

## Development Workflow

1. **Setup**: Clone repository, install dependencies
2. **Development**: Use demo mode for testing
3. **Customization**: Add recipes, workouts, household members
4. **Testing**: Run test suite to verify changes
5. **Deployment**: Build and deploy with Docker

## Testing

```bash
cd web-app

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific suite
npm test -- validation.test.ts
```

**Coverage**: 119 tests across 4 suites (validation, rate-limit, components, API)

## Production Status

**Status**: ✅ Production Ready

- 252 files deployed
- 71,135 lines of code
- 119 tests passing
- Security hardened
- Docker ready
- Documentation complete
- Private repository

## License

MIT License - Free for personal and commercial use.

See [LICENSE](LICENSE) for full license text.

## Support

- **Documentation**: See [web-app/README.md](web-app/README.md) and [web-app/DEPLOY.md](web-app/DEPLOY.md)
- **Issues**: GitHub Issues for bug reports and feature requests
- **Contributions**: Pull requests welcome

## Changelog

### 2025-12-31 - Initial Release
- Complete Next.js 14 PWA implementation
- 100+ recipes, 30+ workout routines
- Security hardening (rate limiting, CSRF, auth)
- Docker deployment with Traefik
- 119 tests passing
- Comprehensive documentation
- Household management support
- Customizable tracking and goals

---

Built with [Claude Code](https://claude.com/claude-code)
