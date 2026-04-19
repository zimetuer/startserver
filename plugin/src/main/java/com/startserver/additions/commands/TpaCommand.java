package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Bukkit;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class TpaCommand implements CommandExecutor {

    private final ServerAdditions plugin;
    private final Map<UUID, UUID> requests;

    public TpaCommand(ServerAdditions plugin) {
        this.plugin = plugin;
        this.requests = new HashMap<>();
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        if (args.length == 0) {
            player.sendMessage(plugin.colorize("&c» Użycie: /tpa <gracz>"));
            return true;
        }

        Player target = Bukkit.getPlayer(args[0]);
        if (target == null) {
            player.sendMessage(plugin.colorize("&c» Gracz nieznaleziony!"));
            return true;
        }

        if (target.equals(player)) {
            player.sendMessage(plugin.colorize("&c» Nie możesz teleportować się do siebie!"));
            return true;
        }

        requests.put(target.getUniqueId(), player.getUniqueId());
        player.sendMessage(plugin.colorize("&a» Wysłano prośbę teleportacji do &f" + target.getName()));
        target.sendMessage(plugin.colorize("&f» " + player.getName() + " &achce się do ciebie teleportować!"));
        target.sendMessage(plugin.colorize("&a» Zaakceptuj &f/tpaccept &alub odrzuć &f/tpdeny"));
        
        return true;
    }

    public Map<UUID, UUID> getRequests() {
        return requests;
    }
}
