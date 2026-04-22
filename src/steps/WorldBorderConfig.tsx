import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout, type TabId } from '../components/Layout.js';
import type { WorldBorderConfig, WorldBorderPreset } from '../types.js';

interface WorldBorderConfigProps {
  onNext: (config: WorldBorderConfig) => void;
  onBack: () => void;
  onTabClick?: (tabId: TabId) => void;
}

const PRESETS: { value: WorldBorderPreset; label: string }[] = [
  { value: 5000, label: '5000 x 5000' },
  { value: 4000, label: '4000 x 4000' },
  { value: 3500, label: '3500 x 3500' },
  { value: 3000, label: '3000 x 3000' },
  { value: 2500, label: '2500 x 2500' },
  { value: 2000, label: '2000 x 2000' },
  { value: 'custom', label: 'Własny rozmiar' },
];

const MIN_BORDER_SIZE = 500;

export function WorldBorderConfigStep({ onNext, onBack, onTabClick }: WorldBorderConfigProps) {
  const [selected, setSelected] = useState(0);
  const [mode, setMode] = useState<'preset' | 'custom' | 'confirm'>('preset');
  const [customValue, setCustomValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);

  useInput((input, key) => {
    if (mode === 'preset') {
      if (key.upArrow) {
        setSelected(s => Math.max(0, s - 1));
      } else if (key.downArrow) {
        setSelected(s => Math.min(PRESETS.length, s + 1));
      } else if (key.return) {
        if (selected === PRESETS.length) {
          onBack();
        } else {
          const preset = PRESETS[selected];
          if (preset.value === 'custom') {
            setMode('custom');
            setError(null);
          } else {
            setSelectedSize(preset.value as number);
            setMode('confirm');
          }
        }
      } else if (key.escape) {
        onBack();
      }
    } else if (mode === 'custom') {
      if (key.return) {
        const value = parseInt(customValue, 10);
        if (isNaN(value) || value < MIN_BORDER_SIZE) {
          setError(`Wartość musi być co najmniej ${MIN_BORDER_SIZE}`);
        } else {
          setSelectedSize(value);
          setMode('confirm');
          setError(null);
        }
      } else if (key.backspace) {
        setCustomValue(v => v.slice(0, -1));
        setError(null);
      } else if (key.escape) {
        setMode('preset');
        setCustomValue('');
        setError(null);
      } else if (input && !key.ctrl && /^\d$/.test(input)) {
        setCustomValue(v => v + input);
        setError(null);
      }
    } else if (mode === 'confirm') {
      if (key.return) {
        const size = selectedSize!;
        onNext({
          overworld: size,
          nether: size,
          end: size,
        });
      } else if (key.escape || key.backspace) {
        setMode('preset');
        setSelectedSize(null);
      }
    }
  });

  if (mode === 'custom') {
    return (
      <Layout title="granica świata" step={10} totalSteps={12} tab="ustawienia" onTabClick={onTabClick}>
        <Box flexDirection="column" marginTop={2}>
          <Text color="white" bold>Wprowadź własny rozmiar granicy:</Text>
          <Text color="gray">Minimum: {MIN_BORDER_SIZE} bloków</Text>
          <Box marginTop={1} />
          <Box>
            <Text color="gray">&gt; </Text>
            <Text color="white">{customValue}</Text>
            <Text backgroundColor="white" color="black"> </Text>
          </Box>
          {error && (
            <Box marginTop={1}>
              <Text color="red">{error}</Text>
            </Box>
          )}
          <Box marginTop={1}>
            <Text color="gray">ENTER aby potwierdzić | ESC aby wrócić</Text>
          </Box>
        </Box>
      </Layout>
    );
  }

  if (mode === 'confirm') {
    return (
      <Layout title="granica świata" step={10} totalSteps={12} tab="ustawienia" onTabClick={onTabClick}>
        <Box flexDirection="column" marginTop={2}>
          <Text color="white" bold>Potwierdź rozmiar granicy:</Text>
          <Box marginTop={1} />
          <Text color="cyan">{selectedSize} x {selectedSize} bloków</Text>
          <Text color="gray">Zastosowano do: Overworld, Nether, End</Text>
          <Box marginTop={2} />
          <Box>
            <Text color="green">▶ Naciśnij ENTER aby potwierdzić</Text>
          </Box>
          <Box>
            <Text color="gray">  Naciśnij ESC aby wrócić</Text>
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="granica świata" step={10} totalSteps={12} tab="ustawienia" onTabClick={onTabClick}>
      <Box flexDirection="column" marginTop={1}>
        <Text color="white" bold>Wybierz rozmiar granicy świata:</Text>
        <Text color="gray">To ogranicza jak daleko gracze mogą podróżować</Text>
        <Box marginTop={1} />
        {PRESETS.map((preset, i) => (
          <Box key={preset.label}>
            <Text color={selected === i ? 'cyan' : 'gray'}>
              {selected === i ? '▶ ' : '  '}
              {preset.label}
            </Text>
          </Box>
        ))}
        <Box>
          <Text color={selected === PRESETS.length ? 'cyan' : 'gray'}>
            {selected === PRESETS.length ? '▶ ' : '  '}← Wróć
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
