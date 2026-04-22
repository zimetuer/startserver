import type { GameVersion, Loader, ModrinthProject, ModrinthVersion } from '../types.js';

const BASE_URL = 'https://api.modrinth.com/v2';
const USER_AGENT = 'StartServer/1.0.0 (https://github.com/startserver)';

async function fetchModrinth<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'User-Agent': USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`Modrinth API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchGameVersions(): Promise<GameVersion[]> {
  const versions = await fetchModrinth<GameVersion[]>('/tag/game_version');
  return versions
    .filter(v => v.version_type === 'release')
    .sort((a, b) => {
      // Sort by version number (newest first)
      const parseVersion = (v: string) => {
        const parts = v.split('.').map(Number);
        return parts[0] * 10000 + (parts[1] || 0) * 100 + (parts[2] || 0);
      };
      return parseVersion(b.version) - parseVersion(a.version);
    });
}

export async function fetchLoaders(): Promise<Loader[]> {
  return fetchModrinth<Loader[]>('/tag/loader');
}

export async function getProjectVersion(
  projectId: string,
  mcVersion: string,
  loader?: string
): Promise<ModrinthVersion | null> {
  const serverLoaders = ['spigot', 'paper', 'bukkit', 'purpur', 'folia'];
  const loaders = loader ? [loader.toLowerCase()] : serverLoaders;

  const params = new URLSearchParams({
    game_versions: JSON.stringify([mcVersion]),
    loaders: JSON.stringify(loaders),
  });

  const versions = await fetchModrinth<ModrinthVersion[]>(
    `/project/${projectId}/version?${params.toString()}`
  );

  if (versions.length === 0) {
    return null;
  }

  return versions[0];
}

export function pickPluginFile(files: Array<{ url: string; filename: string; primary: boolean }>): { url: string; filename: string } | undefined {
  if (files.length === 0) return undefined;
  if (files.length === 1) return { url: files[0].url, filename: files[0].filename };

  const bukkittags = ['bukkit', 'spigot', 'paper', 'purpur'];
  const antitags = ['-sources', '-javadoc', '-api'];

  const preferred = files.find(f =>
    bukkittags.some(t => f.filename.toLowerCase().includes(t)) &&
    !antitags.some(t => f.filename.toLowerCase().includes(t))
  );

  if (preferred) return { url: preferred.url, filename: preferred.filename };

  const primary = files.find(f => f.primary);
  return { url: (primary ?? files[0]).url, filename: (primary ?? files[0]).filename };
}

export async function getVersion(versionId: string): Promise<ModrinthVersion> {
  return fetchModrinth<ModrinthVersion>(`/version/${versionId}`);
}
