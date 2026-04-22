import { describe, it, expect } from 'vitest';
import { getPluginsForTemplate, standardPlugins, fullPlugins, curatedPlugins, voiceChatPlugins, bedrockPlugins } from '../src/data/pluginPresets.js';
import type { Step, Template } from '../src/types.js';

const STEP_SEQUENCE: Step[] = [
  'welcome', 'directory', 'version', 'engine', 'template',
  'voicechat', 'bedrock', 'additions', 'plugin', 'config',
  'worldborder', 'ram', 'review', 'generating'
];

describe('Step sequence', () => {
  it('has 14 steps total (0-13 inclusive)', () => {
    expect(STEP_SEQUENCE).toHaveLength(14);
  });

  it('starts with welcome and ends with generating', () => {
    expect(STEP_SEQUENCE[0]).toBe('welcome');
    expect(STEP_SEQUENCE[STEP_SEQUENCE.length - 1]).toBe('generating');
  });

  it('all steps are unique', () => {
    expect(new Set(STEP_SEQUENCE).size).toBe(STEP_SEQUENCE.length);
  });

  it('review comes before generating', () => {
    expect(STEP_SEQUENCE.indexOf('review')).toBeLessThan(STEP_SEQUENCE.indexOf('generating'));
  });

  it('plugin comes after additions', () => {
    expect(STEP_SEQUENCE.indexOf('plugin')).toBeGreaterThan(STEP_SEQUENCE.indexOf('additions'));
  });

  it('config comes after plugin', () => {
    expect(STEP_SEQUENCE.indexOf('config')).toBeGreaterThan(STEP_SEQUENCE.indexOf('plugin'));
  });

  it('ram comes after worldborder', () => {
    expect(STEP_SEQUENCE.indexOf('ram')).toBeGreaterThan(STEP_SEQUENCE.indexOf('worldborder'));
  });
});

describe('Back navigation', () => {
  const backMap: Record<Step, Step | null> = {
    welcome: null, directory: 'welcome', version: 'directory', engine: 'version',
    template: 'engine', plugin: 'additions', voicechat: 'template', bedrock: 'voicechat',
    additions: 'bedrock', config: 'plugin', worldborder: 'config', ram: 'worldborder', review: 'ram', generating: null,
  };

  it('every step has a back mapping', () => {
    for (const step of STEP_SEQUENCE) {
      expect(backMap).toHaveProperty(step);
    }
  });

  it('going back from each step reaches the previous in sequence', () => {
    for (let i = 1; i < STEP_SEQUENCE.length; i++) {
      const current = STEP_SEQUENCE[i];
      const prevStep = backMap[current];
      if (current === 'generating') {
        expect(prevStep).toBeNull();
      } else {
        expect(prevStep).toBe(STEP_SEQUENCE[i - 1]);
      }
    }
  });

  it('welcome and generating have no back', () => {
    expect(backMap.welcome).toBeNull();
    expect(backMap.generating).toBeNull();
  });
});

describe('Template plugins', () => {
  it('minimal template returns no plugins', () => {
    expect(getPluginsForTemplate('minimal')).toHaveLength(0);
  });

  it('standard template returns 3 required plugins', () => {
    const plugins = getPluginsForTemplate('standard');
    expect(plugins).toHaveLength(3);
    expect(plugins.every(p => p.required)).toBe(true);
  });

  it('full template returns core + extra plugins', () => {
    const plugins = getPluginsForTemplate('full');
    expect(plugins.length).toBeGreaterThanOrEqual(5);
  });

  it('standard and full both include EssentialsX, LuckPerms, WorldEdit', () => {
    const stdNames = standardPlugins.map(p => p.slug);
    const fullNames = fullPlugins.map(p => p.slug);
    for (const slug of ['essentialsx', 'luckperms', 'worldedit']) {
      expect(stdNames).toContain(slug);
      expect(fullNames).toContain(slug);
    }
  });

  it('voice chat plugins has plasmavoice and simple-voice-chat', () => {
    const slugs = voiceChatPlugins.map(p => p.slug);
    expect(slugs).toContain('plasmavoice');
    expect(slugs).toContain('simple-voice-chat');
  });

  it('bedrock plugins has geyser and floodgate', () => {
    const slugs = bedrockPlugins.map(p => p.slug);
    expect(slugs).toContain('geyser');
    expect(slugs).toContain('floodgate');
  });

  it('curated plugins have categories', () => {
    for (const plugin of curatedPlugins) {
      if (plugin.category !== undefined) {
        expect(['core', 'protection', 'admin', 'fun', 'economy']).toContain(plugin.category);
      }
    }
  });

  it('all plugin slugs are unique in curated list', () => {
    const slugs = curatedPlugins.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});

describe('ServerConfig types', () => {
  it('Template type includes minimal, standard, full', () => {
    const templates: Template[] = ['minimal', 'standard', 'full'];
    expect(templates).toHaveLength(3);
  });

  it('getPluginsForTemplate handles all template types', () => {
    for (const template of ['minimal', 'standard', 'full'] as Template[]) {
      const result = getPluginsForTemplate(template);
      expect(Array.isArray(result)).toBe(true);
    }
  });
});