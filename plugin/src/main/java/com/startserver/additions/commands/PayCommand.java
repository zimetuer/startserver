package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class PayCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public PayCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        if (args.length < 2) {
            player.sendMessage(plugin.colorize("&c» Użycie: /pay <gracz> <kwota>"));
            return true;
        }

        Player target = Bukkit.getPlayer(args[0]);
        if (target == null) {
            player.sendMessage(plugin.colorize("&c» Gracz nieznaleziony!"));
            return true;
        }

        double amount;
        try {
            amount = Double.parseDouble(args[1]);
        } catch (NumberFormatException e) {
            player.sendMessage(plugin.colorize("&c» Nieprawidłowa kwota!"));
            return true;
        }

        if (amount <= 0) {
            player.sendMessage(plugin.colorize("&c» Kwota musi być dodatnia!"));
            return true;
        }

        if (plugin.getEconomyManager().transfer(player, target, amount)) {
            player.sendMessage(plugin.colorize("&a» Przekazano &f" + plugin.getEconomyManager().format(amount) + " &adla &f" + target.getName()));
            target.sendMessage(plugin.colorize("&a» Otrzymałeś &f" + plugin.getEconomyManager().format(amount) + " &aod &f" + player.getName()));
        } else {
            player.sendMessage(plugin.colorize("&c» Nie masz wystarczająco pieniędzy!"));
        }
        
        return true;
    }
}
