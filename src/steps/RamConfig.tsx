import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';

interface RamConfigProps {
  maxPlayers: number;
  onNext: (ramGb: number) => void;
  onBack: () => void;
}

export function RamConfig({ maxPlayers, onNext, onBack }: RamConfigProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recommended = Math.max(2, Math.ceil(maxPlayers / 10) + 1);

  useInput((input, key) => {
    if (key.return) {
      const ram = parseInt(value, 10);
      if (isNaN(ram) || ram < 1) setError('Minimum 1GB');
      else onNext(ram);
    } else if (key.backspace) {
      setValue(v => v.slice(0, -1));
      setError(null);
    } else if (key.escape) {
      onBack();
    } else if (/^[0-9]$/.test(input)) {
      setValue(v => v + input);
      setError(null);
    }
  });

  return (
    <Layout title="przydziel ram" step={8} totalSteps={9}>
      <Box flexDirection="column" marginTop={2}>
        <Text color="white" bold>Ile RAM dla serwera?</Text>
        <Box marginTop={1} />
        <Text color="gray">Zalecane dla {maxPlayers} graczy: <Text color="green">{recommended}GB</Text></Text>
        <Text color="gray">Minimum: 1GB │ Duże paczki modów: 6-8GB+</Text>
        <Box marginTop={2} />
        
        <Box>
          <Text color="gray">&gt; </Text>
          <Text color="white">{value}</Text>
          <Text backgroundColor="white" color="black"> </Text>
          <Text color="gray"> GB</Text>
        </Box>

        {error && (
          <>
            <Box marginTop={1} />
            <Text color="red">✗ {error}</Text>
          </>
        )}
      </Box>
    </Layout>
  );
}
