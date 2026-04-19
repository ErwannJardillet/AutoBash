import React, { useState, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { SelectList, SelectItem } from '../components/SelectList.js';
import { listProfiles, readProfile } from '../lib/config.js';
import type { Screen } from '../App.js';

interface Props {
  onNavigate: (screen: Screen) => void;
  onBack: () => void;
}

function buildItems(): SelectItem<string>[] {
  const slugs = listProfiles();
  const items: SelectItem<string>[] = slugs.map(slug => {
    const p = readProfile(slug);
    const count = p?.items.length ?? 0;
    return {
      label: p?.name ?? slug,
      value: `edit:${slug}`,
      hint: `${count} élément${count !== 1 ? 's' : ''}`,
    };
  });
  if (items.length > 0) items.push({ separator: true, label: '', value: '' });
  items.push({ label: 'Nouveau profil', value: 'new' });
  items.push({ separator: true, label: '', value: '' });
  items.push({ label: 'Retour', value: 'back', dim: true });
  return items;
}

export function ProfilesScreen({ onNavigate, onBack }: Props) {
  const [items, setItems] = useState<SelectItem<string>[]>(() => buildItems());

  const refresh = useCallback(() => setItems(buildItems()), []);
  void refresh;

  useInput((_, key) => {
    if (key.escape) onBack();
  });

  return (
    <Box flexDirection="column">
      <Header subtitle="Profils" />
      <Box flexDirection="column" paddingX={2}>
        {listProfiles().length === 0 && (
          <Box marginBottom={1}>
            <Text dimColor>Aucun profil — créez-en un ci-dessous.</Text>
          </Box>
        )}
        <SelectList
          items={items}
          onSelect={item => {
            if (item.value === 'back') { onBack(); return; }
            if (item.value === 'new') { onNavigate({ type: 'createProfile' }); return; }
            if (item.value.startsWith('edit:')) {
              onNavigate({ type: 'editProfile', slug: item.value.slice(5) });
            }
          }}
          onCancel={onBack}
          hint="↑↓ naviguer  ·  ↵ ouvrir  ·  Esc retour"
        />
      </Box>
    </Box>
  );
}
