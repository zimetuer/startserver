package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class PweatherCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public PweatherCommand(ServerAdditions plugin) {
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
            player.sendMessage(plugin.colorize("&cUsage: /pweather [clear|rain|reset]"));
            return true;
        }

        String arg = args[0].toLowerCase();
        
        switch (arg) {
            case "clear":
            case "sun":
                player.setPlayerWeather(org.bukkit.WeatherType.CLEAR);
                player.sendMessage(plugin.colorize("&aPersonal weather set to clear!"));
                break;
            case "rain":
            case "storm":
                player.setPlayerWeather(org.bukkit.WeatherType.DOWNFALL);
                player.sendMessage(plugin.colorize("&aPersonal weather set to rain!"));
                break;
            case "reset":
                player.resetPlayerWeather();
                player.sendMessage(plugin.colorize("&aPersonal weather reset!"));
                break;
            default:
                player.sendMessage(plugin.colorize("&cUsage: /pweather [clear|rain|reset]"));
        }
        
        return true;
    }
}
