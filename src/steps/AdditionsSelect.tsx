import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';
import type { CustomAdditionsConfig, CustomItemLimit } from '../types.js';

interface AdditionsSelectProps {
  onNext: (config: CustomAdditionsConfig) => void;
  onBack: () => void;
  onSkip: () => void;
}

interface FeatureOption {
  key: keyof CustomAdditionsConfig;
  label: string;
  desc: string;
  type: 'boolean' | 'number' | 'items';
  min?: number;
  max?: number;
  step?: number;
}

const FEATURES: FeatureOption[] = [
  { key: 'fullInvisibility', label: 'Pełna Niewidzialność', desc: 'Ukryj cząsteczki i nametagi', type: 'boolean' },
  { key: 'itemLimits', label: 'Limity Przedmiotów', desc: 'Ogranicz gapple/perły/totemy', type: 'boolean' },
  { key: 'maxGapples', label: '  └ Max Gapple', desc: 'Limit zaczarowanych jabłek', type: 'number', min: 1, max: 64, step: 1 },
  { key: 'maxEnderPearls', label: '  └ Max Perły', desc: 'Limit pereł kresu', type: 'number', min: 1, max: 64, step: 1 },
  { key: 'maxTotems', label: '  └ Max Totemy', desc: 'Limit totemów nieśmiertelności', type: 'number', min: 1, max: 64, step: 1 },
  { key: 'lifestealEnabled', label: 'System Lifesteal', desc: 'Serca za zabójstwo, ostatni krzyk', type: 'boolean' },
  { key: 'scoreboardEnabled', label: 'Tablica Wyników', desc: 'Pokaż statystyki na pasku bocznym', type: 'boolean' },
  { key: 'tabEnabled', label: 'Lista Graczy (TAB)', desc: 'Nagłówek/stopka w liście graczy', type: 'boolean' },
  { key: 'spawnProtection', label: 'Ochrona Spawna', desc: 'Chroń spawn przed budowaniem', type: 'boolean' },
  { key: 'spawnProtectionRadius', label: '  └ Promień Ochrony', desc: 'Bloki od spawna', type: 'number', min: 0, max: 500, step: 10 },
  { key: 'rtpEnabled', label: 'Losowy Teleport (/rtp)', desc: 'Teleportuj w losowe miejsce', type: 'boolean' },
  { key: 'rtpMaxDistance', label: '  └ RTP Max Dystans', desc: 'Maksymalny dystans teleportu', type: 'number', min: 1000, max: 50000, step: 1000 },
  { key: 'homesEnabled', label: 'Domy (/home)', desc: 'Ustaw lokalizacje domu', type: 'boolean' },
  { key: 'maxHomes', label: '  └ Max Domów', desc: 'Domów na gracza', type: 'number', min: 1, max: 10, step: 1 },
  { key: 'combatLogPrevention', label: 'Blokada Combat Log', desc: 'Kara za wylogowanie w walce', type: 'boolean' },
  { key: 'combatLogDuration', label: '  └ Czas Walki', desc: 'Sekund w stanie walki', type: 'number', min: 5, max: 120, step: 5 },
  { key: 'economyEnabled', label: 'Ekonomia', desc: 'Komendy /balance, /pay', type: 'boolean' },
  { key: 'economyStartingBalance', label: '  └ Początkowy Balans', desc: 'Startowa gotówka', type: 'number', min: 0, max: 10000, step: 100 },
  { key: 'worldBorderEnabled', label: 'Granica Świata', desc: 'Ogranicz rozmiar świata', type: 'boolean' },
  { key: 'worldBorderSize', label: '  └ Rozmiar Granicy', desc: 'Promień od środka', type: 'number', min: 1000, max: 100000, step: 1000 },
  { key: 'chatAntiSpamEnabled', label: 'Anti-Spam Czatu', desc: 'Blokuj spam wiadomościami', type: 'boolean' },
  { key: 'chatAntiSpamCooldown', label: '  └ Cooldown Czatu', desc: 'Sekund między wiadomościami', type: 'number', min: 0, max: 10, step: 1 },
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

// Predefined materials for quick selection
const COMMON_ITEMS = [
  'DIAMOND', 'NETHERITE_INGOT', 'EMERALD', 'GOLD_INGOT', 'IRON_INGOT',
  'TNT', 'SHULKER_BOX', 'ELYTRA', 'TRIDENT', 'BEACON'
];

export function AdditionsSelect({ onNext, onBack, onSkip }: AdditionsSelectProps) {
  const [config, setConfig] = useState<CustomAdditionsConfig>(defaultConfig);
  const [cursor, setCursor] = useState(0);
  const [view, setView] = useState<'main' | 'customItems'>('main');
  const [customItemCursor, setCustomItemCursor] = useState(0);
  const [newItemMaterial, setNewItemMaterial] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('16');
  const [inputMode, setInputMode] = useState<'none' | 'material' | 'amount'>('none');

  const currentFeature = FEATURES[cursor];
  const value = config[currentFeature?.key as keyof CustomAdditionsConfig];

  const updateNumber = (key: keyof CustomAdditionsConfig, delta: number) => {
    const feature = FEATURES.find(f => f.key === key);
    if (!feature || feature.type !== 'number') return;
    const step = feature.step || 1;
    const currentVal = (config[key] as number) || 0;
    const newValue = Math.max(feature.min || 0, Math.min(feature.max || 999999, currentVal + delta * step));
    setConfig(c => ({ ...c, [key]: newValue }));
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
        if (key.return) {
          setInputMode('amount');
        } else if (key.backspace) {
          setNewItemMaterial(m => m.slice(0, -1));
        } else if (input) {
          setNewItemMaterial(m => m + input);
        }
        return;
      } else if (inputMode === 'amount') {
        if (key.return) {
          addCustomItem();
        } else if (key.backspace) {
          setNewItemAmount(a => a.slice(0, -1));
        } else if (/[0-9]/.test(input)) {
          setNewItemAmount(a => a + input);
        }
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
          // Remove existing item
          removeCustomItem(customItemCursor);
        } else if (customItemCursor < itemCount + commonCount) {
          // Add common item
          const material = COMMON_ITEMS[customItemCursor - itemCount];
          if (!config.customItemLimits.some(i => i.material === material)) {
            setConfig(c => ({
              ...c,
              customItemLimits: [...c.customItemLimits, { material, maxAmount: 16 }]
            }));
          }
        } else if (customItemCursor === itemCount + commonCount) {
          // Start adding custom item
          setInputMode('material');
        } else {
          // Back
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

    // Main view
    if (key.upArrow) {
      setCursor(c => Math.max(0, c - 1));
    } else if (key.downArrow) {
      setCursor(c => Math.min(FEATURES.length + 3, c + 1));
    } else if (key.leftArrow) {
      if (currentFeature?.type === 'number') {
        updateNumber(currentFeature.key, -1);
      } else if (currentFeature?.type === 'boolean') {
        setConfig(c => ({ ...c, [currentFeature.key]: false }));
      }
    } else if (key.rightArrow) {
      if (currentFeature?.type === 'number') {
        updateNumber(currentFeature.key, 1);
      } else if (currentFeature?.type === 'boolean') {
        setConfig(c => ({ ...c, [currentFeature.key]: true }));
      }
    } else if (key.return) {
      if (cursor < FEATURES.length) {
        if (currentFeature.key === 'maxTotems') {
          // Open custom items after totems
          setView('customItems');
        }
      } else if (cursor === FEATURES.length) {
        // Custom items button
        setView('customItems');
      } else if (cursor === FEATURES.length + 1) {
        onNext({ ...config, enabled: true });
      } else if (cursor === FEATURES.length + 2) {
        onSkip();
      } else {
        onBack();
      }
    } else if (key.escape || key.backspace) {
      onBack();
    }
  });

  if (view === 'customItems') {
    return (
      <Layout title="dodatkowe limity" step={7} totalSteps={9}>
        <Box flexDirection="column" marginTop={1}>
          <Text color="white" bold>Dodatkowe Limity Przedmiotów:</Text>
          <Text color="gray">ENTER aby usunąć/dodać</Text>
          <Box marginTop={1} />
          
          {config.customItemLimits.length > 0 && (
            <>
              <Text color="cyan" bold>Aktywne Limity:</Text>
              {config.customItemLimits.map((item, i) => (
                <Box key={i}>
                  <Text color={customItemCursor === i ? 'green' : 'gray'}>
                    {customItemCursor === i ? '▶ ' : '  '}
                    {item.material}: {item.maxAmount}
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
                  {customItemCursor === index ? '▶ ' : '  '}
                  {isAdded ? '✓ ' : '+ '}{material}
                </Text>
              </Box>
            );
          })}

          <Box marginTop={1} />
          
          {inputMode === 'none' ? (
            <Box>
              <Text color={customItemCursor === config.customItemLimits.length + COMMON_ITEMS.length ? 'green' : 'gray'}>
                {customItemCursor === config.customItemLimits.length + COMMON_ITEMS.length ? '▶ ' : '  '}+ Własny Przedmiot...
              </Text>
            </Box>
          ) : (
            <Box flexDirection="column">
              <Text color="cyan">Własny Przedmiot:</Text>
              <Box>
                <Text color="gray">Materiał: </Text>
                <Text color={inputMode === 'material' ? 'yellow' : 'white'}>
                  {newItemMaterial || '_'}
                </Text>
              </Box>
              <Box>
                <Text color="gray">Ilość: </Text>
                <Text color={inputMode === 'amount' ? 'yellow' : 'white'}>
                  {newItemAmount}
                </Text>
              </Box>
            </Box>
          )}

          <Box marginTop={1} />
          <Box>
            <Text color={customItemCursor === config.customItemLimits.length + COMMON_ITEMS.length + 1 ? 'cyan' : 'gray'}>
              {customItemCursor === config.customItemLimits.length + COMMON_ITEMS.length + 1 ? '▶ ' : '  '}← Wróć
            </Text>
          </Box>
        </Box>
      </Layout>
    );
  }

  const renderFeature = (feature: FeatureOption, index: number) => {
    const isSelected = cursor === index;
    const val = config[feature.key];

    if (feature.type === 'boolean') {
      return (
        <Box key={feature.key}>
          <Text color={isSelected ? 'cyan' : 'gray'}>
            {isSelected ? '▶ ' : '  '}
          </Text>
          <Text color={val ? (isSelected ? 'green' : 'gray') : 'gray'}>
            {val ? '[WŁ.]' : ' WŁ. '}
          </Text>
          <Text color="gray"> / </Text>
          <Text color={!val ? (isSelected ? 'red' : 'gray') : 'gray'}>
            {!val ? '[WYŁ.]' : ' WYŁ. '}
          </Text>
          <Text color={isSelected ? 'white' : 'gray'}> {feature.label}</Text>
          <Text color="gray"> - {feature.desc}</Text>
        </Box>
      );
    } else {
      const isIndented = feature.label.startsWith('  └');
      return (
        <Box key={feature.key}>
          <Text color={isSelected ? 'yellow' : 'gray'}>
            {isSelected ? '▶ ' : '  '}{isIndented ? '    ' : ''}{feature.label}: 
          </Text>
          <Text color={isSelected ? 'white' : 'gray'}> {val}</Text>
          <Text color="gray"> ({feature.desc})</Text>
          {isSelected && <Text color="green"> ←→ aby zmienić</Text>}
        </Box>
      );
    }
  };

  return (
    <Layout title="dodatki" step={7} totalSteps={9}>
      <Box flexDirection="column" marginTop={1}>
        <Text color="white" bold>Skonfiguruj dodatki:</Text>
        <Text color="gray">↑↓ nawigacja | ←→ zmień wartość | Enter zatwierdź</Text>
        <Box marginTop={1} />
        
        {FEATURES.map((feature, index) => renderFeature(feature, index))}

        <Box marginTop={1} />
        
        <Box>
          <Text color={cursor === FEATURES.length ? 'green' : 'gray'}>
            {cursor === FEATURES.length ? '▶ ' : '  '}+ Dodatkowe Limity Przedmiotów...
          </Text>
        </Box>
        
        <Box marginTop={1} />
        
        <Box>
          <Text color={cursor === FEATURES.length + 1 ? 'green' : 'gray'}>
            {cursor === FEATURES.length + 1 ? '▶ ' : '  '}✓ Potwierdź i kontynuuj
          </Text>
        </Box>
        <Box>
          <Text color={cursor === FEATURES.length + 2 ? 'yellow' : 'gray'}>
            {cursor === FEATURES.length + 2 ? '▶ ' : '  '}Pomiń dodatki
          </Text>
        </Box>
        <Box>
          <Text color={cursor === FEATURES.length + 3 ? 'cyan' : 'gray'}>
            {cursor === FEATURES.length + 3 ? '▶ ' : '  '}← Wróć
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
