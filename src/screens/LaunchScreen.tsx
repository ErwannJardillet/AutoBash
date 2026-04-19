import React, { useState, useEffect } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
import { Header } from '../components/Header.js';
import { readProfile, loadSettings } from '../lib/config.js';
import { launchItem, sleep } from '../lib/launch.js';

type ItemState = 'pending' | 'running' | 'done';

interface Props {
  slug: string;
  onDone: () => void;
}

function ProgressBar({ value, total, width = 36 }: { value: number; total: number; width?: number }) {
  const filled = total > 0 ? Math.round((value / total) * width) : 0;
  return (
    <Box>
      <Text color="cyan">{'█'.repeat(filled)}</Text>
      <Text dimColor>{'░'.repeat(width - filled)}</Text>
      <Text dimColor>  {value}/{total}</Text>
    </Box>
  );
}

export function LaunchScreen({ slug, onDone }: Props) {
  const { exit } = useApp();
  void exit;
  const profile = readProfile(slug);
  const settings = loadSettings();
  const [states, setStates] = useState<ItemState[]>(() =>
    (profile?.items ?? []).map(() => 'pending')
  );
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!profile || profile.items.length === 0) {
      setDone(true);
      return;
    }
    const delay = parseFloat(profile.delay ?? settings.delay) * 1000;

    (async () => {
      for (let i = 0; i < profile.items.length; i++) {
        setStates(s => s.map((v, idx) => (idx === i ? 'running' : v)));
        const item = profile.items[i]!;
        launchItem(item.type, item.cmd, settings.browser);
        await sleep(Math.max(100, delay));
        setStates(s => s.map((v, idx) => (idx === i ? 'done' : v)));
      }
      setDone(true);
    })();
  }, []);

  useInput((input, key) => {
    if (done && (key.return || key.escape || input.toLowerCase() === 'q')) {
      onDone();
    }
  });

  if (!profile) {
    return (
      <Box flexDirection="column">
        <Header />
        <Box paddingX={2}>
          <Text color="red">✖  Profil introuvable : {slug}</Text>
        </Box>
      </Box>
    );
  }

  const doneCount = states.filter(s => s === 'done').length;

  return (
    <Box flexDirection="column">
      <Header subtitle={`Lancement · ${profile.name}`} />
      <Box flexDirection="column" paddingX={2}>
        {profile.items.length === 0 ? (
          <Box>
            <Text color="yellow">⚠  Ce profil ne contient aucun élément.</Text>
          </Box>
        ) : (
          <>
            {profile.items.map((item, i) => {
              const st = states[i] ?? 'pending';
              return (
                <Box key={i} gap={1}>
                  {st === 'done'    && <Text color="green">✔</Text>}
                  {st === 'running' && <Text color="cyan"><Spinner type="dots" /></Text>}
                  {st === 'pending' && <Text dimColor>○</Text>}
                  <Text
                    bold={st === 'running'}
                    color={st === 'done' ? undefined : st === 'running' ? 'cyan' : undefined}
                    dimColor={st === 'pending'}
                  >
                    {item.label}
                  </Text>
                  <Text dimColor>{item.type === 'url' ? '🔗' : '⚙ '}  {item.cmd}</Text>
                </Box>
              );
            })}

            <Box marginTop={1}>
              <ProgressBar value={doneCount} total={profile.items.length} />
            </Box>

            <Box marginTop={1}>
              {done ? (
                <Text color="green">
                  ✔  {doneCount} élément{doneCount !== 1 ? 's' : ''} lancé{doneCount !== 1 ? 's' : ''}
                  {'  '}<Text dimColor>↵ / Esc pour continuer</Text>
                </Text>
              ) : (
                <Text dimColor>Lancement en cours…</Text>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
