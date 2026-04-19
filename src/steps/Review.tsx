import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';
import type { ServerConfig } from '../types.js';

interface ReviewProps {
  config: ServerConfig;
  onNext: () => void;
  onBack: () => void;
}

export function Review({ config, onNext, onBack }: ReviewProps) {
  const [confirming, setConfirming] = useState(false);

  useInput((input, key) => {
    if (confirming) {
      if (key.return) onNext();
      else if (key.escape) setConfirming(false);
      return;
    }
    if (key.return) setConfirming(true);
    else if (key.escape || key.backspace) onBack();
  });

  if (confirming) {
    return (
      <Layout title="potwierdź" step={9} totalSteps={9}>
        <Box flexDirection="column" marginTop={3} alignItems="center">
          <Text color="yellow" bold>⚠ Wygenerować serwer?</Text>
          <Box marginTop={1} />
          <Text color="gray">Wszystkie pliki zostaną zapisane do:</Text>
          <Text color="cyan">{config.directory}</Text>
          <Box marginTop={2} />
          <Box flexDirection="row" gap={2}>
            <Box backgroundColor="green" paddingX={2}><Text color="black" bold>ENTER = Tak</Text></Box>
            <Box backgroundColor="red" paddingX={2}><Text color="black">ESC = Nie</Text></Box>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="podsumowanie" step={9} totalSteps={9}>
      <Box flexDirection="row" marginTop={1}>
        {/* Left column */}
        <Box flexDirection="column" width={45}>
          <Text color="white" bold underline>Serwer</Text>
          <Text color="gray">Nazwa: <Text color="white">{config.serverName}</Text></Text>
          <Text color="gray">Katalog: <Text color="white">{config.directory}</Text></Text>
          <Text color="gray">Wersja: <Text color="green">{config.version}</Text></Text>
          <Text color="gray">Silnik: <Text color="magenta">{config.engine}</Text></Text>
          <Text color="gray">RAM: <Text color="yellow">{config.ramGb}GB</Text></Text>
          <Box marginY={1} />
          <Text color="white" bold underline>Ustawienia</Text>
          <Text color="gray">Gracze: <Text color="white">{config.maxPlayers}</Text></Text>
          <Text color="gray">Tryb: <Text color="white">{config.gamemode}</Text></Text>
          <Text color="gray">Trudność: <Text color="red">{config.difficulty}</Text></Text>
          <Text color="gray">PVP: {config.pvp ? <Text color="green">✓</Text> : <Text color="red">✗</Text>}</Text>
        </Box>

        {/* Right column */}
        <Box flexDirection="column">
          <Text color="white" bold underline>Funkcje</Text>
          <Text color="gray">Głos: {config.voiceChat.enabled ? <Text color="magenta">{config.voiceChat.type}</Text> : <Text color="gray">wył.</Text>}</Text>
          <Text color="gray">Bedrock: {config.bedrock.enabled ? <Text color="cyan">wł.</Text> : <Text color="gray">wył.</Text>}</Text>
          <Text color="gray">Dodatki: {config.customAdditions.enabled ? <Text color="yellow">wł.</Text> : <Text color="gray">wył.</Text>}</Text>
          <Box marginY={1} />
          <Text color="white" bold underline>Pluginy ({config.plugins.length})</Text>
          {config.plugins.slice(0, 5).map((p, i) => (
            <Text key={i} color={i % 2 === 0 ? 'green' : 'cyan'}>• {p.name}</Text>
          ))}
          {config.plugins.length > 5 && <Text color="gray">+{config.plugins.length - 5} więcej</Text>}
        </Box>
      </Box>

      <Box marginTop={2} />
      <Text color="gray">Naciśnij ENTER aby wygenerować, ESC aby wrócić</Text>
    </Layout>
  );
}
