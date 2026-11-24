import type React from "react";
import { c, mono, sans, sticker } from "./theme";

// Plain presentational pieces of the mocked product UI. Scenes position and
// animate them through Interactive.Div wrappers, so these stay static.

export type Cls = "read" | "write" | "destructive";

const clsColor: Record<Cls, string> = {
  read: c.read,
  write: c.write,
  destructive: c.danger,
};

export const Window: React.FC<{
  readonly title: string;
  readonly children?: React.ReactNode;
  readonly glow?: string;
}> = ({ title, children, glow }) => (
  <div
    style={{
      boxSizing: "border-box",
      width: "100%",
      height: "100%",
      backgroundColor: c.panel,
      border: glow ? `3px solid ${glow}` : "none",
      borderRadius: 22,
      overflow: "hidden",
      boxShadow: glow ? `${sticker}, 0 0 70px ${glow}66` : sticker,
      fontFamily: sans,
      color: c.text,
    }}
  >
    <div
      style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "0 22px",
        borderBottom: `2px solid ${c.line}`,
        backgroundColor: c.panel2,
      }}
    >
      {["#F87171", "#FBBF24", "#34D399"].map((dot) => (
        <div
          key={dot}
          style={{ width: 13, height: 13, borderRadius: 7, backgroundColor: dot, opacity: 0.7 }}
        />
      ))}
      <div style={{ marginLeft: 14, fontSize: 24, fontWeight: 600, color: c.muted }}>
        {title}
      </div>
    </div>
    <div style={{ padding: 24 }}>{children}</div>
  </div>
);

const FileIcon: React.FC<{ readonly folder?: boolean; readonly color: string }> = ({
  folder,
  color,
}) => (
  <svg width={30} height={30} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8}>
    {folder ? (
      <path d="M3 6.5A1.5 1.5 0 0 1 4.5 5H9l2 2.5h8.5A1.5 1.5 0 0 1 21 9v9.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z" />
    ) : (
      <>
        <path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
        <path d="M14 3v4h4" />
      </>
    )}
  </svg>
);

export const FileRow: React.FC<{
  readonly name: string;
  readonly folder?: boolean;
  readonly depth?: number;
  readonly color?: string;
}> = ({ name, folder, depth = 0, color = c.text }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 14,
      height: 54,
      paddingLeft: 14 + depth * 40,
      fontFamily: mono,
      fontSize: 26,
      color,
    }}
  >
    <FileIcon folder={folder} color={folder ? c.accent : c.muted} />
    {name}
  </div>
);

export const ClassTag: React.FC<{ readonly cls: Cls }> = ({ cls }) => (
  <span
    style={{
      fontFamily: sans,
      fontSize: 18,
      fontWeight: 700,
      letterSpacing: 1.5,
      padding: "6px 12px",
      borderRadius: 8,
      color: clsColor[cls],
      backgroundColor: `${clsColor[cls]}1F`,
      border: `1.5px solid ${clsColor[cls]}66`,
    }}
  >
    {cls.toUpperCase()}
  </span>
);

export type StatusKind = "allowed" | "paused" | "denied" | "approved" | "undone";

const statusLook: Record<StatusKind, [string, string]> = {
  allowed: ["ALLOWED · auto", c.read],
  paused: ["PAUSED · needs decision", c.write],
  denied: ["DENIED · not run", c.danger],
  approved: ["APPROVED · ran", c.read],
  undone: ["UNDONE · restored", c.accent],
};

export const Status: React.FC<{ readonly kind: StatusKind }> = ({ kind }) => (
  <span
    style={{
      fontFamily: sans,
      fontSize: 20,
      fontWeight: 700,
      letterSpacing: 0.5,
      padding: "8px 14px",
      borderRadius: 10,
      color: statusLook[kind][1],
      backgroundColor: `${statusLook[kind][1]}1A`,
      border: `1.5px solid ${statusLook[kind][1]}55`,
      whiteSpace: "nowrap",
    }}
  >
    {statusLook[kind][0]}
  </span>
);

export const ToolCall: React.FC<{
  readonly tool: string;
  readonly args: string;
  readonly cls: Cls;
  readonly status?: StatusKind;
}> = ({ tool, args, cls, status }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 16,
      height: 76,
      padding: "0 20px",
      borderRadius: 14,
      backgroundColor: c.panel2,
      border: `2px solid ${c.line}`,
      borderLeft: `6px solid ${clsColor[cls]}`,
    }}
  >
    <ClassTag cls={cls} />
    <div style={{ fontFamily: mono, fontSize: 25, color: c.text, flex: 1, whiteSpace: "nowrap" }}>
      <span style={{ color: clsColor[cls], fontWeight: 700 }}>{tool}</span>
      <span style={{ color: c.muted }}>({args})</span>
    </div>
    {status ? <Status kind={status} /> : null}
  </div>
);

export const Bubble: React.FC<{
  readonly who: "you" | "agent";
  readonly children: React.ReactNode;
}> = ({ who, children }) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: who === "you" ? "flex-end" : "flex-start",
      gap: 6,
      fontFamily: sans,
    }}
  >
    <div style={{ fontSize: 18, fontWeight: 600, color: c.muted, letterSpacing: 1 }}>
      {who === "you" ? "YOU" : "BRIEF-ASSISTANT"}
    </div>
    <div
      style={{
        maxWidth: 640,
        fontSize: 27,
        lineHeight: 1.35,
        padding: "14px 20px",
        borderRadius: 16,
        color: c.text,
        backgroundColor: who === "you" ? "#2D3C9A" : c.panel2,
        border: `2px solid ${who === "you" ? "#4A5CC0" : c.line}`,
      }}
    >
      {children}
    </div>
  </div>
);

export const Field: React.FC<{
  readonly label: string;
  readonly children: React.ReactNode;
}> = ({ label, children }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 20, minHeight: 64 }}>
    <div style={{ width: 190, fontSize: 21, fontWeight: 600, color: c.muted, letterSpacing: 1 }}>
      {label.toUpperCase()}
    </div>
    <div style={{ fontFamily: mono, fontSize: 27, color: c.text, display: "flex", gap: 14, alignItems: "center" }}>
      {children}
    </div>
  </div>
);

export const Button: React.FC<{
  readonly tone: "deny" | "approve" | "ghost";
  readonly children: React.ReactNode;
}> = ({ tone, children }) => (
  <div
    style={{
      padding: "16px 38px",
      borderRadius: 14,
      fontFamily: sans,
      fontSize: 27,
      fontWeight: 700,
      color: tone === "approve" ? "#06281C" : tone === "deny" ? "#FFFFFF" : c.text,
      backgroundColor: tone === "approve" ? c.read : tone === "deny" ? "#DC4A4A" : "transparent",
      border: tone === "ghost" ? `2px solid ${c.line}` : "2px solid transparent",
    }}
  >
    {children}
  </div>
);

export const Cursor: React.FC = () => (
  <svg width={46} height={46} viewBox="0 0 24 24">
    <path
      d="M4 2.5l15 8.2-6.6 1.7-3.1 6.4z"
      fill="#FFFFFF"
      stroke="#0A0E16"
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  </svg>
);

export const Eyebrow: React.FC<{ readonly children: React.ReactNode; readonly color?: string }> = ({
  children,
  color = "#DCE4FF",
}) => (
  <div style={{ fontFamily: sans, fontSize: 24, fontWeight: 700, letterSpacing: 4, color }}>
    {children}
  </div>
);

export type AuditRow = {
  readonly time: string;
  readonly agent: string;
  readonly request: string;
  readonly cls: Cls;
  readonly decision: string;
  readonly outcome: string;
  readonly ran: boolean;
};

export const auditRows: AuditRow[] = [
  {
    time: "10:02:14",
    agent: "brief-assistant",
    request: 'search_files("project brief")',
    cls: "read",
    decision: "Auto · read policy",
    outcome: "Ran · 1 result",
    ran: true,
  },
  {
    time: "10:02:31",
    agent: "brief-assistant",
    request: 'delete_folder("client-files")',
    cls: "destructive",
    decision: "Denied by operator",
    outcome: "Not executed",
    ran: false,
  },
  {
    time: "10:03:05",
    agent: "brief-assistant",
    request: "rename_file(project-brief.md → final-brief.md)",
    cls: "write",
    decision: "Approved by operator",
    outcome: "Ran · renamed",
    ran: true,
  },
  {
    time: "10:03:22",
    agent: "operator",
    request: "undo rename_file",
    cls: "write",
    decision: "Undo by operator",
    outcome: "Ran · restored",
    ran: true,
  },
];

export const auditColumns = ["Time", "Agent", "Request", "Class", "Decision", "Outcome"];
export const auditWidths = [130, 230, 590, 180, 270, 220];
export const AUDIT_HEADER = 64;
export const AUDIT_ROW = 92;

export const AuditTable: React.FC<{ readonly rows?: number }> = ({ rows = auditRows.length }) => (
  <div style={{ fontFamily: sans, color: c.text }}>
    <div
      style={{
        display: "flex",
        height: AUDIT_HEADER,
        alignItems: "center",
        borderBottom: `2px solid ${c.line}`,
        fontSize: 20,
        fontWeight: 700,
        letterSpacing: 2,
        color: c.muted,
      }}
    >
      {auditColumns.map((col, i) => (
        <div key={col} style={{ width: auditWidths[i], paddingLeft: 12 }}>
          {col.toUpperCase()}
        </div>
      ))}
    </div>
    {auditRows.slice(0, rows).map((r) => (
      <div
        key={r.time}
        style={{
          display: "flex",
          height: AUDIT_ROW,
          alignItems: "center",
          borderBottom: `1.5px solid ${c.line}`,
          fontSize: 23,
        }}
      >
        <div style={{ width: auditWidths[0], paddingLeft: 12, fontFamily: mono, color: c.muted }}>{r.time}</div>
        <div style={{ width: auditWidths[1], paddingLeft: 12, fontFamily: mono, fontSize: 21 }}>{r.agent}</div>
        <div style={{ width: auditWidths[2], paddingLeft: 12, fontFamily: mono, fontSize: 20, whiteSpace: "nowrap" }}>{r.request}</div>
        <div style={{ width: auditWidths[3], paddingLeft: 12 }}>
          <ClassTag cls={r.cls} />
        </div>
        <div style={{ width: auditWidths[4], paddingLeft: 12 }}>{r.decision}</div>
        <div style={{ width: auditWidths[5], paddingLeft: 12, color: r.ran ? c.read : c.danger, fontWeight: 600 }}>
          {r.outcome}
        </div>
      </div>
    ))}
  </div>
);

// ElevenLabs reads the approval card aloud (ARCHITECTURE.md); the bars move for the
// first five seconds after the card appears. t = frames since the card appeared.
export const VoiceChip: React.FC<{ readonly t: number }> = ({ t }) => (
  <div
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 12,
      padding: "8px 20px 8px 16px",
      borderRadius: 999,
      backgroundColor: "#FFFFFF",
      border: "3px solid #141A3C",
      boxShadow: "0 10px 24px #0A1A6E55",
      fontFamily: sans,
      fontSize: 22,
      fontWeight: 700,
      color: "#141A3C",
      whiteSpace: "nowrap",
    }}
  >
    <svg width={26} height={26} viewBox="0 0 24 24" fill="#141A3C">
      <path d="M4 9h4l5-4v14l-5-4H4z" />
      <path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="#141A3C" strokeWidth={2} fill="none" strokeLinecap="round" />
    </svg>
    <div style={{ display: "flex", alignItems: "center", gap: 3, height: 24 }}>
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          style={{
            width: 4,
            borderRadius: 2,
            backgroundColor: "#2350E0",
            height: t > 0 && t < 150 ? 6 + Math.abs(Math.sin(t / 3 + i * 1.7)) * 18 : 6,
          }}
        />
      ))}
    </div>
    Read aloud · ElevenLabs
  </div>
);
