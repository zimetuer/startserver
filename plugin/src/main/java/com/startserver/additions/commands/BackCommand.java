package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Location;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class BackCommand implements CommandExecutor {

    private final ServerAdditions plugin;
    private final Map<UUID, Location> lastLocations;

    public BackCommand(ServerAdditions plugin) {
        this.plugin = plugin;
        this.lastLocations = new HashMap<>();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&cOnly players can use this command!"));
            return true;
        }

        Player player = (Player) sender;
        Location lastLoc = lastLocations.get(player.getUniqueId());
        
        if (lastLoc == null) {
            player.sendMessage(plugin.colorize("&cNo previous location!"));
            return true;
        }

        lastLocations.put(player.getUniqueId(), player.getLocation());
        player.teleport(lastLoc);
        player.sendMessage(plugin.colorize("&aTeleported to your previous location!"));
        
        return true;
    }

    public void setLastLocation(Player player, Location loc) {
        lastLocations.put(player.getUniqueId(), loc);
    }
}
