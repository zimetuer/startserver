import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';
import type { VoiceChatConfig } from '../types.js';

interface VoiceChatSelectProps {
  onNext: (config: VoiceChatConfig) => void;
  onBack: () => void;
  onSkip: () => void;
}

const options = [
  { id: 'plasmavoice', name: 'Plasma Voice', desc: 'Nowoczesny czat głosowy z dźwiękiem 3D', color: 'magenta' },
  { id: 'simplevoicechat', name: 'Simple Voice Chat', desc: 'Prosty i stabilny czat głosowy', color: 'cyan' },
  { id: 'skip', name: 'Pomiń', desc: 'Bez czatu głosowego', color: 'gray' },
];

export function VoiceChatSelect({ onNext, onBack, onSkip }: VoiceChatSelectProps) {
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setSelected(s => Math.max(0, s - 1));
    else if (key.downArrow) setSelected(s => Math.min(options.length, s + 1));
    else if (key.return) {
      if (selected === options.length) onBack();
      else if (options[selected].id === 'skip') onSkip();
      else onNext({ enabled: true, type: options[selected].id as 'plasmavoice' | 'simplevoicechat' });
    } else if (key.escape || (key.backspace && !input)) onBack();
  });

  return (
    <Layout title="czat głosowy" step={5} totalSteps={9}>
      <Box flexDirection="column" marginTop={1}>
        <Text color="white" bold>Dodać czat głosowy do serwera?</Text>
        <Box marginTop={1} />
        {options.map((o, i) => (
          <Box key={o.id} flexDirection="column" marginBottom={1}>
            <Text color={selected === i ? o.color as any : 'gray'}>
              {selected === i ? '▶ ' : '  '}
              {o.name}
            </Text>
            <Text color="gray">    {o.desc}</Text>
          </Box>
        ))}
        <Box>
          <Text color={selected === options.length ? 'cyan' : 'gray'}>
            {selected === options.length ? '▶ ' : '  '}← Wróć
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
