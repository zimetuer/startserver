import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout, type TabId } from '../components/Layout.js';
import { getCompatibleEngines } from '../api/mcutils.js';

interface EngineSelectProps {
  version: string;
  onNext: (engine: string) => void;
  onBack: () => void;
  onTabClick?: (tabId: TabId) => void;
}

export function EngineSelect({ version, onNext, onBack, onTabClick }: EngineSelectProps) {
  const engines = getCompatibleEngines(version);
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setSelected(s => Math.max(0, s - 1));
    else if (key.downArrow) setSelected(s => Math.min(engines.length, s + 1));
    else if (key.return) {
      if (selected === engines.length) onBack();
      else onNext(engines[selected].name.toLowerCase());
    } else if (key.escape || (key.backspace && !input)) onBack();
  });

  return (
    <Layout title="wybierz silnik" step={3} totalSteps={12} tab="podstawowe" onTabClick={onTabClick}>
      <Box flexDirection="column" marginTop={1}>
        <Text color="white" bold>Wybierz silnik serwera dla Minecraft {version}:</Text>
        <Box marginTop={1} />
        {engines.map((e, i) => (
          <Box key={e.name}>
            <Text color={selected === i ? 'magenta' : 'gray'}>
              {selected === i ? '▶ ' : '  '}
              {e.name} <Text color="gray">- {e.description}</Text>
            </Text>
          </Box>
        ))}
        <Box>
          <Text color={selected === engines.length ? 'cyan' : 'gray'}>
            {selected === engines.length ? '▶ ' : '  '}← Wróć
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
