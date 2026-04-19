package com.startserver.additions.listeners;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Location;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.PlayerDeathEvent;
import org.bukkit.event.player.PlayerJoinEvent;
import org.bukkit.event.player.PlayerQuitEvent;

public class PlayerListener implements Listener {

    private final ServerAdditions plugin;

    public PlayerListener(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @EventHandler
    public void onJoin(PlayerJoinEvent event) {
        Player player = event.getPlayer();
        
        // Initialize scoreboard
        if (plugin.getScoreboardManager() != null) {
            plugin.getScoreboardManager().updateScoreboard(player);
        }
        
        // Load lifesteal hearts
        if (plugin.getLifestealManager() != null) {
            plugin.getLifestealManager().setHearts(player, plugin.getLifestealManager().getHearts(player));
        }
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        // Cleanup
    }

    @EventHandler
    public void onDeath(PlayerDeathEvent event) {
        Player player = event.getEntity();
        
        // Track deaths
        plugin.getDeathCounts().put(player.getUniqueId(), 
            plugin.getDeathCounts().getOrDefault(player.getUniqueId(), 0) + 1);
        
        // Track kills
        Player killer = player.getKiller();
        if (killer != null && !killer.equals(player)) {
            plugin.getKillCounts().put(killer.getUniqueId(), 
                plugin.getKillCounts().getOrDefault(killer.getUniqueId(), 0) + 1);
        }
    }
}
