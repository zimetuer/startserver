package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class EnderchestCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public EnderchestCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        if (args.length > 0 && player.hasPermission("serveradditions.admin")) {
            Player target = Bukkit.getPlayer(args[0]);
            if (target != null) {
                player.openInventory(target.getEnderChest());
                player.sendMessage(plugin.colorize("&a» Otwieranie enderchest gracza &f" + target.getName()));
                return true;
            }
        }

        player.openInventory(player.getEnderChest());
        
        return true;
    }
}
