package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import org.bukkit.entity.Player;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public class EconomyManager {

    private final ServerAdditions plugin;
    private final Map<UUID, Double> balances;
    private final double startingBalance;
    private final String symbol;
    private final boolean enabled;

    public EconomyManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.balances = new HashMap<>();
        this.enabled = plugin.getConfig().getBoolean("economy.enabled", false);
        this.startingBalance = plugin.getConfig().getDouble("economy.starting-balance", 100);
        this.symbol = plugin.getConfig().getString("economy.symbol", "$");
    }

    public double getBalance(Player player) {
        return balances.getOrDefault(player.getUniqueId(), startingBalance);
    }

    public boolean has(Player player, double amount) {
        return getBalance(player) >= amount;
    }

    public boolean withdraw(Player player, double amount) {
        if (amount < 0) return false;
        
        double current = getBalance(player);
        if (current < amount) return false;
        
        balances.put(player.getUniqueId(), current - amount);
        return true;
    }

    public boolean deposit(Player player, double amount) {
        if (amount < 0) return false;
        
        double current = getBalance(player);
        balances.put(player.getUniqueId(), current + amount);
        return true;
    }

    public boolean transfer(Player from, Player to, double amount) {
        if (!withdraw(from, amount)) return false;
        deposit(to, amount);
        return true;
    }

    public String format(double amount) {
        return symbol + String.format("%.2f", amount);
    }

    public boolean isEnabled() {
        return enabled;
    }
}
