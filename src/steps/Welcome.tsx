import React from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';

interface WelcomeProps {
  onNext: () => void;
}

export function Welcome({ onNext }: WelcomeProps) {
  useInput((input, key) => {
    if (key.return) onNext();
  });

  return (
    <Layout title="startserver" step={0} totalSteps={9}>
      <Box flexDirection="column">
        <Text color="cyan">
{`   ____  _             _   _                  
  / ___|| |_ __ _ _ __| |_(_) ___ ___  ___ ___ 
  \\___ \\| __/ _\` | '__| __| |/ __/ _ \\ / __/ __|
   ___) | || (_| | |  | |_| | (_|  __/\\__ \\__ \\
  |____/ \\__\\__,_|_|   \\__|_|\\___\\___||___/___/`}
        </Text>

        <Box marginTop={2} />
        
        <Text color="white" bold>Kreator Konfiguracji Serwera Minecraft</Text>
        
        <Box marginTop={1} />
        
        <Text color="gray">Ten kreator przeprowadzi Cię przez konfigurację serwera Minecraft.</Text>

        <Box marginTop={3} />

        <Box flexDirection="column">
          <Text color="gray">Funkcje:</Text>
          <Text color="cyan">  • Wybór wersji i silnika</Text>
          <Text color="magenta">  • Czat głosowy (Plasma/Simple)</Text>
          <Text color="cyan">  • Crossplay Bedrock (Geyser)</Text>
          <Text color="yellow">  • Dodatki (niewidzialność, limity)</Text>
          <Text color="green">  • Pluginy oparte na szablonach</Text>
        </Box>

        <Box marginTop={3} />

        <Text color="white" backgroundColor="gray"> Naciśnij ENTER aby rozpocząć </Text>
      </Box>
    </Layout>
  );
}
