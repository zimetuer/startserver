import { describe, it, expect } from 'vitest';
import { pickPluginFile } from '../src/api/modrinth.js';

describe('pickPluginFile', () => {
  const makeFile = (filename: string, primary = false) => ({
    url: `https://cdn.modrinth.com/${filename}`,
    filename,
    primary,
    size: 1000,
    hashes: {},
  });

  it('returns undefined for empty array', () => {
    expect(pickPluginFile([])).toBeUndefined();
  });

  it('returns the only file when one exists', () => {
    const files = [makeFile('LuckPerms-Bukkit-5.4.jar')];
    const result = pickPluginFile(files);
    expect(result?.filename).toBe('LuckPerms-Bukkit-5.4.jar');
  });

  it('prefers bukkit-tagged filename over primary', () => {
    const files = [
      makeFile('LuckPerms-NeoForge-5.4.jar', true),
      makeFile('LuckPerms-Bukkit-5.4.jar', false),
    ];
    const result = pickPluginFile(files);
    expect(result?.filename).toBe('LuckPerms-Bukkit-5.4.jar');
  });

  it('prefers spigot-tagged filename', () => {
    const files = [
      makeFile('Geyser-Standalone.jar', true),
      makeFile('Geyser-Spigot.jar', false),
    ];
    const result = pickPluginFile(files);
    expect(result?.filename).toBe('Geyser-Spigot.jar');
  });

  it('prefers paper-tagged filename', () => {
    const files = [
      makeFile('SomeMod-Fabric-1.0.jar', true),
      makeFile('SomeMod-Paper-1.0.jar', false),
    ];
    const result = pickPluginFile(files);
    expect(result?.filename).toBe('SomeMod-Paper-1.0.jar');
  });

  it('falls back to primary when no bukkit tags match', () => {
    const files = [
      makeFile('SomeMod-Fabric-1.0.jar', true),
      makeFile('SomeMod-Forge-1.0.jar', false),
    ];
    const result = pickPluginFile(files);
    expect(result?.filename).toBe('SomeMod-Fabric-1.0.jar');
  });

  it('rejects -sources and -javadoc files even with bukkit tag', () => {
    const files = [
      makeFile('Plugin-bukkit-sources.jar'),
      makeFile('Plugin-Bukkit-1.0.jar'),
    ];
    const result = pickPluginFile(files);
    expect(result?.filename).toBe('Plugin-Bukkit-1.0.jar');
  });
});