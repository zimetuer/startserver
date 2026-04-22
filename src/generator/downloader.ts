import { createWriteStream, promises as fs } from 'fs';
import { getServerJarUrl } from '../api/mcutils.js';
import type { Plugin, ServerConfig } from '../types.js';
import { pipeline } from 'stream/promises';
import { join, basename } from 'path';
import { generatePluginConfigs } from './pluginConfigs.js';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CUSTOM_PLUGINS_DIR = join(__dirname, '..', 'plugin');
const CUSTOM_PLUGINS_TARGET_DIR = join(CUSTOM_PLUGINS_DIR, 'target');

export interface DownloadProgress {
  total: number;
  current: number;
  status: 'downloading' | 'complete' | 'error';
  message: string;
}

export type ProgressCallback = (progress: DownloadProgress) => void;

export async function downloadFile(
  url: string,
  destPath: string,
  onProgress?: (downloaded: number, total: number) => void,
  maxRetries = 3
): Promise<void> {
  let lastError: Error | undefined;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        // Retry on server errors (5xx) but not client errors (4xx)
        if (response.status >= 500 && response.status < 600 && attempt < maxRetries) {
          console.log(`Download attempt ${attempt} failed with ${response.status}, retrying...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
          continue;
        }
        throw new Error(`Download failed: ${response.status} ${response.statusText}`);
      }

      const total = parseInt(response.headers.get('content-length') || '0', 10);
      const fileStream = createWriteStream(destPath);

      if (!response.body) {
        throw new Error('Response body is null');
      }

      const reader = response.body.getReader();
      let downloaded = 0;

      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            downloaded += value.length;
            if (onProgress) {
              onProgress(downloaded, total);
            }
            controller.enqueue(value);
          }
          controller.close();
        },
      });

      await pipeline(stream, fileStream);
      return; // Success, exit the function
    } catch (error) {
      lastError = error as Error;
      if (attempt < maxRetries) {
        console.log(`Download attempt ${attempt} failed, retrying in ${1000 * attempt}ms...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError || new Error('Download failed after all retries');
}

export async function checkExistingPlugins(directory: string): Promise<{ exists: boolean; count: number }> {
  const pluginsDir = join(directory, 'plugins');
  try {
    const entries = await fs.readdir(pluginsDir);
    const jarFiles = entries.filter(e => e.endsWith('.jar'));
    return { exists: jarFiles.length > 0, count: jarFiles.length };
  } catch {
    return { exists: false, count: 0 };
  }
}

export async function backupPlugins(directory: string): Promise<void> {
  const pluginsDir = join(directory, 'plugins');
  const backupDir = join(directory, 'plugins-backup-' + Date.now());
  
  try {
    await fs.mkdir(backupDir, { recursive: true });
    const entries = await fs.readdir(pluginsDir);
    
    for (const entry of entries) {
      const srcPath = join(pluginsDir, entry);
      const destPath = join(backupDir, entry);
      await fs.rename(srcPath, destPath);
    }
  } catch (error) {
    console.error('Failed to backup plugins:', error);
    throw error;
  }
}

export async function copyCustomPlugins(destDir: string, sourceDirs?: string[]): Promise<number> {
  const dirs = sourceDirs ?? [CUSTOM_PLUGINS_DIR, CUSTOM_PLUGINS_TARGET_DIR];
  const pluginsDir = join(destDir, 'plugins');
  await fs.mkdir(pluginsDir, { recursive: true });
  let totalCopied = 0;

  for (const dir of dirs) {
    try {
      await fs.access(dir);
      const entries = await fs.readdir(dir);
      const jarFiles = entries.filter(e => e.endsWith('.jar') && !e.startsWith('original-') && !e.includes('-shaded'));

      for (const filename of jarFiles) {
        const srcPath = join(dir, filename);
        const destPath = join(pluginsDir, filename);
        try {
          await fs.access(destPath);
        } catch {
          await fs.copyFile(srcPath, destPath);
          totalCopied++;
        }
      }
    } catch {
      // Directory doesn't exist, skip
    }
  }

  return totalCopied;
}

export async function generateServer(
  config: ServerConfig,
  onProgress: ProgressCallback
): Promise<void> {
  const { directory, engine, version } = config;
  
  // Create directory structure
  await fs.mkdir(directory, { recursive: true });
  await fs.mkdir(join(directory, 'plugins'), { recursive: true });
  
  // Check for existing plugins
  const existingPlugins = await checkExistingPlugins(directory);
  if (existingPlugins.exists) {
    onProgress({
      total: config.plugins.length + 3,
      current: 0,
      status: 'downloading',
      message: `Backing up ${existingPlugins.count} existing plugins...`,
    });
    await backupPlugins(directory);
  }
  
  // Copy custom plugins
  onProgress({
    total: config.plugins.length + 3,
    current: existingPlugins.exists ? 1 : 0,
    status: 'downloading',
    message: 'Copying custom plugins...',
  });
  const customPluginCount = await copyCustomPlugins(directory);
  
  // Download server jar
  onProgress({
    total: config.plugins.length + 3,
    current: existingPlugins.exists ? 2 : 1,
    status: 'downloading',
    message: `Downloading ${engine} server jar...`,
  });
  
  const jarInfo = await getServerJarUrl(engine, version);
  const jarPath = join(directory, jarInfo.filename);
  await downloadFile(jarInfo.url, jarPath);
  
  // Download plugins
  let current = existingPlugins.exists ? 3 : 2;
  for (const plugin of config.plugins) {
    onProgress({
      total: config.plugins.length + 3,
      current,
      status: 'downloading',
      message: `Downloading ${plugin.name}...`,
    });

    const pluginPath = join(directory, 'plugins', `${plugin.slug}-${plugin.versionNumber}.jar`);
    await downloadFile(plugin.downloadUrl, pluginPath);
    current++;
  }

  // Generate plugin configs
  if (config.plugins.length > 0) {
    onProgress({
      total: config.plugins.length + 3,
      current,
      status: 'downloading',
      message: 'Generating plugin configurations...',
    });
    
    const pluginSlugs = config.plugins.map(p => p.slug);
    const pluginConfigs = generatePluginConfigs(pluginSlugs, config);
    
    for (const pluginConfig of pluginConfigs) {
      const configDir = join(directory, 'plugins', pluginConfig.pluginDir);
      await fs.mkdir(configDir, { recursive: true });
      await fs.writeFile(join(configDir, pluginConfig.filename), pluginConfig.content);
    }
  }
  
  onProgress({
    total: config.plugins.length + 3,
    current: current + 1,
    status: 'complete',
    message: 'Download complete!',
  });
}
