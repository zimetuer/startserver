package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class BalanceCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public BalanceCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        Player target;
        
        if (args.length > 0 && sender.hasPermission("serveradditions.admin")) {
            target = Bukkit.getPlayer(args[0]);
            if (target == null) {
                sender.sendMessage(plugin.colorize("&c» Gracz nieznaleziony!"));
                return true;
            }
        } else if (sender instanceof Player) {
            target = (Player) sender;
        } else {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        double balance = plugin.getEconomyManager().getBalance(target);
        if (sender.equals(target)) {
            sender.sendMessage(plugin.colorize("&a» Twój stan konta: &f" + plugin.getEconomyManager().format(balance)));
        } else {
            sender.sendMessage(plugin.colorize("&f» " + target.getName() + "&a ma: &f" + plugin.getEconomyManager().format(balance)));
        }
        
        return true;
    }
}
