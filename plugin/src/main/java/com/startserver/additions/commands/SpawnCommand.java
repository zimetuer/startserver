package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Location;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class SpawnCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public SpawnCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        Location spawn = plugin.getSpawnManager().getSpawn();
        
        if (spawn == null) {
            player.sendMessage(plugin.colorize("&c» Spawn nie jest ustawiony!"));
            return true;
        }

        // Check cooldown
        int cooldown = plugin.getConfig().getInt("spawn.teleport.cooldown", 30);
        if (plugin.getLastTeleport().containsKey(player.getUniqueId())) {
            long remaining = (plugin.getLastTeleport().get(player.getUniqueId()) + cooldown * 1000 - System.currentTimeMillis()) / 1000;
            if (remaining > 0) {
                player.sendMessage(plugin.colorize("&c» Cooldown: " + remaining + " sekund"));
                return true;
            }
        }

        player.teleport(spawn);
        player.sendMessage(plugin.colorize("&a» Przeteleportowano na spawn!"));
        plugin.getLastTeleport().put(player.getUniqueId(), System.currentTimeMillis());
        
        return true;
    }
}
