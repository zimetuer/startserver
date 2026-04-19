package com.startserver.additions.commands;

import com.startserver.additions.ServerAdditions;
import org.bukkit.command.Command;
import org.bukkit.command.CommandExecutor;
import org.bukkit.command.CommandSender;
import org.bukkit.entity.Player;

public class HeartsCommand implements CommandExecutor {

    private final ServerAdditions plugin;

    public HeartsCommand(ServerAdditions plugin) {
        this.plugin = plugin;
    }

    @Override
    public boolean onCommand(CommandSender sender, Command command, String label, String[] args) {
        if (!(sender instanceof Player)) {
            sender.sendMessage(plugin.colorize("&c» Tylko gracze mogą użyć tej komendy!"));
            return true;
        }

        Player player = (Player) sender;
        
        if (args.length == 0) {
            // Show hearts info
            int hearts = plugin.getLifestealManager().getHearts(player);
            int maxHearts = plugin.getLifestealManager().getMaxHearts();
            int minHearts = plugin.getLifestealManager().getMinHearts();
            int level = plugin.getLifestealManager().getPlayerLevel(player);
            int levelsPerHeart = plugin.getLifestealManager().getLevelsPerHeart();
            int progress = level % levelsPerHeart;
            
            player.sendMessage(plugin.colorize("&c&l» Status Serc"));
            player.sendMessage(plugin.colorize("&c❤ Serca: &f" + hearts + "&7/&f" + maxHearts + " &7(Min: " + minHearts + ")"));
            player.sendMessage(plugin.colorize("&e⭐ Poziom: &f" + level));
            player.sendMessage(plugin.colorize("&7Postęp do następnego serca: &f" + progress + "&7/&f" + levelsPerHeart));
            player.sendMessage(plugin.colorize(""));
            player.sendMessage(plugin.colorize("&7Użyj &f/hearts withdraw &7aby wypłacić serce"));
            player.sendMessage(plugin.colorize("&7Użyj &f/hearts deposit &7aby wpłacić serce"));
            return true;
        }
        
        String subCommand = args[0].toLowerCase();
        
        switch (subCommand) {
            case "withdraw":
                if (plugin.getLifestealManager().withdrawHeart(player)) {
                    player.sendMessage(plugin.colorize("&a» Wypłaciłeś serce! Użyj go mądrze."));
                    player.playSound(player.getLocation(), org.bukkit.Sound.ENTITY_ITEM_PICKUP, 1.0f, 1.0f);
                } else {
                    player.sendMessage(plugin.colorize("&c» Nie możesz wypłacić! Osiągnięto minimum serc."));
                }
                break;
                
            case "deposit":
                if (plugin.getLifestealManager().depositHeart(player)) {
                    player.sendMessage(plugin.colorize("&a» Serce wpłacone! Zdobyłeś 1 serce."));
                    player.playSound(player.getLocation(), org.bukkit.Sound.ENTITY_PLAYER_LEVELUP, 1.0f, 1.0f);
                } else {
                    player.sendMessage(plugin.colorize("&c» Nie masz przedmiotu serca do wpłacenia!"));
                }
                break;
                
            default:
                player.sendMessage(plugin.colorize("&c» Użycie: /hearts [withdraw|deposit]"));
        }
        
        return true;
    }
}
