import React from 'react';
import { Box, Text, useApp } from 'ink';
import { Header } from '../components/Header.js';
import { SelectList } from '../components/SelectList.js';
import type { Screen } from '../App.js';

interface Props {
  onNavigate: (screen: Screen) => void;
}

const ITEMS = [
  { label: 'Profils',    value: 'profiles' as const, hint: 'créer, modifier, lancer' },
  { label: 'Paramètres', value: 'settings' as const, hint: 'navigateur, délai, défaut' },
  { label: 'Aide',       value: 'help'     as const, hint: 'commandes et options' },
  { separator: true,     label: '', value: 'sep' as const },
  { label: 'Quitter',    value: 'quit'     as const, dim: true },
];

export function MainMenu({ onNavigate }: Props) {
  const { exit } = useApp();

  return (
    <Box flexDirection="column">
      <Header />
      <Box flexDirection="column" paddingX={2}>
        <Box marginBottom={1}>
          <Text dimColor>Lancez vos apps et sites en un instant.</Text>
        </Box>
        <SelectList
          items={ITEMS}
          onSelect={item => {
            if (item.value === 'quit') exit();
            else if (item.value !== 'sep') onNavigate({ type: item.value });
          }}
          onCancel={() => exit()}
          hint="↑↓ naviguer  ·  ↵ sélectionner  ·  Esc quitter"
        />
      </Box>
    </Box>
  );
}
