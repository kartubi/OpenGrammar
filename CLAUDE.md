# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OpenGrammar** is an open-source Wails v2 desktop application that provides AI-powered text processing using Claude AI. It implements a BYOK (Bring Your Own Key) architecture with comprehensive multilingual support and custom action capabilities.

### Architecture

- **Backend**: Go application (`main.go`, `app.go`) using Wails v2 framework with Claude API integration
- **Frontend**: React 18 + TypeScript application with Tailwind CSS v3 styling and Vite build system
- **Communication**: Wails automatically generates TypeScript bindings in `frontend/wailsjs/` for Go backend methods
- **API Integration**: Direct HTTP calls to Anthropic's Claude API with structured prompt engineering

### Core Features

#### Backend (`app.go`)
- **`ProcessText(text, apiKey, actionType, language) (string, error)`** - Main text processing function
- **Multi-language Support** - English and Indonesian prompts with structured responses
- **Action Types**:
  - `grammar` - Grammar, spelling, and style checking
  - `improve` - Text enhancement and clarity improvements
  - `rephrase` - Rewriting with different words/structures
  - `formal` - Formalization for business/academic contexts
  - `detailed` - Text expansion with additional context
  - Custom prompts - User-defined instructions for any task
- **Structured Prompts** - Formatted requests that return consistent `ANALYSIS:` + `FINAL RESULT:` format
- **Error Handling** - Comprehensive HTTP and API error management

#### Frontend (`App.tsx`)
- **Bilingual Interface** - Complete UI translation between English/Indonesian
- **State Management** - React hooks for form data, results, and preferences
- **Response Parsing** - Intelligent parsing of Claude's structured responses with quote removal
- **Custom Actions** - Dynamic textarea for user-defined prompts
- **Copy Functionality** - One-click copying of analysis and results
- **Form Validation** - Input validation for text and custom prompts
- **Persistent Settings** - LocalStorage for API keys and language preferences
- **Professional UI** - Tailwind CSS with proper contrast, spacing, and responsive design

## Development History & Technical Implementation

### Project Evolution
1. **Initial Setup** - Started as Wails v2 calculator template
2. **AI Integration** - Transformed to grammar checker with Claude API integration
3. **Multilingual Support** - Added complete English/Indonesian bilingual interface
4. **UI Enhancement** - Migrated to Tailwind CSS v3 with professional styling
5. **Custom Actions** - Implemented flexible prompt system for any text processing task
6. **Production Build** - Created universal macOS binary and DMG distribution

### Technical Challenges Solved
- **Tailwind CSS v4 Compatibility** - Downgraded to v3 for stable PostCSS integration
- **Response Parsing** - Implemented regex and fallback parsing for Claude's structured responses
- **Quote Removal** - Added logic to remove surrounding quotes from final text
- **Color Contrast** - Fixed white-on-white text visibility issues
- **Universal Binary** - Used `lipo` to create Intel + Apple Silicon compatible builds

### Key Implementation Details
- **API Model**: Uses `claude-3-haiku-20240307` with 1000 token limit
- **Response Structure**: All prompts return `ANALYSIS:` + action-specific result section
- **Error Handling**: Comprehensive validation for empty inputs, missing API keys, and API failures
- **State Persistence**: LocalStorage for API keys and language preferences
- **Custom Prompt Validation**: Ensures custom prompts are provided when custom action is selected

## Development Commands

### Live Development
```bash
wails dev
```
This starts the Wails development server with hot reload for both frontend and backend changes. A browser dev server runs on http://localhost:34115 for debugging Go methods from devtools.

### Frontend Development
```bash
cd frontend
npm install    # Install dependencies
npm run dev    # Start Vite dev server
npm run build  # Build frontend (TypeScript compilation + Vite build)
```

### Building for Production
```bash
# Universal macOS Binary (Intel + Apple Silicon)
wails build -platform darwin/universal

# Create DMG for distribution
cd build/bin && hdiutil create -volname "OpenGrammar" -srcfolder opengrammar.app -ov -format UDZO ../../OpenGrammar.dmg

# Build for specific platforms
wails build -platform darwin/amd64     # Intel Mac only
wails build -platform darwin/arm64     # Apple Silicon only
wails build -platform windows/amd64    # Windows 64-bit
wails build -platform linux/amd64      # Linux 64-bit
```

### Go Backend
Standard Go commands work for the backend:
```bash
go mod tidy    # Clean up dependencies
go build       # Build the Go application
```

## Key Configuration Files

- `wails.json` - Wails project configuration defining build commands and frontend integration
- `go.mod` - Go module definition with Wails v2 dependency
- `frontend/package.json` - Frontend dependencies (React, TypeScript, Vite)
- `frontend/vite.config.ts` - Vite build configuration

## Development Notes

- Wails automatically generates TypeScript bindings in `frontend/wailsjs/go/main/App` when Go methods are added to the App struct
- The frontend must import Go methods from the generated bindings path
- Frontend assets are embedded in the Go binary via `//go:embed all:frontend/dist`
- Backend methods exposed to frontend must be public (capitalized) and bound in `main.go`