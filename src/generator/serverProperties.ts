import type { ServerConfig } from '../types.js';

export function generateServerProperties(config: ServerConfig): string {
  const properties: Record<string, string | number | boolean> = {
    'max-players': config.maxPlayers,
    'white-list': config.whitelist,
    'online-mode': config.onlineMode,
    'difficulty': config.difficulty,
    'gamemode': config.gamemode,
    'server-port': config.serverPort,
    'view-distance': config.viewDistance,
    'motd': config.motd,
    'pvp': config.pvp,
    'spawn-protection': config.spawnProtection,
    'level-name': 'world',
    'level-seed': '',
    'server-ip': '',
    'enable-command-block': false,
    'spawn-animals': true,
    'spawn-monsters': true,
    'spawn-npcs': true,
    'generate-structures': true,
    'allow-flight': false,
    'allow-nether': true,
    'broadcast-console-to-ops': true,
    'broadcast-rcon-to-ops': true,
    'enable-jmx-monitoring': false,
    'enable-query': false,
    'enable-rcon': false,
    'enable-status': true,
    'enforce-secure-profile': true,
    'entity-broadcast-range-percentage': 100,
    'force-gamemode': false,
    'function-permission-level': 2,
    'hardcore': false,
    'hide-online-players': false,
    'initial-disabled-packs': '',
    'initial-enabled-packs': 'vanilla',
    'log-ips': true,
    'max-chained-neighbor-updates': 1000000,
    'max-tick-time': 60000,
    'max-world-size': 29999984,
    'network-compression-threshold': 256,
    'op-permission-level': 4,
    'player-idle-timeout': 0,
    'prevent-proxy-connections': false,
    'query.port': 25565,
    'rate-limit': 0,
    'rcon.password': '',
    'rcon.port': 25575,
    'region-file-compression': 'deflate',
    'require-resource-pack': false,
    'resource-pack': '',
    'resource-pack-id': '',
    'resource-pack-prompt': '',
    'resource-pack-sha1': '',
    'simulation-distance': 10,
    'snooper-enabled': false,
    'sync-chunk-writes': true,
    'text-filtering-config': '',
    'use-native-transport': true,
  };

  const lines = Object.entries(properties).map(([key, value]) => {
    if (typeof value === 'boolean') {
      return `${key}=${value}`;
    }
    if (key === 'motd') {
      return `${key}=${value}`;
    }
    return `${key}=${value}`;
  });

  return lines.join('\n');
}
