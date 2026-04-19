package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Location;
import org.bukkit.World;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class RtpCommand implements CommandExecutor {

    private final ServerAdditions plugin;
    private final Map<UUID, Long> cooldowns;

    public RtpCommand(ServerAdditions plugin) {
        this.plugin = plugin;
        this.cooldowns = new HashMap<>();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        if (!plugin.getConfig().getBoolean("teleport.random.enabled", false)) {
            player.sendMessage(plugin.colorize("&c» Losowy teleport jest wyłączony!"));
            return true;
        }

        // Check cooldown
        int cooldown = plugin.getConfig().getInt("teleport.random.cooldown", 300);
        if (cooldowns.containsKey(player.getUniqueId())) {
            long remaining = (cooldowns.get(player.getUniqueId()) + cooldown * 1000 - System.currentTimeMillis()) / 1000;
            if (remaining > 0) {
                player.sendMessage(plugin.colorize("&c» Cooldown: " + remaining + " sekund"));
                return true;
            }
        }

        // Find random location
        World world = player.getWorld();
        int minDistance = plugin.getConfig().getInt("teleport.random.min-distance", 500);
        int maxDistance = plugin.getConfig().getInt("teleport.random.max-distance", 10000);

        int x = (int) ((Math.random() - 0.5) * 2 * (maxDistance - minDistance));
        int z = (int) ((Math.random() - 0.5) * 2 * (maxDistance - minDistance));
        
        if (x > 0) x += minDistance;
        else x -= minDistance;
        if (z > 0) z += minDistance;
        else z -= minDistance;

        Location loc = world.getHighestBlockAt(x, z).getLocation().add(0.5, 1, 0.5);
        
        player.teleport(loc);
        player.sendMessage(plugin.colorize("&a» Przeteleportowano na losową lokację: &f" + x + ", " + z));
        cooldowns.put(player.getUniqueId(), System.currentTimeMillis());
        
        return true;
    }
}
