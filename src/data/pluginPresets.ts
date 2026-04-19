// Plugin presets for templates
import type { Plugin } from '../types.js';

export interface PresetPlugin {
  slug: string;
  name: string;
  description: string;
  required: boolean;
  category?: 'core' | 'protection' | 'admin' | 'fun' | 'economy';
}

// Curated list of popular plugins (POLISH translations)
// IMPORTANT: slugs must match Modrinth project IDs exactly
export const curatedPlugins: PresetPlugin[] = [
  // Core
  { slug: 'essentialsx', name: 'EssentialsX', description: 'Podstawowe komendy (/spawn, /home, /warp)', required: false, category: 'core' },
  { slug: 'luckperms', name: 'LuckPerms', description: 'Zaawansowany system uprawnień', required: false, category: 'core' },
  { slug: 'vault', name: 'Vault', description: 'API dla ekonomii i uprawnień', required: false, category: 'core' },
  { slug: 'viaversion', name: 'ViaVersion', description: 'Pozwala nowszym klientom dołączyć', required: false, category: 'core' },
  { slug: 'neznamy', name: 'TAB', description: 'Zaawansowana lista graczy i TAB', required: false, category: 'core' },
  // Protection
  { slug: 'worldguard', name: 'WorldGuard', description: 'Ochrona regionów i flagi', required: false, category: 'protection' },
  { slug: 'griefprevention', name: 'GriefPrevention', description: 'Ochrona terenu przez claimy', required: false, category: 'protection' },
  // Admin Tools
  { slug: 'worldedit', name: 'WorldEdit', description: 'Edytor terenu w grze', required: false, category: 'admin' },
  { slug: 'coreprotect', name: 'CoreProtect', description: 'Logowanie bloków i rollbacki', required: false, category: 'admin' },
  { slug: 'discordsrv', name: 'DiscordSRV', description: 'Integracja z Discordem', required: false, category: 'admin' },
  { slug: 'chunky', name: 'Chunky', description: 'Pregenerowanie chunków', required: false, category: 'admin' },
  { slug: 'litebans', name: 'LiteBans', description: 'System kar i banów', required: false, category: 'admin' },
  // Fun/Gameplay
  { slug: 'squaremap', name: 'Squaremap', description: 'Żywa mapa serwera (web)', required: false, category: 'fun' },
  { slug: 'gsit', name: 'GSit', description: 'Siadanie, leżenie, pozowanie', required: false, category: 'fun' },
  // Economy
  { slug: 'tradesystem', name: 'TradeSystem', description: 'Bezpieczny handel między graczami', required: false, category: 'economy' },
];

// Standard template plugins
export const standardPlugins: PresetPlugin[] = [
  {
    slug: 'essentialsx',
    name: 'EssentialsX',
    description: 'Podstawowe komendy serwera (/spawn, /home, /warp, etc.)',
    required: true
  },
  {
    slug: 'luckperms',
    name: 'LuckPerms',
    description: 'Zaawansowany system uprawnień',
    required: true
  },
  {
    slug: 'worldedit',
    name: 'WorldEdit',
    description: 'Edytor terenu w grze',
    required: true
  }
];

// Full template plugins
export const fullPlugins: PresetPlugin[] = [
  // Core essentials
  {
    slug: 'essentialsx',
    name: 'EssentialsX',
    description: 'Podstawowe komendy serwera',
    required: true
  },
  {
    slug: 'luckperms',
    name: 'LuckPerms',
    description: 'Zaawansowany system uprawnień',
    required: true
  },
  {
    slug: 'worldedit',
    name: 'WorldEdit',
    description: 'Edytor terenu w grze',
    required: true
  },
  // Additional Full template plugins
  {
    slug: 'neznamy',
    name: 'TAB',
    description: 'Zaawansowana lista graczy i TAB',
    required: true
  },
  {
    slug: 'vault',
    name: 'Vault',
    description: 'API dla ekonomii i uprawnień',
    required: true
  },
  {
    slug: 'griefprevention',
    name: 'GriefPrevention',
    description: 'Ochrona terenu przed griefingiem',
    required: false
  },
];

// RTP plugin options
export const rtpPlugins: PresetPlugin[] = [
  {
    slug: 'wildernesstp',
    name: 'Wilderness-Tp',
    description: 'Prosty RTP (random teleport)',
    required: false
  },
  {
    slug: 'betterrtp',
    name: 'BetterRTP',
    description: 'Zaawansowany random teleport',
    required: false
  }
];

// Homes plugin options
export const homesPlugins: PresetPlugin[] = [
  {
    slug: 'essentialsx',
    name: 'EssentialsX Homes',
    description: 'System domów z EssentialsX',
    required: false
  },
  {
    slug: 'myhome',
    name: 'MyHome',
    description: 'Dedykowany plugin na domy',
    required: false
  }
];

// Voice chat plugins
export const voiceChatPlugins: PresetPlugin[] = [
  {
    slug: 'plasmavoice',
    name: 'PlasmaVoice',
    description: 'Nowoczesny voice chat z 3D audio',
    required: false
  },
  {
    slug: 'simple-voice-chat',
    name: 'Simple Voice Chat',
    description: 'Prosty i stabilny voice chat',
    required: false
  }
];

// Bedrock crossplay plugins
export const bedrockPlugins: PresetPlugin[] = [
  {
    slug: 'geyser',
    name: 'Geyser',
    description: 'Pozwala graczom Bedrock dołączyć do serwera Java',
    required: true
  },
  {
    slug: 'floodgate',
    name: 'Floodgate',
    description: 'Uwierzytelnianie graczy Bedrock bez konta Java',
    required: true
  }
];

// Scoreboard plugin
export const scoreboardPlugin: PresetPlugin = {
  slug: 'playerstats',
  name: 'PlayerStats',
  description: 'Statystyki graczy na scoreboardzie',
  required: false
};

// Teams plugin
export const teamsPlugin: PresetPlugin = {
  slug: 'betterteams',
  name: 'BetterTeams',
  description: 'System drużyn/klanów',
  required: false
};

// Get plugins for a specific template
export function getPluginsForTemplate(template: 'minimal' | 'standard' | 'full'): PresetPlugin[] {
  switch (template) {
    case 'minimal':
      return [];
    case 'standard':
      return standardPlugins;
    case 'full':
      return fullPlugins;
    default:
      return [];
  }
}
