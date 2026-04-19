import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';
import type { Template } from '../types.js';

interface TemplateSelectProps {
  onNext: (template: Template) => void;
  onBack: () => void;
}

const templates = [
  { id: 'minimal' as Template, name: 'Minimalny', desc: 'Tylko serwer, bez pluginów', color: 'gray' },
  { id: 'standard' as Template, name: 'Standardowy', desc: 'EssentialsX, LuckPerms, WorldEdit', color: 'blue' },
  { id: 'full' as Template, name: 'Pełny', desc: 'TAB, Scoreboard, RTP, Domy, Drużyny', color: 'green' },
];

export function TemplateSelect({ onNext, onBack }: TemplateSelectProps) {
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setSelected(s => Math.max(0, s - 1));
    else if (key.downArrow) setSelected(s => Math.min(templates.length, s + 1));
    else if (key.return) {
      if (selected === templates.length) onBack();
      else onNext(templates[selected].id);
    } else if (key.escape || (key.backspace && !input)) onBack();
  });

  return (
    <Layout title="wybierz szablon" step={4} totalSteps={9}>
      <Box flexDirection="column" marginTop={1}>
        <Text color="white" bold>Wybierz szablon serwera:</Text>
        <Box marginTop={1} />
        {templates.map((t, i) => (
          <Box key={t.id} flexDirection="column" marginBottom={1}>
            <Text color={selected === i ? t.color as any : 'gray'}>
              {selected === i ? '▶ ' : '  '}
              {t.name}
            </Text>
            <Text color="gray">    {t.desc}</Text>
          </Box>
        ))}
        <Box>
          <Text color={selected === templates.length ? 'cyan' : 'gray'}>
            {selected === templates.length ? '▶ ' : '  '}← Wróć
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
