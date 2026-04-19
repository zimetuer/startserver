package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import org.bukkit.Bukkit;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityDamageByEntityEvent;
import org.bukkit.event.player.PlayerCommandPreprocessEvent;
import org.bukkit.event.player.PlayerQuitEvent;
import org.bukkit.scheduler.BukkitRunnable;

import java.util.*;

public class CombatManager implements Listener {

    private final ServerAdditions plugin;
    private final Map<UUID, Long> combatTagged;
    private final int duration;
    private final List<String> blockedCommands;

    public CombatManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.combatTagged = new HashMap<>();
        this.duration = plugin.getConfig().getInt("combat.log-prevention.duration", 30);
        this.blockedCommands = plugin.getConfig().getStringList("combat.log-prevention.blocked-commands");
        
        startTask();
    }

    private void startTask() {
        new BukkitRunnable() {
            @Override
            public void run() {
                long now = System.currentTimeMillis();
                combatTagged.entrySet().removeIf(entry -> now - entry.getValue() > duration * 1000);
            }
        }.runTaskTimer(plugin, 20L, 20L);
    }

    @EventHandler
    public void onDamage(EntityDamageByEntityEvent event) {
        if (!(event.getEntity() instanceof Player)) return;
        
        Player victim = (Player) event.getEntity();
        Player attacker = null;
        
        if (event.getDamager() instanceof Player) {
            attacker = (Player) event.getDamager();
        }
        
        if (attacker != null) {
            tagPlayer(attacker);
            tagPlayer(victim);
        }
    }

    @EventHandler
    public void onCommand(PlayerCommandPreprocessEvent event) {
        Player player = event.getPlayer();
        if (!isInCombat(player)) return;
        
        String command = event.getMessage().split(" ")[0].toLowerCase();
        for (String blocked : blockedCommands) {
            if (command.equals("/" + blocked.toLowerCase())) {
                event.setCancelled(true);
                player.sendMessage(plugin.colorize("&c» Nie możesz używać tej komendy podczas walki!"));
                return;
            }
        }
    }

    @EventHandler
    public void onQuit(PlayerQuitEvent event) {
        Player player = event.getPlayer();
        if (isInCombat(player)) {
            String punishment = plugin.getConfig().getString("combat.log-prevention.punishment", "KILL");
            if (punishment.equalsIgnoreCase("KILL")) {
                player.setHealth(0);
            }
        }
        combatTagged.remove(player.getUniqueId());
    }

    private void tagPlayer(Player player) {
        combatTagged.put(player.getUniqueId(), System.currentTimeMillis());
    }

    public boolean isInCombat(Player player) {
        if (!combatTagged.containsKey(player.getUniqueId())) return false;
        
        long tagged = combatTagged.get(player.getUniqueId());
        return System.currentTimeMillis() - tagged <= duration * 1000;
    }

    public long getRemainingCombatTime(Player player) {
        if (!isInCombat(player)) return 0;
        
        long tagged = combatTagged.get(player.getUniqueId());
        return Math.max(0, duration - (System.currentTimeMillis() - tagged) / 1000);
    }
}
