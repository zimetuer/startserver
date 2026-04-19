package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import lombok.Getter;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.potion.PotionEffectType;
import org.bukkit.scheduler.BukkitRunnable;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

public class InvisibilityManager implements Listener {

    @Getter
    private final Set<UUID> hiddenPlayers = new HashSet<>();
    
    private final ServerAdditions plugin;
    private final boolean enabled;
    private final boolean hideParticles;
    private final boolean hideNametag;

    public InvisibilityManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.enabled = plugin.getPluginConfig().getBoolean("invisibility.enabled", true);
        this.hideParticles = plugin.getPluginConfig().getBoolean("invisibility.hide-particles", true);
        this.hideNametag = plugin.getPluginConfig().getBoolean("invisibility.hide-nametag", true);
        startTask();
    }

    private void startTask() {
        new BukkitRunnable() {
            @Override
            public void run() {
                if (!enabled) return;
                
                Bukkit.getOnlinePlayers().forEach(player -> {
                    if (player.hasPotionEffect(PotionEffectType.INVISIBILITY)) {
                        if (!player.hasPermission("serveradditions.invis.bypass")) {
                            hidePlayer(player);
                        }
                    } else {
                        showPlayer(player);
                    }
                });
            }
        }.runTaskTimer(plugin, 0L, 5L);
    }

    private void hidePlayer(Player player) {
        if (hiddenPlayers.contains(player.getUniqueId())) return;
        
        hiddenPlayers.add(player.getUniqueId());
        
        Bukkit.getOnlinePlayers().stream()
            .filter(other -> other != player && !other.hasPermission("serveradditions.invis.bypass"))
            .forEach(other -> other.hidePlayer(plugin, player));
        
        plugin.logDebug("Hiding player: " + player.getName());
    }

    private void showPlayer(Player player) {
        if (!hiddenPlayers.contains(player.getUniqueId())) return;
        
        hiddenPlayers.remove(player.getUniqueId());
        
        Bukkit.getOnlinePlayers().stream()
            .filter(other -> other != player)
            .forEach(other -> other.showPlayer(plugin, player));
        
        plugin.logDebug("Showing player: " + player.getName());
    }

    public boolean isHidden(UUID uuid) {
        return hiddenPlayers.contains(uuid);
    }
}
