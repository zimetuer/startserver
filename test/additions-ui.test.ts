import { describe, it, expect } from 'vitest';
import type { CustomAdditionsConfig } from '../src/types.js';

const GROUPS: { label: string; features: { key: keyof CustomAdditionsConfig; type: string; children?: { key: keyof CustomAdditionsConfig; type: string }[] }[] }[] = [
  {
    label: 'Walka',
    features: [
      { key: 'fullInvisibility', type: 'boolean' },
      { key: 'itemLimits', type: 'boolean', children: [
        { key: 'maxGapples', type: 'number' },
        { key: 'maxEnderPearls', type: 'number' },
        { key: 'maxTotems', type: 'number' },
      ]},
      { key: 'lifestealEnabled', type: 'boolean' },
      { key: 'combatLogPrevention', type: 'boolean', children: [
        { key: 'combatLogDuration', type: 'number' },
      ]},
    ]
  },
  {
    label: 'Czat & Interfejs',
    features: [
      { key: 'scoreboardEnabled', type: 'boolean' },
      { key: 'tabEnabled', type: 'boolean' },
      { key: 'chatAntiSpamEnabled', type: 'boolean', children: [
        { key: 'chatAntiSpamCooldown', type: 'number' },
      ]},
    ]
  },
  {
    label: 'Swiat',
    features: [
      { key: 'spawnProtection', type: 'boolean', children: [
        { key: 'spawnProtectionRadius', type: 'number' },
      ]},
      { key: 'rtpEnabled', type: 'boolean', children: [
        { key: 'rtpMaxDistance', type: 'number' },
      ]},
      { key: 'homesEnabled', type: 'boolean', children: [
        { key: 'maxHomes', type: 'number' },
      ]},
      { key: 'worldBorderEnabled', type: 'boolean', children: [
        { key: 'worldBorderSize', type: 'number' },
      ]},
    ]
  },
  {
    label: 'Ekonomia',
    features: [
      { key: 'economyEnabled', type: 'boolean', children: [
        { key: 'economyStartingBalance', type: 'number' },
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
  tabTitle: '',
  tabHeader: '',
  tabFooter: '',
  tabUpdateInterval: 40,
  spawnProtection: true,
  spawnProtectionRadius: 50,
  rtpEnabled: false,
  rtpMaxDistance: 10000,
  homesEnabled: true,
  maxHomes: 1,
  combatLogPrevention: false,
  combatLogDuration: 30,
  economyEnabled: false,
  economyStartingBalance: 100,
  chatAntiSpamEnabled: true,
  chatAntiSpamCooldown: 2,
  worldBorderEnabled: false,
  worldBorderSize: 10000,
};

interface NavItem {
  key: string;
  type: 'boolean' | 'number' | 'action';
  group: string;
  indent: boolean;
  parentKey?: string;
  action?: string;
}

function buildNavItems(config: Record<string, unknown>): NavItem[] {
  const items: NavItem[] = [];
  for (const group of GROUPS) {
    for (const feat of group.features) {
      items.push({
        key: feat.key as string,
        type: feat.type as 'boolean' | 'number',
        group: group.label,
        indent: false,
      });
      if (feat.children && config[feat.key as string]) {
        for (const child of feat.children) {
          items.push({
            key: child.key as string,
            type: child.type as 'boolean' | 'number',
            group: group.label,
            indent: true,
            parentKey: feat.key as string,
          });
        }
      }
    }
  }
  items.push({ key: '__custom__', type: 'action', group: '', indent: false, action: 'custom' });
  items.push({ key: '__continue__', type: 'action', group: '', indent: false, action: 'continue' });
  items.push({ key: '__skip__', type: 'action', group: '', indent: false, action: 'skip' });
  items.push({ key: '__back__', type: 'action', group: '', indent: false, action: 'back' });
  return items;
}

describe('AdditionsSelect nav items', () => {
  it('shows all top-level features regardless of config', () => {
    const allOff = { ...defaultConfig, itemLimits: false, spawnProtection: false, rtpEnabled: false, homesEnabled: false, combatLogPrevention: false, economyEnabled: false, chatAntiSpamEnabled: false, worldBorderEnabled: false };
    const items = buildNavItems(allOff);
    const topLevelKeys = items.filter(i => !i.indent).map(i => i.key);
    expect(topLevelKeys).toContain('fullInvisibility');
    expect(topLevelKeys).toContain('itemLimits');
    expect(topLevelKeys).toContain('lifestealEnabled');
    expect(topLevelKeys).toContain('scoreboardEnabled');
    expect(topLevelKeys).toContain('tabEnabled');
    expect(topLevelKeys).toContain('spawnProtection');
    expect(topLevelKeys).toContain('homesEnabled');
    expect(topLevelKeys).toContain('economyEnabled');
  });

  it('hides children when parent is OFF', () => {
    const allOff = { ...defaultConfig, itemLimits: false, spawnProtection: false, rtpEnabled: false, homesEnabled: false, combatLogPrevention: false, economyEnabled: false, chatAntiSpamEnabled: false, worldBorderEnabled: false };
    const items = buildNavItems(allOff);
    const childKeys = items.filter(i => i.indent).map(i => i.key);
    expect(childKeys).toHaveLength(0);
  });

  it('shows children when parent is ON', () => {
    const items = buildNavItems(defaultConfig);
    const itemLimitsChildren = items.filter(i => i.parentKey === 'itemLimits');
    expect(itemLimitsChildren).toHaveLength(3);
    expect(itemLimitsChildren.map(c => c.key)).toEqual(['maxGapples', 'maxEnderPearls', 'maxTotems']);
  });

  it('shows specific children based on parent state', () => {
    const config1 = { ...defaultConfig, spawnProtection: true, rtpEnabled: false };
    const items1 = buildNavItems(config1);
    expect(items1.some(i => i.key === 'spawnProtectionRadius')).toBe(true);
    expect(items1.some(i => i.key === 'rtpMaxDistance')).toBe(false);

    const config2 = { ...defaultConfig, spawnProtection: false, rtpEnabled: true };
    const items2 = buildNavItems(config2);
    expect(items2.some(i => i.key === 'spawnProtectionRadius')).toBe(false);
    expect(items2.some(i => i.key === 'rtpMaxDistance')).toBe(true);
  });

  it('always shows action items at the bottom', () => {
    const items = buildNavItems(defaultConfig);
    const last4 = items.slice(-4);
    expect(last4.map(i => i.key)).toEqual(['__custom__', '__continue__', '__skip__', '__back__']);
    expect(last4.every(i => i.type === 'action')).toBe(true);
  });

  it('has more items when more parents are ON', () => {
    const allOff = { ...defaultConfig, itemLimits: false, spawnProtection: false, rtpEnabled: false, homesEnabled: false, combatLogPrevention: false, economyEnabled: false, chatAntiSpamEnabled: false, worldBorderEnabled: false };
    const itemsAllOff = buildNavItems(allOff);
    const itemsDefault = buildNavItems(defaultConfig);
    expect(itemsDefault.length).toBeGreaterThan(itemsAllOff.length);
  });

  it('child items are always indented', () => {
    const items = buildNavItems(defaultConfig);
    const children = items.filter(i => i.indent);
    for (const child of children) {
      expect(child.parentKey).toBeDefined();
      expect(child.type).toBe('number');
    }
  });

  it('children immediately follow their parent', () => {
    const items = buildNavItems(defaultConfig);
    const parentIndex = items.findIndex(i => i.key === 'itemLimits');
    expect(parentIndex).toBeGreaterThanOrEqual(0);
    expect(items[parentIndex + 1].key).toBe('maxGapples');
    expect(items[parentIndex + 2].key).toBe('maxEnderPearls');
    expect(items[parentIndex + 3].key).toBe('maxTotems');
  });

  it('toggling parent OFF removes its children from nav', () => {
    const enabled = buildNavItems({ ...defaultConfig, itemLimits: true });
    const disabled = buildNavItems({ ...defaultConfig, itemLimits: false });
    const enabledChildKeys = enabled.filter(i => i.parentKey === 'itemLimits').map(i => i.key);
    const disabledChildKeys = disabled.filter(i => i.parentKey === 'itemLimits').map(i => i.key);
    expect(enabledChildKeys).toHaveLength(3);
    expect(disabledChildKeys).toHaveLength(0);
  });

  it('groups are present in nav items', () => {
    const items = buildNavItems(defaultConfig);
    const groups = [...new Set(items.filter(i => i.group).map(i => i.group))];
    expect(groups).toContain('Walka');
    expect(groups).toContain('Czat & Interfejs');
    expect(groups).toContain('Swiat');
    expect(groups).toContain('Ekonomia');
  });
});

describe('AdditionsSelect default config', () => {
  it('has itemLimits enabled by default', () => {
    expect(defaultConfig.itemLimits).toBe(true);
  });

  it('has spawnProtection enabled by default', () => {
    expect(defaultConfig.spawnProtection).toBe(true);
  });

  it('has homesEnabled enabled by default', () => {
    expect(defaultConfig.homesEnabled).toBe(true);
  });

  it('has rtpEnabled disabled by default', () => {
    expect(defaultConfig.rtpEnabled).toBe(false);
  });

  it('has economyEnabled disabled by default', () => {
    expect(defaultConfig.economyEnabled).toBe(false);
  });

  it('has worldBorderEnabled disabled by default', () => {
    expect(defaultConfig.worldBorderEnabled).toBe(false);
  });
});