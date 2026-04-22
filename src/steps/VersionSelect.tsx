import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout, type TabId } from '../components/Layout.js';
import { fetchGameVersions } from '../api/modrinth.js';
import type { GameVersion } from '../types.js';

interface VersionSelectProps {
  onNext: (version: string) => void;
  onBack: () => void;
  onTabClick?: (tabId: TabId) => void;
}

export function VersionSelect({ onNext, onBack, onTabClick }: VersionSelectProps) {
  const [versions, setVersions] = useState<GameVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    fetchGameVersions()
      .then(v => {
        const filtered = v.filter(ver => {
          const parts = ver.version.split('.').map(Number);
          return parts[0] >= 1 && (parts[1] > 8 || (parts[1] === 8 && (parts[2] || 0) >= 9));
        }).slice(0, 20);
        setVersions(filtered);
        setLoading(false);
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Błąd pobierania');
        setLoading(false);
      });
  }, []);

  useInput((input, key) => {
    if (key.upArrow) {
      setSelected(s => Math.max(0, s - 1));
    } else if (key.downArrow) {
      setSelected(s => Math.min(versions.length, s + 1));
    } else if (key.return) {
      if (selected === versions.length) {
        onBack();
      } else {
        onNext(versions[selected].version);
      }
    } else if (key.escape || (key.backspace && !input)) {
      onBack();
    }
  });

  if (loading) {
    return (
      <Layout title="wybierz wersję" step={2} totalSteps={12} tab="podstawowe" onTabClick={onTabClick}>
        <Box marginTop={2}><Text color="gray">Ładowanie wersji Minecraft...</Text></Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="wybierz wersję" step={2} totalSteps={12} tab="podstawowe" onTabClick={onTabClick}>
        <Box marginTop={2}><Text color="red">Błąd: {error}</Text></Box>
      </Layout>
    );
  }

  return (
    <Layout title="wybierz wersję" step={2} totalSteps={12} tab="podstawowe" onTabClick={onTabClick}>
      <Box flexDirection="column" marginTop={1}>
        <Text color="white" bold>Wybierz wersję Minecraft:</Text>
        <Box marginTop={1} />
        {versions.map((v, i) => (
          <Box key={v.version}>
            <Text color={selected === i ? 'cyan' : 'gray'}>
              {selected === i ? '▶ ' : '  '}
              {v.version}
            </Text>
          </Box>
        ))}
        <Box>
          <Text color={selected === versions.length ? 'cyan' : 'gray'}>
            {selected === versions.length ? '▶ ' : '  '}
            ← Wróć
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
