import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';
import { access, constants, mkdir } from 'fs/promises';

interface DirectorySelectProps {
  onNext: (directory: string) => void;
}

export function DirectorySelect({ onNext }: DirectorySelectProps) {
  const [value, setValue] = useState('./server');
  const [error, setError] = useState<string | null>(null);
  const [cursor, setCursor] = useState(value.length);

  useInput((input, key) => {
    if (key.return) {
      validateAndSubmit();
    } else if (key.backspace) {
      if (cursor > 0) {
        const newValue = value.slice(0, cursor - 1) + value.slice(cursor);
        setValue(newValue);
        setCursor(cursor - 1);
      }
    } else if (key.delete) {
      const newValue = value.slice(0, cursor) + value.slice(cursor + 1);
      setValue(newValue);
    } else if (key.leftArrow) {
      setCursor(Math.max(0, cursor - 1));
    } else if (key.rightArrow) {
      setCursor(Math.min(value.length, cursor + 1));
    } else if (input && !key.ctrl && !key.meta) {
      const newValue = value.slice(0, cursor) + input + value.slice(cursor);
      setValue(newValue);
      setCursor(cursor + 1);
      setError(null);
    }
  });

  const validateAndSubmit = async () => {
    const dir = value.trim() || './server';
    try {
      await access(dir, constants.W_OK);
      onNext(dir);
    } catch {
      try {
        await mkdir(dir, { recursive: true });
        onNext(dir);
      } catch (e) {
        setError('Nie można utworzyć katalogu');
      }
    }
  };

  return (
    <Layout title="wybierz katalog" step={1} totalSteps={9}>
      <Box flexDirection="column" marginTop={2}>
        <Text color="white" bold>Gdzie chcesz utworzyć serwer?</Text>
        <Box marginTop={2} />
        <Text color="gray">Ścieżka katalogu:</Text>
        <Box marginTop={1} />
        <Box>
          <Text color="gray">&gt; </Text>
          <Text color="white">{value.slice(0, cursor)}</Text>
          <Text backgroundColor="white" color="black">{value[cursor] || ' '}</Text>
          <Text color="white">{value.slice(cursor + 1)}</Text>
        </Box>
        {error && (
          <>
            <Box marginTop={1} />
            <Text color="red">✗ {error}</Text>
          </>
        )}
        <Box marginTop={2} />
        <Text color="gray">Naciśnij ENTER aby potwierdzić, domyślnie ./server</Text>
      </Box>
    </Layout>
  );
}
