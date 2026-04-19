import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Header } from '../components/Header.js';
import { SelectList, SelectItem } from '../components/SelectList.js';
import { readProfile, saveProfile, deleteProfile, Profile } from '../lib/config.js';
import type { Screen } from '../App.js';

type Mode =
  | 'menu'
  | 'addUrlLabel' | 'addUrlCmd'
  | 'addAppLabel' | 'addAppCmd'
  | 'rename'
  | 'delay'
  | 'confirmDelete';

interface Props {
  slug: string;
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

interface InputScreenProps {
  title: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: (v: string) => void;
  onCancel: () => void;
  hint?: string;
}

function InputScreen({ title, label, placeholder, value, onChange, onSubmit, onCancel, hint }: InputScreenProps) {
  useInput((_, key) => {
    if (key.escape) onCancel();
  });

  return (
    <Box flexDirection="column">
      <Header subtitle={title} />
      <Box flexDirection="column" paddingX={2} gap={1}>
        <Text bold>{label}</Text>
        {hint && <Text dimColor>{hint}</Text>}
        <Box gap={1}>
          <Text color="cyan">›</Text>
          <TextInput value={value} onChange={onChange} placeholder={placeholder} onSubmit={onSubmit} />
        </Box>
        <Text dimColor>↵ confirmer  ·  Esc annuler</Text>
      </Box>
    </Box>
  );
}

export function EditProfileScreen({ slug, onBack, onNavigate }: Props) {
  const [profile, setProfile] = useState<Profile | null>(() => readProfile(slug));
  const [mode, setMode] = useState<Mode>('menu');
  const [input, setInput] = useState('');
  const [pendingLabel, setPendingLabel] = useState('');
  const [feedback, setFeedback] = useState<{ msg: string; ok: boolean } | null>(null);

  useEffect(() => {
    if (feedback) {
      const t = setTimeout(() => setFeedback(null), 1500);
      return () => clearTimeout(t);
    }
  }, [feedback]);

  const persist = (p: Profile) => { saveProfile(p); setProfile(p); };

  if (!profile) {
    return <Box paddingX={2}><Text color="red">✖  Profil introuvable.</Text></Box>;
  }

  if (mode === 'rename') {
    return (
      <InputScreen
        title={`${profile.name} › Renommer`}
        label="Nouveau nom" placeholder={profile.name}
        value={input} onChange={setInput}
        onSubmit={val => {
          if (val.trim()) { persist({ ...profile, name: val.trim() }); setFeedback({ msg: `Renommé en "${val.trim()}"`, ok: true }); }
          setMode('menu'); setInput('');
        }}
        onCancel={() => { setMode('menu'); setInput(''); }}
      />
    );
  }

  if (mode === 'delay') {
    return (
      <InputScreen
        title={`${profile.name} › Délai`}
        label="Délai entre chaque lancement (secondes)" placeholder={profile.delay ?? 'global'}
        value={input} onChange={setInput}
        hint="Laisser vide pour utiliser le délai global"
        onSubmit={val => {
          if (val === '') { persist({ ...profile, delay: undefined }); setFeedback({ msg: 'Délai global utilisé', ok: true }); }
          else if (/^\d+(\.\d+)?$/.test(val)) { persist({ ...profile, delay: val }); setFeedback({ msg: `Délai : ${val}s`, ok: true }); }
          else { setFeedback({ msg: 'Valeur invalide', ok: false }); }
          setMode('menu'); setInput('');
        }}
        onCancel={() => { setMode('menu'); setInput(''); }}
      />
    );
  }

  if (mode === 'addUrlLabel') {
    return (
      <InputScreen
        title={`${profile.name} › Ajouter un site`}
        label="Nom affiché" placeholder="ex: GitHub, Gmail…"
        value={input} onChange={setInput}
        onSubmit={val => {
          if (!val.trim()) { setMode('menu'); return; }
          setPendingLabel(val.trim()); setInput(''); setMode('addUrlCmd');
        }}
        onCancel={() => { setMode('menu'); setInput(''); }}
      />
    );
  }

  if (mode === 'addUrlCmd') {
    return (
      <InputScreen
        title={`${profile.name} › Ajouter un site`}
        label={`URL pour "${pendingLabel}"`} placeholder="https://…"
        value={input} onChange={setInput}
        onSubmit={val => {
          if (val.trim()) { persist({ ...profile, items: [...profile.items, { type: 'url', label: pendingLabel, cmd: val.trim() }] }); setFeedback({ msg: `"${pendingLabel}" ajouté`, ok: true }); }
          setMode('menu'); setInput('');
        }}
        onCancel={() => { setMode('menu'); setInput(''); }}
      />
    );
  }

  if (mode === 'addAppLabel') {
    return (
      <InputScreen
        title={`${profile.name} › Ajouter une appli`}
        label="Nom affiché" placeholder="ex: VS Code, Spotify…"
        value={input} onChange={setInput}
        onSubmit={val => {
          if (!val.trim()) { setMode('menu'); return; }
          setPendingLabel(val.trim()); setInput(''); setMode('addAppCmd');
        }}
        onCancel={() => { setMode('menu'); setInput(''); }}
      />
    );
  }

  if (mode === 'addAppCmd') {
    return (
      <InputScreen
        title={`${profile.name} › Ajouter une appli`}
        label={`Commande shell pour "${pendingLabel}"`} placeholder="ex: code, spotify, discord"
        value={input} onChange={setInput}
        onSubmit={val => {
          if (val.trim()) { persist({ ...profile, items: [...profile.items, { type: 'app', label: pendingLabel, cmd: val.trim() }] }); setFeedback({ msg: `"${pendingLabel}" ajouté`, ok: true }); }
          setMode('menu'); setInput('');
        }}
        onCancel={() => { setMode('menu'); setInput(''); }}
      />
    );
  }

  if (mode === 'confirmDelete') {
    const items: SelectItem<string>[] = [
      { label: 'Annuler', value: 'no' },
      { label: `Supprimer "${profile.name}"`, value: 'yes', dim: true },
    ];
    return (
      <Box flexDirection="column">
        <Header subtitle={`${profile.name} › Supprimer`} />
        <Box flexDirection="column" paddingX={2}>
          <Box marginBottom={1}><Text color="red">Cette action est irréversible.</Text></Box>
          <SelectList
            items={items}
            onSelect={item => {
              if (item.value === 'yes') { deleteProfile(slug); onBack(); }
              else setMode('menu');
            }}
            onCancel={() => setMode('menu')}
          />
        </Box>
      </Box>
    );
  }

  // ─── Main menu ────────────────────────────────────────────────────────────────

  const menuItems: SelectItem<string>[] = [
    ...profile.items.map((item, i) => ({
      label: item.label,
      value: `del:${i}`,
      hint: `${item.type === 'url' ? 'url' : 'app'}  ${item.cmd}`,
    })),
  ];

  if (profile.items.length > 0) menuItems.push({ separator: true, label: '', value: '' });

  menuItems.push(
    { label: 'Ajouter un site web',     value: 'addUrl' },
    { label: 'Ajouter une application', value: 'addApp' },
    { separator: true, label: '', value: '' },
    { label: 'Lancer ce profil',        value: 'launch' },
    { label: 'Renommer',                value: 'rename' },
    { label: 'Changer le délai',        value: 'delay',  hint: profile.delay ? `${profile.delay}s` : 'global' },
    { separator: true, label: '', value: '' },
    { label: 'Supprimer ce profil',     value: 'delete', dim: true },
    { label: 'Retour',                  value: 'back',   dim: true },
  );

  return (
    <Box flexDirection="column">
      <Header subtitle={profile.name} />
      <Box flexDirection="column" paddingX={2}>
        {profile.items.length === 0 ? (
          <Box marginBottom={1}>
            <Text dimColor>Aucun élément — ajoutez un site ou une application.</Text>
          </Box>
        ) : (
          <Box marginBottom={1}>
            <Text dimColor>{profile.items.length} élément{profile.items.length !== 1 ? 's' : ''}  ·  sélectionner pour supprimer</Text>
          </Box>
        )}
        {feedback && (
          <Box marginBottom={1}>
            <Text color={feedback.ok ? 'green' : 'red'}>{feedback.ok ? '✔' : '✖'}  {feedback.msg}</Text>
          </Box>
        )}
        <SelectList
          items={menuItems}
          onSelect={item => {
            if (item.value === 'back') { onBack(); return; }
            if (item.value === 'addUrl') { setInput(''); setMode('addUrlLabel'); return; }
            if (item.value === 'addApp') { setInput(''); setMode('addAppLabel'); return; }
            if (item.value === 'rename') { setInput(''); setMode('rename'); return; }
            if (item.value === 'delay')  { setInput(''); setMode('delay'); return; }
            if (item.value === 'delete') { setMode('confirmDelete'); return; }
            if (item.value === 'launch') { onNavigate({ type: 'launch', slug }); return; }
            if (item.value.startsWith('del:')) {
              const idx = parseInt(item.value.slice(4));
              const newItems = [...profile.items];
              newItems.splice(idx, 1);
              persist({ ...profile, items: newItems });
              setFeedback({ msg: 'Élément supprimé', ok: true });
            }
          }}
          onCancel={onBack}
          hint="↑↓ naviguer  ·  ↵ sélectionner  ·  Esc retour"
        />
      </Box>
    </Box>
  );
}
