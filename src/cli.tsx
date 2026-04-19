#!/usr/bin/env node
import React from 'react';
import { render } from 'ink';
import { App } from './App.js';
import { initConfig, loadSettings, listProfiles, readProfile, profileExists, findProfileByName, VERSION } from './lib/config.js';
import type { Screen } from './App.js';

initConfig();
const settings = loadSettings();
const args = process.argv.slice(2);
const arg = args[0] ?? '';

// ─── Non-interactive commands ─────────────────────────────────────────────────

if (arg === '-v' || arg === '--version') {
  process.stdout.write(`autobash v${VERSION}\n`);
  process.exit(0);
}

if (arg === '-l' || arg === '--list') {
  const slugs = listProfiles();
  if (slugs.length === 0) {
    process.stdout.write('  Aucun profil créé.\n');
  } else {
    process.stdout.write('\n  Profils disponibles :\n\n');
    for (const slug of slugs) {
      const p = readProfile(slug);
      const count = p?.items.length ?? 0;
      process.stdout.write(`  • ${p?.name ?? slug}  (${slug}, ${count} élément${count !== 1 ? 's' : ''})\n`);
    }
    process.stdout.write('\n');
  }
  process.exit(0);
}

// ─── Interactive UI ───────────────────────────────────────────────────────────

let initialScreen: Screen | undefined;

if (arg === '-c' || arg === '--configure' || arg === '') {
  if (!arg && settings.defaultProfile && profileExists(settings.defaultProfile)) {
    initialScreen = { type: 'launch', slug: settings.defaultProfile };
  } else {
    initialScreen = { type: 'main' };
  }
} else if (arg === '-s' || arg === '--settings') {
  initialScreen = { type: 'settings' };
} else if (arg === '-p' || arg === '--profiles') {
  initialScreen = { type: 'profiles' };
} else if (arg === '-n' || arg === '--new') {
  initialScreen = { type: 'createProfile' };
} else if (arg === '-h' || arg === '--help') {
  initialScreen = { type: 'help' };
} else {
  // Try slug, then name
  if (profileExists(arg)) {
    initialScreen = { type: 'launch', slug: arg };
  } else {
    const found = findProfileByName(arg);
    if (found) {
      initialScreen = { type: 'launch', slug: found };
    } else {
      process.stderr.write(`  ✖  Profil "${arg}" introuvable.\n  Utilisez autobash --list pour voir les profils disponibles.\n`);
      process.exit(1);
    }
  }
}

const { waitUntilExit } = render(<App initialScreen={initialScreen} />, {
  exitOnCtrlC: true,
});

waitUntilExit().then(() => process.exit(0)).catch(() => process.exit(1));
