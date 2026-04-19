package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import lombok.Getter;
import org.bukkit.Bukkit;
import org.bukkit.ChatColor;
import org.bukkit.entity.Player;
import org.bukkit.scoreboard.*;

import java.util.List;

public class ScoreboardManager {

    private final ServerAdditions plugin;
    
    @Getter
    private final boolean enabled;
    private final String title;
    private final List<String> lines;
    private final long updateInterval;

    public ScoreboardManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.enabled = plugin.getPluginConfig().getBoolean("scoreboard.enabled", true);
        this.title = plugin.colorize(plugin.getPluginConfig().getString("scoreboard.title", "&6&lStats"));
        this.lines = plugin.getPluginConfig().getStringList("scoreboard.lines");
        this.updateInterval = plugin.getPluginConfig().getLong("scoreboard.update-interval", 20L);
    }

    public void startTask() {
        if (!enabled) return;
        
        Bukkit.getScheduler().runTaskTimer(plugin, () -> 
            Bukkit.getOnlinePlayers().forEach(this::updateScoreboard), 0L, updateInterval);
    }

    public void updateScoreboard(Player player) {
        if (!enabled || !plugin.getPluginConfig().getBoolean("scoreboard.default-visible", true)) return;
        
        org.bukkit.scoreboard.ScoreboardManager manager = Bukkit.getScoreboardManager();
        Scoreboard board = manager.getNewScoreboard();
        
        Objective objective = board.registerNewObjective("stats", Criteria.DUMMY, title);
        objective.setDisplaySlot(DisplaySlot.SIDEBAR);
        
        int deaths = plugin.getDeathCounts().getOrDefault(player.getUniqueId(), 0);
        int kills = plugin.getKillCounts().getOrDefault(player.getUniqueId(), 0);
        
        int score = lines.size();
        for (String line : lines) {
            String formatted = line
                .replace("%player%", player.getName())
                .replace("%deaths%", String.valueOf(deaths))
                .replace("%kills%", String.valueOf(kills))
                .replace("%ping%", String.valueOf(player.getPing()));
            objective.getScore(ChatColor.translateAlternateColorCodes('&', formatted)).setScore(score--);
        }
        
        player.setScoreboard(board);
    }

    public void cleanup() {
        Bukkit.getOnlinePlayers().forEach(player -> 
            player.setScoreboard(Bukkit.getScoreboardManager().getNewScoreboard()));
    }
}
