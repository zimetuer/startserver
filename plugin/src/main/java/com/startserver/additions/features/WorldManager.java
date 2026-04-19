package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Bukkit;
import org.bukkit.World;
import org.bukkit.WorldBorder;

public class WorldManager {

    private final ServerAdditions plugin;
    private final boolean borderEnabled;
    private final boolean weatherEnabled;
    private final boolean timeEnabled;

    public WorldManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.borderEnabled = plugin.getConfig().getBoolean("worlds.border.enabled", false);
        this.weatherEnabled = plugin.getConfig().getBoolean("worlds.weather.enabled", false);
        this.timeEnabled = plugin.getConfig().getBoolean("worlds.time.enabled", false);
        
        setupWorlds();
    }

    private void setupWorlds() {
        // Setup world border
        if (borderEnabled) {
            int size = plugin.getConfig().getInt("worlds.border.size", 10000);
            int centerX = plugin.getConfig().getInt("worlds.border.center-x", 0);
            int centerZ = plugin.getConfig().getInt("worlds.border.center-z", 0);
            int warningDistance = plugin.getConfig().getInt("worlds.border.warning-distance", 100);
            
            for (World world : Bukkit.getWorlds()) {
                WorldBorder border = world.getWorldBorder();
                border.setCenter(centerX, centerZ);
                border.setSize(size * 2);
                border.setWarningDistance(warningDistance);
            }
        }
        
        // Lock weather
        if (weatherEnabled) {
            String lockedWeather = plugin.getConfig().getString("worlds.weather.locked-weather");
            if (lockedWeather != null) {
                for (World world : Bukkit.getWorlds()) {
                    world.setGameRuleValue("doWeatherCycle", "false");
                    
                    switch (lockedWeather.toUpperCase()) {
                        case "CLEAR":
                            world.setStorm(false);
                            world.setThundering(false);
                            break;
                        case "RAIN":
                            world.setStorm(true);
                            world.setThundering(false);
                            break;
                        case "THUNDER":
                            world.setStorm(true);
                            world.setThundering(true);
                            break;
                    }
                }
            }
        }
        
        // Lock time
        if (timeEnabled) {
            String lockedTime = plugin.getConfig().getString("worlds.time.locked-time");
            if (lockedTime != null) {
                for (World world : Bukkit.getWorlds()) {
                    world.setGameRuleValue("doDaylightCycle", "false");
                    
                    switch (lockedTime.toUpperCase()) {
                        case "DAY":
                            world.setTime(1000);
                            break;
                        case "NIGHT":
                            world.setTime(13000);
                            break;
                    }
                }
            }
        }
    }
}
