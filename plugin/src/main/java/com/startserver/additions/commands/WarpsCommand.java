package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class WarpsCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public WarpsCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        java.util.Set<String> warps = plugin.getWarpManager().getWarps();
        
        if (warps.isEmpty()) {
            player.sendMessage(plugin.colorize("&c» Nie ma ustawionych warpów!"));
            return true;
        }

        player.sendMessage(plugin.colorize("&a» Dostępne warpy: &f" + String.join(", ", warps)));
        
        return true;
    }
}
