import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { Layout } from '../components/Layout.js';
import { generateServerProperties } from '../generator/serverProperties.js';
import { generateEula } from '../generator/eula.js';
import { generateStartScript } from '../generator/startScript.js';
import { generateCustomPlugin } from '../generator/customPlugin.js';
import { downloadFile, copyCustomPlugins } from '../generator/downloader.js';
import { getServerJarUrl } from '../api/mcutils.js';
import type { ServerConfig } from '../types.js';
import { join } from 'path';
import { promises as fs } from 'fs';

interface GeneratingProps {
  config: ServerConfig;
  onComplete: () => void;
}

export function Generating({ config, onComplete }: GeneratingProps) {
  const [status, setStatus] = useState<'generating' | 'complete' | 'error'>('generating');
  const [message, setMessage] = useState('Rozpoczynanie...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const generate = async () => {
      try {
        const { directory, engine, version } = config;
        const steps = 4 + config.plugins.length + (config.customAdditions.enabled ? 2 : 0);
        let current = 0;

        const step = (msg: string) => {
          current++;
          setMessage(msg);
          setProgress(Math.round((current / steps) * 100));
        };

        step('Tworzenie katalogów...');
        await fs.mkdir(directory, { recursive: true });
        await fs.mkdir(join(directory, 'plugins'), { recursive: true });

        step('Generowanie server.properties...');
        await fs.writeFile(join(directory, 'server.properties'), generateServerProperties(config));

        step('Generowanie eula.txt...');
        await fs.writeFile(join(directory, 'eula.txt'), generateEula());

        step('Generowanie skryptów startowych...');
        const scripts = generateStartScript(config);
        await fs.writeFile(join(directory, 'start.sh'), scripts.sh);
        await fs.writeFile(join(directory, 'start.bat'), scripts.bat);
        try { await fs.chmod(join(directory, 'start.sh'), 0o755); } catch {}

        step(`Pobieranie ${engine}...`);
        const jarInfo = await getServerJarUrl(engine, version);
        await downloadFile(jarInfo.url, join(directory, jarInfo.filename));

        for (const plugin of config.plugins) {
          step(`Pobieranie ${plugin.name}...`);
          await downloadFile(plugin.downloadUrl, join(directory, 'plugins', `${plugin.slug}.jar`));
        }

        if (config.customAdditions.enabled) {
          step('Kopiowanie własnych pluginów...');
          await copyCustomPlugins(directory);
          step('Generowanie konfiguracji pluginów...');
          await generateCustomPlugin(directory, config.customAdditions);
        }

        if (config.opPlayer) {
          await fs.writeFile(join(directory, 'ops.json'), JSON.stringify([{
            uuid: '', name: config.opPlayer, level: 4, bypassesPlayerLimit: false
          }], null, 2));
        }

        setStatus('complete');
        setTimeout(onComplete, 2000);
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Nieznany błąd');
      }
    };
    generate();
  }, [config, onComplete]);

  if (status === 'error') {
    return (
      <Layout title="błąd" step={9} totalSteps={9}>
        <Box flexDirection="column" marginTop={3} alignItems="center">
          <Text color="red" bold>✗ Błąd</Text>
          <Box marginTop={1} />
          <Text color="red">{error}</Text>
        </Box>
      </Layout>
    );
  }

  if (status === 'complete') {
    return (
      <Layout title="ukończono" step={9} totalSteps={9}>
        <Box flexDirection="column" marginTop={3} alignItems="center">
          <Text color="green" bold>✓ Serwer wygenerowany pomyślnie!</Text>
          <Box marginTop={1} />
          <Text color="gray">Lokalizacja: <Text color="cyan">{config.directory}</Text></Text>
          <Box marginTop={1} />
          <Text color="gray">Uruchom: ./start.sh (Linux) lub start.bat (Windows)</Text>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout title="generowanie" step={9} totalSteps={9} status={message}>
      <Box flexDirection="column" marginTop={3} alignItems="center">
        <Text color="yellow">{message}</Text>
        <Box marginTop={1} />
        <Box width={40}>
          <Text color="gray">[{''.padStart(Math.round(progress / 2.5), '█').padEnd(40, '░')}] {progress}%</Text>
        </Box>
      </Box>
    </Layout>
  );
}
