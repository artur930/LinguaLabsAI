# LinguaLabsAI

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?logo=tailwindcss)
![Claude AI](https://img.shields.io/badge/Claude_AI-Sonnet_4.6-orange)

> An AI-powered English speaking practice app — speak or type, get gentle grammar corrections, learn new vocabulary, and build confidence with your personal tutor Luna.

![Screenshot placeholder](https://via.placeholder.com/900x500/0f0f1a/6366f1?text=LinguaLabsAI+Screenshot)

---

## Features

- **🎙️ Voice Input** — Speak using your browser microphone with live transcription (Web Speech API)
- **🔊 Text-to-Speech** — Luna reads her responses aloud at slow / normal / fast speed
- **✏️ Grammar Corrections** — Mistakes are corrected gently, embedded naturally in the conversation
- **📚 Vocabulary Builder** — One new word or phrase introduced per response with IPA phonetics
- **🎭 6 Practice Scenarios** — Job Interview, Restaurant, Small Talk, Weekend Stories, Travel, and Movie/Book discussions
- **⚙️ Settings Panel** — Level selector (Beginner / Intermediate / Advanced), speech rate, toggle phonetics, toggle auto-play
- **📊 Session Stats** — Live word count, corrections received, and session timer
- **📱 Mobile Responsive** — Works on phones with large tap targets

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS |
| AI | Anthropic Claude claude-sonnet-4-6 |
| Speech | Web Speech API (built-in browser) |
| Deployment | Vercel (recommended) |

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/artur930/lingualabsai.git
cd lingualabsai
```

### 2. Install dependencies

```bash
npm install
```

### 3. Add your API key

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=sk-ant-...
```

Get a key at [console.anthropic.com](https://console.anthropic.com).

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Free conversation** — Just start typing or speaking right away
2. **Scenario practice** — Click **🎭 Scenarios** to pick a role-play situation
3. **Adjust settings** — Click **⚙️ Settings** to change level, speech rate, and toggles
4. **New session** — Click **🔄 New** to clear the chat and start fresh

### Voice input tips

- Chrome and Edge have the best speech recognition support
- Allow microphone permissions when prompted
- Tap the mic button, speak, then tap again to stop

## Project Structure

```
lingualabsai/
├── app/
│   ├── api/chat/route.ts    # Claude API endpoint
│   ├── layout.tsx
│   ├── page.tsx             # Main app shell
│   └── globals.css
├── components/
│   ├── ChatInterface.tsx
│   ├── Header.tsx
│   ├── MessageBubble.tsx
│   ├── ScenarioSelector.tsx
│   ├── SessionStats.tsx
│   ├── SettingsPanel.tsx
│   └── VoiceInput.tsx
├── hooks/
│   ├── useSpeechRecognition.ts
│   └── useSpeechSynthesis.ts
├── lib/
│   └── prompts.ts           # System prompt builder
└── types/
    └── index.ts             # Shared TypeScript types
```

## Deployment

Deploy to Vercel in one click:

```bash
npm run build   # Verify build succeeds first
```

Add `ANTHROPIC_API_KEY` as an environment variable in your Vercel project settings.

## License

MIT
