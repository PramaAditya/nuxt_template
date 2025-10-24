# Nuxt 4 AI SaaS Template

[![Use this template](https://img.shields.io/badge/--000000?style=for-the-badge&logo=github&label=Use%20this%20template)](https://github.com/PramaAditya/nuxt_template/generate)

This is a comprehensive template for building AI-powered Software-as-a-Service (SaaS) applications using a modern, robust, and scalable tech stack. It provides a solid foundation with pre-configured authentication, database integration, UI components, and AI model connectivity.

## ✨ Features

*   **User Authentication:** Secure login, logout, and session management powered by Logto.
*   **AI Chat Interface:** A ready-to-use chat interface using the Vercel AI v5 SDK and Google Gemini Pro.
*   **Database Integration:** Type-safe database access with Prisma ORM connected to a PostgreSQL database.
*   **Server-Side Logic:** Nuxt 4 server routes for creating API endpoints.
*   **Reusable Components:** A clean and consistent UI built with Shadcn-Vue.
*   **Scalable Deployment:** Easily deployable on Netlify's free tier.

## 🛠️ Tech Stack

This template is built with the following technologies:

*   **Framework:** **[Nuxt 4](https://nuxt.com/docs)**
    *   A powerful Vue.js framework for building server-side rendered (SSR) and static websites. We leverage its *server routes*, *composables*, and rich ecosystem.

*   **Database:** **[PostgreSQL](https://www.postgresql.org/)**
    *   A powerful, open-source object-relational database system. This template is configured for PostgreSQL. For a quick start with a serverless option, I recommend **[Neon DB](https://neon.tech/docs)**, which offers a generous free tier.

*   **Authentication:** **[Logto](https://docs.logto.io/)**
    *   An Auth-as-a-Service solution that handles user authentication (login, logout, session management) via its generous free tier.

*   **ORM:** **[Prisma](https://www.prisma.io/docs/)**
    *   A next-generation Node.js and TypeScript ORM that ensures type-safe and structured interaction with your PostgreSQL database.

*   **UI/Components:** **[Shadcn-Vue](https://www.shadcn-vue.com/docs.html)**
    *   A library of beautifully designed and accessible UI components to build a clean and consistent user interface.

*   **LLM & AI SDK:**
    *   **Model:** **Google Gemini 2.5 Pro and Flash** (Get your free API Key from [Google AI Studio](https://aistudio.google.com/)).
    *   **Library:** **[Vercel AI v5 SDK](https://sdk.vercel.ai/docs)**. The `useChat` hook simplifies the integration with the LLM and manages response streaming on the client side.

*   **Deployment:** **[Netlify](https://docs.netlify.com/)**
    *   Deploy your application to the public using Netlify's powerful and easy-to-use free tier.

*   **Nuxt Modules:** This template comes with several pre-installed Nuxt modules to enhance development:
    *   **[@nuxt/fonts](https://fonts.nuxt.com/)**: For optimizing and managing local and web fonts.
    *   **[@nuxt/icon](https://icon.nuxt.com/)**: For adding and managing icons from any icon set.
    *   **[@nuxt/scripts](https://scripts.nuxt.com/)**: For managing third-party scripts with ease.
    *   **[@nuxt/test-utils](https://nuxt.com/docs/getting-started/testing)**: Utilities for testing your Nuxt application.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v20.19.0 or higher)
*   npm (or pnpm/yarn)
*   A PostgreSQL Database. For a quick serverless setup, you can use **[Neon](https://neon.tech/docs)**.
*   Accounts for Logto and Google AI Studio.

### Installation

1.  **Create a repository from this template:**
    *   Click the "Use this template" button above to create a new repository.

2.  **Clone your new repository:**
    ```bash
    git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
    cd YOUR_REPOSITORY
    ```

3.  **Install dependencies:**
    ```bash
    pnpm install
    ```

4.  **Set up environment variables:**
    *   Copy the `.env.example` file to `.env`.
    *   Fill in the required API keys and credentials for your database, Logto, and Google. Your `.env` file should look like this:
        ```env
        # Logto Credentials
        NUXT_LOGTO_APP_ID=
        NUXT_LOGTO_APP_SECRET=
        NUXT_LOGTO_COOKIE_ENCRYPTION_KEY=
        NUXT_LOGTO_ENDPOINT=

        # PostgreSQL Database Connection String (Example from Neon)
        DATABASE_URL="postgresql://***:***?sslmode=require&channel_binding=require"

        # Google Gemini API Key
        GOOGLE_GENERATIVE_AI_API_KEY=
        ```

5.  **Run the development server:**
    ```bash
    pnpm dev
    ```

Your application should now be running on `http://localhost:3000`.

## Deployment

This template is optimized for deployment on **[Netlify](https://docs.netlify.com/)**.

1.  Push your code to a GitHub repository.
2.  Connect your repository to a new site on Netlify.
3.  Configure the environment variables in the Netlify dashboard.
4.  Deploy! Netlify will automatically build and deploy your Nuxt application.
