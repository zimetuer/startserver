package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class PtimeCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public PtimeCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&cOnly players can use this command!"));
            return true;
        }

        Player player = (Player) sender;
        
        if (args.length == 0) {
            player.sendMessage(plugin.colorize("&cUsage: /ptime [day|night|reset|<time>]"));
            return true;
        }

        String arg = args[0].toLowerCase();
        
        switch (arg) {
            case "day":
                player.setPlayerTime(1000, false);
                player.sendMessage(plugin.colorize("&aPersonal time set to day!"));
                break;
            case "night":
                player.setPlayerTime(13000, false);
                player.sendMessage(plugin.colorize("&aPersonal time set to night!"));
                break;
            case "reset":
                player.resetPlayerTime();
                player.sendMessage(plugin.colorize("&aPersonal time reset!"));
                break;
            default:
                try {
                    long time = Long.parseLong(arg);
                    player.setPlayerTime(time, false);
                    player.sendMessage(plugin.colorize("&aPersonal time set to &f" + time));
                } catch (NumberFormatException e) {
                    player.sendMessage(plugin.colorize("&cInvalid time!"));
                }
        }
        
        return true;
    }
}
