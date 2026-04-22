import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { verifyServerSetup } from '../src/generator/verify.js';
import type { ServerConfig, CustomAdditionsConfig } from '../src/types.js';
import { mkdirSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';

const TEST_DIR = join(__dirname, 'verify-test-server');

const fullAdditions: CustomAdditionsConfig = {
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
  scoreboardTitle: '&6&lTest',
  scoreboardUpdateInterval: 20,
  tabEnabled: true,
  tabHeader: 'header',
  tabFooter: 'footer',
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
  combatLogBlockedCommands: ['spawn', 'home'],
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

function makeConfig(overrides: Partial<ServerConfig> = {}): ServerConfig {
  return {
    directory: TEST_DIR,
    version: '1.21.1',
    engine: 'paper',
    template: 'full',
    plugins: [
      { id: 'test', slug: 'essentialsx', name: 'EssentialsX', description: 'test', downloads: 0, versionId: 'v1', versionNumber: '1', downloadUrl: 'https://example.com/essentialsx.jar' },
    ],
    maxPlayers: 20,
    whitelist: false,
    onlineMode: true,
    difficulty: 'normalny',
    gamemode: 'przetrwanie',
    serverPort: 25565,
    viewDistance: 10,
    motd: 'Test Server',
    pvp: true,
    spawnProtection: 16,
    opPlayer: 'TestPlayer',
    ramGb: 4,
    serverName: 'TestServer',
    worldBorder: { overworld: 10000, nether: 10000, end: 10000 },
    voiceChat: { enabled: false, type: null },
    bedrock: { enabled: false, geyser: false, floodgate: false },
    customAdditions: fullAdditions,
    scoreboardEnabled: true,
    tabEnabled: true,
    rtpEnabled: false,
    homesEnabled: true,
    teamsEnabled: false,
    ...overrides,
  };
}

describe('verifyServerSetup', () => {
  beforeEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
    mkdirSync(TEST_DIR, { recursive: true });
    mkdirSync(join(TEST_DIR, 'plugins'), { recursive: true });
  });

  afterEach(() => {
    rmSync(TEST_DIR, { recursive: true, force: true });
  });

  it('detects missing server jar', async () => {
    const config = makeConfig();
    const results = await verifyServerSetup(config);
    const jarCheck = results.find(r => r.description.includes('Silnik'));
    expect(jarCheck).toBeDefined();
    expect(jarCheck!.exists).toBe(false);
  });

  it('detects present server jar', async () => {
    const config = makeConfig();
    writeFileSync(join(TEST_DIR, 'paper-1.21.1.jar'), 'fake');
    const results = await verifyServerSetup(config);
    const jarCheck = results.find(r => r.description.includes('Silnik'));
    expect(jarCheck).toBeDefined();
    expect(jarCheck!.exists).toBe(true);
  });

  it('detects missing server.properties', async () => {
    const config = makeConfig();
    const results = await verifyServerSetup(config);
    const propCheck = results.find(r => r.description === 'server.properties');
    expect(propCheck).toBeDefined();
    expect(propCheck!.exists).toBe(false);
  });

  it('detects present server.properties with correct settings', async () => {
    const config = makeConfig();
    writeFileSync(join(TEST_DIR, 'server.properties'), [
      'max-players=20',
      'difficulty=normalny',
      'gamemode=przetrwanie',
      'server-port=25565',
      'online-mode=true',
      'pvp=true',
    ].join('\n'));
    const results = await verifyServerSetup(config);
    const maxPlayers = results.find(r => r.description === 'max-players');
    expect(maxPlayers).toBeDefined();
    expect(maxPlayers!.exists).toBe(true);

    const difficulty = results.find(r => r.description === 'difficulty');
    expect(difficulty).toBeDefined();
    expect(difficulty!.exists).toBe(true);
  });

  it('detects wrong values in server.properties', async () => {
    const config = makeConfig();
    writeFileSync(join(TEST_DIR, 'server.properties'), 'max-players=50\n');
    const results = await verifyServerSetup(config);
    const maxPlayers = results.find(r => r.description === 'max-players');
    expect(maxPlayers).toBeDefined();
    expect(maxPlayers!.exists).toBe(false);
    expect(maxPlayers!.details).toBeDefined();
  });

  it('detects present eula.txt', async () => {
    const config = makeConfig();
    writeFileSync(join(TEST_DIR, 'eula.txt'), 'eula=true\n');
    const results = await verifyServerSetup(config);
    const eulaCheck = results.find(r => r.description === 'eula.txt');
    expect(eulaCheck).toBeDefined();
    expect(eulaCheck!.exists).toBe(true);
  });

  it('detects start scripts', async () => {
    const config = makeConfig();
    writeFileSync(join(TEST_DIR, 'start.sh'), '#!/bin/bash\njava -jar server.jar\n');
    writeFileSync(join(TEST_DIR, 'start.bat'), '@echo off\njava -jar server.jar\n');
    const results = await verifyServerSetup(config);
    const shCheck = results.find(r => r.description === 'start.sh');
    const batCheck = results.find(r => r.description === 'start.bat');
    expect(shCheck).toBeDefined();
    expect(batCheck).toBeDefined();
    expect(shCheck!.exists).toBe(true);
    expect(batCheck!.exists).toBe(true);
  });

  it('checks RAM allocation in start script', async () => {
    const config = makeConfig({ ramGb: 4 });
    writeFileSync(join(TEST_DIR, 'start.bat'), 'java -Xms4G -Xmx4G -jar server.jar\n');
    const results = await verifyServerSetup(config);
    const ramCheck = results.find(r => r.description === 'RAM 4GB');
    expect(ramCheck).toBeDefined();
    expect(ramCheck!.exists).toBe(true);
  });

  it('detects missing plugin jars', async () => {
    const config = makeConfig();
    const results = await verifyServerSetup(config);
    const pluginCheck = results.find(r => r.description === 'Plugin: EssentialsX');
    expect(pluginCheck).toBeDefined();
    expect(pluginCheck!.exists).toBe(false);
  });

  it('detects present plugin jars', async () => {
    const config = makeConfig();
    writeFileSync(join(TEST_DIR, 'plugins', 'essentialsx.jar'), 'fake');
    const results = await verifyServerSetup(config);
    const pluginCheck = results.find(r => r.description === 'Plugin: EssentialsX');
    expect(pluginCheck).toBeDefined();
    expect(pluginCheck!.exists).toBe(true);
  });

  it('counts plugin jars in directory', async () => {
    const config = makeConfig();
    writeFileSync(join(TEST_DIR, 'plugins', 'essentialsx.jar'), 'fake');
    writeFileSync(join(TEST_DIR, 'plugins', 'other.jar'), 'fake');
    const results = await verifyServerSetup(config);
    const countCheck = results.find(r => r.description.includes('pluginów'));
    expect(countCheck).toBeDefined();
    expect(countCheck!.details).toContain('2');
  });

  it('checks ServerAdditions folder when enabled', async () => {
    const config = makeConfig();
    mkdirSync(join(TEST_DIR, 'plugins', 'ServerAdditions'), { recursive: true });
    writeFileSync(join(TEST_DIR, 'plugins', 'ServerAdditions', 'config.yml'), 'test: true');
    const results = await verifyServerSetup(config);
    const saDir = results.find(r => r.description === 'ServerAdditions (folder)');
    const saConfig = results.find(r => r.description === 'ServerAdditions config.yml');
    expect(saDir).toBeDefined();
    expect(saConfig).toBeDefined();
    expect(saDir!.exists).toBe(true);
    expect(saConfig!.exists).toBe(true);
  });

  it('does not check ServerAdditions when disabled', async () => {
    const config = makeConfig({ customAdditions: { ...fullAdditions, enabled: false } });
    const results = await verifyServerSetup(config);
    const saDir = results.find(r => r.description === 'ServerAdditions (folder)');
    expect(saDir).toBeUndefined();
  });

  it('checks ops.json content when opPlayer is set', async () => {
    const config = makeConfig({ opPlayer: 'TestPlayer' });
    writeFileSync(join(TEST_DIR, 'ops.json'), JSON.stringify([{ uuid: '', name: 'TestPlayer', level: 4, bypassesPlayerLimit: false }], null, 2));
    const results = await verifyServerSetup(config);
    const opCheck = results.find(r => r.description === 'opPlayer: TestPlayer');
    expect(opCheck).toBeDefined();
    expect(opCheck!.exists).toBe(true);
  });

  it('checks voice chat plugin when enabled', async () => {
    const config = makeConfig({ voiceChat: { enabled: true, type: 'plasmavoice' } });
    writeFileSync(join(TEST_DIR, 'plugins', 'plasmavoice.jar'), 'fake');
    const results = await verifyServerSetup(config);
    const vcCheck = results.find(r => r.description === 'Voice chat: plasmavoice');
    expect(vcCheck).toBeDefined();
    expect(vcCheck!.exists).toBe(true);
  });

  it('reports missing voice chat plugin', async () => {
    const config = makeConfig({ voiceChat: { enabled: true, type: 'simple-voice-chat' } });
    const results = await verifyServerSetup(config);
    const vcCheck = results.find(r => r.description === 'Voice chat: simple-voice-chat');
    expect(vcCheck).toBeDefined();
    expect(vcCheck!.exists).toBe(false);
  });

  it('checks geyser and floodgate when bedrock enabled', async () => {
    const config = makeConfig({ bedrock: { enabled: true, geyser: true, floodgate: true } });
    writeFileSync(join(TEST_DIR, 'plugins', 'geyser.jar'), 'fake');
    writeFileSync(join(TEST_DIR, 'plugins', 'floodgate.jar'), 'fake');
    const results = await verifyServerSetup(config);
    const geyserCheck = results.find(r => r.description === 'Geyser');
    const floodgateCheck = results.find(r => r.description === 'Floodgate');
    expect(geyserCheck).toBeDefined();
    expect(floodgateCheck).toBeDefined();
    expect(geyserCheck!.exists).toBe(true);
    expect(floodgateCheck!.exists).toBe(true);
  });

  it('does not check geyser when bedrock is disabled', async () => {
    const config = makeConfig({ bedrock: { enabled: false, geyser: false, floodgate: false } });
    const results = await verifyServerSetup(config);
    const geyserCheck = results.find(r => r.description === 'Geyser');
    expect(geyserCheck).toBeUndefined();
  });

  it('uses custom jarFilename when provided', async () => {
    const config = makeConfig();
    writeFileSync(join(TEST_DIR, 'paper-1.21.1-147.jar'), 'fake');
    const results = await verifyServerSetup(config, 'paper-1.21.1-147.jar');
    const jarCheck = results.find(r => r.description.includes('Silnik'));
    expect(jarCheck).toBeDefined();
    expect(jarCheck!.exists).toBe(true);
    expect(jarCheck!.description).toContain('paper-1.21.1-147.jar');
  });
});