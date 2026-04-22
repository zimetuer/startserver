import type { Plugin } from '../types.js';

export interface PresetPlugin {
  slug: string;
  name: string;
  description: string;
  required: boolean;
  category?: 'core' | 'protection' | 'admin' | 'fun' | 'economy';
}

export const curatedPlugins: PresetPlugin[] = [
  { slug: 'essentialsx', name: 'EssentialsX', description: 'Podstawowe komendy (/spawn, /home, /warp)', required: false, category: 'core' },
  { slug: 'luckperms', name: 'LuckPerms', description: 'Zaawansowany system uprawnień', required: false, category: 'core' },
  { slug: 'viaversion', name: 'ViaVersion', description: 'Pozwala nowszym klientom dołączyć', required: false, category: 'core' },
  { slug: 'tab-was-taken', name: 'TAB', description: 'Zaawansowana lista graczy i TAB', required: false, category: 'core' },
  { slug: 'worldguard', name: 'WorldGuard', description: 'Ochrona regionów i flagi', required: false, category: 'protection' },
  { slug: 'griefprevention', name: 'GriefPrevention', description: 'Ochrona terenu przez claimy', required: false, category: 'protection' },
  { slug: 'worldedit', name: 'WorldEdit', description: 'Edytor terenu w grze', required: false, category: 'admin' },
  { slug: 'coreprotect', name: 'CoreProtect', description: 'Logowanie bloków i rollbacki', required: false, category: 'admin' },
  { slug: 'discordsrv', name: 'DiscordSRV', description: 'Integracja z Discordem', required: false, category: 'admin' },
  { slug: 'chunky', name: 'Chunky', description: 'Pregenerowanie chunków', required: false, category: 'admin' },
  { slug: 'squaremap', name: 'Squaremap', description: 'Żywa mapa serwera (web)', required: false, category: 'fun' },
  { slug: 'gsit', name: 'GSit', description: 'Siadanie, leżenie, pozowanie', required: false, category: 'fun' },
];

export const standardPlugins: PresetPlugin[] = [
  { slug: 'essentialsx', name: 'EssentialsX', description: 'Podstawowe komendy serwera', required: true },
  { slug: 'luckperms', name: 'LuckPerms', description: 'Zaawansowany system uprawnień', required: true },
  { slug: 'worldedit', name: 'WorldEdit', description: 'Edytor terenu w grze', required: true },
];

export const fullPlugins: PresetPlugin[] = [
  { slug: 'essentialsx', name: 'EssentialsX', description: 'Podstawowe komendy serwera', required: true },
  { slug: 'luckperms', name: 'LuckPerms', description: 'Zaawansowany system uprawnień', required: true },
  { slug: 'worldedit', name: 'WorldEdit', description: 'Edytor terenu w grze', required: true },
  { slug: 'tab-was-taken', name: 'TAB', description: 'Zaawansowana lista graczy i TAB', required: true },
  { slug: 'griefprevention', name: 'GriefPrevention', description: 'Ochrona terenu przed griefingiem', required: false },
];

export const rtpPlugins: PresetPlugin[] = [];

export const homesPlugins: PresetPlugin[] = [];

export const voiceChatPlugins: PresetPlugin[] = [
  { slug: 'plasmavoice', name: 'PlasmaVoice', description: 'Nowoczesny voice chat z 3D audio', required: false },
  { slug: 'simple-voice-chat', name: 'Simple Voice Chat', description: 'Prosty i stabilny voice chat', required: false },
];

export const bedrockPlugins: PresetPlugin[] = [
  { slug: 'geyser', name: 'Geyser', description: 'Pozwala graczom Bedrock dołączyć do serwera Java', required: true },
  { slug: 'floodgate', name: 'Floodgate', description: 'Uwierzytelnianie graczy Bedrock bez konta Java', required: true },
];



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