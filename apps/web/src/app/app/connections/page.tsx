"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Bot,
  Copy,
  Check,
  Trash2,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Key,
} from "lucide-react";

interface OAuthConnection {
  id: string;
  clientName: string;
  clientId: string;
  scope: string;
  createdAt: string;
  lastUsedAt: string | null;
  accessExpiresAt: string;
  revokedAt: string | null;
}

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<OAuthConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const remoteMcpUrl = "https://stonewaymd.vercel.app/mcp";

  const fetchConnections = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/oauth/connections");
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch (err) {
      console.error("Failed to load OAuth connections:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConnections();
  }, []);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(remoteMcpUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure you want to revoke this agent's access to your StoneWay profile?")) {
      return;
    }
    try {
      setRevokingId(id);
      const res = await fetch(`/api/oauth/connections?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConnections((prev) =>
          prev.map((c) => (c.id === id ? { ...c, revokedAt: new Date().toISOString() } : c))
        );
      }
    } catch (err) {
      console.error("Failed to revoke connection:", err);
    } finally {
      setRevokingId(null);
    }
  };

  const activeConnections = connections.filter((c) => !c.revokedAt);
  const revokedConnections = connections.filter((c) => !!c.revokedAt);

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      {/* Header */}
      <div className="border-b border-neutral-800 pb-6">
        <div className="flex items-center space-x-2 text-xs text-neutral-400 mb-2">
          <Link href="/app/editor" className="hover:text-white transition">
            Dashboard
          </Link>
          <span>/</span>
          <span className="text-white">Connections</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
          Connected AI Agents (OAuth Grants)
        </h1>
        <p className="text-sm text-neutral-400 mt-1">
          Manage cloud AI agents (Claude.ai, ChatGPT) that access your StoneWay identity via zero-friction OAuth.
        </p>
      </div>

      {/* Quick Setup Card */}
      <div className="border border-neutral-800 bg-neutral-950/80 rounded-xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-200">
              Remote MCP Endpoint URL
            </h2>
          </div>
          <span className="text-xs text-neutral-500 font-mono">Streamable HTTP • OAuth 2.0</span>
        </div>

        <p className="text-xs text-neutral-400 leading-relaxed">
          Paste this URL into Claude.ai or ChatGPT’s custom connector interface. When prompted, sign in with GitHub to connect your profile automatically—no API keys or config file editing required.
        </p>

        <div className="flex items-center space-x-2 bg-black border border-neutral-800 rounded-lg p-2 font-mono text-xs">
          <input
            type="text"
            readOnly
            value={remoteMcpUrl}
            className="bg-transparent flex-1 text-emerald-400 outline-none px-2 select-all"
          />
          <button
            onClick={handleCopyUrl}
            className="flex items-center space-x-1 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 px-3 py-1.5 rounded transition text-xs border border-neutral-700"
          >
            {copiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedUrl ? "Copied" : "Copy URL"}</span>
          </button>
        </div>
      </div>

      {/* Active Grants List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Bot className="w-5 h-5 text-neutral-400" />
            Active Agent Grants ({activeConnections.length})
          </h2>
          <button
            onClick={fetchConnections}
            className="text-xs text-neutral-400 hover:text-white flex items-center space-x-1 border border-neutral-800 px-2.5 py-1 rounded hover:border-neutral-700 transition"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {loading ? (
          <div className="border border-neutral-900 rounded-xl p-8 text-center text-xs text-neutral-500 font-mono">
            Loading agent connections...
          </div>
        ) : activeConnections.length === 0 ? (
          <div className="border border-neutral-900 bg-neutral-950/40 rounded-xl p-10 text-center space-y-3">
            <Bot className="w-10 h-10 text-neutral-700 mx-auto" />
            <h3 className="text-sm font-medium text-neutral-300">No Active Remote Connectors</h3>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              You haven’t connected Claude.ai or ChatGPT yet. Copy the URL above and paste it into their MCP or connector screen to get started.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-900 border border-neutral-800 bg-neutral-950 rounded-xl overflow-hidden">
            {activeConnections.map((conn) => (
              <div key={conn.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-900/40 transition">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-sm text-white">{conn.clientName}</span>
                    <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800/60 px-2 py-0.5 rounded-full font-mono">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-neutral-400 font-mono flex flex-wrap gap-x-4 gap-y-1">
                    <span>Scope: {conn.scope}</span>
                    <span>•</span>
                    <span>Connected: {new Date(conn.createdAt).toLocaleDateString()}</span>
                    {conn.lastUsedAt && (
                      <>
                        <span>•</span>
                        <span>Last used: {new Date(conn.lastUsedAt).toLocaleDateString()}</span>
                      </>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleRevoke(conn.id)}
                  disabled={revokingId === conn.id}
                  className="inline-flex items-center space-x-1.5 text-xs text-red-400 hover:text-red-300 border border-red-950/80 bg-red-950/20 px-3 py-1.5 rounded hover:border-red-800 transition disabled:opacity-50 self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{revokingId === conn.id ? "Revoking..." : "Revoke Grant"}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Revoked Grants History */}
      {revokedConnections.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-neutral-900">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Revoked Grants ({revokedConnections.length})
          </h3>
          <div className="divide-y divide-neutral-900 border border-neutral-900 bg-neutral-950/40 rounded-xl overflow-hidden opacity-60">
            {revokedConnections.map((conn) => (
              <div key={conn.id} className="p-4 flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-neutral-400">{conn.clientName}</div>
                  <div className="text-[11px] text-neutral-600 font-mono">
                    Revoked on {conn.revokedAt ? new Date(conn.revokedAt).toLocaleDateString() : ""}
                  </div>
                </div>
                <span className="text-[10px] text-neutral-500 border border-neutral-800 px-2 py-0.5 rounded">
                  Revoked
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
