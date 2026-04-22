import React from 'react';
import { Box, Text, useInput } from 'ink';

export type TabId = 'podstawowe' | 'funkcje' | 'pluginy' | 'ustawienia' | 'podsumowanie';

const TABS: { id: TabId; label: string; shortcut: string }[] = [
  { id: 'podstawowe', label: 'Podstawowe', shortcut: '1' },
  { id: 'funkcje', label: 'Funkcje', shortcut: '2' },
  { id: 'pluginy', label: 'Pluginy', shortcut: '3' },
  { id: 'ustawienia', label: 'Ustawienia', shortcut: '4' },
  { id: 'podsumowanie', label: 'Podsumowanie', shortcut: '5' },
];

interface LayoutProps {
  title: string;
  step?: number;
  totalSteps?: number;
  tab?: TabId;
  children: React.ReactNode;
  status?: string;
  statusPosition?: 'top' | 'bottom';
  onTabClick?: (tabId: TabId) => void;
}

export function Layout({ title, step = 0, totalSteps = 12, tab, children, status, statusPosition = 'bottom', onTabClick }: LayoutProps) {
  const tabIndex = tab ? TABS.findIndex(t => t.id === tab) : -1;

  useInput((input, key) => {
    if (!onTabClick || tabIndex < 0) return;
    if (input >= '1' && input <= '5' && key.ctrl) {
      const targetIndex = parseInt(input) - 1;
      if (targetIndex >= 0 && targetIndex < TABS.length && targetIndex < tabIndex) {
        onTabClick(TABS[targetIndex].id);
      }
    }
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text color="white" bold>{title}</Text>
        {step > 0 && (
          <>
            <Text color="gray"> | krok </Text>
            <Text color="cyan">{step}</Text>
            <Text color="gray">/{totalSteps}</Text>
          </>
        )}
      </Box>

      {tab && (
        <Box>
          {TABS.map((t, i) => {
            const isCompleted = i < tabIndex;
            const isActive = i === tabIndex;

            return (
              <React.Fragment key={t.id}>
                {i > 0 && <Text color="gray">{` │ `}</Text>}
                {isCompleted && (
                  <Text color="green">{onTabClick ? `[${t.shortcut}] ` : ''}✓ {t.label}</Text>
                )}
                {isActive && <Text color="cyan" bold>{`▸${t.label}`}</Text>}
                {!isCompleted && !isActive && <Text color="dim">○ {t.label}</Text>}
              </React.Fragment>
            );
          })}
        </Box>
      )}

      {status && statusPosition === 'top' && (
        <Box>
          <Text color="gray">{status}</Text>
        </Box>
      )}

      <Box>
        <Text color="gray">{'─'.repeat(80)}</Text>
      </Box>

      <Box flexDirection="column" padding={1} minHeight={20}>
        {children}
      </Box>

      <Box>
        <Text color="gray">{'─'.repeat(80)}</Text>
      </Box>

      <Box>
        {status && statusPosition === 'bottom' ? (
          <Text color="gray">{status}</Text>
        ) : (
          <Text color="gray">↑↓ nawigacja | enter wybierz | esc/backspace wróć{onTabClick ? ' | ctrl+1-5 zakładki' : ''}</Text>
        )}
      </Box>
    </Box>
  );
}

export { TABS };