import { describe, it, expect } from 'vitest';
import {
  getVanillaJarUrl,
  getPaperJarUrl,
  getFoliaJarUrl,
  getPurpurJarUrl,
  getFabricJarUrl,
  getForgeJarUrl,
  getNeoForgeJarUrl,
  getSpigotJarUrl,
  getServerJarUrl,
  validateJarUrl,
} from '../src/api/mcutils.js';

const VERSION = '1.20.4';

describe('URL generation', () => {
  it('vanilla generates mcutils URL', async () => {
    const result = await getVanillaJarUrl(VERSION);
    expect(result.url).toContain('mcutils.com');
    expect(result.url).toContain('vanilla');
    expect(result.url).toContain(VERSION);
    expect(result.filename).toBe(`vanilla-${VERSION}.jar`);
  });

  it('paper generates PaperMC API URL with build info', async () => {
    const result = await getPaperJarUrl(VERSION);
    expect(result.url).toContain('api.papermc.io');
    expect(result.url).toContain(VERSION);
    expect(result.filename).toContain('paper');
    expect(result.filename).toMatch(/\.jar$/);
  });

  it('folia generates PaperMC API URL with build info', async () => {
    const result = await getFoliaJarUrl(VERSION);
    expect(result.url).toContain('api.papermc.io');
    expect(result.url).toContain(VERSION);
    expect(result.url).toContain('folia');
    expect(result.filename).toContain('folia');
    expect(result.filename).toMatch(/\.jar$/);
  });

  it('purpur generates PurpurMC API URL with build info', async () => {
    const result = await getPurpurJarUrl(VERSION);
    expect(result.url).toContain('api.purpurmc.org');
    expect(result.url).toContain(VERSION);
    expect(result.filename).toContain('purpur');
    expect(result.filename).toMatch(/\.jar$/);
  });

  it('fabric generates mcutils URL', async () => {
    const result = await getFabricJarUrl(VERSION);
    expect(result.url).toContain('mcutils.com');
    expect(result.url).toContain('fabric');
    expect(result.url).toContain(VERSION);
    expect(result.filename).toBe(`fabric-${VERSION}.jar`);
  });

  it('forge generates mcutils URL', async () => {
    const result = await getForgeJarUrl(VERSION);
    expect(result.url).toContain('mcutils.com');
    expect(result.url).toContain('forge');
    expect(result.url).toContain(VERSION);
    expect(result.filename).toBe(`forge-${VERSION}.jar`);
  });

  it('neoforge generates mcutils URL', async () => {
    const result = await getNeoForgeJarUrl(VERSION);
    expect(result.url).toContain('mcutils.com');
    expect(result.url).toContain('neoforge');
    expect(result.url).toContain(VERSION);
    expect(result.filename).toBe(`neoforge-${VERSION}.jar`);
  });

  it('spigot generates GetBukkit CDN URL (not mcutils)', async () => {
    const result = await getSpigotJarUrl(VERSION);
    expect(result.url).toContain('cdn.getbukkit.org');
    expect(result.url).toContain('spigot');
    expect(result.url).toContain(VERSION);
    expect(result.filename).toBe(`spigot-${VERSION}.jar`);
  });

  it('getServerJarUrl dispatches to correct engine', async () => {
    const engines = ['vanilla', 'paper', 'folia', 'purpur', 'fabric', 'forge', 'neoforge', 'spigot'] as const;
    for (const engine of engines) {
      const result = await getServerJarUrl(engine, VERSION);
      expect(result.url).toBeTruthy();
      expect(result.filename).toMatch(/\.jar$/);
    }
  });

  it('getServerJarUrl throws for unknown engine', async () => {
    await expect(getServerJarUrl('unknown', VERSION)).rejects.toThrow('Nieznany silnik');
  });
});

describe('Folia URL fix', () => {
  it('folia URL does not contain a space', async () => {
    const result = await getFoliaJarUrl(VERSION);
    expect(result.url).not.toContain(' ');
    expect(result.url).not.toContain('f%20olia');
    expect(result.url).toContain('folia');
  });

  it('folia URL does not contain "f olia"', async () => {
    const result = await getFoliaJarUrl(VERSION);
    expect(result.url).not.toMatch(/f\s+olia/);
  });
});

describe('Download URL validation (integration)', () => {
  it('vanilla download URL is accessible', async () => {
    const { url } = await getVanillaJarUrl(VERSION);
    const valid = await validateJarUrl(url);
    expect(valid).toBe(true);
  }, 30000);

  it('paper download URL is accessible', async () => {
    const { url } = await getPaperJarUrl(VERSION);
    const valid = await validateJarUrl(url);
    expect(valid).toBe(true);
  }, 30000);

  it('fabric download URL is accessible', async () => {
    const { url } = await getFabricJarUrl(VERSION);
    const valid = await validateJarUrl(url);
    expect(valid).toBe(true);
  }, 30000);

  it('spigot download URL is accessible', async () => {
    const { url } = await getSpigotJarUrl(VERSION);
    const valid = await validateJarUrl(url);
    expect(valid).toBe(true);
  }, 30000);

  it('folia download URL is accessible', async () => {
    const { url } = await getFoliaJarUrl(VERSION);
    const valid = await validateJarUrl(url);
    expect(valid).toBe(true);
  }, 30000);

  it('purpur download URL is accessible', async () => {
    const { url } = await getPurpurJarUrl(VERSION);
    const valid = await validateJarUrl(url);
    expect(valid).toBe(true);
  }, 30000);
});

describe('validateJarUrl', () => {
  it('returns false for invalid URL', async () => {
    const valid = await validateJarUrl('https://invalid.example.test/not-found.jar');
    expect(valid).toBe(false);
  });

  it('returns false for URL with 404', async () => {
    const valid = await validateJarUrl('https://mcutils.com/api/server-jars/vanilla/0.0.0/download');
    expect(valid).toBe(false);
  });

  it('returns true for valid URL', async () => {
    const { url } = await getVanillaJarUrl(VERSION);
    const valid = await validateJarUrl(url);
    expect(valid).toBe(true);
  }, 30000);
});