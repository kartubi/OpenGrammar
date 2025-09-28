# OpenGrammar

**OpenGrammar** is an open-source desktop AI text processor that helps you improve your writing using Claude AI. Built with **Wails v2** (Go + React + TypeScript), it provides a clean, fast, and privacy-focused alternative to online grammar checkers.

## ✨ Features

### 🎯 **Core Actions**
- **Grammar Check** - Fix grammar, spelling, and style issues
- **Text Improvement** - Enhance clarity and flow
- **Rephrasing** - Rewrite with different words and structures
- **Formalization** - Make text more professional and formal
- **Detailed Expansion** - Add more context and details
- **Custom Actions** - Write your own prompts for any task

### 🌍 **Multilingual Support**
- **US English** - Full support for American English
- **Bahasa Indonesia** - Complete Indonesian language support
- Dynamic UI language switching

### 🔐 **Privacy & Security**
- **BYOK (Bring Your Own Key)** - Use your own Claude API key
- **No data collection** - Your text never leaves your device except for AI processing
- **Local storage only** - API keys stored securely on your machine
- **Offline-first** - Works without internet (except for AI processing)

### 💻 **Cross-Platform**
- **macOS** - Universal binary (Intel + Apple Silicon)
- **Windows** - Coming soon
- **Linux** - Coming soon

## 🚀 Quick Start

### Prerequisites
- **Claude API Key** - Get one from [Anthropic Console](https://console.anthropic.com)

### Download & Install

#### macOS
1. Download the latest release from [GitHub Releases](../../releases)
2. Extract the downloaded archive
3. Move **OpenGrammar.app** to your Applications folder
4. Launch the app and enter your Claude API key

> **Note**: macOS may show a security warning for unsigned applications. Right-click the app and select "Open" to bypass this warning.

#### Build from Source
See [Development Setup](#-development-setup) below.

## 🛠️ Development Setup

### Prerequisites
- **Go 1.21+** - [Download Go](https://golang.org/dl/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Wails CLI** - Install with `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Clone & Install
```bash
git clone https://github.com/yourusername/opengrammar.git
cd opengrammar
wails dev
```

### Build for Production
```bash
# macOS Universal Binary (Intel + Apple Silicon)
wails build -platform darwin/universal -upx

# Windows with NSIS installer
wails build -platform windows/amd64 -nsis -upx

# Linux
wails build -platform linux/amd64 -upx

# Build all platforms
wails build -platform darwin/universal,windows/amd64,linux/amd64 -upx

# Production build with obfuscation (optional)
wails build -platform darwin/universal -obfuscated -trimpath -upx
```

## 🏗️ Architecture

### Tech Stack
- **Backend**: Go with Wails v2 framework
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v3
- **AI Integration**: Claude API (Anthropic)
- **Build System**: Wails v2 build pipeline

### Project Structure
```
opengrammar/
├── app.go                 # Go backend - Claude API integration
├── main.go               # Application entry point
├── wails.json           # Wails configuration
├── frontend/
│   ├── src/
│   │   ├── App.tsx      # Main React component
│   │   ├── App.css      # Styles and animations
│   │   └── main.tsx     # React entry point
│   ├── package.json     # Frontend dependencies
│   └── dist/           # Built frontend assets
├── build/
│   └── bin/            # Compiled applications
└── CLAUDE.md           # AI assistant documentation
```

### Key Components

#### Go Backend (`app.go`)
- **Claude API Integration** - HTTP client for Anthropic API
- **Multi-language Prompts** - Structured prompts for different actions
- **Request/Response Handling** - JSON marshaling and error handling
- **Action Processing** - Support for 5 built-in actions + custom prompts

#### React Frontend (`App.tsx`)
- **State Management** - React hooks for form data and results
- **Bilingual UI** - Dynamic text switching between English/Indonesian
- **Response Parsing** - Intelligent parsing of Claude's structured responses
- **Copy Functionality** - One-click copying of results
- **Form Validation** - Input validation and error handling

## 🎨 Features Deep Dive

### Custom Actions
Write your own prompts for any text processing task:
```
Examples:
- "Translate to Spanish"
- "Summarize in bullet points"
- "Make it more casual"
- "Convert to social media post"
```

### Response Format
OpenGrammar uses structured prompts that return:
```
ANALYSIS:
[Explanation of changes made]

FINAL RESULT:
[The processed text]
```

### Bilingual Interface
- **Auto-detection** - Remembers your language preference
- **Complete Translation** - All UI elements, prompts, and responses
- **Consistent Experience** - Same functionality in both languages

## 🤝 Contributing

We welcome contributions! Here's how to help:

### Types of Contributions
- 🐛 **Bug Reports** - Found an issue? Let us know!
- ✨ **Feature Requests** - Have an idea? Share it!
- 🔧 **Code Contributions** - Submit PRs for fixes/features
- 📖 **Documentation** - Help improve our docs
- 🌍 **Translations** - Add support for more languages

### Development Process
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- **Go**: Follow standard Go conventions
- **React**: Use TypeScript, functional components, and hooks
- **CSS**: Use Tailwind utility classes

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [Coming Soon]
- **Documentation**: [GitHub Wiki](../../wiki)
- **Issues**: [Bug Reports & Feature Requests](../../issues)
- **Discussions**: [Community Discussions](../../discussions)
- **Releases**: [Download Latest Version](../../releases)

## 🙏 Acknowledgments

- **[Wails](https://wails.io/)** - Amazing Go + Web framework
- **[Anthropic](https://anthropic.com/)** - Claude AI API
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React](https://react.dev/)** - UI library

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/kartubi/opengrammar?style=social)
![GitHub forks](https://img.shields.io/github/forks/kartubi/opengrammar?style=social)
![GitHub issues](https://img.shields.io/github/issues/kartubi/opengrammar)
![GitHub license](https://img.shields.io/github/license/kartubi/opengrammar)

---

*OpenGrammar is an open-source project. Star ⭐ us on GitHub if you find it useful!*
