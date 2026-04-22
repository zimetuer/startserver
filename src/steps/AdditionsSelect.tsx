import React, { useState, useMemo, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout, type TabId } from '../components/Layout.js';
import type { CustomAdditionsConfig } from '../types.js';

interface AdditionsSelectProps {
  onNext: (config: CustomAdditionsConfig) => void;
  onBack: () => void;
  onSkip: () => void;
  onTabClick?: (tabId: TabId) => void;
}

interface FeatureDef {
  key: keyof CustomAdditionsConfig;
  label: string;
  desc: string;
  type: 'boolean' | 'number';
  min?: number;
  max?: number;
  step?: number;
  children?: FeatureDef[];
}

interface GroupDef {
  label: string;
  features: FeatureDef[];
}

const GROUPS: GroupDef[] = [
  {
    label: 'Walka',
    features: [
      { key: 'fullInvisibility', label: 'Niewidzialność', desc: 'Ukryj cząsteczki i nametagi', type: 'boolean' },
      { key: 'itemLimits', label: 'Limity Przedmiotów', desc: 'Ogranicz gapple/perły/totemy', type: 'boolean', children: [
        { key: 'maxGapples', label: 'Max Gapple', desc: 'Zaczarowane jabłka', type: 'number', min: 1, max: 64, step: 1 },
        { key: 'maxEnderPearls', label: 'Max Perły', desc: 'Perły kresu', type: 'number', min: 1, max: 64, step: 1 },
        { key: 'maxTotems', label: 'Max Totemy', desc: 'Totemy nieśmiertelności', type: 'number', min: 1, max: 64, step: 1 },
      ]},
      { key: 'lifestealEnabled', label: 'Lifesteal', desc: 'Serca za zabójstwo', type: 'boolean' },
      { key: 'combatLogPrevention', label: 'Combat Log', desc: 'Kara za wylogowanie w walce', type: 'boolean', children: [
        { key: 'combatLogDuration', label: 'Czas Walki', desc: 'Sekund w stanie walki', type: 'number', min: 5, max: 120, step: 5 },
      ]},
    ]
  },
  {
    label: 'Czat & Interfejs',
    features: [
      { key: 'scoreboardEnabled', label: 'Tablica Wyników', desc: 'Statystyki na pasku bocznym', type: 'boolean' },
      { key: 'tabEnabled', label: 'Lista Graczy (TAB)', desc: 'Nagłówek/stopka', type: 'boolean' },
      { key: 'chatAntiSpamEnabled', label: 'Anti-Spam Czatu', desc: 'Blokuj spam wiadomości', type: 'boolean', children: [
        { key: 'chatAntiSpamCooldown', label: 'Cooldown', desc: 'Sekund między wiadomościami', type: 'number', min: 0, max: 10, step: 1 },
      ]},
    ]
  },
  {
    label: 'Swiat',
    features: [
      { key: 'spawnProtection', label: 'Ochrona Spawna', desc: 'Chroń spawn', type: 'boolean', children: [
        { key: 'spawnProtectionRadius', label: 'Promien', desc: 'Bloki od spawna', type: 'number', min: 0, max: 500, step: 10 },
      ]},
      { key: 'rtpEnabled', label: 'Losowy TP (/rtp)', desc: 'Teleport w losowe miejsce', type: 'boolean', children: [
        { key: 'rtpMaxDistance', label: 'Max Dystans', desc: 'Maks. dystans teleportu', type: 'number', min: 1000, max: 50000, step: 1000 },
      ]},
      { key: 'homesEnabled', label: 'Domy (/home)', desc: 'Ustaw lokalizacje domu', type: 'boolean', children: [
        { key: 'maxHomes', label: 'Max Domow', desc: 'Domow na gracza', type: 'number', min: 1, max: 10, step: 1 },
      ]},
      { key: 'worldBorderEnabled', label: 'Granica Swiata', desc: 'Ogranicz rozmiar swiata', type: 'boolean', children: [
        { key: 'worldBorderSize', label: 'Rozmiar', desc: 'Promien od srodka', type: 'number', min: 1000, max: 100000, step: 1000 },
      ]},
    ]
  },
  {
    label: 'Ekonomia',
    features: [
      { key: 'economyEnabled', label: 'Ekonomia', desc: '/balance, /pay', type: 'boolean', children: [
        { key: 'economyStartingBalance', label: 'Poczatkowy Balans', desc: 'Startowa gotowka', type: 'number', min: 0, max: 10000, step: 100 },
      ]},
    ]
  },
];

const defaultConfig: CustomAdditionsConfig = {
  enabled: true,
  fullInvisibility: true,
  itemLimits: true,
  maxGapples: 16,
  maxEnderPearls: 16,
  maxTotems: 2,
  customItemLimits: [],
  disabledItems: [],
  lifestealEnabled: false,
  scoreboardEnabled: true,
  scoreboardTitle: "&6&lServerAdditions",
  scoreboardUpdateInterval: 20,
  tabEnabled: true,
  tabHeader: "&6&m------------------------\n&eWitaj na %servername%\n&6&m------------------------",
  tabFooter: "&7Online: &f%online%&7/&f%max%\n&7Ping: &f%ping%ms",
  tabUpdateInterval: 40,
  spawnProtection: true,
  spawnProtectionRadius: 50,
  spawnTeleportEnabled: true,
  spawnTeleportCooldown: 30,
  spawnTeleportDelay: 5,
  rtpEnabled: false,
  rtpMinDistance: 500,
  rtpMaxDistance: 10000,
  rtpCooldown: 300,
  rtpCost: 0,
  homesEnabled: true,
  maxHomes: 1,
  homeCooldown: 10,
  combatLogPrevention: false,
  combatLogDuration: 30,
  combatLogPunishment: 'KILL',
  combatLogBlockedCommands: ['spawn', 'home', 'warp', 'rtp'],
  economyEnabled: false,
  economyStartingBalance: 100,
  economySymbol: '$',
  combatIndicatorsEnabled: true,
  combatDamageNumbers: true,
  combatHitSound: true,
  chatFormatEnabled: true,
  chatAntiSpamEnabled: true,
  chatAntiSpamCooldown: 2,
  worldBorderEnabled: false,
  worldBorderSize: 10000,
  worldBorderCenterX: 0,
  worldBorderCenterZ: 0,
  worldBorderWarningDistance: 100,
  entityLimiterEnabled: false,
  maxMobsPerChunk: 25,
  maxAnimalsPerChunk: 15,
  clearDropsInterval: 10,
};

const COMMON_ITEMS = [
  'DIAMOND', 'NETHERITE_INGOT', 'EMERALD', 'GOLD_INGOT', 'IRON_INGOT',
  'TNT', 'SHULKER_BOX', 'ELYTRA', 'TRIDENT', 'BEACON'
];

interface NavItem {
  key: string;
  label: string;
  desc: string;
  type: 'boolean' | 'number' | 'action';
  group: string;
  indent: boolean;
  min?: number;
  max?: number;
  step?: number;
  parentKey?: string;
  action?: 'custom' | 'continue' | 'skip' | 'back';
}

function buildNavItems(config: CustomAdditionsConfig): NavItem[] {
  const items: NavItem[] = [];
  for (const group of GROUPS) {
    for (const feat of group.features) {
      items.push({
        key: feat.key as string,
        label: feat.label,
        desc: feat.desc,
        type: feat.type as 'boolean' | 'number',
        group: group.label,
        indent: false,
        min: feat.min,
        max: feat.max,
        step: feat.step,
      });
      if (feat.children && config[feat.key]) {
        for (const child of feat.children) {
          items.push({
            key: child.key as string,
            label: child.label,
            desc: child.desc,
            type: child.type as 'boolean' | 'number',
            group: group.label,
            indent: true,
            parentKey: feat.key as string,
            min: child.min,
            max: child.max,
            step: child.step,
          });
        }
      }
    }
  }
  items.push({ key: '__custom__', label: '+ Dodatkowe Limity Przedmiotow...', desc: '', type: 'action', group: '', indent: false, action: 'custom' });
  items.push({ key: '__sep__', label: '', desc: '', type: 'action', group: '', indent: false, action: undefined });
  items.push({ key: '__continue__', label: 'Potwierdz i kontynuuj', desc: '', type: 'action', group: '', indent: false, action: 'continue' });
  items.push({ key: '__skip__', label: 'Pomin dodatki', desc: '', type: 'action', group: '', indent: false, action: 'skip' });
  items.push({ key: '__back__', label: 'Wroc', desc: '', type: 'action', group: '', indent: false, action: 'back' });
  return items;
}

export function AdditionsSelect({ onNext, onBack, onSkip, onTabClick }: AdditionsSelectProps) {
  const [config, setConfig] = useState<CustomAdditionsConfig>(defaultConfig);
  const [cursor, setCursor] = useState(0);
  const [view, setView] = useState<'main' | 'customItems'>('main');
  const [customItemCursor, setCustomItemCursor] = useState(0);
  const [newItemMaterial, setNewItemMaterial] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('16');
  const [inputMode, setInputMode] = useState<'none' | 'material' | 'amount'>('none');

  const navItems = useMemo(() => buildNavItems(config), [config]);
  const effectiveCursor = Math.min(cursor, navItems.length - 1);

  useEffect(() => {
    const maxIdx = buildNavItems(config).length - 1;
    setCursor(c => Math.min(c, maxIdx));
  }, [config]);

  const updateNumber = (key: string, delta: number) => {
    const item = navItems.find(n => n.key === key);
    if (!item || item.type !== 'number') return;
    const step = item.step || 1;
    const currentVal = (config[key as keyof CustomAdditionsConfig] as number) || 0;
    const newVal = Math.max(item.min || 0, Math.min(item.max || 999999, currentVal + delta * step));
    setConfig(c => ({ ...c, [key]: newVal }));
  };

  const addCustomItem = () => {
    const material = newItemMaterial.toUpperCase().trim();
    const amount = parseInt(newItemAmount);
    if (material && !isNaN(amount) && amount > 0) {
      setConfig(c => ({
        ...c,
        customItemLimits: [...c.customItemLimits, { material, maxAmount: Math.min(64, amount) }]
      }));
      setNewItemMaterial('');
      setNewItemAmount('16');
      setInputMode('none');
    }
  };

  const removeCustomItem = (index: number) => {
    setConfig(c => ({
      ...c,
      customItemLimits: c.customItemLimits.filter((_, i) => i !== index)
    }));
  };

  useInput((input, key) => {
    if (view === 'customItems') {
      if (inputMode === 'material') {
        if (key.return) { setInputMode('amount'); }
        else if (key.backspace) { setNewItemMaterial(m => m.slice(0, -1)); }
        else if (input) { setNewItemMaterial(m => m + input); }
        return;
      } else if (inputMode === 'amount') {
        if (key.return) { addCustomItem(); }
        else if (key.backspace) { setNewItemAmount(a => a.slice(0, -1)); }
        else if (/[0-9]/.test(input)) { setNewItemAmount(a => a + input); }
        return;
      }

      if (key.upArrow) {
        setCustomItemCursor(c => Math.max(0, c - 1));
      } else if (key.downArrow) {
        const maxCursor = config.customItemLimits.length + COMMON_ITEMS.length + 2;
        setCustomItemCursor(c => Math.min(maxCursor, c + 1));
      } else if (key.return) {
        const itemCount = config.customItemLimits.length;
        const commonCount = COMMON_ITEMS.length;
        if (customItemCursor < itemCount) {
          removeCustomItem(customItemCursor);
        } else if (customItemCursor < itemCount + commonCount) {
          const material = COMMON_ITEMS[customItemCursor - itemCount];
          if (!config.customItemLimits.some(i => i.material === material)) {
            setConfig(c => ({ ...c, customItemLimits: [...c.customItemLimits, { material, maxAmount: 16 }] }));
          }
        } else if (customItemCursor === itemCount + commonCount) {
          setInputMode('material');
        } else {
          setView('main');
          setCustomItemCursor(0);
        }
      } else if (key.escape || key.backspace) {
        setView('main');
        setCustomItemCursor(0);
        setInputMode('none');
      }
      return;
    }

    const item = navItems[effectiveCursor];
    if (!item) return;

    if (key.upArrow) {
      let newCursor = effectiveCursor - 1;
      while (newCursor >= 0 && navItems[newCursor]?.key === '__sep__') newCursor--;
      setCursor(Math.max(0, newCursor));
    } else if (key.downArrow) {
      let newCursor = effectiveCursor + 1;
      while (newCursor < navItems.length && navItems[newCursor]?.key === '__sep__') newCursor++;
      setCursor(Math.min(navItems.length - 1, newCursor));
    } else if (item.type === 'boolean') {
      if (key.leftArrow) setConfig(c => ({ ...c, [item.key]: false }));
      else if (key.rightArrow) setConfig(c => ({ ...c, [item.key]: true }));
      else if (key.return) setConfig(c => ({ ...c, [item.key]: !c[item.key as keyof CustomAdditionsConfig] }));
    } else if (item.type === 'number') {
      if (key.leftArrow) updateNumber(item.key, -1);
      else if (key.rightArrow) updateNumber(item.key, 1);
    } else if (item.type === 'action') {
      if (key.return) {
        if (item.action === 'custom') { setView('customItems'); setCustomItemCursor(0); }
        else if (item.action === 'continue') onNext({ ...config, enabled: true });
        else if (item.action === 'skip') onSkip();
        else if (item.action === 'back') onBack();
      }
    }

    if (key.escape || (key.backspace && item.type !== 'number' && item.type !== 'boolean')) {
      onBack();
    }
  });

  if (view === 'customItems') {
    return (
      <Layout title="dodatkowe limity" step={7} totalSteps={12} tab="funkcje" onTabClick={onTabClick}>
        <Box flexDirection="column" marginTop={1}>
          <Text color="white" bold>Dodatkowe Limity Przedmiotow:</Text>
          <Text color="gray">ENTER usun/dodaj | ESC wroc</Text>
          <Box marginTop={1} />

          {config.customItemLimits.length > 0 && (
            <>
              <Text color="cyan" bold>Aktywne Limity:</Text>
              {config.customItemLimits.map((item, i) => (
                <Box key={i}>
                  <Text color={customItemCursor === i ? 'green' : 'gray'}>
                    {customItemCursor === i ? '▶ ' : '  '}{item.material}: {item.maxAmount}
                  </Text>
                </Box>
              ))}
              <Box marginTop={1} />
            </>
          )}

          <Text color="yellow" bold>Szybkie Dodawanie:</Text>
          {COMMON_ITEMS.map((material, i) => {
            const isAdded = config.customItemLimits.some(item => item.material === material);
            const index = config.customItemLimits.length + i;
            return (
              <Box key={material}>
                <Text color={customItemCursor === index ? 'yellow' : 'gray'}>
                  {customItemCursor === index ? '▶ ' : '  '}{isAdded ? '✓ ' : '+ '}{material}
                </Text>
              </Box>
            );
          })}

          <Box marginTop={1} />
          {inputMode === 'none' ? (
            <Box>
              <Text color={customItemCursor === config.customItemLimits.length + COMMON_ITEMS.length ? 'green' : 'gray'}>
                {customItemCursor === config.customItemLimits.length + COMMON_ITEMS.length ? '▶ ' : '  '}+ Wlasny Przedmiot...
              </Text>
            </Box>
          ) : (
            <Box flexDirection="column">
              <Text color="cyan">Wlasny Przedmiot:</Text>
              <Box>
                <Text color="gray">Material: </Text>
                <Text color={inputMode === 'material' ? 'yellow' : 'white'}>
                  {newItemMaterial || '_'}
                </Text>
              </Box>
              <Box>
                <Text color="gray">Ilosc: </Text>
                <Text color={inputMode === 'amount' ? 'yellow' : 'white'}>
                  {newItemAmount}
                </Text>
              </Box>
            </Box>
          )}

          <Box marginTop={1} />
          <Box>
            <Text color={customItemCursor === config.customItemLimits.length + COMMON_ITEMS.length + 1 ? 'cyan' : 'gray'}>
              {customItemCursor === config.customItemLimits.length + COMMON_ITEMS.length + 1 ? '▶ ' : '  '}← Wroc
            </Text>
          </Box>
        </Box>
      </Layout>
    );
  }

  let lastGroup = '';
  const rows: { element: React.ReactNode; navIndex: number }[] = [];
  let navIdx = 0;

  for (let i = 0; i < navItems.length; i++) {
    const item = navItems[i];
    const isHighlighted = i === effectiveCursor;

    if (item.key === '__sep__') {
      rows.push({ element: <Text color="gray">{'─'.repeat(40)}</Text>, navIndex: -1 });
      continue;
    }

    if (item.group && item.group !== lastGroup) {
      rows.push({ element: <Text color="white" bold>{'── '}{item.group}{' ──'}</Text>, navIndex: -1 });
      lastGroup = item.group;
    }

    if (item.type === 'boolean') {
      const val = config[item.key as keyof CustomAdditionsConfig] as boolean;
      rows.push({
        element: (
          <Box key={item.key}>
            <Text color={isHighlighted ? 'cyan' : 'gray'}>
              {isHighlighted ? '▶ ' : '  '}{item.indent ? '  ' : ''}
            </Text>
            <Text color={val ? 'green' : 'dim'}>
              {val ? '●' : '○'}
            </Text>
            <Text color={isHighlighted ? 'white' : 'gray'}> {item.label}</Text>
            {isHighlighted && <Text color="dim"> ←→</Text>}
          </Box>
        ),
        navIndex: navIdx++,
      });
    } else if (item.type === 'number') {
      const val = config[item.key as keyof CustomAdditionsConfig] as number;
      rows.push({
        element: (
          <Box key={item.key}>
            <Text color={isHighlighted ? 'yellow' : 'gray'}>
              {isHighlighted ? '▶ ' : '  '}  └─
            </Text>
            <Text color={isHighlighted ? 'white' : 'gray'}> {item.label}: </Text>
            <Text color={isHighlighted ? 'cyan' : 'white'}>{val}</Text>
            {isHighlighted && <Text color="green"> ←→</Text>}
          </Box>
        ),
        navIndex: navIdx++,
      });
    } else if (item.type === 'action') {
      const color = item.action === 'continue' ? 'green' : item.action === 'skip' ? 'yellow' : item.action === 'back' ? 'cyan' : 'magenta';
      rows.push({
        element: (
          <Box key={item.key}>
            <Text color={isHighlighted ? color : 'gray'}>
              {isHighlighted ? '▶ ' : '  '}{item.label}
            </Text>
          </Box>
        ),
        navIndex: navIdx++,
      });
    }
  }

  const highlightedItem = navItems[effectiveCursor];

  return (
    <Layout title="dodatki" step={7} totalSteps={12} tab="funkcje" onTabClick={onTabClick}>
      <Box flexDirection="column" marginTop={0}>
        <Text color="white" bold>Skonfiguruj dodatki:</Text>
        <Text color="dim">↑↓ nawigacja | ←→ lub Enter przełącz | Esc wroc</Text>
        <Box marginTop={1} />
        {rows.map((r, i) => <React.Fragment key={i}>{r.element}</React.Fragment>)}
        <Box marginTop={1} />
        {highlightedItem && highlightedItem.desc && (
          <Text color="dim" italic>  {highlightedItem.desc}</Text>
        )}
      </Box>
    </Layout>
  );
}