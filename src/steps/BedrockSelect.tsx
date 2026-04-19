import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';
import type { BedrockConfig } from '../types.js';

interface BedrockSelectProps {
  onlineMode: boolean;
  onNext: (config: BedrockConfig) => void;
  onBack: () => void;
  onSkip: () => void;
}

export function BedrockSelect({ onlineMode, onNext, onBack, onSkip }: BedrockSelectProps) {
  const [selected, setSelected] = useState(0);
  const [confirmed, setConfirmed] = useState(false);
  const [geyser, setGeyser] = useState(true);
  const [floodgate, setFloodgate] = useState(true);

  useInput((input, key) => {
    if (confirmed) {
      // Config mode
      if (key.upArrow || key.downArrow) {
        setSelected(s => s === 0 ? 1 : 0);
      } else if (key.return) {
        if (selected === 0) {
          setGeyser(g => !g);
        } else {
          if (geyser) {
            onNext({ enabled: true, geyser, floodgate: !floodgate });
          } else {
            onSkip();
          }
        }
      } else if (key.escape) {
        setConfirmed(false);
        setSelected(0);
      }
      return;
    }

    // Selection mode
    if (key.upArrow) setSelected(s => Math.max(0, s - 1));
    else if (key.downArrow) setSelected(s => Math.min(2, s + 1));
    else if (key.return) {
      if (selected === 0) setConfirmed(true);
      else if (selected === 1) onSkip();
      else onBack();
    } else if (key.escape || (key.backspace && !input)) onBack();
  });

  if (confirmed) {
    return (
      <Layout title="konfiguracja bedrock" step={6} totalSteps={9}>
        <Box flexDirection="column" marginTop={1}>
          <Text color="white" bold>Skonfiguruj crossplay Bedrock:</Text>
          <Box marginTop={1} />
          <Box>
            <Text color={selected === 0 ? 'green' : 'gray'}>
              {selected === 0 ? '▶ ' : '  '}
              [{geyser ? '✓' : ' '}] Geyser (pozwól graczom Bedrock)
            </Text>
          </Box>
          {geyser && (
            <Box>
              <Text color={selected === 1 ? 'blue' : 'gray'}>
                {selected === 1 ? '▶ ' : '  '}
                [{floodgate ? '✓' : ' '}] Floodgate (uwierzytelnianie)
              </Text>
            </Box>
          )}
          <Box marginTop={1} />
          <Text color="gray">ENTER aby przełączyć, ESC aby wrócić</Text>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="crossplay bedrock" step={6} totalSteps={9}>
      <Box flexDirection="column" marginTop={1}>
        <Text color="white" bold>Włączyć crossplay Bedrock?</Text>
        <Text color="gray">Pozwól graczom Minecraft PE/Windows 10 dołączyć</Text>
        {!onlineMode && <Text color="yellow">Zalecane dla serwerów offline</Text>}
        <Box marginTop={1} />
        <Box>
          <Text color={selected === 0 ? 'cyan' : 'gray'}>
            {selected === 0 ? '▶ ' : '  '}Tak, skonfiguruj
          </Text>
        </Box>
        <Box>
          <Text color={selected === 1 ? 'gray' : 'gray'}>
            {selected === 1 ? '▶ ' : '  '}Nie, pomiń
          </Text>
        </Box>
        <Box>
          <Text color={selected === 2 ? 'cyan' : 'gray'}>
            {selected === 2 ? '▶ ' : '  '}← Wróć
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
