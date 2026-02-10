# LSP Servers

Part of: [Component Architecture](README.md) > [Component Reference](README.md#component-quick-reference) > LSP Servers

LSP (Language Server Protocol) provides code intelligence capabilities to development tools through an open standard.

---

## Table of Contents

- [Overview](#overview)
- [Architecture: Separation of Concerns](#architecture-separation-of-concerns)
- [What LSP Servers Provide](#what-lsp-servers-provide)
- [Communication Flow](#communication-flow)
- [Configuration Example](#configuration-example)
- [Common Language Servers](#common-language-servers)
- [Best Practices](#best-practices)
- [Use Cases in AI Coding Agents](#use-cases-in-ai-coding-agents)
- [Limitations](#limitations)

---

## Overview

**Standard:** [LSP](https://microsoft.github.io/language-server-protocol/) (open)  
**Portability:** High - servers work across multiple editors; protocol fully standardized  
**Use for:** Code intelligence (diagnostics, navigation, type information)

LSP is an **open standard** that provides code intelligence capabilities to development tools. Originally developed by Microsoft for VS Code, LSP enables language-specific tooling (parsing, type checking, code completion) to work across multiple editors through a standardized protocol.

**Key difference from MCP:** LSP provides read-only analysis; [MCP](mcp-servers.md) handles operations with side effects.

**See also:**
- [Principles: Open Standards - LSP](principles-and-standards.md#language-server-protocol-lsp)
- [Component Comparison: MCP vs LSP](principles-and-standards.md#comparison-mcp-vs-lsp)

---

## Architecture: Separation of Concerns

LSP uses a **client-server architecture** where language servers run as separate processes from the editor:

```
Editor/IDE (LSP Client) ←→ JSON-RPC ←→ Language Server ←→ Code Analysis
     ↓                                       ↓
  UI/Interactions                    Parsing, Type Checking,
  (VSCode, Claude Code)              Static Analysis, AST
```

### Benefits of Separation

- **Performance isolation:** Resource-intensive analysis doesn't block editor UI
- **Language agnostic:** Servers can be written in any language (often the same language they analyze)
- **Reusability:** One server works across multiple editors (VS Code, Cursor, Claude Code, Neovim, etc.)
- **M+N scalability:** Instead of M editors × N languages (M×N implementations), only M+N implementations needed

---

## What LSP Servers Provide

LSP standardizes **code intelligence features** through JSON-RPC messages:

| Capability | LSP Method | Description | Example Use Case |
|------------|------------|-------------|------------------|
| **Diagnostics** | `textDocument/publishDiagnostics` | Real-time errors, warnings, hints | Show type errors, linting issues, unused imports |
| **Go to Definition** | `textDocument/definition` | Navigate to symbol definition | Jump to function/class/variable declaration |
| **Find References** | `textDocument/references` | Find all usages of a symbol | Locate all calls to a function |
| **Hover Information** | `textDocument/hover` | Show type info and documentation | Display function signatures, type annotations |
| **Code Completion** | `textDocument/completion` | Context-aware autocomplete | Suggest methods, variables, imports |
| **Code Actions** | `textDocument/codeAction` | Quick fixes and refactorings | Auto-import, extract variable, fix lint issues |
| **Signature Help** | `textDocument/signatureHelp` | Parameter hints during typing | Show function parameters as you type |
| **Document Symbols** | `textDocument/documentSymbol` | Outline of code structure | Show classes, functions, variables in file |
| **Rename** | `textDocument/rename` | Refactor symbol across files | Safely rename variables/functions project-wide |

---

## Communication Flow

### Document Lifecycle

```
1. Editor opens file → textDocument/didOpen
2. User edits → textDocument/didChange (incremental updates)
3. Editor saves → textDocument/didSave
4. Editor closes → textDocument/didClose
```

### Feature Request (Synchronous)

```
Client: "Give me completion at line 42, col 10"
Server: [Analyzes code, returns completion items]
Client: [Displays completions to user]
```

### Diagnostics (Asynchronous Notification)

```
Server: [Detects error in background]
Server → Client: textDocument/publishDiagnostics
Client: [Shows red squiggles in editor]
```

---

## Configuration Example

Claude Code configuration (`.lsp.json`):

```json
{
  "typescript": {
    "command": "typescript-language-server",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".ts": "typescript",
      ".tsx": "typescriptreact"
    }
  },
  "python": {
    "command": "pyright-langserver",
    "args": ["--stdio"],
    "extensionToLanguage": {
      ".py": "python"
    }
  }
}
```

**Note:** Claude Code and other AI-native editors use LSP to enhance code understanding during tool operations (reads, writes, searches), providing type-aware context to language models.

**See also:** [Plugin Structure: LSP Configuration](plugin-structure.md#directory-layout)

---

## Common Language Servers

| Language | Server | Install Command | Notes |
|----------|--------|-----------------|-------|
| TypeScript/JavaScript | typescript-language-server | `npm install -g typescript-language-server typescript` | Requires TypeScript compiler |
| Python | Pyright | `pip install pyright` | Fast, type-aware; alternative: Pylance (VS Code only) |
| Python | python-lsp-server | `pip install python-lsp-server` | Extensible with plugins |
| Go | gopls | `go install golang.org/x/tools/gopls@latest` | Official Go language server |
| Rust | rust-analyzer | [rust-analyzer.github.io](https://rust-analyzer.github.io/manual.html#installation) | Fast incremental compilation |
| Java | Eclipse JDT.LS | [eclipse.jdt.ls](https://github.com/eclipse-jdtls/eclipse.jdt.ls) | Full Java IDE features |
| C/C++ | clangd | Package manager or [llvm.org](https://clangd.llvm.org/installation.html) | Based on Clang compiler |
| Ruby | solargraph | `gem install solargraph` | Type inference and intellisense |
| PHP | intelephense | `npm install -g intelephense` | Commercial with free tier |

---

## Best Practices

### 1. Performance Considerations

- **Incremental updates:** LSP supports sending only changed text ranges (not entire files)
- **Debouncing:** Clients should debounce rapid edits before sending changes
- **Cancellation:** Long-running requests (e.g., find all references) should be cancellable
- **Lazy initialization:** Language servers can defer expensive indexing until needed

### 2. Document Synchronization

- **Full sync:** Send entire document on each change (simple but inefficient)
- **Incremental sync:** Send only changed ranges (preferred for large files)
- **Consistency:** Client must track document versions to prevent desync

### 3. Error Handling

- Language servers should gracefully handle malformed/incomplete code
- Provide partial results when possible (e.g., some completions even with parse errors)
- Log crashes and auto-restart on failure

### 4. Configuration

- Support project-specific settings (e.g., `tsconfig.json`, `.pylintrc`)
- Respect workspace-level configuration
- Allow runtime configuration updates without restart

---

## Use Cases in AI Coding Agents

LSP integration enhances AI agent capabilities:

### 1. Context-Aware Code Generation

- Query type information to generate correctly-typed code
- Use completion results to suggest valid APIs
- Navigate to definitions to understand usage patterns

### 2. Error Detection and Fixing

- Read diagnostics to identify issues before running code
- Apply code actions to auto-fix common problems
- Validate generated code matches type signatures

### 3. Code Understanding

- Find references to understand how functions are used
- Navigate symbol hierarchies for architectural insights
- Extract documentation from hover information

**Example workflow:**

```
1. Agent reads file with LSP
2. LSP returns diagnostics: "Undefined variable 'userData'"
3. Agent sees error, generates fix
4. Agent writes corrected code
5. LSP validates: no more errors
6. Agent confirms success
```

**See also:** [Orchestration: Using LSP with Agents](orchestration-and-decisions.md)

---

## Limitations

### What LSP Does NOT Provide

- **Code execution:** LSP analyzes static code, doesn't run it
- **Build/test management:** Use build tools separately
- **Version control:** Use Git or other VCS tools
- **Refactoring beyond rename:** Complex refactorings (extract class, change signature) are server-specific
- **Cross-language intelligence:** Each server handles one language/ecosystem

### Performance Considerations

- Large projects require indexing time (initial startup can be slow)
- Memory usage scales with project size
- Some servers more resource-intensive than others (e.g., Java vs Python)

### Integration Variability

- Protocol is standard, but capabilities differ per server
- Optional features may not be implemented
- Client integration quality varies (some editors expose more LSP features)

---

## Use Together: MCP + LSP

Combine both protocols for powerful AI agent capabilities:

```
AI Agent uses LSP to understand code structure and types
       ↓
Then uses MCP to query database based on schema understanding
       ↓
Combines both to generate type-safe database queries
```

**Example:**

```python
# Agent reads file and gets diagnostics from LSP
file_content = read_file("app.ts")
diagnostics = lsp_client.get_diagnostics("app.ts")

# Sees error: "Type 'string' is not assignable to type 'number'"
for diag in diagnostics:
    if diag.severity == "error":
        # Get hover info to understand expected type (LSP)
        hover = lsp_client.hover("app.ts", line=diag.line, col=diag.col)
        
        # Generate fix based on type information
        fix = generate_fix(diag, hover)
        
        # Apply fix using MCP tool
        mcp_client.call_tool("write_file", {"path": "app.ts", "content": fix})
```

**See also:**
- [MCP Servers](mcp-servers.md) for external operations
- [Component Comparison: MCP vs LSP](principles-and-standards.md#comparison-mcp-vs-lsp)

---

## Related Documentation

### Core Concepts
- [Principles: Open Standards - LSP](principles-and-standards.md#language-server-protocol-lsp)
- [Principles: Separation of Concerns](principles-and-standards.md#separation-of-concerns)
- [Component Comparison: MCP vs LSP](principles-and-standards.md#comparison-mcp-vs-lsp)

### Integration
- [Decision Framework: Code Intelligence](orchestration-and-decisions.md#component-selection-flowchart)
- [Skills](skills.md) can leverage LSP information
- [Agents](agents.md) can use LSP for code understanding
- [MCP Servers](mcp-servers.md) complement LSP with operations

### Implementation
- [Plugin Structure: LSP Configuration](plugin-structure.md#directory-layout)

### Related Components
- [MCP Servers](mcp-servers.md) - For external operations (write operations)
- [Skills](skills.md) - Can use LSP-informed code generation
- [Agents](agents.md) - Can leverage LSP for validation

---

## Resources

### Official Documentation
- [LSP Specification (v3.17)](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)
- [LSP Overview](https://microsoft.github.io/language-server-protocol/overviews/lsp/overview/)
- [VS Code Language Server Extension Guide](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)
- [Language Server Index](https://langserver.org/) - Directory of available servers
