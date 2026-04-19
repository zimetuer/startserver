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
  mcVersion: string
): Promise<ModrinthVersion | null> {
  const versions = await fetchModrinth<ModrinthVersion[]>(
    `/project/${projectId}/version`
  );
  
  // Find version compatible with the selected MC version
  const compatible = versions.find(v => 
    v.version_number.includes(mcVersion) || 
    v.project_id === projectId
  );
  
  return compatible || versions[0] || null;
}

export async function getVersion(versionId: string): Promise<ModrinthVersion> {
  return fetchModrinth<ModrinthVersion>(`/version/${versionId}`);
}
