package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class DelWarpCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public DelWarpCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        if (args.length == 0) {
            player.sendMessage(plugin.colorize("&c» Użycie: /delwarp <nazwa>"));
            return true;
        }

        if (plugin.getWarpManager().deleteWarp(args[0])) {
            player.sendMessage(plugin.colorize("&a» Warp '&f" + args[0] + "&a' usunięty!"));
        } else {
            player.sendMessage(plugin.colorize("&c» Warp '&f" + args[0] + "&c' nie istnieje!"));
        }
        
        return true;
    }
}
