import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Header } from '../components/Header.js';
import { SelectList, SelectItem } from '../components/SelectList.js';
import { loadSettings, saveSetting, listProfiles, readProfile, Settings } from '../lib/config.js';

type Mode = 'menu' | 'editBrowser' | 'editDelay' | 'editDefault';

interface Props {
  onBack: () => void;
}

function InputField({
  label, placeholder, value, onChange, onSubmit, onCancel, hint,
}: {
  label: string; placeholder: string; value: string;
  onChange: (v: string) => void; onSubmit: (v: string) => void;
  onCancel: () => void; hint?: string;
}) {
  useInput((_, key) => {
    if (key.escape) onCancel();
  });

  return (
    <Box flexDirection="column" paddingX={2} gap={1}>
      <Text bold>{label}</Text>
      {hint && <Text dimColor>{hint}</Text>}
      <Box gap={1}>
        <Text color="cyan">›</Text>
        <TextInput value={value} onChange={onChange} placeholder={placeholder} onSubmit={onSubmit} />
      </Box>
      <Text dimColor>↵ confirmer  ·  Esc annuler</Text>
    </Box>
  );
}

export function SettingsScreen({ onBack }: Props) {
  const [settings, setSettings] = useState<Settings>(() => loadSettings());
  const [mode, setMode] = useState<Mode>('menu');
  const [input, setInput] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);
  const [profiles] = useState(() => listProfiles().map(s => ({ slug: s, name: readProfile(s)?.name ?? s })));

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 1500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const reload = () => setSettings(loadSettings());

  const menuItems: SelectItem<string>[] = [
    { label: 'Navigateur',        value: 'browser', hint: settings.browser },
    { label: 'Délai global',      value: 'delay',   hint: `${settings.delay}s` },
    { label: 'Profil par défaut', value: 'default', hint: settings.defaultProfile || 'aucun' },
    { separator: true, label: '', value: '' },
    { label: 'Retour', value: 'back', dim: true },
  ];

  if (mode === 'editBrowser') {
    return (
      <Box flexDirection="column">
        <Header subtitle="Paramètres › Navigateur" />
        <InputField
          label="Navigateur par défaut"
          placeholder="ex: firefox, chromium, xdg-open"
          value={input}
          onChange={setInput}
          onSubmit={val => {
            if (val.trim()) {
              saveSetting('BROWSER', val.trim());
              setFeedback({ msg: 'Navigateur mis à jour', ok: true });
              reload();
            }
            setMode('menu');
          }}
          onCancel={() => setMode('menu')}
        />
      </Box>
    );
  }

  if (mode === 'editDelay') {
    return (
      <Box flexDirection="column">
        <Header subtitle="Paramètres › Délai" />
        <InputField
          label="Délai entre chaque lancement (secondes)"
          placeholder="ex: 0.3, 1, 0"
          value={input}
          onChange={setInput}
          onSubmit={val => {
            if (/^\d+(\.\d+)?$/.test(val.trim())) {
              saveSetting('DELAY', val.trim());
              setFeedback({ msg: 'Délai mis à jour', ok: true });
              reload();
            } else {
              setFeedback({ msg: 'Valeur invalide (nombre attendu)', ok: false });
            }
            setMode('menu');
          }}
          onCancel={() => setMode('menu')}
        />
      </Box>
    );
  }

  if (mode === 'editDefault') {
    const defItems: SelectItem<string>[] = [
      { label: 'Aucun (afficher le menu)', value: '' },
      ...profiles.map(p => ({ label: p.name, value: p.slug, hint: p.slug })),
    ];
    return (
      <Box flexDirection="column">
        <Header subtitle="Paramètres › Profil par défaut" />
        <Box paddingX={2}>
          <SelectList
            items={defItems}
            onSelect={item => {
              saveSetting('DEFAULT_PROFILE', item.value);
              setFeedback({ msg: 'Profil par défaut mis à jour', ok: true });
              reload();
              setMode('menu');
            }}
            onCancel={() => setMode('menu')}
            hint="↑↓ naviguer  ·  ↵ choisir  ·  Esc annuler"
          />
        </Box>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Header subtitle="Paramètres" />
      <Box flexDirection="column" paddingX={2}>
        {feedback && (
          <Box marginBottom={1}>
            <Text color={feedback.ok ? 'green' : 'red'}>{feedback.ok ? '✔' : '✖'}  {feedback.msg}</Text>
          </Box>
        )}
        <SelectList
          items={menuItems}
          onSelect={item => {
            if (item.value === 'back') { onBack(); return; }
            setInput('');
            if (item.value === 'browser') setMode('editBrowser');
            else if (item.value === 'delay') setMode('editDelay');
            else if (item.value === 'default') setMode('editDefault');
          }}
          onCancel={onBack}
          hint="↑↓ naviguer  ·  ↵ modifier  ·  Esc retour"
        />
      </Box>
    </Box>
  );
}
