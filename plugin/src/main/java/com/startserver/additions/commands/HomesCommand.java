package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class HomesCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public HomesCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        if (plugin.getHomeManager().hasHome(player)) {
            player.sendMessage(plugin.colorize("&a» Masz ustawiony 1 dom. Użyj /home aby się teleportować."));
        } else {
            player.sendMessage(plugin.colorize("&c» Nie masz ustawionego domu! Użyj /sethome"));
        }
        
        return true;
    }
}
