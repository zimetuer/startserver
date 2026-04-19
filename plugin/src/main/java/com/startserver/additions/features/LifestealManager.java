package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Bukkit;
import org.bukkit.Material;
import org.bukkit.attribute.Attribute;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageEvent;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerItemConsumeEvent;
import org.bukkit.inventory.ItemStack;
import org.bukkit.inventory.meta.ItemMeta;
import org.bukkit.potion.PotionEffect;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.scheduler.BukkitRunnable;

import java.io.File;
import java.io.IOException;
import java.util.*;

public class LifestealManager implements Listener {

    private final ServerAdditions plugin;
    private final File dataFile;
    private FileConfiguration data;
    private final Map<UUID, Integer> playerHearts;
    private final Map<UUID, Integer> playerLevels;
    private final Map<UUID, Long> lastStandPlayers;
    private final Map<UUID, BukkitRunnable> lastStandTasks;
    private final Set<UUID> inLastStand;
    
    private final int maxHearts;
    private final int minHearts;
    private final int heartsPerKill;
    private final int heartsLostOnDeath;
    private final int levelsPerHeart;
    private final int lastStandDuration;
    private final boolean lastStandEnabled;
    private final double goldenAppleBaseHeal;

    public LifestealManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.playerHearts = new HashMap<>();
        this.playerLevels = new HashMap<>();
        this.lastStandPlayers = new HashMap<>();
        this.lastStandTasks = new HashMap<>();
        this.inLastStand = new HashSet<>();
        this.dataFile = new File(plugin.getDataFolder(), "lifesteal.yml");
        
        // Config values
        this.maxHearts = plugin.getConfig().getInt("lifesteal.max-hearts", 20);
        this.minHearts = plugin.getConfig().getInt("lifesteal.min-hearts", 1);
        this.heartsPerKill = plugin.getConfig().getInt("lifesteal.hearts-per-kill", 1);
        this.heartsLostOnDeath = plugin.getConfig().getInt("lifesteal.hearts-lost-on-death", 1);
        this.levelsPerHeart = plugin.getConfig().getInt("lifesteal.levels-per-heart", 5);
        this.lastStandEnabled = plugin.getConfig().getBoolean("lifesteal.last-stand.enabled", true);
        this.lastStandDuration = plugin.getConfig().getInt("lifesteal.last-stand.duration-seconds", 5);
        this.goldenAppleBaseHeal = plugin.getConfig().getDouble("lifesteal.golden-apple.base-heal", 2.0);
        
        load();
    }

    public void load() {
        if (!dataFile.exists()) {
            try {
                dataFile.createNewFile();
            } catch (IOException e) {
                plugin.logError("Failed to create lifesteal.yml: " + e.getMessage());
                return;
            }
        }
        
        data = YamlConfiguration.loadConfiguration(dataFile);
        
        for (String uuidStr : data.getKeys(false)) {
            try {
                UUID uuid = UUID.fromString(uuidStr);
                playerHearts.put(uuid, data.getInt(uuidStr + ".hearts", 10));
                playerLevels.put(uuid, data.getInt(uuidStr + ".level", 0));
            } catch (IllegalArgumentException ignored) {}
        }
    }

    public void save() {
        for (Map.Entry<UUID, Integer> entry : playerHearts.entrySet()) {
            String uuid = entry.getKey().toString();
            data.set(uuid + ".hearts", entry.getValue());
            data.set(uuid + ".level", playerLevels.getOrDefault(entry.getKey(), 0));
        }
        
        try {
            data.save(dataFile);
        } catch (IOException e) {
            plugin.logError("Failed to save lifesteal.yml: " + e.getMessage());
        }
    }

    @EventHandler(priority = EventPriority.HIGH)
    public void onEntityDamage(EntityDamageEvent event) {
        if (!(event.getEntity() instanceof Player)) return;
        Player player = (Player) event.getEntity();
        
        // Check if player would die
        double finalHealth = player.getHealth() - event.getFinalDamage();
        
        if (finalHealth <= 0 && !inLastStand.contains(player.getUniqueId()) && lastStandEnabled) {
            // Check if player has more than min hearts to trigger last stand
            int hearts = getHearts(player);
            if (hearts > minHearts) {
                event.setCancelled(true);
                triggerLastStand(player);
            }
        }
    }

    private void triggerLastStand(Player player) {
        UUID uuid = player.getUniqueId();
        inLastStand.add(uuid);
        lastStandPlayers.put(uuid, System.currentTimeMillis());
        
        // Set player to 0.5 HP (half a heart)
        player.setHealth(1.0);
        
        // Visual and audio effects
        player.sendTitle(
            plugin.colorize("&c&lOSTATNI KRZYK"),
            plugin.colorize("&7Przetrwaj " + lastStandDuration + " sekund!"),
            10, lastStandDuration * 20, 10
        );
        player.playSound(player.getLocation(), org.bukkit.Sound.BLOCK_NOTE_BLOCK_PLING, 1.0f, 0.5f);
        
        // Give slowness and weakness
        player.addPotionEffect(new PotionEffect(PotionEffectType.SLOW, lastStandDuration * 20, 2, false, false));
        player.addPotionEffect(new PotionEffect(PotionEffectType.WEAKNESS, lastStandDuration * 20, 4, false, false));
        
        // Start countdown task
        BukkitRunnable task = new BukkitRunnable() {
            int remaining = lastStandDuration;
            
            @Override
            public void run() {
                if (!player.isOnline()) {
                    cancelLastStand(player);
                    return;
                }
                
                remaining--;
                
                if (remaining <= 0 || player.getHealth() > 1.0) {
                    // Survived!
                    cancelLastStand(player);
                    player.sendMessage(plugin.colorize("&a&l» Przetrwałeś Ostatni Krzyk!"));
                    player.playSound(player.getLocation(), org.bukkit.Sound.ENTITY_PLAYER_LEVELUP, 1.0f, 1.0f);
                    
                    // Remove one heart as penalty
                    int currentHearts = getHearts(player);
                    setHearts(player, Math.max(minHearts, currentHearts - 1));
                    player.sendMessage(plugin.colorize("&c» Straciłeś 1 serce jako karę!"));
                } else {
                    // Still counting down
                    player.sendMessage(plugin.colorize("&c&l» " + remaining + "..."));
                    player.playSound(player.getLocation(), org.bukkit.Sound.BLOCK_NOTE_BLOCK_HAT, 0.5f, 0.5f);
                }
            }
        };
        
        task.runTaskTimer(plugin, 20L, 20L);
        lastStandTasks.put(uuid, task);
    }

    public void cancelLastStand(Player player) {
        UUID uuid = player.getUniqueId();
        inLastStand.remove(uuid);
        lastStandPlayers.remove(uuid);
        
        if (lastStandTasks.containsKey(uuid)) {
            lastStandTasks.get(uuid).cancel();
            lastStandTasks.remove(uuid);
        }
    }

    @EventHandler
    public void onPlayerDeath(PlayerDeathEvent event) {
        Player victim = event.getEntity();
        Player killer = victim.getKiller();
        
        // Cancel any active last stand
        cancelLastStand(victim);
        
        // Victim loses hearts
        int victimHearts = getHearts(victim);
        victimHearts = Math.max(minHearts, victimHearts - heartsLostOnDeath);
        setHearts(victim, victimHearts);
        
        // Killer gains hearts and XP
        if (killer != null && !killer.equals(victim)) {
            int killerHearts = getHearts(killer);
            killerHearts = Math.min(maxHearts, killerHearts + heartsPerKill);
            setHearts(killer, killerHearts);
            
            // Add level progress
            addLevelProgress(killer, 1);
        }
    }

    @EventHandler
    public void onGoldenAppleEat(PlayerItemConsumeEvent event) {
        if (!(event.getPlayer() instanceof Player)) return;
        
        ItemStack item = event.getItem();
        if (item.getType() != Material.GOLDEN_APPLE && item.getType() != Material.ENCHANTED_GOLDEN_APPLE) {
            return;
        }
        
        Player player = event.getPlayer();
        int level = getPlayerLevel(player);
        
        // Scale healing with level
        double healAmount = goldenAppleBaseHeal + (level * 0.5);
        
        // Apply extra healing after the default effect
        Bukkit.getScheduler().runTaskLater(plugin, () -> {
            double newHealth = Math.min(player.getHealth() + healAmount, player.getMaxHealth());
            player.setHealth(newHealth);
            player.sendMessage(plugin.colorize("&a» Złote jabłko dodatkowo uleczyło &c" + healAmount + " &aserc dzięki twojemu poziomowi!"));
        }, 1L);
    }

    public void addLevelProgress(Player player, int amount) {
        UUID uuid = player.getUniqueId();
        int currentLevel = playerLevels.getOrDefault(uuid, 0);
        int newLevel = currentLevel + amount;
        
        // Check if earned a heart from levels
        int heartsFromLevels = newLevel / levelsPerHeart;
        int oldHeartsFromLevels = currentLevel / levelsPerHeart;
        
        if (heartsFromLevels > oldHeartsFromLevels) {
            // Earned a new heart!
            int currentHearts = getHearts(player);
            if (currentHearts < maxHearts) {
                setHearts(player, Math.min(maxHearts, currentHearts + 1));
                player.sendMessage(plugin.colorize("&6&l» POZIOM WZOROSŁ! &aZdobyłeś serce za osiągnięcie poziomu " + newLevel + "!"));
                player.playSound(player.getLocation(), org.bukkit.Sound.ENTITY_PLAYER_LEVELUP, 1.0f, 1.5f);
            }
        }
        
        playerLevels.put(uuid, newLevel);
    }

    public int getPlayerLevel(Player player) {
        return playerLevels.getOrDefault(player.getUniqueId(), 0);
    }

    public void setPlayerLevel(Player player, int level) {
        playerLevels.put(player.getUniqueId(), level);
    }

    public int getHearts(Player player) {
        return playerHearts.getOrDefault(player.getUniqueId(), 10);
    }

    public void setHearts(Player player, int hearts) {
        playerHearts.put(player.getUniqueId(), hearts);
        
        // Apply to player health attribute
        double maxHealth = hearts * 2;
        Objects.requireNonNull(player.getAttribute(Attribute.GENERIC_MAX_HEALTH)).setBaseValue(maxHealth);
        if (player.getHealth() > maxHealth) {
            player.setHealth(maxHealth);
        }
    }

    public boolean withdrawHeart(Player player) {
        int currentHearts = getHearts(player);
        if (currentHearts <= minHearts) {
            return false;
        }
        
        // Remove one heart
        setHearts(player, currentHearts - 1);
        
        // Give heart item
        ItemStack heartItem = createHeartItem();
        player.getInventory().addItem(heartItem);
        
        return true;
    }

    public boolean depositHeart(Player player) {
        // Check if player has heart item
        ItemStack heartItem = createHeartItem();
        if (!player.getInventory().containsAtLeast(heartItem, 1)) {
            return false;
        }
        
        // Remove heart item
        player.getInventory().removeItem(heartItem);
        
        // Add one heart
        int currentHearts = getHearts(player);
        if (currentHearts < maxHearts) {
            setHearts(player, currentHearts + 1);
        }
        
        return true;
    }

    public ItemStack createHeartItem() {
        ItemStack heart = new ItemStack(Material.RED_DYE);
        ItemMeta meta = heart.getItemMeta();
        if (meta != null) {
            meta.setDisplayName(plugin.colorize("&c&l❤ Serce"));
            List<String> lore = new ArrayList<>();
            lore.add(plugin.colorize("&7» Kliknij prawym aby użyć"));
            lore.add(plugin.colorize("&7» Dodaje 1 serce po wpłaceniu"));
            meta.setLore(lore);
            heart.setItemMeta(meta);
        }
        return heart;
    }

    public boolean isInLastStand(Player player) {
        return inLastStand.contains(player.getUniqueId());
    }

    public int getMaxHearts() { return maxHearts; }
    public int getMinHearts() { return minHearts; }
    public int getLevelsPerHeart() { return levelsPerHeart; }
}
