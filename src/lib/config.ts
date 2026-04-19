import fs from 'fs';
import path from 'path';
import os from 'os';

export const CONFIG_DIR = process.env['XDG_CONFIG_HOME']
  ? path.join(process.env['XDG_CONFIG_HOME'], 'autobash')
  : path.join(os.homedir(), '.config', 'autobash');

export const PROFILES_DIR = path.join(CONFIG_DIR, 'profiles');
export const SETTINGS_FILE = path.join(CONFIG_DIR, 'settings.conf');
export const VERSION = '1.0.2';

export interface Settings {
  browser: string;
  delay: string;
  defaultProfile: string;
}

export interface ProfileItem {
  type: 'app' | 'url';
  label: string;
  cmd: string;
}

export interface Profile {
  slug: string;
  name: string;
  delay?: string;
  items: ProfileItem[];
}

export function initConfig(): void {
  fs.mkdirSync(PROFILES_DIR, { recursive: true });
  if (!fs.existsSync(SETTINGS_FILE)) {
    fs.writeFileSync(
      SETTINGS_FILE,
      '# autobash — Paramètres globaux\nBROWSER=xdg-open\nDELAY=0.3\nDEFAULT_PROFILE=\n'
    );
  }
}

export function loadSettings(): Settings {
  const s: Settings = { browser: 'xdg-open', delay: '0.3', defaultProfile: '' };
  if (!fs.existsSync(SETTINGS_FILE)) return s;
  for (const line of fs.readFileSync(SETTINGS_FILE, 'utf8').split('\n')) {
    if (line.startsWith('#') || !line.includes('=')) continue;
    const eq = line.indexOf('=');
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (key === 'BROWSER') s.browser = val;
    else if (key === 'DELAY') s.delay = val;
    else if (key === 'DEFAULT_PROFILE') s.defaultProfile = val;
  }
  return s;
}

export function saveSetting(key: string, val: string): void {
  if (!fs.existsSync(SETTINGS_FILE)) initConfig();
  let content = fs.readFileSync(SETTINGS_FILE, 'utf8');
  const re = new RegExp(`^${key}=.*$`, 'm');
  content = re.test(content)
    ? content.replace(re, `${key}=${val}`)
    : content + `\n${key}=${val}`;
  fs.writeFileSync(SETTINGS_FILE, content);
}

export function listProfiles(): string[] {
  if (!fs.existsSync(PROFILES_DIR)) return [];
  return fs
    .readdirSync(PROFILES_DIR)
    .filter(f => f.endsWith('.conf'))
    .map(f => f.slice(0, -5));
}

export function profileExists(slug: string): boolean {
  return fs.existsSync(path.join(PROFILES_DIR, `${slug}.conf`));
}

export function readProfile(slug: string): Profile | null {
  const file = path.join(PROFILES_DIR, `${slug}.conf`);
  if (!fs.existsSync(file)) return null;
  const p: Profile = { slug, name: slug, items: [] };
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!line || line.startsWith('#')) continue;
    if (line.startsWith('NAME=')) { p.name = line.slice(5); continue; }
    if (line.startsWith('DELAY=')) { p.delay = line.slice(6); continue; }
    const parts = line.split('|');
    if (parts.length === 3 && (parts[0] === 'app' || parts[0] === 'url')) {
      p.items.push({ type: parts[0] as 'app' | 'url', label: parts[1]!, cmd: parts[2]! });
    }
  }
  return p;
}

export function saveProfile(profile: Profile): void {
  const file = path.join(PROFILES_DIR, `${profile.slug}.conf`);
  let content = `# Profil autobash : ${profile.name}\nNAME=${profile.name}\n`;
  if (profile.delay) content += `DELAY=${profile.delay}\n`;
  for (const item of profile.items) content += `${item.type}|${item.label}|${item.cmd}\n`;
  fs.writeFileSync(file, content);
}

export function createProfile(name: string): string {
  let slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  let n = 1;
  const base = slug;
  while (profileExists(slug)) slug = `${base}-${n++}`;
  fs.writeFileSync(
    path.join(PROFILES_DIR, `${slug}.conf`),
    `# Profil autobash : ${name}\nNAME=${name}\n`
  );
  return slug;
}

export function deleteProfile(slug: string): void {
  const file = path.join(PROFILES_DIR, `${slug}.conf`);
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

export function findProfileByName(query: string): string | null {
  const q = query.toLowerCase();
  for (const slug of listProfiles()) {
    const p = readProfile(slug);
    if (p && p.name.toLowerCase() === q) return slug;
  }
  return null;
}
