package com.startserver.additions.features;

import com.startserver.additions.ServerAdditions;
import lombok.Getter;
import org.bukkit.ChatColor;
import org.bukkit.Material;
import org.bukkit.entity.Player;
import org.bukkit.event.EventHandler;
import org.bukkit.event.EventPriority;
import org.bukkit.event.Listener;
import org.bukkit.event.entity.EntityPickupItemEvent;
import org.bukkit.event.inventory.InventoryClickEvent;
import org.bukkit.event.inventory.PrepareItemCraftEvent;
import org.bukkit.inventory.ItemStack;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ItemManager implements Listener {

    private final ServerAdditions plugin;
    private final Map<Material, Integer> itemLimits = new HashMap<>();
    
    @Getter
    private final boolean enabled;
    @Getter
    private final List<String> disabledItems;
    private final boolean preventCrafting;
    private final String limitMessage;
    private final String disabledMessage;

    public ItemManager(ServerAdditions plugin) {
        this.plugin = plugin;
        this.enabled = plugin.getPluginConfig().getBoolean("items.enabled", true);
        this.disabledItems = plugin.getPluginConfig().getStringList("items.disabled.items");
        this.preventCrafting = plugin.getPluginConfig().getBoolean("items.disabled.prevent-crafting", true);
        this.limitMessage = plugin.colorize(plugin.getPluginConfig().getString("items.limits.message", 
            "&c» Nie możesz nosić więcej niż {limit} {item}!"));
        this.disabledMessage = plugin.colorize(plugin.getPluginConfig().getString("items.disabled.message", 
            "&c» Ten przedmiot jest wyłączony na tym serwerze!"));
        
        loadLimits();
    }
    
    private void loadLimits() {
        if (plugin.getPluginConfig().getBoolean("items.limits.enabled", true)) {
            plugin.getPluginConfig().getConfigurationSection("items.limits.restricted-items")
                .getKeys(false)
                .forEach(key -> {
                    try {
                        Material mat = Material.valueOf(key.toUpperCase());
                        itemLimits.put(mat, plugin.getPluginConfig().getInt("items.limits.restricted-items." + key));
                    } catch (IllegalArgumentException ignored) {}
                });
        }
    }

    @EventHandler(priority = EventPriority.HIGH)
    public void onInventoryClick(InventoryClickEvent event) {
        if (!enabled || !plugin.getPluginConfig().getBoolean("items.limits.enabled", true)) return;
        if (!(event.getWhoClicked() instanceof Player)) return;
        
        Player player = (Player) event.getWhoClicked();
        if (player.hasPermission("serveradditions.items.bypass")) return;
        
        if (checkItemLimit(player, event.getCursor()) || checkItemLimit(player, event.getCurrentItem())) {
            event.setCancelled(true);
        }
    }

    @EventHandler(priority = EventPriority.HIGH)
    public void onItemPickup(EntityPickupItemEvent event) {
        if (!enabled || !plugin.getPluginConfig().getBoolean("items.limits.enabled", true)) return;
        if (!(event.getEntity() instanceof Player)) return;
        
        Player player = (Player) event.getEntity();
        if (player.hasPermission("serveradditions.items.bypass")) return;
        
        ItemStack item = event.getItem().getItemStack();
        Material type = item.getType();
        
        itemLimits.computeIfPresent(type, (mat, limit) -> {
            int current = countItems(player, type);
            if (current + item.getAmount() > limit) {
                event.setCancelled(true);
                player.sendMessage(limitMessage.replace("{limit}", String.valueOf(limit))
                    .replace("{item}", formatMaterialName(type)));
            }
            return limit;
        });
    }

    @EventHandler(priority = EventPriority.HIGHEST)
    public void onCraft(PrepareItemCraftEvent event) {
        if (!enabled || !preventCrafting) return;
        
        ItemStack result = event.getInventory().getResult();
        if (result != null && disabledItems.contains(result.getType().name())) {
            event.getInventory().setResult(null);
        }
    }

    private boolean checkItemLimit(Player player, ItemStack item) {
        if (item == null || item.getType() == Material.AIR) return false;
        
        Material type = item.getType();
        Integer limit = itemLimits.get(type);
        if (limit == null) return false;
        
        int current = countItems(player, type);
        if (current + item.getAmount() > limit) {
            item.setAmount(Math.max(0, limit - current));
            player.sendMessage(limitMessage.replace("{limit}", String.valueOf(limit))
                .replace("{item}", formatMaterialName(type)));
            return true;
        }
        return false;
    }

    private int countItems(Player player, Material type) {
        int count = 0;
        for (ItemStack item : player.getInventory().getContents()) {
            if (item != null && item.getType() == type) {
                count += item.getAmount();
            }
        }
        return count;
    }

    private String formatMaterialName(Material material) {
        String name = material.name().toLowerCase().replace("_", " ");
        return name.substring(0, 1).toUpperCase() + name.substring(1);
    }

    public boolean isItemDisabled(Material material) {
        return disabledItems.contains(material.name());
    }
}
