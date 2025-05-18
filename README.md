# CodeCraft Studio 🚀

Welcome to CodeCraft Studio, an interactive coding editor designed to empower young coders on their programming journey! This application, built with modern web technologies, provides a user-friendly environment for writing, running (simulated), and understanding code across various popular languages.

## ✨ Features

*   **Multi-Language Editor**: Supports JavaScript, Python, Java, TypeScript, HTML, and CSS with a Monaco-based code editor.
*   **AI-Powered Code Explanation**: Leverages Genkit and Google's Gemini models to explain code snippets in simple, understandable terms.
*   **User Authentication**: Secure login and registration system using MongoDB Atlas as the backend database and bcryptjs for password hashing.
*   **Simulated Code Execution**: Provides a terminal-like interface to simulate running code and see mock outputs.
*   **Theme Customization**: Users can switch between dark and light themes, with preferences saved locally.
*   **Responsive Design**: Built with Tailwind CSS and ShadCN UI components for a modern and responsive user experience on various devices.
*   **Download Code**: Easily download the code written in the editor.
*   **Clear Terminal**: Option to clear the terminal output.

## 🛠️ Tech Stack

*   **Framework**: [Next.js](https://nextjs.org/) (App Router)
*   **Language**: [TypeScript](https://www.typescriptlang.org/)
*   **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **AI Integration**: [Genkit (by Google)](https://firebase.google.com/docs/genkit) with Gemini models
*   **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (for user authentication)
*   **Password Hashing**: [bcryptjs](https://www.npmjs.com/package/bcryptjs)
*   **Form Management**: [React Hook Form](https://react-hook-form.com/) with [Zod](https://zod.dev/) for validation
*   **Deployment**: [Vercel](https://vercel.com/)

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18 or later recommended)
*   npm, yarn, or pnpm
*   A MongoDB Atlas account and a connection string.

### Setup

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd <repository-name>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

3.  **Set up environment variables:**
    Create a `.env.local` file in the root of your project and add your MongoDB Atlas connection string:
    ```env
    MONGODB_URI="your_mongodb_atlas_connection_string_here"
    ```
    Ensure `.env.local` is added to your `.gitignore` file.

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    # or
    pnpm dev
    ```
    The application will typically be available at `http://localhost:9002`.

5.  **Run the Genkit development server (optional, for AI feature development):**
    In a separate terminal, run:
    ```bash
    npm run genkit:dev
    ```

## 📄 Project Structure (Key Directories)

*   `src/app/`: Next.js App Router pages (e.g., editor, login, register, settings).
*   `src/app/actions/`: Server Actions (e.g., authentication logic).
*   `src/components/`: Reusable React components (UI elements, layout, editor).
*   `src/ai/`: Genkit related files.
    *   `src/ai/flows/`: Genkit flow definitions (e.g., code explanation).
*   `src/lib/`: Utility functions (e.g., MongoDB connection).
*   `public/`: Static assets.

## 💡 Future Enhancements (Ideas)

*   Real-time collaboration.
*   Saving and loading projects/files for users.
*   More advanced AI features (e.g., code generation, debugging assistance).
*   Integration with Git for version control.

---

Happy Coding! 🎉
