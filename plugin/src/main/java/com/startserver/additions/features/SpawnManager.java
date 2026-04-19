package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Location;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.block.BlockBreakEvent;
import org.bukkit.event.block.BlockPlaceEvent;

import java.io.File;
import java.io.IOException;

public class SpawnManager implements Listener {

    private final ServerAdditions plugin;
    private final File dataFile;
    private FileConfiguration data;
    private Location spawnLocation;

    public SpawnManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.dataFile = new File(plugin.getDataFolder(), "spawn.yml");
        load();
    }

    public void load() {
        if (!dataFile.exists()) {
            try {
                dataFile.createNewFile();
            } catch (IOException e) {
                plugin.logError("Failed to create spawn.yml: " + e.getMessage());
                return;
            }
        }
        
        data = YamlConfiguration.loadConfiguration(dataFile);
        
        if (data.contains("spawn")) {
            spawnLocation = data.getLocation("spawn");
        }
    }

    public void save() {
        if (spawnLocation != null) {
            data.set("spawn", spawnLocation);
            try {
                data.save(dataFile);
            } catch (IOException e) {
                plugin.logError("Failed to save spawn.yml: " + e.getMessage());
            }
        }
    }

    public void setSpawn(Location location) {
        this.spawnLocation = location;
        save();
    }

    public Location getSpawn() {
        if (spawnLocation != null) {
            return spawnLocation;
        }
        
        // Default to world spawn
        org.bukkit.World world = plugin.getServer().getWorlds().get(0);
        return world != null ? world.getSpawnLocation() : null;
    }

    public boolean isSet() {
        return spawnLocation != null;
    }

    @EventHandler
    public void onBlockBreak(BlockBreakEvent event) {
        if (!plugin.getConfig().getBoolean("spawn.protection.enabled", true)) return;
        if (event.getPlayer().hasPermission("serveradditions.admin")) return;
        
        Location spawn = getSpawn();
        if (spawn == null) return;
        
        double distance = event.getBlock().getLocation().distance(spawn);
        int radius = plugin.getConfig().getInt("spawn.protection.radius", 50);
        
        if (distance <= radius) {
            event.setCancelled(true);
            event.getPlayer().sendMessage(plugin.colorize(plugin.getConfig().getString("spawn.protection.message", "&c» Nie możesz budować blisko spawnu!")));
        }
    }

    @EventHandler
    public void onBlockPlace(BlockPlaceEvent event) {
        if (!plugin.getConfig().getBoolean("spawn.protection.enabled", true)) return;
        if (event.getPlayer().hasPermission("serveradditions.admin")) return;
        
        Location spawn = getSpawn();
        if (spawn == null) return;
        
        double distance = event.getBlock().getLocation().distance(spawn);
        int radius = plugin.getConfig().getInt("spawn.protection.radius", 50);
        
        if (distance <= radius) {
            event.setCancelled(true);
            event.getPlayer().sendMessage(plugin.colorize(plugin.getConfig().getString("spawn.protection.message", "&c» Nie możesz budować blisko spawnu!")));
        }
    }
}
