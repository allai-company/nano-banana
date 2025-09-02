# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**nano-banana** is a desktop image generation application built with Tauri + React + TypeScript that leverages Google's Gemini 2.0 Flash Image Preview model for AI-powered image creation.

### Key Features
- 4-parallel image generation with 2×2 grid display
- Batch regeneration and continuous generation
- Automatic image saving to Windows AppData
- Persistent history with JSONL metadata storage
- Error handling with retry mechanisms
- Aspect ratio selection (1:1, 3:4, 4:3, 9:16, 16:9)

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (frontend only)
npm run dev

# Build for production
npm run build

# Start Tauri development (requires Rust + system dependencies)
npm run tauri dev

# Build Tauri app
npm run tauri build
```

## Architecture

### Frontend Stack
- **Tauri 2.0**: Desktop app framework
- **React 18**: UI framework
- **TypeScript 5**: Type safety
- **Vite**: Build tool

### Key Services
- `services/gemini.ts`: Gemini API integration with retry logic
- `services/storage.ts`: Local file system operations
- `utils/retry.ts`: Exponential backoff retry utility

### Core Components
- `ApiKeyManager`: API key input with local storage
- `ImageGenerator`: Prompt input and generation controls
- `ImageGallery`: Batch display with 2×2 grid layout
- `ErrorDisplay`: Toast-style error notifications

### File Structure
```
src/
├── components/          # React components (<200 lines each)
├── services/           # Business logic services
├── utils/              # Utility functions
├── types.ts           # TypeScript type definitions
└── App.tsx            # Main application
```

## Storage Architecture

- **Images**: Saved to `%LOCALAPPDATA%/nano-banana/outputs/YYYY-MM-DD/`
- **Metadata**: Stored in `index.jsonl` with one JSON object per line
- **API Keys**: Optional localStorage with user consent

## Development Guidelines

- Keep files under 200 lines when possible, splitting into modules as appropriate
- For MVP implementations, prefer single entry files to avoid file proliferation
- Minimize creation of test files and scattered code during initial development
- Use TypeScript strictly (no `any` or `unknown` types)
- Avoid classes unless absolutely necessary (prefer functions)
- All async operations include error handling with user-friendly messages

## Known Limitations

- Requires Windows 10/11 (x64)
- Rust toolchain needed for Tauri development
- Gemini API key required for image generation
- File system operations depend on Tauri plugins
