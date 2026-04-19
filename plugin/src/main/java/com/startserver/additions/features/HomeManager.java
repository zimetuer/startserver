package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import lombok.Getter;
import org.bukkit.Location;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class HomeManager {

    private final ServerAdditions plugin;
    private File dataFile;
    private FileConfiguration data;
    
    @Getter
    private final Map<UUID, Location> homes = new HashMap<>();
    
    @Getter
    private final int maxHomes = 1;

    public HomeManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.dataFile = new File(plugin.getDataFolder(), "homes.yml");
        load();
    }

    public void load() {
        if (!dataFile.exists()) {
            try {
                dataFile.createNewFile();
            } catch (IOException e) {
                plugin.logError("Failed to create homes.yml: " + e.getMessage());
                return;
            }
        }
        
        data = YamlConfiguration.loadConfiguration(dataFile);
        
        data.getKeys(false).forEach(uuidStr -> {
            try {
                UUID uuid = UUID.fromString(uuidStr);
                Location loc = data.getLocation(uuidStr);
                if (loc != null) {
                    homes.put(uuid, loc);
                }
            } catch (IllegalArgumentException ignored) {}
        });
    }

    public void save() {
        homes.forEach((uuid, loc) -> data.set(uuid.toString(), loc));
        
        try {
            data.save(dataFile);
        } catch (IOException e) {
            plugin.logError("Failed to save homes.yml: " + e.getMessage());
        }
    }

    public boolean setHome(org.bukkit.entity.Player player, String name) {
        homes.put(player.getUniqueId(), player.getLocation());
        return true;
    }

    public Location getHome(org.bukkit.entity.Player player, String name) {
        return homes.get(player.getUniqueId());
    }

    public boolean deleteHome(org.bukkit.entity.Player player, String name) {
        return homes.remove(player.getUniqueId()) != null;
    }

    public java.util.Set<String> getHomes(org.bukkit.entity.Player player) {
        java.util.Set<String> result = new java.util.HashSet<>();
        if (homes.containsKey(player.getUniqueId())) {
            result.add("home");
        }
        return result;
    }

    public int getHomeCount(org.bukkit.entity.Player player) {
        return homes.containsKey(player.getUniqueId()) ? 1 : 0;
    }

    public boolean hasHome(org.bukkit.entity.Player player) {
        return homes.containsKey(player.getUniqueId());
    }
}
