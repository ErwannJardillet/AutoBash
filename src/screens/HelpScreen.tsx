import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Header } from '../components/Header.js';
import { CONFIG_DIR } from '../lib/config.js';

interface Props {
  onBack: () => void;
}

function Row({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <Box gap={1}>
      <Text color="cyan" bold>{cmd.padEnd(20)}</Text>
      <Text dimColor>{desc}</Text>
    </Box>
  );
}

export function HelpScreen({ onBack }: Props) {
  useInput((input, key) => {
    if (key.escape || key.return || input === 'q') onBack();
  });

  return (
    <Box flexDirection="column">
      <Header subtitle="Aide" />
      <Box flexDirection="column" paddingX={2} gap={1}>

        <Box flexDirection="column">
          <Text bold>Usage</Text>
          <Text dimColor>  autobash [OPTIONS] [PROFIL]</Text>
        </Box>

        <Box flexDirection="column" gap={0}>
          <Text bold>Options</Text>
          <Row cmd="  [PROFIL]"         desc="Lance directement un profil (slug ou nom)" />
          <Row cmd="  -c, --configure"  desc="Ouvre le menu de configuration" />
          <Row cmd="  -s, --settings"   desc="Ouvre les paramètres globaux" />
          <Row cmd="  -p, --profiles"   desc="Gestion des profils" />
          <Row cmd="  -l, --list"       desc="Liste tous les profils" />
          <Row cmd="  -n, --new"        desc="Crée un nouveau profil" />
          <Row cmd="  -h, --help"       desc="Affiche cette aide" />
          <Row cmd="  -v, --version"    desc="Affiche la version" />
        </Box>

        <Box flexDirection="column" gap={0}>
          <Text bold>Exemples</Text>
          <Text dimColor>  autobash              <Text color="cyan">→</Text>  menu principal</Text>
          <Text dimColor>  autobash travail      <Text color="cyan">→</Text>  lance le profil "travail"</Text>
          <Text dimColor>  autobash --new        <Text color="cyan">→</Text>  crée un profil</Text>
          <Text dimColor>  autobash --list       <Text color="cyan">→</Text>  liste les profils</Text>
        </Box>

        <Box>
          <Text dimColor>Config : </Text>
          <Text dimColor color="cyan">{CONFIG_DIR}</Text>
        </Box>

        <Box>
          <Text dimColor>{'─'.repeat(44)}</Text>
        </Box>
        <Box>
          <Text dimColor>Esc  ·  ↵  ·  q  →  retour</Text>
        </Box>

      </Box>
    </Box>
  );
}
