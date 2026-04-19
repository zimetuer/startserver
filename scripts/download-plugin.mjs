#!/usr/bin/env node

import { createWriteStream, mkdirSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pluginDir = join(__dirname, '..', 'plugin');
const pluginJar = join(pluginDir, 'server-additions-2.0.0.jar');

const GITHUB_REPO = 'zimetuer/startserver';
const PLUGIN_URL = `https://github.com/${GITHUB_REPO}/releases/latest/download/ServerAdditions-plugin.jar`;

export async function downloadPlugin({ url = PLUGIN_URL, dest = pluginJar } = {}) {
  if (existsSync(dest)) {
    return { skipped: true, path: dest };
  }

  const dir = dirname(dest);
  mkdirSync(dir, { recursive: true });

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download plugin: ${response.status} ${response.statusText}`);
  }

  const fileStream = createWriteStream(dest);
  await pipeline(response.body, fileStream);

  return { skipped: false, path: dest };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  downloadPlugin()
    .then((result) => {
      if (result.skipped) {
        console.log('Plugin already exists, skipping download.');
      } else {
        console.log('ServerAdditions plugin downloaded successfully.');
      }
    })
    .catch((err) => {
      console.error('Failed to download plugin:', err.message);
      console.error('The plugin will not be available. You can manually download it from:');
      console.error(`  ${PLUGIN_URL}`);
      process.exit(0);
    });
}