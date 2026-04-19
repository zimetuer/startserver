// Shared TypeScript interfaces

export type Template = 'minimal' | 'standard' | 'full';

export interface WorldBorderConfig {
  overworld: number;
  nether: number;
  end: number;
}

export type WorldBorderPreset = 5000 | 4000 | 3500 | 3000 | 2500 | 2000 | 'custom';

export interface VoiceChatConfig {
  enabled: boolean;
  type: 'plasmavoice' | 'simplevoicechat' | null;
}

export interface BedrockConfig {
  enabled: boolean;
  geyser: boolean;
  floodgate: boolean;
}

export interface CustomItemLimit {
  material: string;
  maxAmount: number;
}

export interface CustomAdditionsConfig {
  enabled: boolean;
  fullInvisibility: boolean;
  itemLimits: boolean;
  maxGapples: number;
  maxEnderPearls: number;
  maxTotems: number;
  customItemLimits: CustomItemLimit[];
  disabledItems: string[];
  lifestealEnabled: boolean;
  scoreboardEnabled: boolean;
  scoreboardTitle: string;
  scoreboardUpdateInterval: number;
  tabEnabled: boolean;
  tabHeader: string;
  tabFooter: string;
  tabUpdateInterval: number;
  spawnProtection: boolean;
  spawnProtectionRadius: number;
  spawnTeleportEnabled: boolean;
  spawnTeleportCooldown: number;
  spawnTeleportDelay: number;
  rtpEnabled: boolean;
  rtpMinDistance: number;
  rtpMaxDistance: number;
  rtpCooldown: number;
  rtpCost: number;
  homesEnabled: boolean;
  maxHomes: number;
  homeCooldown: number;
  combatLogPrevention: boolean;
  combatLogDuration: number;
  combatLogPunishment: 'KILL' | 'BAN' | 'TEMPBAN';
  combatLogBlockedCommands: string[];
  economyEnabled: boolean;
  economyStartingBalance: number;
  economySymbol: string;
  combatIndicatorsEnabled: boolean;
  combatDamageNumbers: boolean;
  combatHitSound: boolean;
  chatFormatEnabled: boolean;
  chatAntiSpamEnabled: boolean;
  chatAntiSpamCooldown: number;
  worldBorderEnabled: boolean;
  worldBorderSize: number;
  worldBorderCenterX: number;
  worldBorderCenterZ: number;
  worldBorderWarningDistance: number;
  entityLimiterEnabled: boolean;
  maxMobsPerChunk: number;
  maxAnimalsPerChunk: number;
  clearDropsInterval: number;
}

export interface ServerConfig {
  directory: string;
  version: string;
  engine: string;
  template: Template;
  plugins: Plugin[];
  maxPlayers: number;
  whitelist: boolean;
  onlineMode: boolean;
  difficulty: string;
  gamemode: string;
  serverPort: number;
  viewDistance: number;
  motd: string;
  pvp: boolean;
  spawnProtection: number;
  opPlayer: string;
  ramGb: number;
  serverName: string;
  worldBorder: WorldBorderConfig;
  voiceChat: VoiceChatConfig;
  bedrock: BedrockConfig;
  customAdditions: CustomAdditionsConfig;
  scoreboardEnabled: boolean;
  tabEnabled: boolean;
  rtpEnabled: boolean;
  homesEnabled: boolean;
  teamsEnabled: boolean;
}

export interface Plugin {
  id: string;
  slug: string;
  name: string;
  description: string;
  downloads: number;
  versionId: string;
  versionNumber: string;
  downloadUrl: string;
}

export interface ModrinthProject {
  slug: string;
  title: string;
  description: string;
  downloads: number;
  project_id: string;
}

export interface ModrinthVersion {
  id: string;
  project_id: string;
  version_number: string;
  files: Array<{
    url: string;
    filename: string;
    primary: boolean;
  }>;
}

export interface GameVersion {
  version: string;
  version_type: string;
}

export interface Loader {
  name: string;
  supported_project_types: string[];
}

export type Step =
  | 'welcome'
  | 'directory'
  | 'version'
  | 'engine'
  | 'template'
  | 'plugin'
  | 'voicechat'
  | 'bedrock'
  | 'additions'
  | 'config'
  | 'worldborder'
  | 'ram'
  | 'review'
  | 'generating';
