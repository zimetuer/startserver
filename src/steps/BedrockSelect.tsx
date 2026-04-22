import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout, type TabId } from '../components/Layout.js';
import type { BedrockConfig } from '../types.js';

interface BedrockSelectProps {
  onlineMode: boolean;
  onNext: (config: BedrockConfig) => void;
  onBack: () => void;
  onSkip: () => void;
  onTabClick?: (tabId: TabId) => void;
}

export function BedrockSelect({ onlineMode, onNext, onBack, onSkip, onTabClick }: BedrockSelectProps) {
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setSelected(s => Math.max(0, s - 1));
    else if (key.downArrow) setSelected(s => Math.min(2, s + 1));
    else if (key.return) {
      if (selected === 0) onNext({ enabled: true });
      else if (selected === 1) onSkip();
      else onBack();
    } else if (key.escape || (key.backspace && !input)) onBack();
  });

  return (
    <Layout title="crossplay bedrock" step={6} totalSteps={12} tab="funkcje" onTabClick={onTabClick}>
      <Box flexDirection="column" marginTop={1}>
        <Text color="white" bold>Włączyć crossplay Bedrock?</Text>
        <Text color="gray">Pozwól graczom Minecraft PE/Windows 10 dołączyć</Text>
        {!onlineMode && <Text color="yellow">Zalecane dla serwerów offline</Text>}
        <Box marginTop={1} />
        <Box>
          <Text color={selected === 0 ? 'cyan' : 'gray'}>
            {selected === 0 ? '▶ ' : '  '}Tak
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