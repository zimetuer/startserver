import React, { useState } from 'react';
import { Box } from 'ink';
import { Welcome } from './steps/Welcome.js';
import { DirectorySelect } from './steps/DirectorySelect.js';
import { VersionSelect } from './steps/VersionSelect.js';
import { EngineSelect } from './steps/EngineSelect.js';
import { TemplateSelect } from './steps/TemplateSelect.js';
import { VoiceChatSelect } from './steps/VoiceChatSelect.js';
import { BedrockSelect } from './steps/BedrockSelect.js';
import { AdditionsSelect } from './steps/AdditionsSelect.js';
import { PluginSelect } from './steps/PluginSelect.js';
import { ServerConfigStep } from './steps/ServerConfig.js';
import { RamConfig } from './steps/RamConfig.js';
import { Review } from './steps/Review.js';
import { Generating } from './steps/Generating.js';
import { WorldBorderConfigStep } from './steps/WorldBorderConfig.js';
import type { TabId } from './components/Layout.js';
import type { ServerConfig, Step, Plugin, Template, VoiceChatConfig, BedrockConfig, CustomAdditionsConfig, WorldBorderConfig } from './types.js';

const TAB_STEP_MAP: Record<TabId, Step> = {
  podstawowe: 'directory',
  funkcje: 'voicechat',
  pluginy: 'plugin',
  ustawienia: 'config',
  podsumowanie: 'review',
};

export function App() {
  const [step, setStep] = useState<Step>('welcome');
  const [config, setConfig] = useState<Partial<ServerConfig>>({});

  const STEP_TAB_MAP: Record<Step, TabId | null> = {
    welcome: null,
    directory: 'podstawowe',
    version: 'podstawowe',
    engine: 'podstawowe',
    template: 'podstawowe',
    voicechat: 'funkcje',
    bedrock: 'funkcje',
    additions: 'funkcje',
    plugin: 'pluginy',
    config: 'ustawienia',
    worldborder: 'ustawienia',
    ram: 'ustawienia',
    review: 'podsumowanie',
    generating: 'podsumowanie',
  };

  const currentTab = STEP_TAB_MAP[step];
  const currentTabIndex = currentTab
    ? ['podstawowe', 'funkcje', 'pluginy', 'ustawienia', 'podsumowanie'].indexOf(currentTab)
    : -1;

  const handleTabClick = (tabId: TabId) => {
    const targetStep = TAB_STEP_MAP[tabId];
    if (targetStep) setStep(targetStep);
  };

  const handleDirectory = (directory: string) => { setConfig(p => ({ ...p, directory })); setStep('version'); };
  const handleVersion = (version: string) => { setConfig(p => ({ ...p, version })); setStep('engine'); };
  const handleEngine = (engine: string) => { setConfig(p => ({ ...p, engine })); setStep('template'); };
  const handleTemplate = (template: Template) => {
    setConfig(p => ({ ...p, template, scoreboardEnabled: template === 'full', tabEnabled: template === 'full', rtpEnabled: template === 'full', homesEnabled: template === 'full', teamsEnabled: template === 'full' }));
    setStep('voicechat');
  };
  const handleVoiceChat = (voiceChat: VoiceChatConfig) => { setConfig(p => ({ ...p, voiceChat })); setStep('bedrock'); };
  const handleSkipVoiceChat = () => { setConfig(p => ({ ...p, voiceChat: { enabled: false, type: null } })); setStep('bedrock'); };
  const handleBedrock = (bedrock: BedrockConfig) => { setConfig(p => ({ ...p, bedrock })); setStep('additions'); };
  const handleSkipBedrock = () => { setConfig(p => ({ ...p, bedrock: { enabled: false, geyser: false, floodgate: false } })); setStep('additions'); };
  const handleAdditions = (additions: CustomAdditionsConfig) => { setConfig(p => ({ ...p, customAdditions: additions })); setStep('plugin'); };
  const handleSkipAdditions = () => {
    setConfig(p => ({ ...p, customAdditions: { 
      enabled: false, 
      fullInvisibility: false, 
      itemLimits: false, 
      maxGapples: 16, 
      maxEnderPearls: 16,
      maxTotems: 2,
      customItemLimits: [],
      disabledItems: [], 
      lifestealEnabled: false, 
      scoreboardEnabled: false, 
      scoreboardTitle: "&6&lServerAdditions",
      scoreboardUpdateInterval: 20,
      tabEnabled: false, 
      tabHeader: "&6&m------------------------\n&eWitaj na %servername%\n&6&m------------------------",
      tabFooter: "&7Online: &f%online%&7/&f%max%\n&7Ping: &f%ping%ms",
      tabUpdateInterval: 40,
      spawnProtection: false, 
      spawnProtectionRadius: 50,
      spawnTeleportEnabled: false,
      spawnTeleportCooldown: 30,
      spawnTeleportDelay: 5,
      rtpEnabled: false, 
      rtpMinDistance: 500,
      rtpMaxDistance: 10000,
      rtpCooldown: 300,
      rtpCost: 0,
      homesEnabled: false, 
      maxHomes: 1,
      homeCooldown: 10,
      combatLogPrevention: false, 
      combatLogDuration: 30,
      combatLogPunishment: 'KILL',
      combatLogBlockedCommands: ['spawn', 'home', 'warp', 'rtp'],
      economyEnabled: false, 
      economyStartingBalance: 100,
      economySymbol: '$',
      combatIndicatorsEnabled: false,
      combatDamageNumbers: true,
      combatHitSound: true,
      chatFormatEnabled: false,
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
    } }));
    setStep('plugin');
  };
  const handlePlugins = (plugins: Plugin[]) => { setConfig(p => ({ ...p, plugins })); setStep('config'); };
  const handleConfig = (serverConfig: Partial<ServerConfig>) => { setConfig(p => ({ ...p, ...serverConfig })); setStep('worldborder'); };
  const handleWorldBorder = (worldBorder: WorldBorderConfig) => { setConfig(p => ({ ...p, worldBorder })); setStep('ram'); };
  const handleRam = (ramGb: number) => { setConfig(p => ({ ...p, ramGb })); setStep('review'); };
  const handleGenerate = () => { setStep('generating'); };
  const handleComplete = () => { process.exit(0); };

  const goBack = (currentStep: Step) => {
    const backMap: Record<Step, Step | null> = {
      welcome: null, directory: 'welcome', version: 'directory', engine: 'version',
      template: 'engine', plugin: 'additions', voicechat: 'template', bedrock: 'voicechat',
      additions: 'bedrock', config: 'plugin', worldborder: 'config', ram: 'worldborder', review: 'ram', generating: null,
    };
    const prevStep = backMap[currentStep];
    if (prevStep) setStep(prevStep);
  };

  const tabClickHandler = currentTab ? handleTabClick : undefined;

  return (
    <Box flexDirection="column">
      {step === 'welcome' && <Welcome onNext={() => setStep('directory')} />}
      {step === 'directory' && <DirectorySelect onNext={handleDirectory} onTabClick={tabClickHandler} />}
      {step === 'version' && <VersionSelect onNext={handleVersion} onBack={() => goBack('version')} onTabClick={tabClickHandler} />}
      {step === 'engine' && config.version && <EngineSelect version={config.version} onNext={handleEngine} onBack={() => goBack('engine')} onTabClick={tabClickHandler} />}
      {step === 'template' && <TemplateSelect onNext={handleTemplate} onBack={() => goBack('template')} onTabClick={tabClickHandler} />}
      {step === 'voicechat' && <VoiceChatSelect onNext={handleVoiceChat} onBack={() => goBack('voicechat')} onSkip={handleSkipVoiceChat} onTabClick={tabClickHandler} />}
      {step === 'bedrock' && <BedrockSelect onlineMode={config.onlineMode ?? true} onNext={handleBedrock} onBack={() => goBack('bedrock')} onSkip={handleSkipBedrock} onTabClick={tabClickHandler} />}
      {step === 'additions' && <AdditionsSelect onNext={handleAdditions} onBack={() => goBack('additions')} onSkip={handleSkipAdditions} onTabClick={tabClickHandler} />}
      {step === 'plugin' && config.version && config.engine && config.template && (
        <PluginSelect version={config.version} engine={config.engine} template={config.template}
          voiceChat={config.voiceChat ?? { enabled: false, type: null }}
          bedrock={config.bedrock ?? { enabled: false, geyser: false, floodgate: false }}
          rtpEnabled={config.rtpEnabled ?? false} homesEnabled={config.homesEnabled ?? false} teamsEnabled={config.teamsEnabled ?? false}
          onNext={handlePlugins} onBack={() => goBack('plugin')} onTabClick={tabClickHandler} />
      )}
      {step === 'config' && config.template && <ServerConfigStep template={config.template} onNext={handleConfig} onBack={() => goBack('config')} onTabClick={tabClickHandler} />}
      {step === 'worldborder' && <WorldBorderConfigStep onNext={handleWorldBorder} onBack={() => goBack('worldborder')} onTabClick={tabClickHandler} />}
      {step === 'ram' && <RamConfig maxPlayers={config.maxPlayers || 20} onNext={handleRam} onBack={() => goBack('ram')} onTabClick={tabClickHandler} />}
      {step === 'review' && isCompleteConfig(config) && <Review config={config as ServerConfig} onNext={handleGenerate} onBack={() => goBack('review')} />}
      {step === 'generating' && isCompleteConfig(config) && <Generating config={config as ServerConfig} onComplete={handleComplete} />}
    </Box>
  );
}

function isCompleteConfig(config: Partial<ServerConfig>): config is ServerConfig {
  return !!(
    config.directory && config.version && config.engine && config.template &&
    config.plugins !== undefined && config.voiceChat !== undefined && config.bedrock !== undefined &&
    config.customAdditions !== undefined && config.maxPlayers !== undefined &&
    config.difficulty !== undefined && config.gamemode !== undefined &&
    config.serverPort !== undefined && config.ramGb !== undefined
  );
}