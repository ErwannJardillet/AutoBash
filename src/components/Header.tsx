import React from 'react';
import { Box, Text } from 'ink';
import { VERSION } from '../lib/config.js';

interface HeaderProps {
  subtitle?: string;
}

export function Header({ subtitle }: HeaderProps) {
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Box paddingX={2} gap={1}>
        <Text bold color="cyan">⚡ autobash</Text>
        <Text dimColor>v{VERSION}</Text>
        {subtitle && (
          <>
            <Text dimColor>›</Text>
            <Text bold color="white">{subtitle}</Text>
          </>
        )}
      </Box>
      <Box paddingX={2}>
        <Text color="cyan">{'─'.repeat(48)}</Text>
      </Box>
    </Box>
  );
}
