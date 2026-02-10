# Installation Guide

Complete installation instructions for the Lockstride Kickoff plugin.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installing Claude](#installing-claude)
- [Installing the Plugin](#installing-the-plugin)
- [Optional Tools](#optional-tools)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

The only requirement is **Claude Code** — Anthropic's AI coding assistant. Choose one of the installation methods below based on your preference.

## Installing Claude

### Option A: Claude Desktop App (Recommended for Beginners)

The desktop app provides a visual interface and is the simplest way to get started.

**System Requirements:**

- macOS 11 (Big Sur) or higher, OR
- Windows 10 or higher

**Installation Steps:**

1. Visit [claude.ai/download](https://claude.ai/download)
2. Download the version for your operating system (macOS or Windows)
3. Open the downloaded file and follow the installation prompts
4. Launch Claude from your Applications folder (Mac) or Start menu (Windows)
5. Sign in with your Claude account (create one if needed)

For detailed setup instructions, see the [official installation guide](https://support.claude.com/en/articles/10065433-installing-claude-desktop).

### Option B: Claude Code CLI (For Terminal Users)

The command-line interface offers more flexibility for those comfortable with the terminal.

**System Requirements:**

- macOS 10.15+, Linux (Ubuntu 20.04+/Debian 10+), or Windows 10+ (via WSL or Git Bash)
- 4GB RAM minimum
- Node.js 22+ (for npm installation method)

**Installation Methods:**

Using npm (requires Node.js 22+):

```bash
npm install -g @anthropic-ai/claude-code
```

Using the install script (no Node.js required):

```bash
# macOS / Linux
curl -fsSL https://claude.ai/install.sh | bash

# Windows (PowerShell)
irm https://claude.ai/install.ps1 | iex
```

For detailed CLI documentation, see the [CLI reference](https://docs.claude.com/en/docs/claude-code/cli-reference).

## Installing the Plugin

### From Lockstride Marketplace (Recommended)

Within Claude, run these commands:

```
/plugin marketplace add lockstride/claude-marketplace
/plugin install lockstride-kickoff@lockstride-marketplace
```

For local development setup, see the [Development Guide](development.md).

## Getting Started

After installing the plugin, run the init command to start your first project:

```
/lockstride-kickoff:init
```

If this is your first time, the command will automatically guide you through configuration setup before continuing. Configuration is stored at `~/.lockstride/kickoff/config.json` with:
- **documentsRoot**: Base directory where startup documents are stored
- **applicationsRoot**: Base directory where code repositories are created
- **templateRepo**: GitHub template for development setup

To manage your configuration directly, use `/lockstride-kickoff:config --update`.

### Per-Startup Profiles

Different startups can have different paths. When you initialize a startup with `/lockstride-kickoff:init`, you'll be offered the option to customize paths for that specific startup.

Custom paths are saved as "profiles" in your config:

```json
{
  "default": {
    "documentsRoot": "~/Startups",
    "applicationsRoot": "~/dev"
  },
  "profiles": {
    "client-project": {
      "displayName": "Client Project",
      "documentsPath": "~/clients/planning/client-project",
      "applicationsPath": "~/clients/code/client-project"
    }
  }
}
```

Each profile stores `displayName` (the original startup name with preserved casing) and any path values that differ from the default.

To view or manage your configuration:
- `/lockstride-kickoff:config` — Display current config
- `/lockstride-kickoff:config --update` — Update default settings
- `/lockstride-kickoff:config --profile NAME` — Create/update a profile

## Optional Tools

These tools are **not required** for basic usage but enable specific features:

### Pandoc

**Required for:** Exporting polished documents (DOCX, PPTX) using the `/lockstride-kickoff:generate-docs {doc-type} external` command.

**What it does:** Converts your internal markdown documents into professionally formatted Word and PowerPoint files for sharing with investors, partners, or team members.

**Installation:**

- **macOS:** `brew install pandoc`
- **Windows:** Download from [pandoc.org/installing](https://pandoc.org/installing.html)
- **Linux:** `apt install pandoc` or `dnf install pandoc`

**Note:** The export also requires the `adm-zip` npm package for DOCX post-processing. Claude will check for this and install it globally (`npm install -g adm-zip`) if missing.

**If not installed:** The core workflow (brainstorming, document generation, etc.) works normally. You'll only encounter an error if you try to export external documents.

### Node.js

**Required for:** Downloading the monorepo template using the `/lockstride-kickoff:create-repo` command.

**What it does:** Enables `npx degit` to download the template repository without git history. Also required for developing with the Nuxt-based monorepo template.

**Installation:**

- **macOS:** `brew install node` or download from [nodejs.org](https://nodejs.org/)
- **Windows:** Download from [nodejs.org](https://nodejs.org/) or `winget install OpenJS.NodeJS`
- **Linux:** `apt install nodejs` or see [nodejs.org](https://nodejs.org/)

**If not installed:** The create-repo command will attempt a fallback using curl/tar, but Node.js is ultimately required for the monorepo template itself.

### GitHub CLI

**Optional for:** Creating a GitHub remote repository using the `/lockstride-kickoff:create-repo` command.

**What it does:** Creates a GitHub repository to store your code online, enabling backup, collaboration, and deployment.

**Installation:**

- **macOS:** `brew install gh`
- **Windows:** `winget install --id GitHub.cli`
- **Linux:** See [cli.github.com](https://cli.github.com/) for distribution-specific instructions

After installation, authenticate with your GitHub account:

```bash
gh auth login
```

**If not installed:** You can still download the template and initialize git locally. The GitHub remote step is optional — you can add it later or work entirely offline.

## Troubleshooting

### Claude won't start

- Ensure you have a valid Claude account at [claude.ai](https://claude.ai)
- For CLI users, verify installation with `claude doctor`
- Check that your system meets the minimum requirements

### Plugin not found

- Verify the marketplace was added: `/plugin marketplace list`
- Try reinstalling: `/plugin uninstall lockstride-kickoff` then `/plugin install lockstride-kickoff@lockstride-marketplace`

### Document export fails

- Verify Pandoc is installed: `pandoc --version`
- If adm-zip is missing, Claude will install it globally (`npm install -g adm-zip`)
- Ensure the reference template exists in your startup's `generated-assets/external/` folder

### Create repo fails

- Verify GitHub CLI is installed: `gh --version`
- Ensure you're authenticated: `gh auth status`
- Check that you have permission to create repositories
- Verify the template repository exists and is accessible

---

*For additional help, see the [Development Guide](development.md) or contact hello+kickoff@lockstride.ai*
