package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Location;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class HomeCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public HomeCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        Location home = plugin.getHomeManager().getHome(player, "home");
        if (home == null) {
            player.sendMessage(plugin.colorize("&c» Nie masz ustawionego domu! Użyj /sethome"));
            return true;
        }

        player.teleport(home);
        player.sendMessage(plugin.colorize("&a» Przeteleportowano do domu!"));
        
        return true;
    }
}
