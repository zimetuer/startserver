package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import lombok.Getter;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;

import java.util.List;

public class TabManager {

    private final ServerAdditions plugin;
    
    @Getter
    private final boolean enabled;
    private final List<String> header;
    private final List<String> footer;
    private final long updateInterval;

    public TabManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.enabled = plugin.getPluginConfig().getBoolean("tab.enabled", true);
        this.header = plugin.getPluginConfig().getStringList("tab.header");
        this.footer = plugin.getPluginConfig().getStringList("tab.footer");
        this.updateInterval = plugin.getPluginConfig().getLong("tab.update-interval", 40L);
    }

    public void startTask() {
        if (!enabled) return;
        
        Bukkit.getScheduler().runTaskTimer(plugin, () -> 
            Bukkit.getOnlinePlayers().forEach(this::updateTab), 0L, updateInterval);
    }

    public void updateTab(Player player) {
        if (!enabled) return;
        
        String headerStr = String.join("\n", header)
            .replace("%player%", player.getName())
            .replace("%servername%", plugin.getPluginConfig().getString("server-name", "Server"))
            .replace("%online%", String.valueOf(Bukkit.getOnlinePlayers().size()))
            .replace("%max%", String.valueOf(Bukkit.getMaxPlayers()))
            .replace("%ping%", String.valueOf(player.getPing()));
        
        String footerStr = String.join("\n", footer)
            .replace("%player%", player.getName())
            .replace("%servername%", plugin.getPluginConfig().getString("server-name", "Server"))
            .replace("%online%", String.valueOf(Bukkit.getOnlinePlayers().size()))
            .replace("%max%", String.valueOf(Bukkit.getMaxPlayers()))
            .replace("%ping%", String.valueOf(player.getPing()));
        
        player.setPlayerListHeaderFooter(
            plugin.colorize(headerStr),
            plugin.colorize(footerStr)
        );
    }

    public void cleanup() {
        Bukkit.getOnlinePlayers().forEach(player -> player.setPlayerListHeaderFooter("", ""));
    }
}
