import Link from "next/link";
import { Copy, Terminal, Shield, Sparkles, BookOpen, ExternalLink, Cpu } from "lucide-react";

export default function DocsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 text-neutral-300 text-xs leading-relaxed pb-16">
      {/* Header */}
      <div className="border-b border-neutral-900 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">STONEWAY DOCUMENTATION</h1>
          <p className="text-neutral-400 mt-1">
            Give every AI agent the same you. Persistent, user-owned identity, projects, and context across all your coding tools.
          </p>
        </div>
        <Link href="/" className="text-neutral-500 hover:text-white transition">
          ← home
        </Link>
      </div>

      {/* 1. Quick Start */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>1. Quick Start (Zero-Token Setup)</span>
        </h2>
        <p className="text-neutral-400">
          StoneWay acts as a cloud-backed memory vault and profile generator for all your AI coding agents. We eliminate token friction with two seamless authentication methods:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-lg space-y-2">
            <span className="text-xs font-semibold text-emerald-400">Option A: Local Agents (CLI Device Login)</span>
            <p className="text-neutral-400 text-[11px]">
              Run one command to authenticate via your browser. Your credentials are securely cached in <code className="text-neutral-300">~/.stoneway/credentials.json</code> so agent configs need no secrets!
            </p>
            <pre className="p-2 bg-black border border-neutral-900 rounded text-[11px] text-neutral-200 font-mono overflow-x-auto">
{`npx -y stoneway-mcp login
# or with Python:
uvx stoneway-mcp login`}
            </pre>
          </div>
          <div className="bg-neutral-950 border border-neutral-900 p-4 rounded-lg space-y-2">
            <span className="text-xs font-semibold text-blue-400">Option B: Web Agents (Claude.ai & ChatGPT)</span>
            <p className="text-neutral-400 text-[11px]">
              Paste the canonical remote URL into your client&apos;s custom connector screen and log in with GitHub via RFC 8414 OAuth 2.0:
            </p>
            <pre className="p-2 bg-black border border-neutral-900 rounded text-[11px] text-neutral-200 font-mono overflow-x-auto">
{`https://stonewaymd.vercel.app/api/mcp`}
            </pre>
            <p className="text-neutral-500 text-[10px]">
              Manage or revoke connected apps anytime at <Link href="/app/connections" className="text-neutral-300 underline">/app/connections</Link>.
            </p>
          </div>
        </div>
        <p className="text-neutral-500 text-[11px]">
          Static API keys (<code className="text-neutral-300">sw_...</code>) from <Link href="/app/key" className="text-neutral-300 underline">/app/key</Link> remain fully supported via the <code className="text-neutral-300">STONEWAY_TOKEN</code> environment variable for CI/headless environments.
        </p>
      </section>

      {/* 2. Standing Instructions */}
      <section className="space-y-4 bg-neutral-950 border border-neutral-800 p-5 rounded-lg">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Standing Rule for Agents
          </h2>
        </div>
        <p className="text-neutral-400">
          AI agents don&apos;t reliably discover or call tools by themselves. Add this single standing instruction to your agent&apos;s global or project rules files (<strong>CLAUDE.md</strong>, <strong>AGENTS.md</strong>, <strong>.cursor/rules</strong>, or <strong>GEMINI.md</strong>):
        </p>

        <pre className="p-3 bg-black border border-neutral-800 rounded text-[11px] text-amber-200 font-mono overflow-x-auto select-all">
{`# StoneWay Agent Memory Instruction
Before answering anything about me, my projects, or my preferences, call StoneWay's get_profile_context. After meaningful work, call append_note with what changed.`}
        </pre>
      </section>

      {/* 3. Client Setup Guides */}
      <section className="space-y-6">
        <div className="border-b border-neutral-900 pb-2">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span>2. Connect Every Agent You Use</span>
          </h2>
          <p className="text-neutral-500 mt-1">
            Choose your client below and paste the configuration into the corresponding settings file.
          </p>
          <div className="mt-2 p-2.5 bg-emerald-950/30 border border-emerald-900/50 rounded text-[11px] text-emerald-300">
            <strong>💡 Zero-Token Tip:</strong> If you ran <code className="text-white">npx -y stoneway-mcp login</code> (or <code className="text-white">uvx stoneway-mcp login</code>), your credentials are automatically read from disk. You can omit the <code className="text-white">env</code> block completely!
          </div>
        </div>

        {/* Claude Desktop */}
        <div className="space-y-2 bg-neutral-950 p-4 border border-neutral-900 rounded-lg">
          <h3 className="font-bold text-neutral-200">Claude Desktop</h3>
          <p className="text-neutral-400 text-[11px]">
            File: <code className="text-neutral-300">%APPDATA%\Claude\claude_desktop_config.json</code> (Windows) or <code className="text-neutral-300">~/Library/Application Support/Claude/claude_desktop_config.json</code> (macOS).
          </p>
          <pre className="p-3 bg-black border border-neutral-900 rounded text-[11px] text-neutral-300 overflow-x-auto">
{`{
  "mcpServers": {
    "stoneway": {
      "command": "npx",
      "args": ["-y", "stoneway-mcp"],
      "env": {
        "STONEWAY_TOKEN": "sw_your_token_here",
        "STONEWAY_API_URL": "https://stonewaymd.vercel.app/api/v1"
      }
    }
  }
}`}
          </pre>
        </div>

        {/* Claude Code CLI */}
        <div className="space-y-2 bg-neutral-950 p-4 border border-neutral-900 rounded-lg">
          <h3 className="font-bold text-neutral-200">Claude Code CLI</h3>
          <p className="text-neutral-400 text-[11px]">
            Run this command directly in your terminal:
          </p>
          <pre className="p-3 bg-black border border-neutral-900 rounded text-[11px] text-neutral-300 overflow-x-auto">
{`claude mcp add stoneway npx -y stoneway-mcp --env STONEWAY_TOKEN=sw_your_token_here`}
          </pre>
        </div>

        {/* Cursor */}
        <div className="space-y-2 bg-neutral-950 p-4 border border-neutral-900 rounded-lg">
          <h3 className="font-bold text-neutral-200">Cursor IDE</h3>
          <p className="text-neutral-400 text-[11px]">
            File: <code className="text-neutral-300">.cursor/mcp.json</code> (per-repo) or Cursor Settings → Features → MCP:
          </p>
          <pre className="p-3 bg-black border border-neutral-900 rounded text-[11px] text-neutral-300 overflow-x-auto">
{`{
  "mcpServers": {
    "stoneway": {
      "command": "npx",
      "args": ["-y", "stoneway-mcp"],
      "env": {
        "STONEWAY_TOKEN": "sw_your_token_here",
        "STONEWAY_API_URL": "https://stonewaymd.vercel.app/api/v1"
      }
    }
  }
}`}
          </pre>
        </div>

        {/* VS Code Copilot */}
        <div className="space-y-2 bg-neutral-950 p-4 border border-neutral-900 rounded-lg">
          <h3 className="font-bold text-neutral-200">VS Code (GitHub Copilot)</h3>
          <p className="text-neutral-400 text-[11px]">
            File: <code className="text-neutral-300">.vscode/mcp.json</code>:
          </p>
          <pre className="p-3 bg-black border border-neutral-900 rounded text-[11px] text-neutral-300 overflow-x-auto">
{`{
  "servers": {
    "stoneway": {
      "command": "npx",
      "args": ["-y", "stoneway-mcp"],
      "env": {
        "STONEWAY_TOKEN": "sw_your_token_here"
      }
    }
  }
}`}
          </pre>
        </div>

        {/* Windsurf & Cline */}
        <div className="space-y-2 bg-neutral-950 p-4 border border-neutral-900 rounded-lg">
          <h3 className="font-bold text-neutral-200">Windsurf & Cline</h3>
          <p className="text-neutral-400 text-[11px]">
            Add to your Cline / Windsurf MCP settings file:
          </p>
          <pre className="p-3 bg-black border border-neutral-900 rounded text-[11px] text-neutral-300 overflow-x-auto">
{`{
  "mcpServers": {
    "stoneway": {
      "command": "npx",
      "args": ["-y", "stoneway-mcp"],
      "env": {
        "STONEWAY_TOKEN": "sw_your_token_here"
      }
    }
  }
}`}
          </pre>
        </div>

        {/* Codex CLI */}
        <div className="space-y-2 bg-neutral-950 p-4 border border-neutral-900 rounded-lg">
          <h3 className="font-bold text-neutral-200">Codex CLI</h3>
          <p className="text-neutral-400 text-[11px]">
            File: <code className="text-neutral-300">config.toml</code>:
          </p>
          <pre className="p-3 bg-black border border-neutral-900 rounded text-[11px] text-neutral-300 overflow-x-auto">
{`[mcp_servers.stoneway]
command = "npx"
args = ["-y", "stoneway-mcp"]
env = { STONEWAY_TOKEN = "sw_your_token_here" }`}
          </pre>
        </div>

        {/* Gemini CLI */}
        <div className="space-y-2 bg-neutral-950 p-4 border border-neutral-900 rounded-lg">
          <h3 className="font-bold text-neutral-200">Gemini CLI</h3>
          <p className="text-neutral-400 text-[11px]">
            File: <code className="text-neutral-300">settings.json</code>:
          </p>
          <pre className="p-3 bg-black border border-neutral-900 rounded text-[11px] text-neutral-300 overflow-x-auto">
{`{
  "mcpServers": {
    "stoneway": {
      "command": "npx",
      "args": ["-y", "stoneway-mcp"],
      "env": {
        "STONEWAY_TOKEN": "sw_your_token_here"
      }
    }
  }
}`}
          </pre>
        </div>

        {/* Remote HTTP for Cloud Agents */}
        <div className="space-y-3 bg-neutral-950 p-4 border border-neutral-800 rounded-lg">
          <h3 className="font-bold text-white flex items-center gap-2">
            <span>Remote HTTP Server with OAuth 2.0 (Claude.ai & ChatGPT)</span>
          </h3>
          <p className="text-neutral-400 text-[11px]">
            Web-based agents running in the cloud (such as <strong className="text-neutral-200">Claude.ai</strong> or <strong className="text-neutral-200">ChatGPT</strong> Custom Connectors) cannot run local terminal binaries. Connect them directly to StoneWay&apos;s hosted Streamable HTTP endpoint:
          </p>
          <div className="p-3 bg-black border border-neutral-900 rounded text-[11px] space-y-1.5 font-mono">
            <div><span className="text-neutral-500">Canonical URL:</span> <code className="text-emerald-400">https://stonewaymd.vercel.app/api/mcp</code></div>
            <div><span className="text-neutral-500">Alias URL:</span> <code className="text-neutral-300">https://stonewaymd.vercel.app/mcp</code></div>
            <div><span className="text-neutral-500">Authentication:</span> <span className="text-neutral-300">RFC 8414 OAuth 2.0 (Auto-discovered via /.well-known) or Bearer sw_...</span></div>
          </div>
          <div className="space-y-1.5 text-[11px] text-neutral-400 pt-1">
            <p>
              • <strong>Claude.ai:</strong> Enter the URL in your Claude Custom Connector screen. Claude discovers the metadata, redirects you to sign in with GitHub, and obtains an OAuth token automatically.
            </p>
            <p>
              • <strong>ChatGPT:</strong> Supports Dynamic Client Registration (<code className="text-neutral-300">/api/oauth/register</code>) and RFC 7636 PKCE.
            </p>
            <p>
              • <strong>Claude Code & Desktop:</strong> You can also pass <code className="text-neutral-300">Authorization: Bearer sw_...</code> in headers if using HTTP transport directly.
            </p>
            <p>
              • <strong>Security Safeguards:</strong> Query string tokens (<code className="text-neutral-400">?token=</code>) are strictly forbidden to prevent URL logging. Active OAuth grants can be viewed and revoked anytime at <Link href="/app/connections" className="text-emerald-400 underline">/app/connections</Link>.
            </p>
          </div>
        </div>

        {/* Python Native & MCP Inspector */}
        <div className="space-y-2 bg-neutral-950 p-4 border border-neutral-900 rounded-lg">
          <h3 className="font-bold text-neutral-200">Python FastMCP / Native Stdio</h3>
          <p className="text-neutral-400 text-[11px]">
            If you prefer Python directly or want to test with the official MCP Inspector:
          </p>
          <pre className="p-3 bg-black border border-neutral-900 rounded text-[11px] text-neutral-300 overflow-x-auto">
{`# Test with MCP Inspector (>= 0.14.1)
npx @modelcontextprotocol/inspector py -m stoneway_mcp.server

# Or direct Python command
python -m stoneway_mcp.server`}
          </pre>
        </div>
      </section>

      {/* 4. Daily Vibecoder Routine */}
      <section className="space-y-3 bg-neutral-950 border border-neutral-900 p-5 rounded-lg">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          3. Daily Vibecoder Routine
        </h2>
        <ul className="list-disc pl-5 space-y-2 text-neutral-400">
          <li>
            <strong>Instant Bios:</strong> Tell your agent <code className="text-neutral-200">&quot;Write my X bio&quot;</code> or <code className="text-neutral-200">&quot;Draft my GitHub headline&quot;</code>. The agent calls <code className="text-white font-mono">get_bio</code> using strictly verified public facts.
          </li>
          <li>
            <strong>Session Start:</strong> Your agent calls <code className="text-white font-mono">get_profile_context</code> and automatically matches your preferred frameworks and conventions.
          </li>
          <li>
            <strong>Session End:</strong> Tell your agent <code className="text-neutral-200">&quot;Log what we built&quot;</code>. It calls <code className="text-white font-mono">append_note</code> without touching your code files.
          </li>
          <li>
            <strong>Weekly Sync:</strong> Open <Link href="/app/editor" className="text-white underline">/app/editor</Link>, skim your markdown notes, and click <Link href="/app/connectors" className="text-white underline">Sync Now</Link> on your GitHub connector.
          </li>
          <li>
            <strong>Resume Export:</strong> Click <code className="text-emerald-400">JSON Resume</code> in the editor or fetch <code className="text-neutral-300">/api/user/resume</code> to export your profile into standard JSON Resume format.
          </li>
        </ul>
      </section>

      {/* 5. Tools Reference */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">
          4. Available Tools Reference
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              name: "get_profile_context",
              desc: "Retrieves structured StoneWay.json and StoneWay.md with reconciliation guidance. Call this first in any coding session.",
            },
            {
              name: "update_profile_context",
              desc: "Optimistic-locking update to structured StoneWay.json with zero-data-loss overflow capture.",
            },
            {
              name: "append_note",
              desc: "Appends timestamped notes, commit summaries, or architectural decisions to StoneWay.md.",
            },
            {
              name: "get_bio",
              desc: "Generates platform-tailored bios (github, x, linkedin, devpost) filtered strictly to public fields.",
            },
            {
              name: "trigger_external_sync",
              desc: "Triggers on-demand synchronization for connected integrations (GitHub, npm, Notion).",
            },
            {
              name: "export_json_resume",
              desc: "Exports profile in standardized JSON Resume schema for interoperability.",
            },
          ].map((tool, idx) => (
            <div key={idx} className="bg-neutral-950 border border-neutral-900 p-3 rounded-lg space-y-1">
              <code className="text-emerald-400 font-bold text-xs">{tool.name}</code>
              <p className="text-neutral-400 text-[11px] leading-relaxed">{tool.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
