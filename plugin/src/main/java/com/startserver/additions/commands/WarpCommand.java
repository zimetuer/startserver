package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Location;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class WarpCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public WarpCommand(ServerAdditions plugin) {
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
            player.sendMessage(plugin.colorize("&c» Użycie: /warp <nazwa>"));
            return true;
        }

        Location warp = plugin.getWarpManager().getWarp(args[0]);
        if (warp == null) {
            player.sendMessage(plugin.colorize("&c» Warp '&f" + args[0] + "&c' nie istnieje!"));
            return true;
        }

        player.teleport(warp);
        player.sendMessage(plugin.colorize("&a» Przeteleportowano do warpu '&f" + args[0] + "&a'!"));
        
        return true;
    }
}
