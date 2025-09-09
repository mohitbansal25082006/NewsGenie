# NewsGenie - AI-Powered News Aggregator

![NewsGenie Banner](./banner.png)

<div align="center">
  
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)](https://prisma.io/)
[![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=flat&logo=openai&logoColor=white)](https://openai.com/)

</div>

👉 **Check it out here:** [![Live Demo](https://img.shields.io/badge/Live%20Demo-NewsGenie-blue?style=for-the-badge&logo=vercel)](https://newsgenie-psi.vercel.app/)

## 📖 Table of Contents

- [🌟 About](#-about)
- [✨ Features](#-features)
- [🚀 Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [🛠️ Architecture](#️-architecture)
- [📚 API Documentation](#-api-documentation)
- [🎨 UI Components](#-ui-components)
- [🔧 Configuration](#-configuration)
- [📱 Deployment](#-deployment)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

## 🌟 About

NewsGenie is a cutting-edge, AI-powered news aggregation platform that revolutionizes how users consume and interact with news content. Built with modern web technologies and powered by advanced artificial intelligence, NewsGenie delivers a personalized, intelligent news experience tailored to each user's interests and preferences.

Our mission is to combat information overload and provide users with curated, relevant news content while offering powerful AI tools to enhance understanding and engagement with news articles.

### Key Technologies

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **AI Integration**: OpenAI GPT-3.5 Turbo
- **Deployment**: Vercel

## ✨ Features

### 📰 Personalized News Feed
- **Smart Curation**: AI-powered content recommendations based on user interests and reading history
- **Customizable Categories**: Filter news by categories (General, Business, Technology, etc.)
- **Country-Specific Content**: Localized news based on user's geographical preferences
- **Source Preferences**: Select preferred news sources for tailored content

### 🤖 AI-Powered Features
- **Article Summarization**: Concise AI-generated summaries of lengthy articles
- **Sentiment Analysis**: Understand the emotional tone of news articles
- **Keyword Extraction**: Identify key topics and entities within articles
- **Conversational AI**: Chat with an AI assistant about news and current events
- **Article Q&A**: Ask specific questions about article content
- **Topic Exploration**: Discover related articles and background information
- **Personalized Briefings**: Generate custom news briefings via conversation

### 🔔 Real-time Notifications
- **Breaking News Alerts**: Instant notifications for important breaking news
- **Personalized Notifications**: Custom alerts based on user interests
- **Digest Emails**: Daily or weekly news summaries delivered to your inbox
- **Notification Preferences**: Fine-tune notification frequency and types

### 📊 Analytics & Insights
- **Reading Analytics**: Track reading habits and patterns
- **Category Distribution**: Visual breakdown of news consumption by category
- **Sentiment Trends**: Monitor the emotional tone of consumed content
- **Reading Statistics**: Daily, weekly, and monthly reading metrics

### 📱 User Experience
- **Responsive Design**: Seamless experience across desktop, tablet, and mobile devices
- **Dark/Light Mode**: Comfortable reading in any lighting condition
- **Bookmarks**: Save articles for later reading
- **Reading History**: Track previously read articles
- **Search Functionality**: Find articles by keywords, topics, or sources

### 🔐 Security & Privacy
- **Secure Authentication**: OAuth integration with Google and GitHub
- **Data Privacy**: User data encrypted and securely stored
- **Content Filtering**: Option to filter sensitive or unwanted content
- **User Controls**: Complete control over personal data and preferences

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0 or higher
- **npm**: Version 8.0 or higher
- **Git**: Version 2.0 or higher
- **PostgreSQL**: Version 13 or higher
- **Neon Database Account**: For cloud PostgreSQL hosting (recommended)

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/your-username/newsgenie.git
cd newsgenie
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env.local` file in the root directory:

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Database URL
DATABASE_URL="your_postgresql_database_url_here"

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GITHUB_CLIENT_ID=your_github_client_id_here
GITHUB_CLIENT_SECRET=your_github_client_secret_here

# News API
NEWS_API_KEY=your_news_api_key_here
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Yes |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes |
| `NEXTAUTH_URL` | URL of your application | Yes |
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Yes |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth client secret | Yes |
| `NEWS_API_KEY` | News API key for fetching articles | Yes |

### Database Setup

1. **Set up PostgreSQL**

```bash
# Install PostgreSQL
sudo apt-get install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database
sudo -u postgres createdb newsgenie
```

2. **Run Prisma migrations**

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Open Prisma Studio for database management
npx prisma studio
```

### Running the Application

1. **Start the development server**

```bash
npm run dev
```

2. **Open your browser**

Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 🛠️ Architecture

### High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (Next.js)      │◄──►│   (API Routes)  │◄──►│   (PostgreSQL)   │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │ Components  │ │    │ │ Controllers │ │    │ │ Models      │ │
│ │             │ │    │ │             │ │    │ │             │ │
│ │ - UI        │ │    │ │ - News      │ │    │ │ - User      │ │
│ │ - Forms      │ │    │ │ - Auth      │ │    │ │ - Article   │ │
│ │ - Charts     │ │    │ │ - Chat      │ │    │ │ - Chat      │ │
│ │ - Layouts    │ │    │ │ - Analytics │ │    │ │ - Bookmark  │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                │
                    ┌─────────────────┐
                    │   External APIs  │
                    │                 │
                    │ - OpenAI        │
                    │ - News API      │
                    │ - OAuth         │
                    └─────────────────┘
```

### Database Schema

```
User
├── id (Primary Key)
├── name
├── email
├── emailVerified
├── image
├── createdAt
├── updatedAt
├── accounts (One-to-Many)
├── sessions (One-to-Many)
├── userPreference (One-to-One)
├── bookmarks (One-to-Many)
├── readArticles (One-to-Many)
├── readingHistory (One-to-Many)
├── notifications (One-to-Many)
└── conversations (One-to-Many)

Article
├── id (Primary Key)
├── title
├── description
├── content
├── url (Unique)
├── urlToImage
├── publishedAt
├── source
├── author
├── category
├── country
├── language
├── summary (AI-generated)
├── sentiment (AI-analyzed)
├── keywords (AI-extracted)
├── createdAt
├── updatedAt
├── bookmarks (One-to-Many)
├── readArticles (One-to-Many)
└── notifications (One-to-Many)

Conversation
├── id (Primary Key)
├── userId (Foreign Key)
├── title
├── createdAt
├── updatedAt
└── messages (One-to-Many)

Message
├── id (Primary Key)
├── conversationId (Foreign Key)
├── role ('user' | 'assistant')
├── content
├── createdAt
└── articleIds (Array of Foreign Keys)
```

### Component Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── news/           # News-related endpoints
│   │   ├── chat/           # Chat functionality
│   │   ├── bookmarks/      # Bookmark management
│   │   ├── preferences/    # User preferences
│   │   ├── analytics/      # Analytics data
│   │   └── read-articles/  # Reading history
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── chat/              # Chat interface
│   ├── article/           # Article detail pages
│   └── global.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Shadcn UI components
│   ├── layout/           # Layout components
│   └── forms/            # Form components
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Database connection
│   ├── prisma.ts        # Prisma client
│   ├── newsApi.ts       # News API integration
│   ├── openai.ts        # OpenAI integration
│   ├── notifications.ts # Notification system
│   ├── chat.ts          # Chat functionality
│   └── utils.ts         # Utility functions
└── prisma/               # Database schema
```

## 📚 API Documentation

### Authentication Endpoints

#### `GET /api/auth/[...nextauth]`
Handles NextAuth.js authentication flow.

#### `POST /api/auth/signin`
Initiates the sign-in process.

#### `POST /api/auth/signout`
Terminates the user session.

### News Endpoints

#### `GET /api/news`
Fetch news articles with optional filtering parameters.

**Query Parameters:**
- `category` (string): Filter by news category
- `country` (string): Filter by country
- `q` (string): Search query
- `pageSize` (number): Number of articles per page (default: 20)
- `page` (number): Page number for pagination

**Response:**
```json
{
  "status": "ok",
  "totalResults": 100,
  "articles": [
    {
      "id": "article-id",
      "title": "Article Title",
      "description": "Article description",
      "content": "Full article content",
      "url": "https://example.com/article",
      "urlToImage": "https://example.com/image.jpg",
      "publishedAt": "2023-12-01T10:30:00Z",
      "source": {
        "name": "Source Name",
        "id": "source-id"
      },
      "author": "Author Name",
      "summary": "AI-generated summary",
      "sentiment": "positive",
      "keywords": ["keyword1", "keyword2"]
    }
  ]
}
```

### Chat Endpoints

#### `GET /api/chat/conversations`
Fetch user's chat conversations.

#### `POST /api/chat/conversations`
Create a new conversation.

**Request Body:**
```json
{
  "title": "Conversation Title"
}
```

#### `GET /api/chat/conversations/[id]`
Fetch a specific conversation with messages.

#### `POST /api/chat/conversations/[id]`
Send a message in a conversation.

**Request Body:**
```json
{
  "message": "User message",
  "articleIds": ["article-id-1", "article-id-2"]
}
```

#### `DELETE /api/chat/conversations/[id]`
Delete a conversation and all its messages.

#### `POST /api/chat/article-qa`
Ask a question about a specific article.

**Request Body:**
```json
{
  "articleId": "article-id",
  "question": "What is this article about?"
}
```

#### `POST /api/chat/explore-topic`
Explore a news topic with AI.

**Request Body:**
```json
{
  "topic": "Artificial Intelligence"
}
```

#### `GET /api/chat/personalized-briefing`
Generate a personalized news briefing.

### User Management Endpoints

#### `GET /api/bookmarks`
Fetch user's bookmarked articles.

#### `POST /api/bookmarks`
Bookmark an article.

**Request Body:**
```json
{
  "articleId": "article-id"
}
```

#### `DELETE /api/bookmarks?articleId={id}`
Remove a bookmark.

#### `GET /api/preferences`
Fetch user preferences.

#### `POST /api/preferences`
Update user preferences.

**Request Body:**
```json
{
  "interests": ["technology", "business"],
  "sources": ["techcrunch", "reuters"],
  "language": "en",
  "country": "us",
  "emailNotifications": true,
  "articlesPerDay": 20,
  "notifyBreakingNews": true,
  "notifyNewArticles": true,
  "notifyDigest": false,
  "digestTime": "08:00"
}
```

### Analytics Endpoints

#### `GET /api/analytics`
Fetch user reading analytics.

**Response:**
```json
{
  "readingStats": [
    { "date": "2023-12-01", "count": 5 },
    { "date": "2023-12-02", "count": 8 }
  ],
  "categoryDistribution": {
    "technology": 15,
    "business": 10,
    "general": 5
  },
  "sentimentDistribution": {
    "positive": 12,
    "neutral": 15,
    "negative": 3
  },
  "totalRead": 30,
  "totalBookmarks": 8,
  "todayRead": 3
}
```

## 🎨 UI Components

### Core Components

#### `NotificationBadge`
Displays notification count in the header with dropdown menu.

**Props:**
- None

**Usage:**
```tsx
import { NotificationBadge } from "@/components/ui/notification-badge";

// In layout
<NotificationBadge />
```

#### `UserMenu`
User profile menu with navigation links.

**Props:**
- None

**Usage:**
```tsx
import { UserMenu } from "@/components/ui/user-menu";

// In layout
<UserMenu />
```

#### `ArticleCard`
Displays article information with interactive elements.

**Props:**
```tsx
interface ArticleCardProps {
  article: Article;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
  onMarkAsRead?: (id: string) => void;
}
```

**Usage:**
```tsx
import { ArticleCard } from "@/components/article-card";

<ArticleCard 
  article={article} 
  onBookmark={toggleBookmark}
  isBookmarked={bookmarked}
  onMarkAsRead={markAsRead}
/>
```

#### `ChatInterface`
Complete chat interface with message history and input.

**Props:**
```tsx
interface ChatInterfaceProps {
  conversation?: Conversation;
  onSendMessage: (message: string) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
}
```

### Form Components

#### `NewsSearchForm`
Search form for finding news articles.

**Props:**
```tsx
interface NewsSearchFormProps {
  onSearch: (query: string) => void;
  onCategoryChange: (category: string) => void;
  selectedCategory: string;
}
```

#### `PreferencesForm`
User preferences configuration form.

**Props:**
```tsx
interface PreferencesFormProps {
  preferences: UserPreference;
  onSave: (preferences: UserPreference) => void;
}
```

### Chart Components

#### `ReadingActivityChart`
Line chart showing daily reading activity.

**Props:**
```tsx
interface ReadingActivityChartProps {
  data: { date: string; count: number }[];
}
```

#### `CategoryDistributionChart`
Pie chart showing news category distribution.

**Props:**
```tsx
interface CategoryDistributionChartProps {
  data: { name: string; value: number }[];
}
```

## 🔧 Configuration

### Environment Configuration

1. **OpenAI API Setup**

```bash
# Get your API key from https://platform.openai.com/api-keys
export OPENAI_API_KEY="sk-..."
```

2. **OAuth Provider Setup**

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`

**GitHub OAuth:**
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Create a new OAuth App
3. Set Authorization callback URL:
   - `http://localhost:3000/api/auth/callback/github`
   - `https://yourdomain.com/api/auth/callback/github`

3. **News API Setup**

```bash
# Get your API key from https://newsapi.org/
export NEWS_API_KEY="your-api-key"
```

### Database Configuration

1. **Prisma Setup**

```bash
# Initialize Prisma
npx prisma init

# Generate client
npx prisma generate

# Push schema to database
npx prisma db push

# (Optional) Create migrations
npx prisma migrate dev
```

2. **Environment Variables for Database**

```env
# PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/newsgenie"
```

### Authentication Configuration

1. **NextAuth Setup**

```typescript
// src/lib/auth.ts
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
```

## 📱 Deployment

### Vercel Deployment

1. **Connect to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

2. **Environment Variables on Vercel**

- Go to your project dashboard on Vercel
- Navigate to Settings → Environment Variables
- Add all environment variables from `.env.local`

3. **Database Setup on Vercel**

- Use a managed PostgreSQL service like Neon, PlanetScale, or AWS RDS
- Update `DATABASE_URL` in Vercel environment variables

### Docker Deployment

1. **Create Dockerfile**

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build the application
RUN npm run build

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
```

2. **Create docker-compose.yml**

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/newsgenie
      - OPENAI_API_KEY=your-openai-api-key
      - NEXTAUTH_SECRET=your-nextauth-secret
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: newsgenie
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

3. **Deploy with Docker Compose**

```bash
docker-compose up -d
```

## 🤝 Contributing

We welcome contributions to NewsGenie! Please follow these guidelines to contribute effectively.

### Development Workflow

1. **Fork the Repository**

```bash
# Fork the repository on GitHub
git clone https://github.com/your-username/newsgenie.git
cd newsgenie
```

2. **Create a Feature Branch**

```bash
git checkout -b feature/amazing-feature
```

3. **Make Your Changes**

- Follow the existing code style
- Add tests for new functionality
- Update documentation as needed

4. **Commit Your Changes**

```bash
git add .
git commit -m "feat: add amazing feature"
```

5. **Push to Your Fork**

```bash
git push origin feature/amazing-feature
```

6. **Create a Pull Request**

- Go to the original repository
- Click "New Pull Request"
- Fill in the PR template
- Link any relevant issues

### Code Style Guidelines

- **TypeScript**: Use strict TypeScript with proper typing
- **Components**: Use functional components with hooks
- **Styling**: Follow Tailwind CSS utility-first approach
- **Comments**: Add meaningful comments for complex logic
- **Naming**: Use descriptive names for variables and functions

### Pull Request Process

1. **PR Template**

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Checklist:
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules
```

2. **Review Process**

- All PRs must be reviewed by at least one maintainer
- Automated tests must pass
- Code must follow the project's style guidelines
- Documentation must be updated for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## 🙏 Acknowledgments

- **OpenAI** for providing the powerful GPT models that power our AI features
- **Next.js** team for the excellent React framework
- **Prisma** for the modern database toolkit
- **Tailwind CSS** for the utility-first CSS framework
- **Shadcn UI** for the beautiful component library
- **News API** for providing comprehensive news data
- All contributors and users who have helped improve NewsGenie

<div align="center">
  
**Made with ❤️ by Mohit Bansal**

</div>
