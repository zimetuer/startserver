import React, { useState, useEffect, useCallback } from 'react';
import { Box, Text, useInput } from 'ink';
import { Layout } from '../components/Layout.js';
import { generateServerProperties } from '../generator/serverProperties.js';
import { generateEula } from '../generator/eula.js';
import { generateStartScript } from '../generator/startScript.js';
import { generateCustomPlugin } from '../generator/customPlugin.js';
import { downloadFile, copyCustomPlugins } from '../generator/downloader.js';
import { getServerJarUrl } from '../api/mcutils.js';
import { verifyServerSetup, type CheckResult } from '../generator/verify.js';
import type { ServerConfig } from '../types.js';
import { join, resolve } from 'path';
import { promises as fs } from 'fs';
import { spawn } from 'child_process';

interface GeneratingProps {
  config: ServerConfig;
  onComplete: () => void;
}

function startServerProcess(config: ServerConfig): void {
  const isWin = process.platform === 'win32';

  if (isWin) {
    const scriptPath = resolve(join(config.directory, 'start.bat'));
    spawn('cmd.exe', ['/c', scriptPath], {
      cwd: config.directory,
      stdio: 'inherit',
      windowsHide: false,
    }).on('error', () => { process.exit(1); })
      .on('exit', () => { process.exit(0); });
  } else {
    const scriptPath = join(config.directory, 'start.sh');
    spawn('sh', [scriptPath], {
      cwd: config.directory,
      stdio: 'inherit',
    }).on('error', () => { process.exit(1); })
      .on('exit', () => { process.exit(0); });
  }
}

export function Generating({ config, onComplete }: GeneratingProps) {
  const [status, setStatus] = useState<'generating' | 'verifying' | 'complete' | 'error' | 'running'>('generating');
  const [message, setMessage] = useState('Rozpoczynanie...');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);

  const handleStart = useCallback(() => {
    setStatus('running');
    startServerProcess(config);
  }, [config]);

  const handleExit = useCallback(() => {
    process.exit(0);
  }, []);

  useInput((_input, key) => {
    if (status === 'complete') {
      if (key.return) handleStart();
      else if (key.escape) handleExit();
    }
  });

  useEffect(() => {
    const generate = async () => {
      try {
        const { directory, engine, version } = config;
        const steps = 5 + config.plugins.length + (config.customAdditions.enabled ? 2 : 0);
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

        step(`Pobieranie ${engine}...`);
        const jarInfo = await getServerJarUrl(engine, version);
        await downloadFile(jarInfo.url, join(directory, jarInfo.filename));

        step('Generowanie skryptów startowych...');
        const scripts = generateStartScript(config, jarInfo.filename);
        await fs.writeFile(join(directory, 'start.sh'), scripts.sh);
        await fs.writeFile(join(directory, 'start.bat'), scripts.bat);
        try { await fs.chmod(join(directory, 'start.sh'), 0o755); } catch {}

        for (const plugin of config.plugins) {
          step(`Pobieranie ${plugin.name}...`);
          try {
            await downloadFile(plugin.downloadUrl, join(directory, 'plugins', `${plugin.slug}.jar`));
          } catch (err) {
            process.stderr.write(`Ostrzeżenie: nie udało się pobrać ${plugin.name}: ${err instanceof Error ? err.message : err}\n`);
          }
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

        setStatus('verifying');
        setMessage('Weryfikacja plików...');
        setProgress(100);

        const verifyResults = await verifyServerSetup(config, jarInfo.filename);
        setChecks(verifyResults.filter(c => c.path.startsWith(config.directory)));
        setStatus('complete');
      } catch (err) {
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Nieznany błąd');
      }
    };
    generate();
  }, [config]);

  const failedChecks = checks.filter(c => !c.exists);
  const passedChecks = checks.filter(c => c.exists);
  const allPassed = failedChecks.length === 0 && checks.length > 0;

  if (status === 'error') {
    return (
      <Layout title="błąd" step={12} totalSteps={12} tab="podsumowanie">
        <Box flexDirection="column" marginTop={3} alignItems="center">
          <Text color="red" bold>✗ Błąd</Text>
          <Box marginTop={1} />
          <Text color="red">{error}</Text>
        </Box>
      </Layout>
    );
  }

  if (status === 'verifying') {
    return (
      <Layout title="weryfikacja" step={12} totalSteps={12} tab="podsumowanie" status={message} statusPosition="top">
        <Box flexDirection="column" marginTop={3} alignItems="center">
          <Text color="yellow">{message}</Text>
          <Box marginTop={1} />
          <Box width={40}>
            <Text color="gray">[{'█'.repeat(40)}] 100%</Text>
          </Box>
        </Box>
      </Layout>
    );
  }

  if (status === 'complete') {
    return (
      <Layout title="ukończono" step={12} totalSteps={12} tab="podsumowanie">
        <Box flexDirection="column" marginTop={1}>
          <Box flexDirection="column" alignItems="center" marginBottom={1}>
            <Text color={allPassed ? 'green' : 'yellow'} bold>
              {allPassed ? '✓ Serwer wygenerowany pomyślnie!' : '⚠ Serwer wygenerowany (z ostrzeżeniami)'}
            </Text>
          </Box>

          <Box flexDirection="column" marginBottom={1}>
            <Text color="white" bold>Weryfikacja:</Text>
            {passedChecks.map((c, i) => (
              <Text key={i} color="green">  ✓ {c.description}</Text>
            ))}
            {failedChecks.map((c, i) => (
              <Box key={`f${i}`}>
                <Text color="red">  ✗ {c.description}</Text>
                {c.details && <Text color="yellow"> — {c.details}</Text>}
              </Box>
            ))}
          </Box>

          <Box marginTop={1} flexDirection="column" alignItems="center">
            <Text color="white" bold>Uruchomić serwer teraz?</Text>
            <Box marginTop={1} />
            <Text color="green" bold>ENTER = Uruchom</Text>
            <Text color="red">ESC = Wyjdź</Text>
          </Box>
          <Box marginTop={1} />
          <Text color="dim">Lub ręcznie: .\start.bat (Windows) / ./start.sh (Linux)</Text>
        </Box>
      </Layout>
    );
  }

  if (status === 'running') {
    return null;
  }

  return (
    <Layout title="generowanie" step={12} totalSteps={12} tab="podsumowanie" status={message} statusPosition="top">
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