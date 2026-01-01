# Fitness Tracker

Personal fitness management system for a 2-person household in Edmonton, Alberta. Tracks workouts, nutrition, weight, pantry inventory, and meal planning.

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
│   └── dietary-preferences.md  # Household food rules
├── Tracking/                   # Historical tracking docs
│   ├── WEEKLY-OVERVIEW.md      # Weekly summaries
│   └── nutrition-review.md     # Nutrition analysis
├── Weekly-Plans/               # Meal planning archives
│   └── Current/                # Active meal plans
├── Workout-Planner/            # Training schedules
│   ├── current-week-his-plan.md   # Powerlifting schedule
│   ├── current-week-her-plan.md   # Cardio/mobility schedule
│   └── Example Plan/              # Template workouts
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
- **Workout Tracking**: 30+ pre-built routines (powerlifting & cardio)
- **Nutrition Tracking**: 100+ recipes with macro breakdowns
- **Meal Planning**: Weekly meal plans and grocery lists
- **Pantry Management**: Inventory tracking with low-stock alerts
- **Weight Tracking**: Historical charts and trend analysis
- **Progressive Web App**: Installable, offline-capable
- **Demo Mode**: Full functionality without authentication

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Database**: SQLite (production) with optional Supabase auth
- **Security**: Rate limiting, CSRF protection, API authentication
- **Testing**: Jest + React Testing Library (119 tests passing)
- **Deployment**: Docker with Traefik reverse proxy
- **Monitoring**: Error tracking, health checks, backups

## Household Profile

**Him** - Powerlifting Focus
- Training: Squat/Bench/Deadlift (4 days/week)
- Target: 140-180g protein daily
- Supplements: One-A-Day Men's
- Allergy: Bananas (substitute yellow kiwi)

**Her** - Cardio/Mobility Focus
- Training: HIIT, yoga, light strength (5 days/week)
- Target: 140-180g protein daily
- Supplements: One-A-Day Women's, Metamucil

**Shared Preferences:**
- White rice ONLY (never brown)
- PB Fit (powdered) instead of peanut butter
- Built Marshmallow bars (Costco)
- Whole grain bread (cheapest quality)
- Savory snacks: pepperoni sticks, beef jerky, pickled eggs

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
│                  Cloudflare Proxy                        │
│           (DDoS Protection, Caching, DNS)                │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ Port 443
                            ▼
┌─────────────────────────────────────────────────────────┐
│                 Fortigate Firewall                       │
│           (Packet Filtering, IPS/IDS)                    │
└───────────────────────────┬─────────────────────────────┘
                            │
                            │ Port 443
                            ▼
┌─────────────────────────────────────────────────────────┐
│                  Traefik Reverse Proxy                   │
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

- **Multi-Layer Defense**: Cloudflare → Fortigate → Traefik → App
- **Rate Limiting**: 100 req/min (read), 30 req/min (write), 20 req/min (delete)
- **CSRF Protection**: Double-submit cookie pattern
- **Authentication**: Supabase auth with secure demo mode
- **Ownership Verification**: Users can only access their own data
- **Input Validation**: Comprehensive validators on all inputs
- **Docker Isolation**: Non-root user, minimal attack surface
- **Automated Backups**: Daily SQLite backups with 7-day retention

## Development Workflow

1. **Planning**: Use Claude Code agents for meal/workout planning
2. **Tracking**: Log daily workouts, meals, weight in web app
3. **Analysis**: Review nutrition and workout trends
4. **Adjustment**: Update meal plans and workout routines
5. **Grocery Shopping**: Generate shopping lists from meal plans

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
- Private GitHub repository

## Support

- **Issues**: Not accepting external contributions (personal project)
- **License**: Personal/household use only
- **Contact**: For deployment help, see [web-app/DEPLOY.md](web-app/DEPLOY.md)

## Changelog

### 2025-12-31 - Initial Release
- Complete Next.js 14 PWA implementation
- 100+ recipes, 30+ workout routines
- Security hardening (rate limiting, CSRF, auth)
- Docker deployment with Traefik
- 119 tests passing
- Comprehensive documentation

---

Built with [Claude Code](https://claude.com/claude-code)
