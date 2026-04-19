package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;

public class ServerAdditionsCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public ServerAdditionsCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(plugin.colorize("&6» ServerAdditions &7v" + plugin.getDescription().getVersion()));
            sender.sendMessage(plugin.colorize("&7» Użyj &f/sa reload &7aby przeładować config"));
            return true;
        }

        if (args[0].equalsIgnoreCase("reload")) {
            if (!sender.hasPermission("serveradditions.admin")) {
                sender.sendMessage(plugin.colorize("&c» Nie masz uprawnień!"));
                return true;
            }
            plugin.reload();
            sender.sendMessage(plugin.colorize("&a» Konfiguracja przeładowana!"));
            return true;
        }

        return true;
    }
}
