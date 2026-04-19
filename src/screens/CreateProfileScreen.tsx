import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import TextInput from 'ink-text-input';
import { Header } from '../components/Header.js';
import { createProfile } from '../lib/config.js';
import type { Screen } from '../App.js';

interface Props {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
}

export function CreateProfileScreen({ onBack, onNavigate }: Props) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  useInput((_, key) => {
    if (key.escape) onBack();
  });

  return (
    <Box flexDirection="column">
      <Header subtitle="Nouveau profil" />
      <Box flexDirection="column" paddingX={2} gap={1}>
        <Text dimColor>Choisissez un nom pour votre profil.</Text>
        <Box gap={1}>
          <Text color="cyan">›</Text>
          <TextInput
            value={name}
            onChange={v => { setName(v); setError(''); }}
            placeholder="ex: Travail, Perso, Dev…"
            onSubmit={val => {
              if (!val.trim()) { setError('Le nom ne peut pas être vide.'); return; }
              const slug = createProfile(val.trim());
              onNavigate({ type: 'editProfile', slug });
            }}
          />
        </Box>
        {error && <Text color="red">✖  {error}</Text>}
        <Text dimColor>↵ créer  ·  Esc annuler</Text>
      </Box>
    </Box>
  );
}
