<div align="center">
  <img src=".github/assets/lockstride-logo.png" alt="Lockstride Logo" width="80" />

# Lockstride Kickoff

**AI-guided workflow for startup ideation and development**

[![CI](https://github.com/lockstride/kickoff/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/lockstride/kickoff/actions/workflows/ci.yml)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[![Claude Code](https://img.shields.io/badge/Claude_Code-Plugin-6366f1.svg)](https://claude.ai/)
[![Node.js](https://img.shields.io/badge/node-22-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)](https://www.typescriptlang.org/)

A plugin for [Claude Code](https://claude.ai/) that guides entrepreneurs through a methodical process from initial concept to development handoff — eliminating repetitive setup, maintaining consistency, and preserving context through progressive artifact creation.

[Features](#-features) • [Quick Start](#-quick-start) • [Commands](#-commands) • [Documentation](#-documentation)

</div>

---

## 🎯 Why Kickoff?

**You have an idea. Now what?**

Most founders face the same painful early-stage problems: hours lost recreating the same documents from scratch, critical questions overlooked until it's too late, and valuable context scattered across conversations that never gets captured. Worse, when you finally sit down with advisors or investors, you discover gaps in your thinking that force you back to square one.

Kickoff eliminates this waste.

Instead of staring at blank documents or juggling fragmented notes, you get **a structured conversation** that asks the right questions in the right order. As you answer, Kickoff builds your business artifacts progressively — each document informed by what came before, maintaining consistency automatically.

**The result?** In hours, not weeks, you move from rough concept to:

- **Rigorously researched** market analysis with competitive positioning
- **Thoughtfully designed** brand identity with naming and domain validation  
- **Clearly articulated** product specifications ready for development handoff
- **Battle-tested ideas** through optional VC-style stress testing (SKEPTIC MODE)

Every document follows proven templates refined across real startups. No more wondering if you've addressed the right concerns or structured things correctly — the methodology is baked in.

And when you're ready to build? Kickoff hands off clean, structured requirements directly into a development-ready monorepo. No translation layer. No "let me dig up that doc we wrote three months ago."

**Kickoff doesn't replace your judgment.** It amplifies it by handling the tedious parts — document structure, consistency checks, research synthesis — so you can focus on the strategic decisions only you can make.

Start with a concept. Leave with conviction and a concrete plan.

---

## ✨ Features

- **💡 Interactive Input Gathering** - Structured conversations for business, brand, and product direction
- **📊 Market Research** - Automated market analysis, competitive landscape, and IP search
- **✏️ Naming Exercise** - Structured naming workflow with domain and trademark validation
- **📄 Document Generation** - Business briefs, brand briefs, product specs, pitch decks, and more
- **🎯 SKEPTIC MODE** - Optional VC-style stress-testing at key milestones
- **🚀 Development Handoff** - Seamless transition from planning to coding with monorepo setup

## 🚀 Quick Start

### Prerequisites

This plugin requires **Claude Code** with a subscription that supports plugins. If you don't have Claude installed:

- **Desktop App** (easiest): Download from [claude.ai/download](https://claude.ai/download)
- **Command Line**: Install via `npm install -g @anthropic-ai/claude-code`

For detailed installation instructions, see the [Installation Guide](docs/installation.md).

> **⚠️ AI-Generated Content Disclaimer**
>
> This tool uses artificial intelligence to evaluate startup business concepts and generate documents. AI-generated output may contain errors, inaccuracies, or incomplete information. The content is provided "as-is" without warranty of any kind. Users should not rely on AI output as a substitute for professional business, legal, or financial advice. Always review, verify, and validate all generated content before using it for business decisions, presentations, or external communications.

### Install the Plugin

Within Claude, run:

```
/plugin marketplace add lockstride/claude-marketplace
/plugin install lockstride-kickoff@lockstride-marketplace
```

### Start Your First Project

1. **Initialize a startup**:

   ```
   /lockstride-kickoff:init "My Startup Name"
   ```

   > No name yet? Run without arguments to get a temporary code name (like "PURPLE WALRUS"). A naming exercise is built into the workflow.

   If this is your first time, the command will automatically guide you through configuration setup before continuing.

2. **Follow the guided workflow** through brainstorming, research, and documentation.

## 💻 Commands

| Command | Description |
| ------- | ----------- |
| `/lockstride-kickoff:config` | Configure startups and development paths |
| `/lockstride-kickoff:init` | Initialize or resume a startup |
| `/lockstride-kickoff:status` | Show current progress |
| `/lockstride-kickoff:create-repo` | Create repository from monorepo template |
| `/lockstride-kickoff:generate-docs` | Generate or export documents with smart routing |
| `/lockstride-kickoff:name-startup` | Interactive naming exercise or simple rename |

**Document generation examples:**
- `/lockstride-kickoff:generate-docs` — List available documents
- `/lockstride-kickoff:generate-docs business-brief` — Generate with smart routing
- `/lockstride-kickoff:generate-docs pitch-deck external` — Export DOCX/PPTX ([Pandoc](https://pandoc.org/) required)

## 📂 Document Workflow

The workflow follows a structured progression:

```
business-brief (required, interactive input gathering)
       │
       ▼
market-analysis (required, web research)
       │
       ▼
  [naming exercise] (optional, offered before brand brief)
       │
       ▼
  brand-brief (required, interactive input gathering)
       │
       ▼
 product-brief (required)
       │
       ▼
product-spec + technical-requirements (required, synthesized from prior docs)
```

**Interactive documents** (business-brief, brand-brief, product-brief) use the `gathering-input` skill to conduct structured conversations before generating content.

Optional documents (ip-search, gtm, business-plan, pitch-deck) are prompted at appropriate points.

## 🤔 SKEPTIC MODE

At key milestone documents, engage **SKEPTIC MODE** for rigorous stress-testing before proceeding.

When activated, a VC-style challenger will:

- Read your generated document
- Challenge key assumptions with pointed questions
- Push for data, evidence, and defensible reasoning
- Back off only when you demonstrate genuine insight

**Exit criteria:**

- 3 satisfactory responses (you've defended your position)
- Say "skip" to exit early
- After 5+ exchanges without progress

After the challenge session, **incorporate insights directly into your document** — strengthening weak points identified during questioning without manually rewriting.

SKEPTIC MODE is optional but recommended before external reviews, investor meetings, or major decisions.


## 📚 Documentation

| Guide | Description |
| ----- | ----------- |
| [Installation Guide](docs/installation.md) | Detailed setup for Claude and optional tools |
| [Development Guide](docs/development.md) | Setup, testing, and contribution workflow |
| [Architecture](docs/kickoff-architecture.md) | Kickoff-specific architectural patterns |
| [Component Architecture](docs/component-architecture/README.md) | Plugin component design principles |
| [Templates](skills/generating-documents/assets/templates/) | Document template customization |

## 🤝 Feedback & Contributions

This plugin is maintained with limited bandwidth. Bug reports and suggestions are welcome via issues, though response times may vary. For feature additions, consider forking the repository for your specific needs.

The project follows:

- **Test coverage** - All code must be tested
- **Type safety** - TypeScript throughout the stack
- **Code quality** - ESLint and Prettier enforce consistent style

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🏢 About

Built by [**Lockstride**](https://lockstride.ai) - Accelerating software development with AI-powered tools, templates, and workflows.

📧 **Contact:** hello+kickoff@lockstride.ai

---

<div align="center">

⭐ **If you find this plugin helpful, consider giving it a star!** ⭐

</div>
