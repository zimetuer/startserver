import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';

interface ServerConfigProps {
  template: string;
  onNext: (config: Record<string, any>) => void;
  onBack: () => void;
}

const fields = [
  { key: 'serverName', label: 'Nazwa serwera', default: 'Serwer Minecraft', type: 'text' },
  { key: 'maxPlayers', label: 'Maksymalna liczba graczy', default: '20', type: 'number' },
  { key: 'whitelist', label: 'Włącz whitelistę', default: false, type: 'bool' },
  { key: 'onlineMode', label: 'Tryb online', default: true, type: 'bool' },
  { key: 'difficulty', label: 'Trudność', default: 'normalny', type: 'select', options: ['pokojowy', 'łatwy', 'normalny', 'trudny'] },
  { key: 'gamemode', label: 'Tryb gry', default: 'przetrwanie', type: 'select', options: ['przetrwanie', 'kreatywny', 'przygoda', 'widz'] },
  { key: 'serverPort', label: 'Port serwera', default: '25565', type: 'number' },
  { key: 'viewDistance', label: 'Odległość widzenia', default: '10', type: 'number' },
  { key: 'motd', label: 'MOTD (opis serwera)', default: 'Serwer Minecraft', type: 'text' },
  { key: 'pvp', label: 'Włącz PVP', default: true, type: 'bool' },
  { key: 'spawnProtection', label: 'Ochrona spawna', default: '16', type: 'number' },
  { key: 'opPlayer', label: 'Gracz OP (opcjonalnie)', default: '', type: 'text' },
];

export function ServerConfigStep({ template, onNext, onBack }: ServerConfigProps) {
  const [current, setCurrent] = useState(0);
  const [values, setValues] = useState<Record<string, any>>({});
  const [input, setInput] = useState('');
  const [confirmMode, setConfirmMode] = useState(false);
  const field = fields[current];

  useInput((char, key) => {
    if (confirmMode) {
      if (key.return) {
        // Confirm and move to next
        if (current + 1 >= fields.length) {
          onNext(values);
        } else {
          setCurrent(c => c + 1);
          setInput('');
          setConfirmMode(false);
        }
      } else if (key.escape || key.backspace) {
        // Go back to editing
        setConfirmMode(false);
      }
      return;
    }

    if (field.type === 'bool') {
      if (key.leftArrow || key.rightArrow) {
        const newValues = { ...values, [field.key]: !(values[field.key] !== undefined ? values[field.key] : field.default) };
        setValues(newValues);
      } else if (key.return) {
        setConfirmMode(true);
      } else if (key.escape || key.backspace) {
        onBack();
      }
      return;
    }

    if (field.type === 'select') {
      if (key.upArrow) {
        const idx = field.options!.indexOf(values[field.key] || field.default);
        const newVal = field.options![Math.max(0, idx - 1)];
        setValues(v => ({ ...v, [field.key]: newVal }));
      } else if (key.downArrow) {
        const idx = field.options!.indexOf(values[field.key] || field.default);
        const newVal = field.options![Math.min(field.options!.length - 1, idx + 1)];
        setValues(v => ({ ...v, [field.key]: newVal }));
      } else if (key.return) {
        const newValues = { ...values, [field.key]: values[field.key] || field.default };
        setValues(newValues);
        setConfirmMode(true);
      } else if (key.escape) {
        onBack();
      }
      return;
    }

    // text/number
    if (key.return) {
      const val = field.type === 'number' ? parseInt(input || field.default as string, 10) : (input || field.default);
      const newValues = { ...values, [field.key]: val };
      setValues(newValues);
      setConfirmMode(true);
    } else if (key.backspace) {
      setInput(i => i.slice(0, -1));
    } else if (key.escape) {
      onBack();
    } else if (char && !key.ctrl) {
      setInput(i => i + char);
    }
  });

  const currentVal = values[field.key] !== undefined ? values[field.key] : field.default;

  // Confirmation screen
  if (confirmMode) {
    return (
      <Layout title="konfiguracja serwera" step={7} totalSteps={10}>
        <Box flexDirection="column" marginTop={2}>
          <Text color="gray">Pole {current + 1}/{fields.length}</Text>
          <Box marginTop={1} />
          <Text color="white" bold>{field.label}</Text>
          <Box marginTop={1} />
          <Box>
            <Text color="gray">Wartość: </Text>
            <Text color="cyan">{String(currentVal)}</Text>
          </Box>
          <Box marginTop={2} />
          <Box>
            <Text color="green">▶ Naciśnij ENTER aby potwierdzić</Text>
          </Box>
          <Box>
            <Text color="gray">  Naciśnij ESC aby edytować ponownie</Text>
          </Box>
        </Box>
      </Layout>
    );
  }

  // Input screen
  return (
    <Layout title="konfiguracja serwera" step={7} totalSteps={10}>
      <Box flexDirection="column" marginTop={2}>
        <Text color="gray">Pole {current + 1}/{fields.length}</Text>
        <Box marginTop={1} />
        <Text color="white" bold>{field.label}</Text>
        <Box marginTop={1} />

        {field.type === 'bool' && (
          <Box>
            <Text color={currentVal ? 'green' : 'gray'}>
              {currentVal ? '[TAK]' : ' TAK '}
            </Text>
            <Text color="gray"> / </Text>
            <Text color={!currentVal ? 'red' : 'gray'}>
              {!currentVal ? '[NIE]' : ' NIE '}
            </Text>
            <Text color="gray"> (←→ aby zmienić, ENTER aby potwierdzić)</Text>
          </Box>
        )}

        {field.type === 'select' && (
          <Box flexDirection="column">
            {field.options!.map(opt => (
              <Box key={opt}>
                <Text color={currentVal === opt ? 'cyan' : 'gray'}>
                  {currentVal === opt ? '▶ ' : '  '}{opt}
                </Text>
              </Box>
            ))}
          </Box>
        )}

        {(field.type === 'text' || field.type === 'number') && (
          <Box>
            <Text color="gray">&gt; </Text>
            <Text color="white">{input}</Text>
            <Text backgroundColor="white" color="black"> </Text>
            <Text color="gray"> (domyślnie: {field.default})</Text>
          </Box>
        )}
      </Box>
    </Layout>
  );
}
