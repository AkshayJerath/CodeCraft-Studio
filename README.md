# CodeCraft Studio 🚀

Welcome to **CodeCraft Studio**, a powerful multi-language code execution platform providing **real-time code execution** in a secure, containerized environment. Write, execute, and learn programming with **instant feedback** across multiple languages.

---

## ✨ Features

### 🔥 Real Code Execution
- **Live Execution:** Run code in real-time using Docker containers (Railway-hosted)
- **Multi-Language Support:** JavaScript, Python, Java, TypeScript
- **Interactive Input:** Space-separated or multi-line input support
- **Secure Sandboxing:** Isolated Docker containers ensure safety

### 💻 Advanced Code Editor
- **Monaco Editor:** Syntax highlighting, autocomplete, error detection
- **Language Detection:** Auto-loads sample code per language
- **Keyboard Shortcuts:** `Ctrl + Enter` to run code
- **Real-time Feedback:** Output, errors, and exit codes instantly

### 🎨 Modern UI/UX
- **Responsive Layout:** Resizable split-panel interface
- **Dark/Light Themes:** With system preference detection
- **Terminal Output:** Real terminal-like interface
- **Status Indicators:** Live health and connection monitoring

### 🔐 Authentication System
- **Secure Auth:** bcryptjs password hashing with MongoDB Atlas
- **Session Management:** Local storage-based state
- **Protected Routes:** Editor access restricted to logged-in users

### 🤖 AI Integration
- **Code Explanation:** Gemini-powered analysis via Google Genkit
- **Educational Aid:** Clear, beginner-friendly code explanations
- **Interactive Help:** Terminal commands for learning support

---

## 🛠️ Tech Stack

### Frontend (Vercel)
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI:** ShadCN UI, Radix UI
- **Styling:** Tailwind CSS
- **Editor:** Monaco Editor
- **Icons:** Lucide React

### Backend (Railway)
- **Runtime:** Node.js 18 (Alpine)
- **Framework:** Express.js
- **Supported Runtimes:** Python 3.11, Java OpenJDK 11, Node.js 18, TypeScript 5.x
- **Containerization:** Docker with sandboxing & resource limits

### Infrastructure
- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** MongoDB Atlas
- **AI:** Google Genkit (Gemini models)
- **Security:** bcryptjs for password hashing

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Docker
- MongoDB Atlas account
- Gemini API Key from Google

### Local Setup

```bash
git clone https://github.com/AkshayJerath/CodeCraft-Studio
cd CodeCraft-Studio
npm install
````

### Environment Configuration

Create a `.env.local` file:

```env
# Database
MONGODB_URI=your_mongodb_atlas_connection_string

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# Code Execution Service
NEXT_PUBLIC_CODE_EXECUTOR_URL=http://localhost:3001

# Execution Limits
EXECUTION_TIMEOUT=30000
MAX_OUTPUT_SIZE=1048576
```

### Run the Project

**Frontend:**

```bash
npm run dev
```

**Backend (Docker):**

```bash
docker-compose up --build
```

**Genkit AI (Optional):**

```bash
npm run genkit:dev
```

### Access URLs

* Frontend: [http://localhost:3000](http://localhost:3000)
* Backend API: [http://localhost:3001](http://localhost:3001)
* Health Check: [http://localhost:3001/health](http://localhost:3001/health)

---

## 🏗️ Architecture

```
┌─────────────────┐    HTTPS/API    ┌─────────────────┐
│   Vercel        │    Calls        │   Railway       │
│   (Frontend)    │ ──────────────→ │   (Backend)     │
│   Next.js App   │                 │   Express API   │
└─────────────────┘                 └─────────────────┘
        ↑                                   ↓
   User Browser                      Docker Containers
                                  (Python / Java / JS / TS)
```

---

## 💡 Supported Languages & Runtimes

| Language   | Version      | Runtime/Compiler | Notes                                |
| ---------- | ------------ | ---------------- | ------------------------------------ |
| JavaScript | Node.js 18.x | Native V8        | ES2020+, npm modules                 |
| Python     | 3.11         | CPython          | Full stdlib, pip support             |
| Java       | OpenJDK 11   | javac/java       | Compilation + execution              |
| TypeScript | 5.x          | tsx runtime      | Type checking, modern syntax support |

---

## 📁 Project Structure

```
studio-master/
├── src/
│   ├── app/                 # App routes (login, register, settings, editor)
│   ├── components/          # Editor, terminal, layout, UI
│   ├── services/            # API communication (codeExecutor.ts)
│   ├── ai/                  # Genkit AI flows
│   └── lib/                 # MongoDB utils
├── docker/
│   ├── Dockerfile.executor  # Docker container setup
│   ├── execution-server.js  # Express API server
│   └── executors/           # Language runners
├── docker-compose.yml       # Local setup
├── vercel.json              # Vercel config
└── README.md                # This file
```

---

## 🔧 Available Commands

### Development

```bash
npm run dev         # Start Next.js dev server
npm run build       # Build production
npm run start       # Start production server
npm run lint        # Lint code
npm run genkit:dev  # Start Genkit AI dev server
```

### Docker

```bash
npm run docker:build   # Build execution containers
npm run docker:up      # Start containers
npm run docker:down    # Stop containers
npm run docker:logs    # Show container logs
```

---

## 🎯 Key Features Walkthrough

### ✅ Real Code Execution

* Write code → Click **Run** or press **Ctrl+Enter**
* Executes inside sandboxed container
* Output and errors shown in terminal

### 🧾 Input Handling

* Single: `John`
* Multi: `John 25`
* Complex: `input()`, `Scanner`, `readline`, etc. handled natively

### 💻 Terminal Commands

* `clear` - Clears terminal
* `run` - Executes current code
* `health` - Checks backend status
* `help` - Shows available commands

---

## 🔒 Security

* **Isolated Execution:** Docker sandboxing
* **Resource Limits:** CPU, memory, time (30s timeout)
* **No Network Access:** Containers are offline
* **Input Sanitization:** All user input validated and escaped

---

## 🌟 Production Deployment

### Frontend (Vercel)

* Git-based auto deploys
* Env vars via dashboard
* Global CDN + cache invalidation

### Backend (Railway)

* Docker-based auto deploys
* Health checks and scaling
* Secrets via environment settings

---

## 📊 Monitoring & Analytics

* **Health Checks:** `/health` endpoint
* **Execution Metrics:** Track success/error rate
* **Performance:** Monitor response time, CPU/mem usage

---

## 🤝 Contributing

1. Fork this repo
2. Create a feature branch
   `git checkout -b feature/amazing-feature`
3. Commit changes
   `git commit -m 'Add amazing feature'`
4. Push to branch
   `git push origin feature/amazing-feature`
5. Open a Pull Request!

## 🆘 Support & Troubleshooting

### Common Issues

#### ❌ Code Execution Fails

* Check Railway service: `https://your-app.railway.app/health`
* Verify env variables (especially in Vercel)
* Check browser console for API errors

#### ❌ Build Fails

* Validate all `package.json` dependencies
* Use Node.js 18+
* Ensure `.env.local` is correctly filled

---

## 💡 Future Roadmap

* ✅ Multi-file project support
* 👥 Real-time collaborative editing
* 📦 Package management (pip, npm, etc.)
* 🔗 Shareable code snippets
* 📚 Learning tracks and tutorials
* 🧠 Static analysis + suggestions
* 🗃️ Database integration for data science
* 🔌 Built-in API testing client

---

**Happy Coding! 🎉
