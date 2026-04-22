import type { ServerConfig } from '../types.js';
import { join } from 'path';
import { promises as fs } from 'fs';

export interface CheckResult {
  path: string;
  description: string;
  exists: boolean;
  details?: string;
}

export async function verifyServerSetup(config: ServerConfig, jarFilename?: string): Promise<CheckResult[]> {
  const dir = config.directory;
  const results: CheckResult[] = [];
  const check = (p: string, desc: string) =>
    fs.access(p).then(() => results.push({ path: p, description: desc, exists: true }))
      .catch(() => results.push({ path: p, description: desc, exists: false }));

  const checkContent = async (p: string, desc: string, expectedContent: string | RegExp) => {
    try {
      const content = await fs.readFile(p, 'utf-8');
      if (typeof expectedContent === 'string') {
        const found = content.includes(expectedContent);
        results.push({ path: p, description: desc, exists: found, details: found ? undefined : `nie znaleziono: "${expectedContent}"` });
      } else {
        const found = expectedContent.test(content);
        results.push({ path: p, description: desc, exists: found, details: found ? undefined : `nie pasuje do wzorca` });
      }
    } catch {
      results.push({ path: p, description: desc, exists: false, details: 'plik nie istnieje' });
    }
  };

  const isWin = process.platform === 'win32';
  const jarName = jarFilename || getJarName(config.engine, config.version);

  await check(join(dir, jarName), `Silnik: ${config.engine} (${jarName})`);
  await check(join(dir, 'server.properties'), 'server.properties');
  await check(join(dir, 'eula.txt'), 'eula.txt');
  await check(isWin ? join(dir, 'start.bat') : join(dir, 'start.sh'), 'Skrypt startowy');
  await check(join(dir, 'start.bat'), 'start.bat');
  await check(join(dir, 'start.sh'), 'start.sh');

  await checkContent(join(dir, 'server.properties'), `max-players`, `max-players=${config.maxPlayers}`);
  await checkContent(join(dir, 'server.properties'), `difficulty`, `difficulty=${config.difficulty}`);
  await checkContent(join(dir, 'server.properties'), `gamemode`, `gamemode=${config.gamemode}`);
  await checkContent(join(dir, 'server.properties'), `server-port`, `server-port=${config.serverPort}`);
  await checkContent(join(dir, 'server.properties'), `online-mode`, `online-mode=${config.onlineMode}`);
  await checkContent(join(dir, 'server.properties'), `pvp`, `pvp=${config.pvp}`);
  await checkContent(join(dir, 'eula.txt'), 'eula=true', 'eula=true');

  await checkContent(isWin ? join(dir, 'start.bat') : join(dir, 'start.sh'), `RAM ${config.ramGb}GB`, `-Xmx${config.ramGb}G`);

  for (const plugin of config.plugins) {
    await check(join(dir, 'plugins', `${plugin.slug}.jar`), `Plugin: ${plugin.name}`);
  }

  const pluginsDir = join(dir, 'plugins');
  try {
    const entries = await fs.readdir(pluginsDir);
    const jars = entries.filter(e => e.endsWith('.jar'));
    results.push({
      path: pluginsDir,
      description: `Łącznie pluginów w folderze`,
      exists: true,
      details: `${jars.length} plików .jar`,
    });
  } catch {
    results.push({
      path: pluginsDir,
      description: `Łącznie pluginów w folderze`,
      exists: false,
      details: 'folder plugins nie istnieje',
    });
  }

  if (config.customAdditions.enabled) {
    const saDir = join(dir, 'plugins', 'ServerAdditions');
    await check(saDir, 'ServerAdditions (folder)');
    await check(join(saDir, 'config.yml'), 'ServerAdditions config.yml');
  }

  if (config.opPlayer) {
    await checkContent(join(dir, 'ops.json'), `opPlayer: ${config.opPlayer}`, config.opPlayer);
  }

  if (config.voiceChat.enabled) {
    const slug = config.voiceChat.type === 'plasmavoice' ? 'plasmavoice' : 'simple-voice-chat';
    await check(join(dir, 'plugins', `${slug}.jar`), `Voice chat: ${config.voiceChat.type}`);
  }

  if (config.bedrock.enabled) {
    await check(join(dir, 'plugins', 'geyser.jar'), 'Geyser');
    await check(join(dir, 'plugins', 'floodgate.jar'), 'Floodgate');
  }

  return results;
}

function getJarName(engine: string, version: string): string {
  switch (engine.toLowerCase()) {
    case 'vanilla': return 'server.jar';
    case 'paper': return `paper-${version}.jar`;
    case 'folia': return `folia-${version}.jar`;
    case 'purpur': return `purpur-${version}.jar`;
    case 'spigot': return `spigot-${version}.jar`;
    default: return 'server.jar';
  }
}