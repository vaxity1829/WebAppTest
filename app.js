const { useState, useRef, useEffect } = React;

/* ---------------------------------------------------------
   Icons (square line-caps, no curves, 90-degree minimalism)
--------------------------------------------------------- */

function IconPlus({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <line x1="8" y1="1" x2="8" y2="15" />
      <line x1="1" y1="8" x2="15" y2="8" />
    </svg>
  );
}
function IconClose({ size = 11 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square">
      <line x1="2" y1="2" x2="14" y2="14" />
      <line x1="14" y1="2" x2="2" y2="14" />
    </svg>
  );
}
function IconArrowLeft({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="square" strokeLinejoin="miter">
      <line x1="14" y1="8" x2="2" y2="8" />
      <polyline points="7,3 2,8 7,13" fill="none" />
    </svg>
  );
}

/* ---------------------------------------------------------
   Helpers
--------------------------------------------------------- */

function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
function initialsFromName(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase();
}
function firstNameOf(name) {
  return name.trim().split(/\s+/)[0] || name;
}
function decodeJWT(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

const THEMES = {
  literature: { accent: "#A8483A" },
  math: { accent: "#2E5F9E" },
  art: { accent: "#A8791E" },
  science: { accent: "#3D7257" },
  history: { accent: "#7C6232" },
  music: { accent: "#7A4878" },
};
const THEME_ORDER = ["literature", "math", "art", "science", "history", "music"];

const CONFIG = window.APP_CONFIG || {};
const API_URL = CONFIG.SHEETS_API_URL || "";
const CLIENT_ID = CONFIG.GOOGLE_CLIENT_ID || "";
const IS_CONFIGURED = API_URL && API_URL.indexOf("http") === 0;
const AUTH_CONFIGURED = CLIENT_ID && CLIENT_ID.indexOf("YOUR_") !== 0;

async function postAction(action, payload) {
  if (!IS_CONFIGURED) return { error: "not configured" };
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, ...payload }),
    });
    return await res.json();
  } catch (err) {
    return { error: String(err) };
  }
}

/* ---------------------------------------------------------
   Styles
--------------------------------------------------------- */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Trirong:ital,wght@0,300;0,400;0,500;1,400;1,500&family=IBM+Plex+Sans+Thai:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; }
button, input, textarea { border-radius: 0 !important; -webkit-appearance: none; appearance: none; }

.fr-app {
  --ink: #EEF2F8;
  --ink-soft: #E2E9F3;
  --paper: #FFFFFF;
  --chalk: #1C2A3B;
  --chalk-muted: rgba(28,42,59,.58);
  --rule: rgba(28,42,59,.13);
  --house: #2459A8;
  --pen: #B23B2C;
  --font-display: 'Trirong', serif;
  --font-body: 'IBM Plex Sans Thai', sans-serif;
  --font-label: 'IBM Plex Sans Thai', sans-serif;
  position: relative;
  background: var(--ink);
  color: var(--chalk);
  min-height: 100vh;
  font-family: var(--font-body);
  overflow-x: hidden;
}

.fr-topbar { position: sticky; top: 0; z-index: 40; display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 32px; border-bottom: 1px solid var(--rule); background: var(--ink); flex-wrap: wrap; }
.fr-topbar-mark { font-family: var(--font-label); font-size: 12px; letter-spacing: .1em; color: var(--house); }
.fr-topbar-auth { display: flex; align-items: center; gap: 14px; }
.fr-topbar-offline { font-family: var(--font-label); font-size: 11px; color: var(--chalk-muted); border: 1px solid var(--rule); padding: 5px 10px; }
.fr-topbar-user { display: flex; align-items: center; gap: 10px; font-family: var(--font-label); font-size: 12.5px; color: var(--chalk-muted); }
.fr-topbar-avatar { width: 24px; height: 24px; object-fit: cover; border: 1px solid var(--rule); }
.fr-topbar-signout { font-family: var(--font-label); font-size: 11.5px; background: none; border: none; color: var(--house); cursor: pointer; padding: 0; text-decoration: underline; }
.fr-notice { font-family: var(--font-label); font-size: 12.5px; color: var(--house); border: 1px solid var(--house); padding: 10px 14px; max-width: 1080px; margin: 24px auto 0; background: #fff; }

.fr-content { position: relative; z-index: 1; }

.fr-mast { max-width: 1080px; margin: 0 auto; padding: 64px 32px 8px; }
.fr-eyebrow { font-family: var(--font-label); font-size: 12px; letter-spacing: .12em; color: var(--house); display: flex; align-items: center; gap: 12px; margin: 0 0 30px; }
.fr-eyebrow::after { content: ''; flex: 0 0 56px; height: 1px; background: var(--house); opacity: .55; }
.fr-headline { font-family: var(--font-display); font-weight: 400; font-size: clamp(32px,5.6vw,58px); line-height: 1.18; letter-spacing: 0; margin: 0 0 24px; max-width: 720px; }
.fr-headline em { font-style: italic; font-weight: 400; color: var(--house); }
.fr-sub { font-family: var(--font-body); font-size: 16px; line-height: 1.75; color: var(--chalk-muted); max-width: 480px; margin: 0; padding-bottom: 40px; border-bottom: 1px solid var(--rule); }

.fr-loading, .fr-empty-msg { font-family: var(--font-display); font-style: italic; font-size: 16px; color: var(--chalk-muted); padding: 40px 32px; max-width: 1080px; margin: 0 auto; }

.fr-row { display: flex; gap: 1px; background: var(--rule); overflow-x: auto; scrollbar-width: none; cursor: grab; max-width: 1080px; margin: 56px auto 0; border-top: 1px solid var(--rule); border-left: 1px solid var(--rule); }
.fr-row::-webkit-scrollbar { display: none; }
.fr-row.fr-dragging { cursor: grabbing; }
.fr-row > * { flex: 0 0 auto; }

.fr-card { width: 252px; min-height: 312px; padding: 28px 26px 24px; display: flex; flex-direction: column; position: relative; background: var(--paper); transition: transform .4s cubic-bezier(.2,.8,.2,1), background .4s, box-shadow .4s; animation: frCardIn .55s cubic-bezier(.2,.8,.2,1) both; cursor: pointer; border: none; text-align: left; font: inherit; color: var(--chalk); }
.fr-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); opacity: .9; }
.fr-card:hover, .fr-card:focus-visible { transform: translateY(-6px); background: var(--ink-soft); box-shadow: 0 14px 28px rgba(20,40,70,.1); }
.fr-card:focus-visible { outline: 2px solid var(--house); outline-offset: -2px; }
@keyframes frCardIn { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }

.fr-card-eyebrow { font-family: var(--font-label); font-size: 12px; letter-spacing: .04em; display: flex; align-items: center; gap: 8px; margin: 0 0 22px; color: var(--chalk-muted); }
.fr-card-dot { width: 6px; height: 6px; background: var(--accent); flex: 0 0 auto; }
.fr-card-title { font-family: var(--font-body); font-weight: 700; font-size: 21px; line-height: 1.25; margin: 0 0 16px; }
.fr-card-text { font-family: var(--font-display); font-style: italic; font-size: 16px; line-height: 1.6; color: var(--chalk-muted); flex: 1; margin: 0; }
.fr-card-hint { font-family: var(--font-label); font-size: 12px; color: var(--chalk-muted); margin: 20px 0 0; transition: color .3s; }
.fr-card:hover .fr-card-hint { color: var(--house); }

.fr-addcard { width: 252px; min-height: 312px; display: flex; flex-direction: column; align-items: flex-start; justify-content: center; gap: 12px; padding: 26px; background: var(--paper); color: var(--chalk-muted); cursor: pointer; transition: background .3s, color .3s, box-shadow .3s; animation: frCardIn .55s cubic-bezier(.2,.8,.2,1) both; font: inherit; border: none; text-align: left; }
.fr-addcard:hover, .fr-addcard:focus-visible { background: var(--ink-soft); color: var(--house); box-shadow: 0 14px 28px rgba(20,40,70,.1); }
.fr-addcard:focus-visible { outline: 2px solid var(--house); outline-offset: -2px; }
.fr-addcard-label { font-family: var(--font-label); font-size: 13px; display: flex; align-items: center; gap: 8px; }
.fr-addcard-sub { font-family: var(--font-display); font-style: italic; font-size: 16px; color: var(--chalk); max-width: 190px; line-height: 1.4; }

.fr-row-hint { text-align: center; font-family: var(--font-label); font-size: 12px; letter-spacing: .05em; color: var(--chalk-muted); margin: 0 0 80px; padding-top: 14px; }

.fr-profile-wrap { max-width: 1000px; margin: 0 auto; padding: 56px 32px 0; animation: frPanelIn .5s cubic-bezier(.16,1,.3,1) both; }
@keyframes frPanelIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

.fr-back { font-family: var(--font-label); font-size: 13px; color: var(--chalk-muted); background: none; border: none; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; padding: 0; margin: 0 0 40px; transition: color .25s; }
.fr-back:hover, .fr-back:focus-visible { color: var(--house); }

.fr-profile-card { background: var(--paper); color: #1C2A3B; padding: 56px 60px 50px; position: relative; box-shadow: 0 20px 40px rgba(20,40,70,.12); border: 1px solid var(--rule); }
.fr-profile-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: var(--accent); }

.fr-profile-eyebrow { font-family: var(--font-label); font-size: 13px; color: var(--accent); display: flex; align-items: center; gap: 9px; margin: 0 0 20px; }
.fr-profile-name { font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: clamp(28px,4.2vw,44px); margin: 0 0 26px; line-height: 1.25; max-width: 85%; }
.fr-profile-quote { font-family: var(--font-display); font-style: italic; font-size: 19px; line-height: 1.65; color: #3C4D60; border-left: 2px solid var(--accent); padding-left: 22px; margin: 0 0 38px; max-width: 560px; }

.fr-profile-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 56px; padding-top: 38px; border-top: 1px solid var(--rule); }
.fr-profile-bio p { font-family: var(--font-body); font-size: 16px; line-height: 1.9; color: #2E3D4F; margin: 0 0 18px; }
.fr-profile-bio > p:first-child::first-letter { font-family: var(--font-display); font-style: italic; font-size: 52px; line-height: 38px; float: left; padding: 6px 8px 0 0; color: var(--accent); }

.fr-sidebar { align-self: start; }
.fr-sidebar-title { font-family: var(--font-label); font-size: 12px; letter-spacing: .08em; color: #6E7F92; margin: 0 0 16px; }
.fr-sidebar-row { display: flex; align-items: baseline; gap: 6px; font-family: var(--font-body); font-size: 14px; padding: 11px 0; border-bottom: 1px solid var(--rule); }
.fr-sidebar-row:last-child { border-bottom: none; }
.fr-sidebar-label { color: #6E7F92; flex: 0 0 auto; }
.fr-sidebar-leader { flex: 1; border-bottom: 1px dotted rgba(28,42,59,.3); margin-bottom: 4px; }
.fr-sidebar-value { color: #1C2A3B; font-weight: 600; text-align: right; flex: 0 0 auto; max-width: 56%; }

.fr-margin-section { max-width: 1000px; margin: 64px auto 0; padding: 0 32px 120px; }
.fr-margin-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin: 0 0 22px; flex-wrap: wrap; border-bottom: 1px solid var(--rule); padding-bottom: 18px; }
.fr-margin-title { font-family: var(--font-display); font-style: italic; font-weight: 400; font-size: 24px; color: var(--chalk); margin: 0 0 4px; }
.fr-margin-sub { font-family: var(--font-body); font-size: 13.5px; color: var(--chalk-muted); margin: 0; }
.fr-addnote-btn { font-family: var(--font-label); font-size: 12.5px; background: var(--paper); color: var(--house); border: 1px solid var(--house); padding: 9px 16px; display: inline-flex; gap: 8px; align-items: center; cursor: pointer; transition: background .25s, color .25s; }
.fr-addnote-btn:hover, .fr-addnote-btn:focus-visible { background: var(--house); color: #fff; }

.fr-margin-board { position: relative; background: var(--ink-soft); min-height: 380px; border: 1px solid var(--rule); }
.fr-margin-empty { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-style: italic; font-size: 16px; color: var(--chalk-muted); text-align: center; padding: 40px; pointer-events: none; }

.fr-note { position: absolute; top: 0; left: 0; width: 188px; min-height: 156px; padding: 20px 16px 14px; background: var(--paper); color: #1C2A3B; display: flex; flex-direction: column; box-shadow: 0 6px 16px rgba(20,40,70,.15); transition: transform .4s cubic-bezier(.34,1.56,.64,1), box-shadow .25s; border: 1px solid var(--rule); }
.fr-note.fr-dragging { transition: none; box-shadow: 0 16px 26px rgba(20,40,70,.22); z-index: 50; }
.fr-note::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: var(--accent); }
.fr-note-handle { position: absolute; top: 8px; left: 50%; transform: translateX(-50%); width: 26px; height: 3px; background: rgba(28,42,59,.22); cursor: grab; touch-action: none; }
.fr-note-handle:active { cursor: grabbing; }
.fr-note-delete { position: absolute; top: 8px; right: 8px; opacity: 0; width: 18px; height: 18px; border: none; background: transparent; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: opacity .2s; color: #5A6B7E; padding: 0; }
.fr-note:hover .fr-note-delete, .fr-note-delete:focus-visible { opacity: 1; }
.fr-note-title { font-family: var(--font-label); font-weight: 600; font-size: 11px; background: transparent; border: none; border-bottom: 1px solid rgba(28,42,59,.15); padding: 2px 0 8px; margin: 6px 0 10px; color: #1C2A3B; width: 100%; }
.fr-note-title:focus { outline: none; border-bottom-color: #1C2A3B; }
.fr-note-body { font-family: var(--font-display); font-style: italic; font-size: 14px; line-height: 1.6; background: transparent; border: none; resize: none; flex: 1; color: #2E3D4F; width: 100%; }
.fr-note-body:focus { outline: none; }
.fr-note-title::placeholder, .fr-note-body::placeholder { color: rgba(28,42,59,.38); font-style: italic; }

.fr-overlay { position: fixed; inset: 0; background: rgba(18,28,42,.45); backdrop-filter: blur(3px); display: flex; align-items: center; justify-content: center; padding: 24px; z-index: 100; animation: frFade .25s ease both; }
@keyframes frFade { from { opacity: 0; } to { opacity: 1; } }
.fr-modal { background: var(--paper); color: #1C2A3B; width: 100%; max-width: 560px; max-height: 86vh; overflow-y: auto; padding: 40px 40px 32px; box-shadow: 0 24px 56px rgba(20,40,70,.18); animation: frPanelIn .35s cubic-bezier(.16,1,.3,1) both; }
.fr-modal::before { content: ''; display: block; height: 3px; background: var(--house); margin: -40px -40px 28px; }
.fr-modal-title { font-family: var(--font-display); font-style: italic; font-size: 26px; margin: 0 0 6px; }
.fr-modal-as { font-family: var(--font-label); font-size: 12px; color: var(--house); margin: 0 0 4px; }
.fr-modal-sub { font-family: var(--font-body); font-size: 14px; color: #5A6B7E; margin: 0 0 28px; }
.fr-field { margin: 0 0 18px; display: flex; flex-direction: column; gap: 6px; }
.fr-field label { font-family: var(--font-label); font-size: 12px; color: #6E7F92; }
.fr-field input, .fr-field textarea { font-family: var(--font-body); font-size: 15px; padding: 10px 0; border: none; border-bottom: 1px solid rgba(28,42,59,.2); background: transparent; color: #1C2A3B; }
.fr-field input:focus, .fr-field textarea:focus { outline: none; border-bottom-color: var(--house); }
.fr-field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.fr-theme-row { display: flex; gap: 10px; flex-wrap: wrap; }
.fr-theme-swatch { width: 26px; height: 26px; border: 2px solid transparent; cursor: pointer; transition: transform .2s, border-color .2s; padding: 0; }
.fr-theme-swatch.fr-active { border-color: #1C2A3B; transform: scale(1.15); }
.fr-modal-actions { display: flex; justify-content: flex-end; align-items: center; gap: 18px; margin-top: 10px; }
.fr-btn-ghost { font-family: var(--font-label); font-size: 13px; background: none; border: none; color: #6E7F92; cursor: pointer; padding: 10px 4px; }
.fr-btn-primary { font-family: var(--font-label); font-size: 13px; background: var(--house); color: #fff; border: none; padding: 12px 22px; cursor: pointer; transition: opacity .2s; }
.fr-btn-primary:hover, .fr-btn-primary:focus-visible { opacity: .85; }
.fr-btn-primary:disabled { opacity: .5; cursor: default; }
.fr-error { color: var(--pen); font-size: 13px; font-family: var(--font-body); margin: 0 0 16px; }

@media (max-width: 760px) {
  .fr-profile-grid { grid-template-columns: 1fr; gap: 28px; }
  .fr-profile-name { max-width: 100%; }
  .fr-profile-card { padding: 40px 28px 34px; }
  .fr-mast { padding: 48px 22px 0; }
  .fr-topbar { padding: 14px 20px; }
  .fr-field-row { grid-template-columns: 1fr; }
}

@media (prefers-reduced-motion: reduce) {
  .fr-card, .fr-addcard, .fr-profile-wrap, .fr-overlay, .fr-modal, .fr-note { animation: none !important; transition: none !important; }
}
`;

/* ---------------------------------------------------------
   Top bar (sign-in / sign-out)
--------------------------------------------------------- */

function TopBar({ user, signInRef, onSignOut, offline }) {
  return (
    <div className="fr-topbar">
      <span className="fr-topbar-mark">ห้องพักครู</span>
      <div className="fr-topbar-auth">
        {offline && <span className="fr-topbar-offline">โหมดออฟไลน์ — ข้อมูลยังไม่ถูกบันทึกถาวร</span>}
        {user ? (
          <div className="fr-topbar-user">
            {user.picture && <img className="fr-topbar-avatar" src={user.picture} alt="" />}
            <span>เข้าสู่ระบบในชื่อ {user.name}</span>
            <button className="fr-topbar-signout" onClick={onSignOut}>ออกจากระบบ</button>
          </div>
        ) : (
          <div ref={signInRef} />
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Note board + note card
--------------------------------------------------------- */

function NoteCard({ note, accent, containerRef, onDrag, onCommitText, onDelete }) {
  const ref = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [title, setTitle] = useState(note.title || "");
  const [body, setBody] = useState(note.body || "");

  function commitText() {
    if (title !== note.title || body !== note.body) onCommitText(note.id, { title, body });
  }

  function onHandleDown(e) {
    e.preventDefault();
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const start = { x: e.clientX, y: e.clientY, origX: note.x, origY: note.y, w: rect.width, h: rect.height };
    let last = { x: note.x, y: note.y };
    setIsDragging(true);

    function handleMove(ev) {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      let nx = start.origX + dx;
      let ny = start.origY + dy;
      nx = Math.max(4, Math.min(start.w - 196, nx));
      ny = Math.max(4, Math.min(start.h - 164, ny));
      last = { x: nx, y: ny };
      if (ref.current) {
        const wobble = Math.max(-6, Math.min(6, (ev.movementX || 0) * 1.4));
        ref.current.style.transform = `translate(${nx}px, ${ny}px) rotate(${wobble}deg)`;
      }
    }
    function handleUp() {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      setIsDragging(false);
      onDrag(note.id, last.x, last.y);
    }
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  }

  return (
    <div
      ref={ref}
      className={`fr-note${isDragging ? " fr-dragging" : ""}`}
      style={{ transform: `translate(${note.x}px, ${note.y}px) rotate(0deg)`, "--accent": accent }}
    >
      <div className="fr-note-handle" onPointerDown={onHandleDown} aria-hidden="true" />
      <button className="fr-note-delete" onClick={onDelete} aria-label="ลบข้อความ">
        <IconClose size={11} />
      </button>
      <input
        className="fr-note-title"
        value={title}
        placeholder="หัวข้อ"
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commitText}
        onPointerDown={(e) => e.stopPropagation()}
      />
      <textarea
        className="fr-note-body"
        value={body}
        placeholder="เขียนข้อความ…"
        onChange={(e) => setBody(e.target.value)}
        onBlur={commitText}
        onPointerDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function NoteBoard({ notes, accent, teacherFirstName, onAddNote, onUpdateNote, onDeleteNote }) {
  const boardRef = useRef(null);

  return (
    <div className="fr-margin-section">
      <div className="fr-margin-head">
        <div>
          <h3 className="fr-margin-title">ขอบกระดาษ</h3>
          <p className="fr-margin-sub">ข้อความจากนักเรียน ฝากไว้ให้ {teacherFirstName} ที่ขอบกระดาษ</p>
        </div>
        <button className="fr-addnote-btn" onClick={onAddNote}>
          <IconPlus size={12} /> เพิ่มข้อความ
        </button>
      </div>
      <div className="fr-margin-board" ref={boardRef}>
        {notes.length === 0 && <div className="fr-margin-empty">ยังไม่มีข้อความ เป็นคนแรกที่เขียนไว้ที่ขอบกระดาษ</div>}
        {notes.map((n) => (
          <NoteCard
            key={n.id}
            note={n}
            accent={accent}
            containerRef={boardRef}
            onDrag={(id, x, y) => onUpdateNote(id, { x, y })}
            onCommitText={onUpdateNote}
            onDelete={() => onDeleteNote(n.id)}
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Grid view
--------------------------------------------------------- */

function GridView({ teachers, loading, user, onOpen, onAddClick }) {
  const rowRef = useRef(null);
  const dragInfo = useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });
  const [isDraggingRow, setIsDraggingRow] = useState(false);

  function onRowMouseDown(e) {
    dragInfo.current = { isDown: true, startX: e.clientX, startScroll: rowRef.current.scrollLeft, moved: false };
    setIsDraggingRow(true);
  }
  function onRowMouseMove(e) {
    if (!dragInfo.current.isDown) return;
    const dx = e.clientX - dragInfo.current.startX;
    if (Math.abs(dx) > 5) dragInfo.current.moved = true;
    rowRef.current.scrollLeft = dragInfo.current.startScroll - dx;
  }
  function endRowDrag() {
    dragInfo.current.isDown = false;
    setIsDraggingRow(false);
  }

  return (
    <div className="fr-content">
      <header className="fr-mast">
        <p className="fr-eyebrow">เล่มที่ 1 — ฉบับคณาจารย์</p>
        <h1 className="fr-headline">
          รู้จักคน <em>เบื้องหลังบทเรียน</em>
        </h1>
        <p className="fr-sub">
          ครูแต่ละคนมีห้องและเรื่องราวเป็นของตัวเอง เปิดดูเรื่องราวฉบับเต็ม แล้วฝากข้อความไว้ที่ขอบกระดาษ
        </p>
      </header>

      {loading ? (
        <p className="fr-loading">กำลังโหลดข้อมูล…</p>
      ) : (
        <React.Fragment>
          {teachers.length === 0 && <p className="fr-empty-msg">ยังไม่มีคุณครูเพิ่มหน้าเลย เป็นคนแรกได้เลยไหม?</p>}
          <div
            className={`fr-row${isDraggingRow ? " fr-dragging" : ""}`}
            ref={rowRef}
            onMouseDown={onRowMouseDown}
            onMouseMove={onRowMouseMove}
            onMouseUp={endRowDrag}
            onMouseLeave={endRowDrag}
          >
            {teachers.map((t, i) => {
              const accent = (THEMES[t.theme] || THEMES.literature).accent;
              return (
                <button
                  key={t.id}
                  className="fr-card"
                  style={{ "--accent": accent, animationDelay: `${i * 60}ms` }}
                  onClick={() => {
                    if (dragInfo.current.moved) return;
                    onOpen(t.id);
                  }}
                >
                  <p className="fr-card-eyebrow">
                    <span className="fr-card-dot" />
                    {t.subject} · ห้อง {t.room}
                  </p>
                  <h2 className="fr-card-title">{t.name.split(" ").slice(-1)[0]}</h2>
                  <p className="fr-card-text">{t.tagline}</p>
                  <p className="fr-card-hint">→ เปิดอ่าน</p>
                </button>
              );
            })}

            <button
              className="fr-addcard"
              style={{ animationDelay: `${teachers.length * 60}ms` }}
              onClick={() => {
                if (dragInfo.current.moved) return;
                onAddClick();
              }}
            >
              <span className="fr-addcard-label">
                <IconPlus size={12} /> {user ? "เพิ่มหน้าของคุณ" : "เข้าสู่ระบบเพื่อเพิ่มหน้า"}
              </span>
              <span className="fr-addcard-sub">สำหรับคุณครู: แนะนำตัวเองที่นี่</span>
            </button>
          </div>
          <p className="fr-row-hint">← ลากเพื่ออ่านต่อ →</p>
        </React.Fragment>
      )}
    </div>
  );
}

/* ---------------------------------------------------------
   Profile view
--------------------------------------------------------- */

function ProfileView({ teacher, notes, onBack, onAddNote, onUpdateNote, onDeleteNote }) {
  const accent = (THEMES[teacher.theme] || THEMES.literature).accent;

  return (
    <div className="fr-content">
      <div className="fr-profile-wrap">
        <button className="fr-back" onClick={onBack}>
          <IconArrowLeft size={13} /> กลับไปห้องพักครู
        </button>

        <div className="fr-profile-card" style={{ "--accent": accent }}>
          <p className="fr-profile-eyebrow">
            <span className="fr-card-dot" />
            {teacher.subject} · ห้อง {teacher.room}
          </p>
          <h1 className="fr-profile-name">{teacher.name}</h1>
          <blockquote className="fr-profile-quote">“{teacher.quote}”</blockquote>

          <div className="fr-profile-grid">
            <div className="fr-profile-bio">
              {(teacher.bio || []).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            <aside className="fr-sidebar">
              <p className="fr-sidebar-title">ข้อมูล</p>
              <div className="fr-sidebar-row">
                <span className="fr-sidebar-label">เวลาให้คำปรึกษา</span>
                <span className="fr-sidebar-leader" />
                <span className="fr-sidebar-value">{teacher.officeHours}</span>
              </div>
              <div className="fr-sidebar-row">
                <span className="fr-sidebar-label">เริ่มสอนตั้งแต่</span>
                <span className="fr-sidebar-leader" />
                <span className="fr-sidebar-value">{teacher.since}</span>
              </div>
              <div className="fr-sidebar-row">
                <span className="fr-sidebar-label">{teacher.factLabel}</span>
                <span className="fr-sidebar-leader" />
                <span className="fr-sidebar-value">{teacher.factValue}</span>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <NoteBoard
        notes={notes}
        accent={accent}
        teacherFirstName={firstNameOf(teacher.name)}
        onAddNote={onAddNote}
        onUpdateNote={onUpdateNote}
        onDeleteNote={onDeleteNote}
      />
    </div>
  );
}

/* ---------------------------------------------------------
   Create profile modal
--------------------------------------------------------- */

function CreateModal({ user, submitting, onClose, onSubmit }) {
  const [name, setName] = useState(user ? user.name : "");
  const [subject, setSubject] = useState("");
  const [room, setRoom] = useState("");
  const [tagline, setTagline] = useState("");
  const [bioText, setBioText] = useState("");
  const [officeHours, setOfficeHours] = useState("");
  const [since, setSince] = useState("");
  const [factLabel, setFactLabel] = useState("");
  const [factValue, setFactValue] = useState("");
  const [quote, setQuote] = useState("");
  const [theme, setTheme] = useState("literature");
  const [error, setError] = useState("");

  function handleSubmit() {
    if (!name.trim() || !subject.trim()) {
      setError("กรุณาใส่ชื่อและวิชาที่สอนก่อนเพิ่มหน้า");
      return;
    }
    const bio = bioText.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

    onSubmit({
      id: makeId("t"),
      name: name.trim(),
      subject: subject.trim(),
      room: room.trim() || "—",
      theme,
      tagline: tagline.trim() || "ยังไม่มีคำแนะนำตัว เร็ว ๆ นี้",
      quote: quote.trim() || "หน้านี้ยังอยู่ระหว่างเขียน",
      bio: bio.length ? bio : ["หน้านี้ยังอยู่ระหว่างเขียน กลับมาดูใหม่เร็ว ๆ นี้"],
      officeHours: officeHours.trim() || "ยังไม่ระบุ",
      since: since.trim() || "—",
      factLabel: factLabel.trim() || "เรื่องน่ารู้",
      factValue: factValue.trim() || "เร็ว ๆ นี้",
      initials: initialsFromName(name.trim()),
    });
  }

  return (
    <div className="fr-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="fr-modal">
        <h2 className="fr-modal-title">เพิ่มหน้าแนะนำตัวของคุณ</h2>
        {user && <p className="fr-modal-as">กำลังเพิ่มในชื่อ {user.email}</p>}
        <p className="fr-modal-sub">หน้านี้จะปรากฏบนกระดานให้นักเรียนเห็น</p>

        {error && <p className="fr-error">{error}</p>}

        <div className="fr-field-row">
          <div className="fr-field">
            <label htmlFor="fr-name">ชื่อ-นามสกุล</label>
            <input id="fr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="มารา โอคอนโบ" />
          </div>
          <div className="fr-field">
            <label htmlFor="fr-subject">วิชาที่สอน</label>
            <input id="fr-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="ภาษาไทย" />
          </div>
        </div>

        <div className="fr-field-row">
          <div className="fr-field">
            <label htmlFor="fr-room">หมายเลขห้อง</label>
            <input id="fr-room" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="214" />
          </div>
          <div className="fr-field">
            <label htmlFor="fr-since">เริ่มสอนตั้งแต่ปี</label>
            <input id="fr-since" value={since} onChange={(e) => setSince(e.target.value)} placeholder="2557" />
          </div>
        </div>

        <div className="fr-field">
          <label htmlFor="fr-tagline">แนะนำตัวสั้น ๆ</label>
          <input id="fr-tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="ประโยคสั้น ๆ ที่บอกความเป็นคุณ" />
        </div>

        <div className="fr-field">
          <label htmlFor="fr-bio">ประวัติแบบเต็ม (เว้นบรรทัดว่างระหว่างย่อหน้า)</label>
          <textarea id="fr-bio" rows={5} value={bioText} onChange={(e) => setBioText(e.target.value)} placeholder="บอกนักเรียนว่าคุณเป็นใคร สอนอะไร และห้องเรียนของคุณมีดีอะไร" />
        </div>

        <div className="fr-field">
          <label htmlFor="fr-quote">คำพูดหรือคติประจำใจ</label>
          <input id="fr-quote" value={quote} onChange={(e) => setQuote(e.target.value)} placeholder="คำพูดที่คุณใช้บ่อย ๆ ในห้องเรียน" />
        </div>

        <div className="fr-field-row">
          <div className="fr-field">
            <label htmlFor="fr-hours">เวลาให้คำปรึกษา</label>
            <input id="fr-hours" value={officeHours} onChange={(e) => setOfficeHours(e.target.value)} placeholder="อังคาร-พฤหัส 15:15–16:00" />
          </div>
          <div className="fr-field">
            <label htmlFor="fr-factlabel">หัวข้อเรื่องน่ารู้</label>
            <input id="fr-factlabel" value={factLabel} onChange={(e) => setFactLabel(e.target.value)} placeholder="กำลังอ่าน" />
          </div>
        </div>

        <div className="fr-field">
          <label htmlFor="fr-factvalue">รายละเอียดเรื่องน่ารู้</label>
          <input id="fr-factvalue" value={factValue} onChange={(e) => setFactValue(e.target.value)} placeholder="เช่น ชื่อหนังสือที่กำลังอ่าน" />
        </div>

        <div className="fr-field">
          <label>สีประจำตัว</label>
          <div className="fr-theme-row">
            {THEME_ORDER.map((key) => (
              <button
                key={key}
                type="button"
                className={`fr-theme-swatch${theme === key ? " fr-active" : ""}`}
                style={{ background: THEMES[key].accent }}
                aria-label={key}
                onClick={() => setTheme(key)}
              />
            ))}
          </div>
        </div>

        <div className="fr-modal-actions">
          <button className="fr-btn-ghost" onClick={onClose}>ยกเลิก</button>
          <button className="fr-btn-primary" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "กำลังบันทึก…" : "เพิ่มลงกระดาน"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Main app
--------------------------------------------------------- */

function FacultyRoom() {
  const [teachers, setTeachers] = useState([]);
  const [notesByTeacher, setNotesByTeacher] = useState({});
  const [view, setView] = useState("grid");
  const [selectedId, setSelectedId] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [offline, setOffline] = useState(!IS_CONFIGURED);
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState("");
  const signInBtnRef = useRef(null);

  const selectedTeacher = teachers.find((t) => t.id === selectedId) || null;
  const selectedNotes = (selectedId && notesByTeacher[selectedId]) || [];

  function applyData(data) {
    setTeachers(data.teachers || []);
    const grouped = {};
    (data.notes || []).forEach((n) => {
      if (!grouped[n.teacherId]) grouped[n.teacherId] = [];
      grouped[n.teacherId].push({ ...n, x: Number(n.x) || 0, y: Number(n.y) || 0 });
    });
    setNotesByTeacher(grouped);
  }

  async function loadFallback() {
    try {
      const res = await fetch("database/fallback.json");
      applyData(await res.json());
    } catch (err) {
      applyData({ teachers: [], notes: [] });
    }
  }

  async function loadInitialData() {
    setLoading(true);
    if (IS_CONFIGURED) {
      try {
        const res = await fetch(API_URL + "?action=list");
        applyData(await res.json());
        setOffline(false);
      } catch (err) {
        await loadFallback();
        setOffline(true);
      }
    } else {
      await loadFallback();
      setOffline(true);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (window.google && AUTH_CONFIGURED) {
      window.google.accounts.id.initialize({ client_id: CLIENT_ID, callback: handleCredential });
      if (signInBtnRef.current) {
        window.google.accounts.id.renderButton(signInBtnRef.current, {
          theme: "outline", shape: "rectangular", size: "medium", text: "signin_with", locale: "th",
        });
      }
    }
  }, []);

  function handleCredential(response) {
    const payload = decodeJWT(response.credential);
    if (payload) {
      setUser({ name: payload.name, email: payload.email, picture: payload.picture });
      setIdToken(response.credential);
      setNotice("");
    }
  }
  function signOut() {
    setUser(null);
    setIdToken(null);
    if (window.google) window.google.accounts.id.disableAutoSelect();
  }

  function openProfile(id) {
    setSelectedId(id);
    setView("profile");
  }
  function backToGrid() {
    setView("grid");
  }

  function handleAddClick() {
    if (!user) {
      if (window.google && AUTH_CONFIGURED) {
        window.google.accounts.id.prompt();
      } else {
        setNotice("ยังไม่ได้ตั้งค่า Google Sign-In กรุณาตั้งค่า Client ID ใน database/config.js ก่อน");
      }
      return;
    }
    setShowCreate(true);
  }

  async function addTeacher(newTeacher) {
    setSubmitting(true);
    if (IS_CONFIGURED && idToken) {
      const result = await postAction("addTeacher", { idToken, teacher: newTeacher });
      if (result && result.id) newTeacher.id = result.id;
      if (result && result.error) setNotice("บันทึกไม่สำเร็จ: " + result.error);
    }
    setTeachers((prev) => [...prev, newTeacher]);
    setSubmitting(false);
    setShowCreate(false);
    openProfile(newTeacher.id);
  }

  function addNote() {
    if (!selectedId) return;
    const count = (notesByTeacher[selectedId] || []).length;
    const col = count % 4;
    const row = Math.floor(count / 4);
    const newNote = {
      id: makeId("note"),
      teacherId: selectedId,
      title: "",
      body: "",
      x: 24 + col * 208 + Math.round(Math.random() * 12 - 6),
      y: 24 + row * 178 + Math.round(Math.random() * 10 - 5),
    };
    setNotesByTeacher((prev) => ({ ...prev, [selectedId]: [...(prev[selectedId] || []), newNote] }));
    if (IS_CONFIGURED) postAction("addNote", { note: newNote });
  }
  function updateNote(noteId, patch) {
    if (!selectedId) return;
    setNotesByTeacher((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] || []).map((n) => (n.id === noteId ? { ...n, ...patch } : n)),
    }));
    if (IS_CONFIGURED) postAction("updateNote", { id: noteId, patch });
  }
  function deleteNote(noteId) {
    if (!selectedId) return;
    setNotesByTeacher((prev) => ({
      ...prev,
      [selectedId]: (prev[selectedId] || []).filter((n) => n.id !== noteId),
    }));
    if (IS_CONFIGURED) postAction("deleteNote", { id: noteId });
  }

  return (
    <div className="fr-app">
      <style>{CSS}</style>

      <TopBar user={user} signInRef={signInBtnRef} onSignOut={signOut} offline={offline} />
      {notice && <p className="fr-notice">{notice}</p>}

      {view === "grid" && (
        <GridView teachers={teachers} loading={loading} user={user} onOpen={openProfile} onAddClick={handleAddClick} />
      )}

      {view === "profile" && selectedTeacher && (
        <ProfileView
          teacher={selectedTeacher}
          notes={selectedNotes}
          onBack={backToGrid}
          onAddNote={addNote}
          onUpdateNote={updateNote}
          onDeleteNote={deleteNote}
        />
      )}

      {showCreate && (
        <CreateModal user={user} submitting={submitting} onClose={() => setShowCreate(false)} onSubmit={addTeacher} />
      )}
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<FacultyRoom />);
