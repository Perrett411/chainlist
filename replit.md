# X Chain - EVM Network Directory

## Overview

X Chain is a comprehensive directory of Ethereum Virtual Machine (EVM) compatible blockchain networks. The platform provides users with detailed information about various blockchain networks, including RPC endpoints, chain IDs, native currencies, and explorers. Users can easily connect their wallets to different networks and access real-time performance metrics for RPC endpoints.

The project has been enhanced with quantum-powered financial intelligence capabilities through integration with Perrett and Associates Private Investment Firm LLC, featuring advanced AI-driven financial analysis, crypto wallet connections, and banking integrations.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with React 18
- **Styling**: Tailwind CSS for responsive design with dark/light theme support
- **State Management**: Zustand for lightweight state management
- **Data Fetching**: TanStack React Query for efficient API calls and caching
- **UI Components**: Ariakit for accessible UI components
- **Analytics**: Fathom Analytics for privacy-focused tracking

### Backend Architecture
- **Server Framework**: Express.js with Next.js API routes
- **Authentication**: Replit Auth with OpenID Connect (OIDC) integration
- **Session Management**: Express sessions with PostgreSQL store
- **Database ORM**: Drizzle ORM for type-safe database operations
- **API Design**: RESTful endpoints with role-based access control

### Data Storage Solutions
- **Primary Database**: PostgreSQL with connection pooling
- **Schema Management**: Drizzle Kit for migrations and schema generation
- **Session Storage**: PostgreSQL-backed session store for authentication persistence
- **Static Data**: JSON files for chain configurations and additional chain registry

### Authentication and Authorization
- **Identity Provider**: Replit Auth using OpenID Connect
- **Session Security**: Secure HTTP-only cookies with CSRF protection
- **Role-Based Access**: User roles (user, admin, cfo) with granular permissions
- **API Security**: JWT-like session tokens with server-side validation

### Key Architectural Components

#### Chain Data Management
- **Static Registry**: Constants folder containing chain definitions and RPC configurations
- **Dynamic Updates**: Real-time RPC performance monitoring and latency testing
- **Data Aggregation**: Combines static chain data with live RPC metrics
- **Caching Strategy**: Memoized fetches with configurable TTL

#### RPC Performance Monitoring
- **Health Checks**: Regular polling of RPC endpoints for availability
- **Latency Measurement**: Response time tracking with axios interceptors
- **Block Height Verification**: Ensures RPC endpoints are synchronized
- **Automatic Sorting**: Orders RPCs by performance and reliability

#### Multi-language Support
- **Internationalization**: JSON-based translation files for multiple languages
- **Dynamic Loading**: Language files loaded based on user preference
- **RTL Support**: Right-to-left language compatibility

#### Financial Intelligence Platform
- **AI Integration**: OpenAI GPT-5 powered CFO assistant for financial analysis
- **Quantum Computing**: Simulated quantum-enhanced blockchain processing
- **Portfolio Management**: Multi-asset tracking across traditional and crypto markets
- **Data Streaming**: Real-time market data feeds and analysis

## External Dependencies

### Core Services
- **Replit Auth**: Primary authentication service with OIDC support
- **PostgreSQL**: Database hosting (configured for Replit deployment)
- **Cloudflare**: CDN and caching for static assets and API responses

### Blockchain Infrastructure
- **RPC Providers**: Multiple endpoint providers including Ankr, Alchemy, Infura
- **Chain Icons**: Llama.fi icon service for blockchain network logos
- **Block Explorers**: Integration with various blockchain explorers

### Analytics and Monitoring
- **Fathom Analytics**: Privacy-focused web analytics
- **HypeLab**: Native advertising platform for monetization
- **Custom Metrics**: Performance tracking for RPC endpoints

### AI and Financial Services
- **OpenAI API**: GPT-5 integration for conversational AI and financial analysis
- **CoinGecko API**: Real-time cryptocurrency market data
- **Speech Recognition**: Browser-native Web Speech API for voice interactions

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **TailwindCSS**: Utility-first CSS framework
- **PostCSS**: CSS processing with autoprefixer

### Data Sources
- **EVM Networks List**: Community-maintained registry of blockchain networks
- **Additional Chain Registry**: Custom chain definitions for newer networks
- **Llama Nodes**: Decentralized RPC infrastructure