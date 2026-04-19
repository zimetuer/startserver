import React from 'react';
import { Box, Text } from 'ink';

interface LayoutProps {
  title: string;
  step?: number;
  totalSteps?: number;
  children: React.ReactNode;
  status?: string;
}

export function Layout({ title, step = 0, totalSteps = 9, children, status }: LayoutProps) {
  return (
    <Box flexDirection="column">
      {/* Header */}
      <Box backgroundColor="black" paddingX={1}>
        <Text color="white">{title}</Text>
        {step > 0 && (
          <>
            <Text color="gray"> | krok </Text>
            <Text color="cyan">{step}</Text>
            <Text color="gray">/{totalSteps}</Text>
          </>
        )}
      </Box>

      {/* Separator */}
      <Box>
        <Text color="gray">{'─'.repeat(80)}</Text>
      </Box>

      {/* Content */}
      <Box flexDirection="column" padding={1} minHeight={20}>
        {children}
      </Box>

      {/* Bottom Separator */}
      <Box>
        <Text color="gray">{'─'.repeat(80)}</Text>
      </Box>

      {/* Status Bar */}
      <Box backgroundColor="black" paddingX={1}>
        {status ? (
          <Text color="gray">{status}</Text>
        ) : (
          <>
            <Text color="gray">↑↓ nawigacja | enter wybierz | esc/backspace wróć</Text>
          </>
        )}
      </Box>
    </Box>
  );
}
