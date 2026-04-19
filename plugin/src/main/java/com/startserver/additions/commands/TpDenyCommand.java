package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.Map;
import java.util.UUID;

public class TpDenyCommand implements CommandExecutor {

    private final ServerAdditions plugin;
    private final Map<UUID, UUID> requests;

    public TpDenyCommand(ServerAdditions plugin, Map<UUID, UUID> requests) {
        this.plugin = plugin;
        this.requests = requests;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        if (!requests.containsKey(player.getUniqueId())) {
            player.sendMessage(plugin.colorize("&c» Nie masz oczekujących próśb teleportacji!"));
            return true;
        }

        Player requester = Bukkit.getPlayer(requests.get(player.getUniqueId()));
        requests.remove(player.getUniqueId());
        
        player.sendMessage(plugin.colorize("&c» Odrzuciłeś prośbę teleportacji!"));
        if (requester != null) {
            requester.sendMessage(plugin.colorize("&c» Twoja prośba została odrzucona!"));
        }
        
        return true;
    }
}
