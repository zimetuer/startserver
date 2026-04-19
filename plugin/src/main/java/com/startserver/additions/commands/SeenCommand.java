package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Bukkit;
import org.bukkit.OfflinePlayer;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;

public class SeenCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public SeenCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (args.length == 0) {
            sender.sendMessage(plugin.colorize("&c» Użycie: /seen <gracz>"));
            return true;
        }

        OfflinePlayer target = Bukkit.getOfflinePlayer(args[0]);
        
        if (target.isOnline()) {
            sender.sendMessage(plugin.colorize("&f» " + target.getName() + " &ajest online!"));
        } else if (target.hasPlayedBefore()) {
            long lastSeen = target.getLastPlayed();
            long diff = System.currentTimeMillis() - lastSeen;
            
            String timeAgo;
            long days = diff / (1000 * 60 * 60 * 24);
            long hours = (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60);
            long minutes = (diff % (1000 * 60 * 60)) / (1000 * 60);
            
            if (days > 0) {
                timeAgo = days + " dni, " + hours + " godzin temu";
            } else if (hours > 0) {
                timeAgo = hours + " godzin, " + minutes + " minut temu";
            } else {
                timeAgo = minutes + " minut temu";
            }
            
            sender.sendMessage(plugin.colorize("&f» " + target.getName() + " &7był ostatnio online &f" + timeAgo));
        } else {
            sender.sendMessage(plugin.colorize("&c» Gracz nieznaleziony!"));
        }
        
        return true;
    }
}
