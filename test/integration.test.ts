import { describe, it, expect, afterAll } from 'vitest';
import { copyCustomPlugins, generateServer } from '../src/generator/downloader.js';
import { existsSync, readFileSync, rmSync, readdirSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ServerConfig } from '../src/types.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PLUGIN_DIR = join(__dirname, '..', 'plugin');
const PLUGIN_TARGET_DIR = join(PLUGIN_DIR, 'target');
const TEST_DIR = join(__dirname, 'test-server-output');

describe('copyCustomPlugins', () => {
  afterAll(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('copies plugin JARs from source directory to plugins folder', async () => {
    rmSync(TEST_DIR, { recursive: true, force: true });

    const result = await copyCustomPlugins(TEST_DIR, [PLUGIN_DIR, PLUGIN_TARGET_DIR]);

    expect(result).toBeGreaterThan(0);

    const pluginsDir = join(TEST_DIR, 'plugins');
    expect(existsSync(pluginsDir)).toBe(true);

    const pluginFiles = readdirSync(pluginsDir).filter(f => f.endsWith('.jar'));
    expect(pluginFiles.length).toBeGreaterThan(0);

    const hasServerAdditions = pluginFiles.some(f => f.includes('server-additions'));
    expect(hasServerAdditions).toBe(true);
  });

  it('skips already-existing JARs', async () => {
    rmSync(TEST_DIR, { recursive: true, force: true });

    const count1 = await copyCustomPlugins(TEST_DIR, [PLUGIN_DIR, PLUGIN_TARGET_DIR]);
    expect(count1).toBeGreaterThan(0);

    const count2 = await copyCustomPlugins(TEST_DIR, [PLUGIN_DIR, PLUGIN_TARGET_DIR]);
    expect(count2).toBe(0);
  });

  it('does not copy original- prefixed JARs', async () => {
    const fakeDir = join(TEST_DIR, 'fake-plugin');
    const fakeTarget = join(TEST_DIR, 'fake-target');
    rmSync(TEST_DIR, { recursive: true, force: true });

    mkdirSync(fakeDir, { recursive: true });
    mkdirSync(fakeTarget, { recursive: true });

    writeFileSync(join(fakeDir, 'my-plugin.jar'), 'fake');
    writeFileSync(join(fakeTarget, 'original-shaded.jar'), 'fake');
    writeFileSync(join(fakeTarget, 'real-plugin.jar'), 'fake');

    const result = await copyCustomPlugins(TEST_DIR, [fakeDir, fakeTarget]);
    expect(result).toBe(2);

    const pluginsDir = join(TEST_DIR, 'plugins');
    const files = readdirSync(pluginsDir);
    expect(files).toContain('my-plugin.jar');
    expect(files).toContain('real-plugin.jar');
    expect(files).not.toContain('original-shaded.jar');
  });
});