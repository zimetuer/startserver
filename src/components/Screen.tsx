import React, { useEffect } from 'react';
import { Box, Text, useApp, useStdout } from 'ink';

export interface ScreenProps {
  title: string;
  titleColor?: string;
  step: number;
  totalSteps: number;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Screen({ title, titleColor = 'cyan', step, totalSteps, children, footer }: ScreenProps) {
  const { stdout } = useStdout();
  const columns = stdout?.columns ?? 80;
  const rows = stdout?.rows ?? 24;

  useEffect(() => {
    process.stdout.write('\x1B[2J\x1B[H');
  }, []);

  const titleLine = `  ${title}  `;
  const titlePadLeft = Math.max(0, Math.floor((columns - titleLine.length) / 2));
  const paddedTitle = ' '.repeat(titlePadLeft) + titleLine;

  const barWidth = Math.max(0, columns - 12);
  const filled = Math.round((step / totalSteps) * barWidth);
  const empty = barWidth - filled;
  const progressBar = '█'.repeat(filled) + '░'.repeat(empty);

  const contentHeight = rows - 6;

  return (
    <Box flexDirection="column" height={rows} width={columns}>
      {/* Top border */}
      <Box>
        <Text color="gray">╔{'═'.repeat(columns - 2)}╗</Text>
      </Box>

      {/* Title bar */}
      <Box>
        <Text color="gray">║</Text>
        <Text bold color={titleColor as any}>{paddedTitle}</Text>
        <Text color="gray">{' '.repeat(Math.max(0, columns - titlePadLeft - titleLine.length - 1))}║</Text>
      </Box>

      {/* Step progress */}
      <Box>
        <Text color="gray">║ </Text>
        <Text color={titleColor as any}>{progressBar}</Text>
        <Text color="gray"> </Text>
        <Text color={titleColor as any}>{step}/{totalSteps}</Text>
        <Text color="gray"> ║</Text>
      </Box>

      {/* Separator */}
      <Box>
        <Text color="gray">╟{'─'.repeat(columns - 2)}╢</Text>
      </Box>

      {/* Content area */}
      <Box flexDirection="column" flexGrow={1} paddingX={2}>
        {children}
      </Box>

      {/* Bottom separator */}
      <Box>
        <Text color="gray">╟{'─'.repeat(columns - 2)}╢</Text>
      </Box>

      {/* Footer */}
      <Box>
        <Text color="gray">║ </Text>
        {footer || (
          <Text dimColor>
            <Text color="cyan">↑↓</Text> Nawigacja │ <Text color="green">Enter</Text> Zatwierdź │ <Text color="red">ESC/Backspace</Text> Wróć
          </Text>
        )}
        <Text color="gray"> ║</Text>
      </Box>

      {/* Bottom border */}
      <Box>
        <Text color="gray">╚{'═'.repeat(columns - 2)}╝</Text>
      </Box>
    </Box>
  );
}

export function useTerminalSize() {
  const { stdout } = useStdout();
  return {
    columns: stdout?.columns ?? 80,
    rows: stdout?.rows ?? 24
  };
}

export function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps = Array.from({ length: total }, (_, i) => i + 1);
  return (
    <Box flexDirection="row" gap={1}>
      {steps.map(s => (
        <Text key={s} color={s === current ? 'green' : s < current ? 'cyan' : 'gray'}>
          {s < current ? '●' : s === current ? '◉' : '○'}
        </Text>
      ))}
    </Box>
  );
}
