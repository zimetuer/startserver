package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class SetHomeCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public SetHomeCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        boolean hadHome = plugin.getHomeManager().hasHome(player);
        plugin.getHomeManager().setHome(player, "home");
        
        if (hadHome) {
            player.sendMessage(plugin.colorize("&a» Dom zaktualizowany w twojej lokacji!"));
        } else {
            player.sendMessage(plugin.colorize("&a» Dom ustawiony! Użyj /home aby wrócić."));
        }
        
        return true;
    }
}
