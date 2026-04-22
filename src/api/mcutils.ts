// Server jar download URL builders for various engines

export interface ServerJarUrl {
  url: string;
  filename: string;
}

// Using mcutils.com API: https://mcutils.com/api/server-jars/{engine}/{version}/download

const MCUTILS_API = "https://mcutils.com/api/server-jars";

export async function validateJarUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

export async function getMcutilsJarUrl(
  engine: string,
  version: string,
): Promise<ServerJarUrl> {
  return {
    url: `${MCUTILS_API}/${engine}/${version}/download`,
    filename: `${engine}-${version}.jar`,
  };
}

// Paper - using official PaperMC API
export async function getPaperJarUrl(version: string): Promise<ServerJarUrl> {
  const apiUrl = `https://api.papermc.io/v2/projects/paper/versions/${version}/builds`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Paper builds: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    builds: Array<{
      build: number;
      channel: string;
      downloads: { application: { name: string } };
    }>;
  };

  if (!data.builds || data.builds.length === 0) {
    throw new Error(`No builds found for Paper ${version}`);
  }

  // Get the latest stable build
  const latestBuild = data.builds[data.builds.length - 1];
  const buildNumber = latestBuild.build;
  const filename = latestBuild.downloads.application.name;

  return {
    url: `https://api.papermc.io/v2/projects/paper/versions/${version}/builds/${buildNumber}/downloads/${filename}`,
    filename: filename,
  };
}

// Folia - using official PaperMC API
export async function getFoliaJarUrl(version: string): Promise<ServerJarUrl> {
  const apiUrl = `https://api.papermc.io/v2/projects/folia/versions/${version}/builds`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Folia builds: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    builds: Array<{
      build: number;
      channel: string;
      downloads: { application: { name: string } };
    }>;
  };

  if (!data.builds || data.builds.length === 0) {
    throw new Error(`No builds found for Folia ${version}`);
  }

  const latestBuild = data.builds[data.builds.length - 1];
  const buildNumber = latestBuild.build;
  const filename = latestBuild.downloads.application.name;

  return {
    url: `https://api.papermc.io/v2/projects/folia/versions/${version}/builds/${buildNumber}/downloads/${filename}`,
    filename: filename,
  };
}

// Purpur - using official PurpurMC API
export async function getPurpurJarUrl(version: string): Promise<ServerJarUrl> {
  const apiUrl = `https://api.purpurmc.org/v2/purpur/${version}`;

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch Purpur builds: ${response.status} ${response.statusText}`,
    );
  }

  const data = (await response.json()) as {
    builds: { all: string[]; latest: string };
  };

  if (!data.builds || !data.builds.all || data.builds.all.length === 0) {
    throw new Error(`No builds found for Purpur ${version}`);
  }

  const latestBuild = data.builds.latest;

  return {
    url: `https://api.purpurmc.org/v2/purpur/${version}/${latestBuild}/download`,
    filename: `purpur-${version}-${latestBuild}.jar`,
  };
}



// Spigot - using GetBukkit CDN (mcutils returns 503 for Spigot downloads)
export async function getSpigotJarUrl(version: string): Promise<ServerJarUrl> {
  return {
    url: `https://cdn.getbukkit.org/spigot/spigot-${version}.jar`,
    filename: `spigot-${version}.jar`,
  };
}

// Main function to get jar URL based on engine
export async function getServerJarUrl(
  engine: string,
  version: string,
): Promise<ServerJarUrl> {
  switch (engine.toLowerCase()) {
    case "paper":
      return getPaperJarUrl(version);
    case "folia":
      return getFoliaJarUrl(version);
    case "purpur":
      return getPurpurJarUrl(version);
    case "spigot":
      return getSpigotJarUrl(version);
    default:
      throw new Error(`Nieznany silnik: ${engine}`);
  }
}

// Get compatible engines for a version
export function getCompatibleEngines(
  version: string,
): Array<{ name: string; description: string }> {
  const engines: Array<{ name: string; description: string }> = [];

  const parseVersion = (v: string) => {
    const parts = v.split(".").map(Number);
    return { major: parts[0], minor: parts[1], patch: parts[2] || 0 };
  };

  const v = parseVersion(version);

  if (v.major > 1 || (v.major === 1 && v.minor >= 8)) {
    if (v.minor > 8 || (v.minor === 8 && v.patch >= 8)) {
      engines.push({
        name: "Paper",
        description: "Wydajny fork Spigota z optymalizacjami",
      });
      engines.push({
        name: "Spigot",
        description: "Popularny fork Bukkit z ulepszeniami wydajności",
      });
    }
  }

  if (v.major > 1 || (v.major === 1 && v.minor >= 14)) {
    if (v.minor > 14 || (v.minor === 14 && v.patch >= 4)) {
      engines.push({
        name: "Purpur",
        description: "Fork Paper z dodatkowymi opcjami konfiguracji",
      });
    }
  }

  if (v.major > 1 || (v.major === 1 && v.minor >= 19)) {
    if (v.minor > 19 || (v.minor === 19 && v.patch >= 4)) {
      engines.push({
        name: "Folia",
        description: "Wielowątkowy fork Paper dla dużych serwerów",
      });
    }
  }

  return engines;
}
