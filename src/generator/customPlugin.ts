import type { CustomAdditionsConfig } from '../types.js';
import { join } from 'path';
import { promises as fs } from 'fs';

/**
 * ServerAdditions v2.0.0 - Pre-built standalone plugin
 * All features can be toggled via config.yml
 */

export async function generateCustomPlugin(directory: string, config: CustomAdditionsConfig): Promise<void> {
  const pluginDir = join(directory, 'plugins', 'ServerAdditions');
  
  // Create plugin directory
  await fs.mkdir(pluginDir, { recursive: true });
  
  // Generate config.yml based on user selections
  const configYml = generateConfig(config);
  await fs.writeFile(join(pluginDir, 'config.yml'), configYml);
  
  // Note: The actual plugin JAR is bundled with the CLI
  // and will be copied to the plugins folder
}

function generateConfig(config: CustomAdditionsConfig): string {
  return `# ServerAdditions v2.0.0 - Konfiguracja
# Wszystkie funkcje można włączać/wyłączać niezależnie

# =============================================================================
# USTAWIENIA GŁÓWNE
# =============================================================================
core:
  # Włącz debugowanie w konsoli
  debug: false
  # Interwał auto-zapisu w minutach (0 = wyłączone)
  auto-save-interval: 10

# =============================================================================
# NIEWIDZIALNOŚĆ
# =============================================================================
invisibility:
  # Główny przełącznik niewidzialności
  enabled: ${config.fullInvisibility}
  # Ukryj cząsteczki mikstur
  hide-particles: true
  # Ukryj nametag nad głową
  hide-nametag: true
  # Ukryj z listy graczy (tab)
  hide-from-tab: false
  # Światy gdzie działa (puste = wszystkie)
  worlds: []
  # Uprawnienie do pominięcia ukrywania
  bypass-permission: "serveradditions.invis.bypass"

# =============================================================================
# ZARZĄDZANIE PRZEDMIOTAMI
# =============================================================================
items:
  # Główny przełącznik
  enabled: ${config.itemLimits || config.disabledItems.length > 0}

  # Limity przedmiotów
  limits:
    enabled: ${config.itemLimits}
    # Przedmioty i ich maksymalna ilość
    restricted-items:
      ENCHANTED_GOLDEN_APPLE: ${config.maxGapples}
      GOLDEN_APPLE: 64
      ENDER_PEARL: ${config.maxEnderPearls}
      TOTEM_OF_UNDYING: ${config.maxTotems}${config.customItemLimits.map(item => `
      ${item.material}: ${item.maxAmount}`).join('')}
    # Wiadomość przy przekroczeniu limitu
    message: "&c» Nie możesz nosić więcej niż {limit} {item}!"
    # Uprawnienie do pominięcia limitów
    bypass-permission: "serveradditions.items.bypass"

  # Wyłączone przedmioty
  disabled:
    enabled: ${config.disabledItems.length > 0}
    # Lista wyłączonych materiałów
    items: []
    # Wiadomość przy użyciu wyłączonego przedmiotu
    message: "&c» Ten przedmiot jest wyłączony na tym serwerze!"
    # Blokuj craftowanie wyłączonych przedmiotów
    prevent-crafting: true

# =============================================================================
# SYSTEM LIFESTEAL + OSTATNI KRZYK
# =============================================================================
lifesteal:
  # Włącz system serc
  enabled: ${config.lifestealEnabled}
  # Maksymalna liczba serc
  max-hearts: 20
  # Minimalna liczba serc przed śmiercią
  min-hearts: 1
  # Serca zdobywane za zabójstwo
  hearts-per-kill: 1
  # Serca tracone przy śmierci
  hearts-lost-on-death: 1
  # Poziomy potrzebne do zdobycia serca
  levels-per-heart: 5

  # Skalowanie złotych jabłek
  golden-apple:
    # Podstawowe leczenie (w sercach)
    base-heal: 2.0
    # Dodatkowe leczenie za poziom
    heal-per-level: 0.5

  # System Ostatniego Krzyku - przetrwaj przy 0 HP
  last-stand:
    enabled: true
    # Czas trwania w sekundach
    duration-seconds: 5
    # Efekty podczas ostatniego krzyku
    slowness-level: 2
    weakness-level: 4

  # Przedmiot odrodzenia
  revive:
    enabled: true
    # Składniki receptury (9 slotów)
    recipe:
      - DIAMOND_BLOCK
      - NETHERITE_INGOT
      - DIAMOND_BLOCK
      - NETHERITE_INGOT
      - BEACON
      - NETHERITE_INGOT
      - DIAMOND_BLOCK
      - NETHERITE_INGOT
      - DIAMOND_BLOCK

# =============================================================================
# TABLICA WYNIKÓW (SCOREBOARD)
# =============================================================================
scoreboard:
  enabled: ${config.scoreboardEnabled}
  # Interwał aktualizacji w tickach (20 = 1 sekunda)
  update-interval: ${config.scoreboardUpdateInterval}
  # Tytuł tablicy
  title: "${config.scoreboardTitle}"
  # Linie tablicy (obsługuje placeholdery)
  lines:
    - "&7&m----------------"
    - "&eGracz: &f%player%"
    - "&eŚmierci: &f%deaths%"
    - "&eZabójstwa: &f%kills%"
    - "&7&m----------------"
  # Widoczna domyślnie
  default-visible: true

# =============================================================================
# LISTA GRACZY (TAB)
# =============================================================================
tab:
  enabled: ${config.tabEnabled}
  # Nagłówek (obsługuje wiele linii)
  header:${config.tabHeader.split('\n').map(line => `
    - "${line}"`).join('')}
  # Stopka
  footer:${config.tabFooter.split('\n').map(line => `
    - "${line}"`).join('')}
  # Interwał aktualizacji w tickach
  update-interval: ${config.tabUpdateInterval}

# =============================================================================
# ZARZĄDZANIE SPAWNEM
# =============================================================================
spawn:
  # Ochrona spawna
  protection:
    enabled: ${config.spawnProtection}
    # Promień ochrony
    radius: ${config.spawnProtectionRadius}
    # Wiadomość przy próbie budowy
    message: "&c» Nie możesz budować blisko spawnu!"
    # Bloki które można niszczyć/stawiać
    allowed-blocks:
      - CHEST
      - TRAPPED_CHEST

  # Teleport na spawn
  teleport:
    enabled: ${config.spawnTeleportEnabled}
    # Cooldown w sekundach
    cooldown: ${config.spawnTeleportCooldown}
    # Opóźnienie przed teleportem (0 = natychmiast)
    delay: ${config.spawnTeleportDelay}
    # Wiadomość podczas opóźnienia
    delay-message: "&e» Teleportacja na spawn za {delay} sekund..."

# =============================================================================
# TELEPORTACJA
# =============================================================================
teleport:
  # Losowy teleport (RTP)
  random:
    enabled: ${config.rtpEnabled}
    # Maksymalna odległość od spawna
    max-distance: ${config.rtpMaxDistance}
    # Minimalna odległość od spawna
    min-distance: ${config.rtpMinDistance}
    # Cooldown w sekundach
    cooldown: ${config.rtpCooldown}
    # Koszt (jeśli ekonomia włączona)
    cost: ${config.rtpCost}

  # Domy - TYLKO JEDEN DOM
  homes:
    enabled: ${config.homesEnabled}
    # Tylko 1 dom dozwolony
    max-homes: ${config.maxHomes}
    # Cooldown w sekundach
    cooldown: ${config.homeCooldown}

# =============================================================================
# CZAT
# =============================================================================
chat:
  # Formatowanie czatu
  enabled: ${config.chatFormatEnabled}
  # Format czatu (obsługuje placeholdery)
  format: "&7[%prefix%&7] &f%player%&7: &f%message%"
  # Anti-spam
  anti-spam:
    enabled: ${config.chatAntiSpamEnabled}
    # Cooldown między wiadomościami w sekundach
    cooldown: ${config.chatAntiSpamCooldown}
    # Blokuj powtarzające się wiadomości
    block-repeat: true
  # Filtr czatu
  filter:
    enabled: false
    # Blokowane słowa
    blocked-words: []
    # Zamień na
    replacement: "***"

# =============================================================================
# WALKI
# =============================================================================
combat:
  # Zapobieganie wylogowywaniu podczas walki
  log-prevention:
    enabled: ${config.combatLogPrevention}
    # Czas oznaczenia w walce w sekundach
    duration: ${config.combatLogDuration}
    # Komendy zablokowane w walce
    blocked-commands:${config.combatLogBlockedCommands.map(cmd => `
      - ${cmd}`).join('')}
    # Kara za wylogowanie
    punishment: ${config.combatLogPunishment}

  # Wskaźniki walki
  indicators:
    enabled: ${config.combatIndicatorsEnabled}
    # Pokazuj liczby obrażeń
    damage-numbers: ${config.combatDamageNumbers}
    # Dźwięk przy trafieniu
    hit-sound: ${config.combatHitSound}

# =============================================================================
# KOMENDY
# =============================================================================
commands:
  rtp: true
  spawn: true
  setspawn: true
  home: true
  tpa: true
  warp: true
  seen: true
  invsee: true
  enderchest: true
  workbench: true

# =============================================================================
# EKONOMIA
# =============================================================================
economy:
  enabled: ${config.economyEnabled}
  # Początkowe saldo
  starting-balance: ${config.economyStartingBalance}
  # Symbol waluty
  symbol: "${config.economySymbol}"
  # Komenda /pay
  pay-command: true
  # Komenda /balance
  balance-command: true

# =============================================================================
# WYDAJNOŚĆ
# =============================================================================
performance:
  # Limiter mobów
  entity-limiter:
    enabled: ${config.entityLimiterEnabled}
    # Maksymalna liczba mobów na chunk
    max-mobs-per-chunk: ${config.maxMobsPerChunk}
    # Maksymalna liczba zwierząt na chunk
    max-animals-per-chunk: ${config.maxAnimalsPerChunk}
    # Interwał czyszczenia dropów (minuty, 0 = wyłączone)
    clear-drops-interval: ${config.clearDropsInterval}

  # Limiter redstone
  redstone-limiter:
    enabled: false
    # Maksymalna liczba aktualizacji redstone na tick
    max-updates: 1000

# =============================================================================
# ŚWIATY
# =============================================================================
worlds:
  # Granica świata
  border:
    enabled: ${config.worldBorderEnabled}
    # Rozmiar granicy (promień)
    size: ${config.worldBorderSize}
    # Środek X
    center-x: ${config.worldBorderCenterX}
    # Środek Z
    center-z: ${config.worldBorderCenterZ}
    # Ostrzegaj graczy blisko granicy
    warning-distance: ${config.worldBorderWarningDistance}

  # Kontrola pogody
  weather:
    enabled: false
    # Zablokowana pogoda (CLEAR, RAIN, THUNDER)
    locked-weather: null

  # Kontrola czasu
  time:
    enabled: false
    # Zablokowany czas (DAY, NIGHT, lub null)
    locked-time: null
`;
}

// Pre-built plugin JAR path (relative to dist folder)
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const PLUGIN_JAR_PATH = join(__dirname, '..', 'plugin', 'server-additions-2.0.0.jar');
