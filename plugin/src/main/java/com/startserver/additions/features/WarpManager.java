package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Location;
import org.bukkit.configuration.file.FileConfiguration;
import org.bukkit.configuration.file.YamlConfiguration;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

public class WarpManager {

    private final ServerAdditions plugin;
    private final File dataFile;
    private FileConfiguration data;
    private final Map<String, Location> warps;

    public WarpManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.warps = new HashMap<>();
        this.dataFile = new File(plugin.getDataFolder(), "warps.yml");
        load();
    }

    public void load() {
        if (!dataFile.exists()) {
            try {
                dataFile.createNewFile();
            } catch (IOException e) {
                plugin.logError("Failed to create warps.yml: " + e.getMessage());
                return;
            }
        }
        
        data = YamlConfiguration.loadConfiguration(dataFile);
        
        for (String warpName : data.getKeys(false)) {
            Location loc = data.getLocation(warpName);
            if (loc != null) {
                warps.put(warpName.toLowerCase(), loc);
            }
        }
    }

    public void save() {
        for (Map.Entry<String, Location> entry : warps.entrySet()) {
            data.set(entry.getKey(), entry.getValue());
        }
        
        try {
            data.save(dataFile);
        } catch (IOException e) {
            plugin.logError("Failed to save warps.yml: " + e.getMessage());
        }
    }

    public boolean setWarp(String name, Location location) {
        warps.put(name.toLowerCase(), location);
        return true;
    }

    public Location getWarp(String name) {
        return warps.get(name.toLowerCase());
    }

    public boolean deleteWarp(String name) {
        return warps.remove(name.toLowerCase()) != null;
    }

    public Set<String> getWarps() {
        return warps.keySet();
    }

    public boolean warpExists(String name) {
        return warps.containsKey(name.toLowerCase());
    }
}
