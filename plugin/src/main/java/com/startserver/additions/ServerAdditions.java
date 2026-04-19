package com.startserver.additions;

import com.startserver.additions.commands.*;
import com.startserver.additions.features.*;
import com.startserver.additions.listeners.*;
import lombok.Getter;
import lombok.Setter;
import java.util.logging.Logger;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.plugin.java.JavaPlugin;
import org.bukkit.scheduler.BukkitRunnable;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class ServerAdditions extends JavaPlugin {
    
    private static final Logger log = Logger.getLogger(ServerAdditions.class.getName());

    @Getter
    private static ServerAdditions instance;
    
    @Getter
    private FileConfiguration pluginConfig;
    
    // Feature managers
    @Getter
    private InvisibilityManager invisibilityManager;
    @Getter
    private ItemManager itemManager;
    @Getter
    private LifestealManager lifestealManager;
    @Getter
    private ScoreboardManager scoreboardManager;
    @Getter
    private TabManager tabManager;
    @Getter
    private SpawnManager spawnManager;
    @Getter
    private HomeManager homeManager;
    @Getter
    private WarpManager warpManager;
    @Getter
    private CombatManager combatManager;
    @Getter
    private EconomyManager economyManager;
    @Getter
    private WorldManager worldManager;
    
    // Data storage
    @Getter
    private final Map<UUID, Integer> deathCounts = new HashMap<>();
    @Getter
    private final Map<UUID, Integer> killCounts = new HashMap<>();
    @Getter
    private final Map<UUID, Long> lastTeleport = new HashMap<>();
    @Getter
    private final Map<UUID, String> lastMessage = new HashMap<>();

    @Override
    public void onEnable() {
        instance = this;
        
        saveDefaultConfig();
        reloadConfig();
        pluginConfig = getConfig();
        
        initializeFeatures();
        registerCommands();
        registerListeners();
        startTasks();
        
        log.info("ServerAdditions v" + getDescription().getVersion() + " enabled successfully!");
        log.info("Active features: " + getActiveFeatures());
    }

    @Override
    public void onDisable() {
        saveData();
        
        if (scoreboardManager != null) scoreboardManager.cleanup();
        if (tabManager != null) tabManager.cleanup();
        
        log.info("ServerAdditions disabled!");
    }
    
    private void initializeFeatures() {
        if (pluginConfig.getBoolean("invisibility.enabled", true)) {
            invisibilityManager = new InvisibilityManager(this);
        }
        
        if (pluginConfig.getBoolean("items.enabled", true)) {
            itemManager = new ItemManager(this);
        }
        
        if (pluginConfig.getBoolean("lifesteal.enabled", false)) {
            lifestealManager = new LifestealManager(this);
        }
        
        if (pluginConfig.getBoolean("scoreboard.enabled", true)) {
            scoreboardManager = new ScoreboardManager(this);
        }
        
        if (pluginConfig.getBoolean("tab.enabled", true)) {
            tabManager = new TabManager(this);
        }
        
        if (pluginConfig.getBoolean("spawn.teleport.enabled", true) || 
            pluginConfig.getBoolean("spawn.protection.enabled", true)) {
            spawnManager = new SpawnManager(this);
        }
        
        if (pluginConfig.getBoolean("teleport.homes.enabled", false)) {
            homeManager = new HomeManager(this);
        }
        
        if (pluginConfig.getBoolean("commands.warp", true)) {
            warpManager = new WarpManager(this);
        }
        
        if (pluginConfig.getBoolean("combat.log-prevention.enabled", false) ||
            pluginConfig.getBoolean("combat.indicators.enabled", true)) {
            combatManager = new CombatManager(this);
        }
        
        if (pluginConfig.getBoolean("economy.enabled", false)) {
            economyManager = new EconomyManager(this);
        }
        
        if (pluginConfig.getBoolean("worlds.border.enabled", false) ||
            pluginConfig.getBoolean("worlds.weather.enabled", false) ||
            pluginConfig.getBoolean("worlds.time.enabled", false)) {
            worldManager = new WorldManager(this);
        }
    }
    
    private void registerCommands() {
        getCommand("serveradditions").setExecutor(new ServerAdditionsCommand(this));
        
        if (pluginConfig.getBoolean("commands.rtp", true)) {
            getCommand("rtp").setExecutor(new RtpCommand(this));
        }
        if (pluginConfig.getBoolean("commands.spawn", true)) {
            getCommand("spawn").setExecutor(new SpawnCommand(this));
            getCommand("setspawn").setExecutor(new SetSpawnCommand(this));
        }
        if (pluginConfig.getBoolean("commands.home", true)) {
            getCommand("home").setExecutor(new HomeCommand(this));
            getCommand("sethome").setExecutor(new SetHomeCommand(this));
            getCommand("delhome").setExecutor(new DelHomeCommand(this));
            getCommand("homes").setExecutor(new HomesCommand(this));
        }
        if (pluginConfig.getBoolean("commands.tpa", true)) {
            TpaCommand tpaCmd = new TpaCommand(this);
            getCommand("tpa").setExecutor(tpaCmd);
            getCommand("tpaccept").setExecutor(new TpAcceptCommand(this, tpaCmd.getRequests()));
            getCommand("tpdeny").setExecutor(new TpDenyCommand(this, tpaCmd.getRequests()));
        }
        if (pluginConfig.getBoolean("commands.warp", true)) {
            getCommand("warp").setExecutor(new WarpCommand(this));
            getCommand("setwarp").setExecutor(new SetWarpCommand(this));
            getCommand("delwarp").setExecutor(new DelWarpCommand(this));
            getCommand("warps").setExecutor(new WarpsCommand(this));
        }
        if (pluginConfig.getBoolean("commands.seen", true)) {
            getCommand("seen").setExecutor(new SeenCommand(this));
        }
        if (pluginConfig.getBoolean("commands.invsee", true)) {
            getCommand("invsee").setExecutor(new InvseeCommand(this));
        }
        if (pluginConfig.getBoolean("commands.enderchest", true)) {
            getCommand("enderchest").setExecutor(new EnderchestCommand(this));
        }
        if (pluginConfig.getBoolean("commands.workbench", true)) {
            getCommand("workbench").setExecutor(new WorkbenchCommand(this));
        }
        if (pluginConfig.getBoolean("economy.balance-command", true)) {
            getCommand("balance").setExecutor(new BalanceCommand(this));
        }
        if (pluginConfig.getBoolean("economy.pay-command", true)) {
            getCommand("pay").setExecutor(new PayCommand(this));
        }
        if (pluginConfig.getBoolean("lifesteal.enabled", false)) {
            getCommand("hearts").setExecutor(new HeartsCommand(this));
        }
    }
    
    private void registerListeners() {
        getServer().getPluginManager().registerEvents(new PlayerListener(this), this);
        
        if (invisibilityManager != null) {
            getServer().getPluginManager().registerEvents(invisibilityManager, this);
        }
        if (itemManager != null) {
            getServer().getPluginManager().registerEvents(itemManager, this);
        }
        if (lifestealManager != null) {
            getServer().getPluginManager().registerEvents(lifestealManager, this);
        }
        if (combatManager != null) {
            getServer().getPluginManager().registerEvents(combatManager, this);
        }
        if (spawnManager != null) {
            getServer().getPluginManager().registerEvents(spawnManager, this);
        }
    }
    
    private void startTasks() {
        int saveInterval = pluginConfig.getInt("core.auto-save-interval", 10);
        if (saveInterval > 0) {
            new BukkitRunnable() {
                @Override
                public void run() {
                    saveData();
                }
            }.runTaskTimer(this, saveInterval * 1200L, saveInterval * 1200L);
        }
        
        if (scoreboardManager != null) {
            scoreboardManager.startTask();
        }
        
        if (tabManager != null) {
            tabManager.startTask();
        }
    }
    
    public void reload() {
        reloadConfig();
        pluginConfig = getConfig();
        initializeFeatures();
        log.info("Configuration reloaded!");
    }
    
    public void saveData() {
        deathCounts.forEach((uuid, count) -> 
            getConfig().set("data.deaths." + uuid.toString(), count));
        killCounts.forEach((uuid, count) -> 
            getConfig().set("data.kills." + uuid.toString(), count));
        
        if (homeManager != null) homeManager.save();
        if (warpManager != null) warpManager.save();
        if (lifestealManager != null) lifestealManager.save();
        
        saveConfig();
    }
    
    public void loadData() {
        if (getConfig().contains("data.deaths")) {
            getConfig().getConfigurationSection("data.deaths").getKeys(false).forEach(key -> {
                try {
                    deathCounts.put(UUID.fromString(key), getConfig().getInt("data.deaths." + key));
                } catch (IllegalArgumentException ignored) {}
            });
        }
        if (getConfig().contains("data.kills")) {
            getConfig().getConfigurationSection("data.kills").getKeys(false).forEach(key -> {
                try {
                    killCounts.put(UUID.fromString(key), getConfig().getInt("data.kills." + key));
                } catch (IllegalArgumentException ignored) {}
            });
        }
    }
    
    private String getActiveFeatures() {
        StringBuilder sb = new StringBuilder();
        if (invisibilityManager != null) sb.append("Invisibility ");
        if (itemManager != null) sb.append("Items ");
        if (lifestealManager != null) sb.append("Lifesteal ");
        if (scoreboardManager != null) sb.append("Scoreboard ");
        if (tabManager != null) sb.append("Tab ");
        if (homeManager != null) sb.append("Homes ");
        if (economyManager != null) sb.append("Economy ");
        return sb.toString().trim();
    }
    
    public void logDebug(String message) {
        if (pluginConfig.getBoolean("core.debug", false)) {
            log.info("[DEBUG] " + message);
        }
    }
    
    public void logError(String message) {
        log.severe(message);
    }
    
    public String colorize(String message) {
        return ChatColor.translateAlternateColorCodes('&', message);
    }
}
