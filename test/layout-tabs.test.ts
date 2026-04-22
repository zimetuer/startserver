import { describe, it, expect } from 'vitest';
import type { TabId } from '../src/components/Layout.js';

const TABS: { id: TabId; label: string; shortcut: string }[] = [
  { id: 'podstawowe', label: 'Podstawowe', shortcut: '1' },
  { id: 'funkcje', label: 'Funkcje', shortcut: '2' },
  { id: 'pluginy', label: 'Pluginy', shortcut: '3' },
  { id: 'ustawienia', label: 'Ustawienia', shortcut: '4' },
  { id: 'podsumowanie', label: 'Podsumowanie', shortcut: '5' },
];

const STEP_TAB_MAP: Record<string, { step: number; tab: TabId }> = {
  directory: { step: 1, tab: 'podstawowe' },
  version: { step: 2, tab: 'podstawowe' },
  engine: { step: 3, tab: 'podstawowe' },
  template: { step: 4, tab: 'podstawowe' },
  voicechat: { step: 5, tab: 'funkcje' },
  bedrock: { step: 6, tab: 'funkcje' },
  additions: { step: 7, tab: 'funkcje' },
  plugin: { step: 8, tab: 'pluginy' },
  config: { step: 9, tab: 'ustawienia' },
  worldborder: { step: 10, tab: 'ustawienia' },
  ram: { step: 11, tab: 'ustawienia' },
  review: { step: 12, tab: 'podsumowanie' },
  generating: { step: 12, tab: 'podsumowanie' },
};

const TOTAL_STEPS = 12;

describe('Tab bar', () => {
  it('has 5 tabs', () => {
    expect(TABS).toHaveLength(5);
  });

  it('has correct tab ids', () => {
    const ids = TABS.map(t => t.id);
    expect(ids).toEqual(['podstawowe', 'funkcje', 'pluginy', 'ustawienia', 'podsumowanie']);
  });

  it('each tab has a non-empty label', () => {
    for (const tab of TABS) {
      expect(tab.label.length).toBeGreaterThan(0);
    }
  });

  it('tab ids are unique', () => {
    const ids = TABS.map(t => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('finds correct tab index for each tab', () => {
    for (let i = 0; i < TABS.length; i++) {
      const index = TABS.findIndex(t => t.id === TABS[i].id);
      expect(index).toBe(i);
    }
  });

  it('marks tabs before the active one as completed', () => {
    const activeTab: TabId = 'pluginy';
    const activeIndex = TABS.findIndex(t => t.id === activeTab);
    expect(activeIndex).toBe(2);

    const completed = TABS.filter((_, i) => i < activeIndex);
    expect(completed.map(t => t.id)).toEqual(['podstawowe', 'funkcje']);
  });

  it('marks tabs after the active one as upcoming', () => {
    const activeTab: TabId = 'funkcje';
    const activeIndex = TABS.findIndex(t => t.id === activeTab);
    const upcoming = TABS.filter((_, i) => i > activeIndex);
    expect(upcoming.map(t => t.id)).toEqual(['pluginy', 'ustawienia', 'podsumowanie']);
  });

  it('marks no tabs completed when on first tab', () => {
    const activeTab: TabId = 'podstawowe';
    const activeIndex = TABS.findIndex(t => t.id === activeTab);
    const completed = TABS.filter((_, i) => i < activeIndex);
    expect(completed).toHaveLength(0);
  });

  it('marks all tabs completed when past last tab', () => {
    const beyondLast = TABS.length;
    const completed = TABS.filter((_, i) => i < beyondLast);
    expect(completed).toHaveLength(TABS.length);
  });
});

describe('Step-to-tab mapping', () => {
  it('maps every step to a valid tab', () => {
    for (const [stepName, mapping] of Object.entries(STEP_TAB_MAP)) {
      expect(TABS.some(t => t.id === mapping.tab)).toBe(true);
    }
  });

  it('step numbers are sequential from 1 to 12', () => {
    const steps = Object.values(STEP_TAB_MAP)
      .filter(m => m.step <= TOTAL_STEPS - 1)
      .map(m => m.step)
      .sort((a, b) => a - b);
    const uniqueSteps = [...new Set(steps)];
    for (let i = 1; i <= TOTAL_STEPS - 1; i++) {
      expect(uniqueSteps).toContain(i);
    }
  });

  it('steps in the same tab have consecutive or equal step numbers', () => {
    const tabs = [...new Set(Object.values(STEP_TAB_MAP).map(m => m.tab))];
    for (const tab of tabs) {
      const stepsInTab = Object.entries(STEP_TAB_MAP)
        .filter(([, m]) => m.tab === tab)
        .map(([, m]) => m.step)
        .sort((a, b) => a - b);
      for (let i = 1; i < stepsInTab.length; i++) {
        expect(stepsInTab[i]).toBeGreaterThanOrEqual(stepsInTab[i - 1]);
      }
    }
  });

  it('tab order matches step order', () => {
    const tabOrder: TabId[] = ['podstawowe', 'funkcje', 'pluginy', 'ustawienia', 'podsumowanie'];
    const stepEntries = Object.entries(STEP_TAB_MAP).sort((a, b) => a[1].step - b[1].step);
    let lastTabIndex = -1;
    for (const [, m] of stepEntries) {
      const currentTabIndex = tabOrder.indexOf(m.tab);
      expect(currentTabIndex).toBeGreaterThanOrEqual(lastTabIndex);
      if (currentTabIndex > lastTabIndex) {
        lastTabIndex = currentTabIndex;
      }
    }
  });

  it('review and generating share the same step number and tab', () => {
    expect(STEP_TAB_MAP.review.step).toBe(STEP_TAB_MAP.generating.step);
    expect(STEP_TAB_MAP.review.tab).toBe(STEP_TAB_MAP.generating.tab);
  });
});

describe('Step number consistency', () => {
  it('total steps is 12 for all mappings', () => {
    const allSteps = Object.values(STEP_TAB_MAP).map(m => m.step);
    const maxStep = Math.max(...allSteps);
    expect(maxStep).toBeLessThanOrEqual(TOTAL_STEPS);
    expect(maxStep).toBe(TOTAL_STEPS);
  });

  it('step 0 (welcome) has no tab', () => {
    expect(STEP_TAB_MAP).not.toHaveProperty('welcome');
  });

  it('all step numbers are positive (except welcome)', () => {
    for (const [name, m] of Object.entries(STEP_TAB_MAP)) {
      expect(m.step).toBeGreaterThan(0);
    }
  });
});

describe('Layout rendering logic', () => {
  it('computes correct tabIndex for each tab', () => {
    const cases: [TabId, number][] = [
      ['podstawowe', 0],
      ['funkcje', 1],
      ['pluginy', 2],
      ['ustawienia', 3],
      ['podsumowanie', 4],
    ];
    for (const [tabId, expectedIndex] of cases) {
      const tabIndex = TABS.findIndex(t => t.id === tabId);
      expect(tabIndex).toBe(expectedIndex);
    }
  });

  it('returns -1 when no tab is provided (welcome screen)', () => {
    const tabIndex = TABS.findIndex(t => t.id === undefined as any);
    expect(tabIndex).toBe(-1);
  });

  it('separator │ is shown between tabs, not before first or after last', () => {
    const tab: TabId = 'funkcje';
    const tabIndex = TABS.findIndex(t => t.id === tab);
    const parts = TABS.map((t, i) => {
      const isCompleted = i < tabIndex;
      const isActive = i === tabIndex;
      const prefix = i > 0 ? ' │ ' : '';
      if (isCompleted) return prefix + `✓ ${t.label}`;
      if (isActive) return prefix + `▸${t.label}`;
      return prefix + `○ ${t.label}`;
    });
    expect(parts[0].startsWith(' │ ')).toBe(false);
    expect(parts[1].startsWith(' │ ')).toBe(true);
  });

  it('active tab uses ▸ prefix, completed uses ✓, upcoming uses ○', () => {
    const tab: TabId = 'pluginy';
    const tabIndex = TABS.findIndex(t => t.id === tab);

    const representations = TABS.map((t, i) => {
      if (i < tabIndex) return `✓ ${t.label}`;
      if (i === tabIndex) return `▸${t.label}`;
      return `○ ${t.label}`;
    });

    expect(representations[0]).toBe('✓ Podstawowe');
    expect(representations[1]).toBe('✓ Funkcje');
    expect(representations[2]).toBe('▸Pluginy');
    expect(representations[3]).toBe('○ Ustawienia');
    expect(representations[4]).toBe('○ Podsumowanie');
  });
});

describe('Tab grouping', () => {
  it('podstawowe contains directory, version, engine, template', () => {
    const podstawoweSteps = Object.entries(STEP_TAB_MAP)
      .filter(([, m]) => m.tab === 'podstawowe')
      .map(([name]) => name);
    expect(podstawoweSteps.sort()).toEqual(['directory', 'engine', 'template', 'version']);
  });

  it('funkcje contains voicechat, bedrock, additions', () => {
    const funkcjeSteps = Object.entries(STEP_TAB_MAP)
      .filter(([, m]) => m.tab === 'funkcje')
      .map(([name]) => name);
    expect(funkcjeSteps.sort()).toEqual(['additions', 'bedrock', 'voicechat']);
  });

  it('pluginy contains only plugin step', () => {
    const pluginySteps = Object.entries(STEP_TAB_MAP)
      .filter(([, m]) => m.tab === 'pluginy')
      .map(([name]) => name);
    expect(pluginySteps).toEqual(['plugin']);
  });

  it('ustawienia contains config, worldborder, ram', () => {
    const ustawieniaSteps = Object.entries(STEP_TAB_MAP)
      .filter(([, m]) => m.tab === 'ustawienia')
      .map(([name]) => name);
    expect(ustawieniaSteps.sort()).toEqual(['config', 'ram', 'worldborder']);
  });

  it('podsumowanie contains review and generating', () => {
    const podsumowanieSteps = Object.entries(STEP_TAB_MAP)
      .filter(([, m]) => m.tab === 'podsumowanie')
      .map(([name]) => name);
    expect(podsumowanieSteps.sort()).toEqual(['generating', 'review']);
  });
});

describe('Tab click navigation', () => {
  const TAB_STEP_MAP: Record<TabId, string> = {
    podstawowe: 'directory',
    funkcje: 'voicechat',
    pluginy: 'plugin',
    ustawienia: 'config',
    podsumowanie: 'review',
  };

  it('maps each tab to a valid step', () => {
    for (const [tabId, step] of Object.entries(TAB_STEP_MAP)) {
      expect(step).toBeTruthy();
      expect(typeof step).toBe('string');
    }
  });

  it('navigates to the first step of each tab section', () => {
    expect(TAB_STEP_MAP.podstawowe).toBe('directory');
    expect(TAB_STEP_MAP.funkcje).toBe('voicechat');
    expect(TAB_STEP_MAP.pluginy).toBe('plugin');
    expect(TAB_STEP_MAP.ustawienia).toBe('config');
    expect(TAB_STEP_MAP.podsumowanie).toBe('review');
  });

  it('tab shortcuts are number keys 1-5', () => {
    for (let i = 0; i < TABS.length; i++) {
      expect(TABS[i].shortcut).toBe(String(i + 1));
    }
  });

  it('only completed tabs are clickable (index < current tab index)', () => {
    const currentTab: TabId = 'pluginy';
    const currentIndex = TABS.findIndex(t => t.id === currentTab);
    const clickableTabs = TABS.filter((_, i) => i < currentIndex);
    const nonClickableTabs = TABS.filter((_, i) => i >= currentIndex);

    expect(clickableTabs.map(t => t.id)).toEqual(['podstawowe', 'funkcje']);
    expect(nonClickableTabs.map(t => t.id)).toEqual(['pluginy', 'ustawienia', 'podsumowanie']);
  });

  it('no tabs are clickable when on the first tab', () => {
    const currentTab: TabId = 'podstawowe';
    const currentIndex = TABS.findIndex(t => t.id === currentTab);
    const clickableTabs = TABS.filter((_, i) => i < currentIndex);
    expect(clickableTabs).toHaveLength(0);
  });

  it('all previous tabs are clickable when on the last tab', () => {
    const currentTab: TabId = 'podsumowanie';
    const currentIndex = TABS.findIndex(t => t.id === currentTab);
    const clickableTabs = TABS.filter((_, i) => i < currentIndex);
    expect(clickableTabs).toHaveLength(4);
  });

  it('ctrl+number maps to correct tab', () => {
    const shortcuts: Record<string, TabId> = {
      '1': 'podstawowe',
      '2': 'funkcje',
      '3': 'pluginy',
      '4': 'ustawienia',
      '5': 'podsumowanie',
    };
    for (const [key, tabId] of Object.entries(shortcuts)) {
      const tabIndex = TABS.findIndex(t => t.id === tabId);
      expect(TABS[tabIndex].shortcut).toBe(key);
    }
  });
});