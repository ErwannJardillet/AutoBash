import React, { useState } from 'react';
import { Box } from 'ink';
import { MainMenu } from './screens/MainMenu.js';
import { SettingsScreen } from './screens/SettingsScreen.js';
import { ProfilesScreen } from './screens/ProfilesScreen.js';
import { EditProfileScreen } from './screens/EditProfileScreen.js';
import { CreateProfileScreen } from './screens/CreateProfileScreen.js';
import { LaunchScreen } from './screens/LaunchScreen.js';
import { HelpScreen } from './screens/HelpScreen.js';

export type Screen =
  | { type: 'main' }
  | { type: 'settings' }
  | { type: 'profiles' }
  | { type: 'editProfile'; slug: string }
  | { type: 'createProfile' }
  | { type: 'launch'; slug: string }
  | { type: 'help' };

interface Props {
  initialScreen?: Screen;
}

export function App({ initialScreen }: Props) {
  const [stack, setStack] = useState<Screen[]>([initialScreen ?? { type: 'main' }]);
  const current = stack[stack.length - 1]!;

  const push = (screen: Screen) => setStack(s => [...s, screen]);
  const pop = () => setStack(s => (s.length > 1 ? s.slice(0, -1) : s));
  const replace = (screen: Screen) => setStack(s => [...s.slice(0, -1), screen]);

  return (
    <Box flexDirection="column">
      {current.type === 'main' && (
        <MainMenu onNavigate={push} />
      )}
      {current.type === 'settings' && (
        <SettingsScreen onBack={pop} />
      )}
      {current.type === 'profiles' && (
        <ProfilesScreen onNavigate={screen => {
          if (screen.type === 'createProfile') push(screen);
          else push(screen);
        }} onBack={pop} />
      )}
      {current.type === 'editProfile' && (
        <EditProfileScreen
          slug={current.slug}
          onBack={pop}
          onNavigate={screen => {
            if (screen.type === 'editProfile') replace(screen);
            else push(screen);
          }}
        />
      )}
      {current.type === 'createProfile' && (
        <CreateProfileScreen
          onBack={pop}
          onNavigate={screen => replace(screen)}
        />
      )}
      {current.type === 'launch' && (
        <LaunchScreen slug={current.slug} onDone={pop} />
      )}
      {current.type === 'help' && (
        <HelpScreen onBack={pop} />
      )}
    </Box>
  );
}
