import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { config } from "./config.js";
import { planOf } from "./plans.js";
import { mediaPath } from "./art.js";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS clients (
  phone TEXT PRIMARY KEY,
  business TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'start',
  credits INTEGER NOT NULL DEFAULT 0,
  period TEXT NOT NULL DEFAULT '',
  brand TEXT NOT NULL DEFAULT '{}',
  state TEXT NOT NULL DEFAULT '{}',
  onboarded INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS messages_phone ON messages(phone, id);
CREATE TABLE IF NOT EXISTS arts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  group_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  spec TEXT NOT NULL,
  variant TEXT NOT NULL,
  file TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'option',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS arts_group ON arts(group_id);
CREATE TABLE IF NOT EXISTS posts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  group_id TEXT NOT NULL,
  caption TEXT NOT NULL,
  when_text TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  kind TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL,
  file TEXT NOT NULL,
  mime TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS processed (
  msg_id TEXT PRIMARY KEY,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS strangers (
  phone TEXT PRIMARY KEY,
  last_notified TEXT NOT NULL
);
`;

export function openDb(file = path.join(config.dataDir, "lia.db")) {
  if (file !== ":memory:") fs.mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec(SCHEMA);
  // colunas novas em bancos antigos
  for (const col of ["cutout TEXT"]) {
    try { db.exec(`ALTER TABLE photos ADD COLUMN ${col}`); } catch { /* já existe */ }
  }
  return new Store(db);
}

const parse = (s, fallback) => {
  try { return JSON.parse(s); } catch { return fallback; }
};

export function currentPeriod(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: config.timezone, year: "numeric", month: "2-digit" }).formatToParts(date);
  const y = parts.find((p) => p.type === "year").value;
  const m = parts.find((p) => p.type === "month").value;
  return `${y}-${m}`;
}

class Store {
  constructor(db) { this.db = db; }

  tx(fn) {
    this.db.exec("BEGIN IMMEDIATE");
    try { const r = fn(); this.db.exec("COMMIT"); return r; }
    catch (e) { this.db.exec("ROLLBACK"); throw e; }
  }

  // ---------- clients ----------
  row2client(r) {
    if (!r) return null;
    return { ...r, brand: parse(r.brand, {}), state: parse(r.state, {}), onboarded: !!r.onboarded, active: !!r.active };
  }
  getClient(phone) {
    return this.row2client(this.db.prepare("SELECT * FROM clients WHERE phone = ?").get(phone));
  }
  listClients() {
    return this.db.prepare("SELECT * FROM clients ORDER BY created_at").all().map((r) => this.row2client(r));
  }
  addClient(phone, business, plan) {
    const credits = planOf(plan).credits;
    this.db.prepare(
      `INSERT INTO clients (phone, business, plan, credits, period) VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(phone) DO UPDATE SET business = excluded.business, plan = excluded.plan, active = 1`,
    ).run(phone, business, plan, credits, currentPeriod());
    this.addLedger(phone, credits, `plano ${plan}`);
    return this.getClient(phone);
  }
  setPlan(phone, plan) { this.db.prepare("UPDATE clients SET plan = ? WHERE phone = ?").run(plan, phone); }
  setActive(phone, active) { this.db.prepare("UPDATE clients SET active = ? WHERE phone = ?").run(active ? 1 : 0, phone); }
  setOnboarded(phone) { this.db.prepare("UPDATE clients SET onboarded = 1 WHERE phone = ?").run(phone); }
  updateBrand(phone, patch) {
    const c = this.getClient(phone);
    const brand = { ...c.brand };
    for (const [k, v] of Object.entries(patch)) {
      if (Array.isArray(v) ? v.length : typeof v === "string" ? v.trim() : v != null) brand[k] = v;
    }
    this.db.prepare("UPDATE clients SET brand = ? WHERE phone = ?").run(JSON.stringify(brand), phone);
    return brand;
  }
  setState(phone, state) { this.db.prepare("UPDATE clients SET state = ? WHERE phone = ?").run(JSON.stringify(state || {}), phone); }
  patchState(phone, patch) {
    const c = this.getClient(phone);
    const s = { ...c.state, ...patch };
    for (const k of Object.keys(s)) if (s[k] === undefined || s[k] === null) delete s[k];
    this.setState(phone, s);
    return s;
  }

  /** Renova os créditos quando o mês vira. Créditos não acumulam. */
  ensurePeriod(phone) {
    const c = this.getClient(phone);
    const now = currentPeriod();
    if (c.period === now) return c;
    const credits = planOf(c.plan).credits;
    this.tx(() => {
      this.db.prepare("UPDATE clients SET credits = ?, period = ? WHERE phone = ?").run(credits, now, phone);
      this.addLedger(phone, credits - c.credits, `renovação ${now}`);
    });
    return this.getClient(phone);
  }

  /** Debita créditos. Devolve false se não houver saldo. */
  spend(phone, n, reason) {
    if (n <= 0) return true;
    return this.tx(() => {
      const r = this.db.prepare("UPDATE clients SET credits = credits - ? WHERE phone = ? AND credits >= ?").run(n, phone, n);
      if (r.changes === 0) return false;
      this.addLedger(phone, -n, reason);
      return true;
    });
  }
  grant(phone, n, reason) {
    this.tx(() => {
      this.db.prepare("UPDATE clients SET credits = MAX(0, credits + ?) WHERE phone = ?").run(n, phone);
      this.addLedger(phone, n, reason);
    });
  }
  addLedger(phone, delta, reason) {
    this.db.prepare("INSERT INTO ledger (phone, delta, reason) VALUES (?, ?, ?)").run(phone, delta, reason);
  }

  // ---------- messages ----------
  addMessage(phone, role, text) {
    this.db.prepare("INSERT INTO messages (phone, role, text) VALUES (?, ?, ?)").run(phone, role, text);
  }
  recentMessages(phone, limit = 24) {
    return this.db.prepare("SELECT role, text FROM messages WHERE phone = ? ORDER BY id DESC LIMIT ?").all(phone, limit).reverse();
  }

  // ---------- arts ----------
  addArt(a) {
    const r = this.db.prepare("INSERT INTO arts (phone, group_id, kind, spec, variant, file) VALUES (?, ?, ?, ?, ?, ?)")
      .run(a.phone, a.group, a.kind, JSON.stringify(a.spec), a.variant, a.file);
    return Number(r.lastInsertRowid);
  }
  row2art(r) { return r ? { ...r, spec: parse(r.spec, {}) } : null; }
  getArt(id) { return this.row2art(this.db.prepare("SELECT * FROM arts WHERE id = ?").get(id)); }
  groupArts(group, status) {
    const rows = status
      ? this.db.prepare("SELECT * FROM arts WHERE group_id = ? AND status = ? ORDER BY id").all(group, status)
      : this.db.prepare("SELECT * FROM arts WHERE group_id = ? ORDER BY id").all(group);
    return rows.map((r) => this.row2art(r));
  }
  setGroupStatus(group, status) { this.db.prepare("UPDATE arts SET status = ? WHERE group_id = ?").run(status, group); }
  setArtStatus(id, status) { this.db.prepare("UPDATE arts SET status = ? WHERE id = ?").run(status, id); }

  // ---------- posts & tasks ----------
  addPost(phone, group, caption, whenText) {
    return Number(this.db.prepare("INSERT INTO posts (phone, group_id, caption, when_text) VALUES (?, ?, ?, ?)")
      .run(phone, group, caption, whenText).lastInsertRowid);
  }
  postForGroup(group) { return this.db.prepare("SELECT * FROM posts WHERE group_id = ?").get(group) || null; }
  addTask(phone, kind, description) {
    return Number(this.db.prepare("INSERT INTO tasks (phone, kind, description) VALUES (?, ?, ?)").run(phone, kind, description).lastInsertRowid);
  }
  pending() {
    return {
      posts: this.db.prepare("SELECT p.*, c.business FROM posts p JOIN clients c USING(phone) WHERE p.status = 'pending' ORDER BY p.id").all(),
      tasks: this.db.prepare("SELECT t.*, c.business FROM tasks t JOIN clients c USING(phone) WHERE t.status = 'pending' ORDER BY t.id").all(),
    };
  }
  finish(kind, id) {
    const table = kind === "p" ? "posts" : "tasks";
    return this.db.prepare(`UPDATE ${table} SET status = 'done' WHERE id = ? AND status = 'pending'`).run(id).changes > 0;
  }

  // ---------- photos ----------
  addPhoto(phone, file, mime) { return Number(this.db.prepare("INSERT INTO photos (phone, file, mime) VALUES (?, ?, ?)").run(phone, file, mime).lastInsertRowid); }
  setCutout(id, file) { this.db.prepare("UPDATE photos SET cutout = ? WHERE id = ?").run(file, id); }
  latestPhoto(phone) { return this.db.prepare("SELECT * FROM photos WHERE phone = ? ORDER BY id DESC LIMIT 1").get(phone) || null; }

  // ---------- housekeeping ----------
  /** Apaga registros de deduplicação com mais de 7 dias e artes descartadas com mais de 30. */
  cleanup() {
    this.db.prepare("DELETE FROM processed WHERE created_at < datetime('now', '-7 days')").run();
    const old = this.db.prepare("SELECT id, file FROM arts WHERE status = 'discarded' AND created_at < datetime('now', '-30 days')").all();
    for (const a of old) {
      try { fs.unlinkSync(mediaPath(a.file)); } catch { /* já apagado */ }
      this.db.prepare("DELETE FROM arts WHERE id = ?").run(a.id);
    }
    return old.length;
  }
  /** Marca a mensagem como processada. Devolve false se já tinha sido. */
  markProcessed(msgId) {
    try { this.db.prepare("INSERT INTO processed (msg_id) VALUES (?)").run(msgId); return true; }
    catch { return false; }
  }
  /** Avisa o operador sobre número desconhecido no máximo uma vez por dia. */
  shouldNotifyStranger(phone) {
    const today = new Date().toISOString().slice(0, 10);
    const r = this.db.prepare("SELECT last_notified FROM strangers WHERE phone = ?").get(phone);
    if (r && r.last_notified === today) return false;
    this.db.prepare("INSERT INTO strangers (phone, last_notified) VALUES (?, ?) ON CONFLICT(phone) DO UPDATE SET last_notified = excluded.last_notified").run(phone, today);
    return true;
  }
}
