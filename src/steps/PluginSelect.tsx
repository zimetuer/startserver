import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout, type TabId } from '../components/Layout.js';
import { getProjectVersion, pickPluginFile } from '../api/modrinth.js';
import { getPluginsForTemplate, voiceChatPlugins, bedrockPlugins, curatedPlugins } from '../data/pluginPresets.js';
import type { Plugin, Template, VoiceChatConfig, BedrockConfig } from '../types.js';

interface PluginSelectProps {
  version: string;
  engine: string;
  template: Template;
  voiceChat: VoiceChatConfig;
  bedrock: BedrockConfig;
  rtpEnabled: boolean;
  homesEnabled: boolean;
  teamsEnabled: boolean;
  onNext: (plugins: Plugin[]) => void;
  onBack: () => void;
  onTabClick?: (tabId: TabId) => void;
}

export function PluginSelect({ version, engine, template, voiceChat, bedrock, onNext, onBack, onTabClick }: PluginSelectProps) {
  const [selectedPlugins, setSelectedPlugins] = useState<Plugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'loading' | 'select' | 'confirm' | 'error'>('loading');
  const [selected, setSelected] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [failedPlugins, setFailedPlugins] = useState<string[]>([]);

  // Load template-required plugins first
  useEffect(() => {
    const load = async () => {
      const presets = getPluginsForTemplate(template);
      const voice = voiceChat.enabled && voiceChat.type ? voiceChatPlugins.filter(p => p.slug === voiceChat.type) : [];
      const bedr = bedrock.enabled ? bedrockPlugins.filter(p => p.slug === 'geyser').concat(bedrock.floodgate ? bedrockPlugins.filter(p => p.slug === 'floodgate') : []) : [];
      
      const loadedPlugins: Plugin[] = [];
      const failed: string[] = [];
      
      for (const preset of [...presets, ...voice, ...bedr]) {
        try {
          const vd = await getProjectVersion(preset.slug, version, engine);
          if (vd) {
            const file = pickPluginFile(vd.files);
            if (file) {
              loadedPlugins.push({
                id: preset.slug, slug: preset.slug, name: preset.name,
                description: preset.description, downloads: 0,
                versionId: vd.id, versionNumber: vd.version_number, downloadUrl: file.url,
              });
            }
          } else {
            failed.push(preset.name);
          }
        } catch (err) {
          failed.push(preset.name);
          console.log(`Nie udało się załadować pluginu: ${preset.slug}`);
        }
      }
      
      setSelectedPlugins(loadedPlugins);
      setFailedPlugins(failed);
      setLoading(false);
      setMode('select');
    };
    load();
  }, [template, voiceChat, bedrock, version]);

  const loadOptionalPlugin = async (pluginSlug: string) => {
    const preset = curatedPlugins.find(p => p.slug === pluginSlug);
    if (!preset) return null;
    
    try {
      const vd = await getProjectVersion(preset.slug, version, engine);
      if (vd) {
        const file = pickPluginFile(vd.files);
        if (file) {
          return {
            id: preset.slug, slug: preset.slug, name: preset.name,
            description: preset.description, downloads: 0,
            versionId: vd.id, versionNumber: vd.version_number, downloadUrl: file.url,
          };
        }
      }
    } catch (err) {
      console.log(`Nie udało się załadować: ${preset.slug}`);
    }
    return null;
  };

  useInput((input, key) => {
    if (mode === 'select') {
      if (key.upArrow) {
        setSelected(s => Math.max(0, s - 1));
      } else if (key.downArrow) {
        setSelected(s => Math.min(curatedPlugins.length + 2, s + 1));
      } else if (key.return) {
        if (selected === curatedPlugins.length) {
          setMode('confirm');
        } else if (selected === curatedPlugins.length + 1) {
          onBack();
        } else if (selected === curatedPlugins.length + 2) {
          onNext(selectedPlugins);
        } else {
          // Toggle plugin selection
          const plugin = curatedPlugins[selected];
          const isSelected = selectedPlugins.some(p => p.slug === plugin.slug);
          
          if (isSelected) {
            setSelectedPlugins(prev => prev.filter(p => p.slug !== plugin.slug));
          } else {
            // Load plugin info and add it
            loadOptionalPlugin(plugin.slug).then(loaded => {
              if (loaded) {
                setSelectedPlugins(prev => [...prev, loaded]);
              } else {
                setErrorMsg(`Nie znaleziono wersji ${plugin.name} dla MC ${version}`);
                setMode('error');
              }
            });
          }
        }
      } else if (key.escape) {
        onBack();
      }
    } else if (mode === 'confirm') {
      if (key.return) {
        onNext(selectedPlugins);
      } else if (key.escape || key.backspace) {
        setMode('select');
      }
    } else if (mode === 'error') {
      if (key.return || key.escape || key.backspace) {
        setMode('select');
        setErrorMsg('');
      }
    }
  });

  if (loading || mode === 'loading') {
    return (
      <Layout title="pluginy" step={8} totalSteps={12} tab="pluginy" onTabClick={onTabClick}>
        <Box marginTop={2}>
          <Text color="yellow">Ładowanie pluginów...</Text>
        </Box>
      </Layout>
    );
  }

  if (mode === 'error') {
    return (
      <Layout title="błąd" step={8} totalSteps={12} tab="pluginy" onTabClick={onTabClick}>
        <Box flexDirection="column" marginTop={2}>
          <Text color="red" bold>✗ Błąd</Text>
          <Box marginTop={1} />
          <Text color="red">{errorMsg}</Text>
          <Box marginTop={1} />
          <Text color="gray">Naciśnij ENTER lub ESC aby kontynuować</Text>
        </Box>
      </Layout>
    );
  }

  if (mode === 'confirm') {
    return (
      <Layout title="potwierdzenie pluginów" step={8} totalSteps={12} tab="pluginy" onTabClick={onTabClick}>
        <Box flexDirection="column" marginTop={2}>
          <Text color="white" bold>Wybrane Pluginy ({selectedPlugins.length}):</Text>
          <Box marginTop={1} />
          {selectedPlugins.length === 0 ? (
            <Text color="gray">Nie wybrano dodatkowych pluginów</Text>
          ) : (
            selectedPlugins.map((p, i) => (
              <Text key={i} color="gray">  ✓ {p.name}</Text>
            ))
          )}
          {failedPlugins.length > 0 && (
            <>
              <Box marginTop={1} />
              <Text color="yellow" bold>Nie udało się załadować:</Text>
              {failedPlugins.map((name, i) => (
                <Text key={i} color="yellow">  ⚠ {name}</Text>
              ))}
            </>
          )}
          <Box marginTop={2} />
          <Text color="green">▶ Naciśnij ENTER aby potwierdzić</Text>
          <Text color="gray">  Naciśnij ESC aby wrócić</Text>
        </Box>
      </Layout>
    );
  }

  // select mode - show curated list
  return (
    <Layout title="pluginy" step={8} totalSteps={12} tab="pluginy" onTabClick={onTabClick}>
      <Box flexDirection="column" marginTop={1}>
        <Text color="white" bold>Wybierz dodatkowe pluginy:</Text>
        <Text color="gray">ENTER aby zaznaczyć/odznaczyć</Text>
        <Box marginTop={1} />
        
        {/* Template plugins (auto-selected) */}
        {selectedPlugins.filter(p => !curatedPlugins.some(cp => cp.slug === p.slug)).length > 0 && (
          <>
            <Text color="yellow" bold>Pluginy z Szablonu:</Text>
            {selectedPlugins.filter(p => !curatedPlugins.some(cp => cp.slug === p.slug)).map((p, i) => (
              <Text key={`auto-${i}`} color="yellow">  ✓ {p.name}</Text>
            ))}
            <Box marginTop={1} />
          </>
        )}
        
        <Text color="white" bold>Dodatkowe Pluginy:</Text>
        {curatedPlugins.map((plugin, i) => {
          const isSelected = selectedPlugins.some(p => p.slug === plugin.slug);
          const isActive = selected === i;
          return (
            <Box key={plugin.slug}>
              <Text color={isActive ? 'cyan' : 'gray'}>
                {isActive ? '▶ ' : '  '}
                {isSelected ? '[✓] ' : '[ ] '}
                {plugin.name}
              </Text>
              <Text color="gray"> - {plugin.description}</Text>
            </Box>
          );
        })}
        
        <Box marginTop={1} />
        <Box>
          <Text color={selected === curatedPlugins.length ? 'green' : 'gray'}>
            {selected === curatedPlugins.length ? '▶ ' : '  '}Dalej
          </Text>
        </Box>
        <Box>
          <Text color={selected === curatedPlugins.length + 1 ? 'cyan' : 'gray'}>
            {selected === curatedPlugins.length + 1 ? '▶ ' : '  '}← Wróć
          </Text>
        </Box>
      </Box>
    </Layout>
  );
}
