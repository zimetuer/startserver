# ServerAdditions Plugin v2.0.0

Kompleksowy plugin do zarzadzania serwerem Minecraft.

## Wymagania

- Java 17+
- Paper/Spigot 1.20+
- **Lombok** (deweloperskie)

## Technologie

Ten projekt używa **Lombok** do redukcji kodu powtarzalnego:
- `@Getter` - automatyczne generowanie getterow
- `@Setter` - automatyczne generowanie setterow  
- `@RequiredArgsConstructor` - konstruktory z wymaganymi polami
- Logger - uproszczone logowanie

## Funkcje

Wszystkie funkcje mozna wlaczyc/wylaczyc w config.yml

### System Lifesteal + Ostatni Krzyk
- Serca za zabojstwo
- Serca tracone przy smierci
- Wypłacalne Serca - /hearts withdraw
- Wplacanie Serc - /hearts deposit
- Co 5 poziomow = 1 serce
- Skalowane Zlote Jabłka
- Ostatni Krzyk - 5 sekund przy 0 HP

## Komendy

### Serca
- /hearts - Status serc i poziomu
- /hearts withdraw - Wypłać serce
- /hearts deposit - Wpłać serce

### Teleportacja
- /rtp - Losowy teleport
- /spawn - Teleport na spawn
- /home - Teleport do domu (TYLKO 1 DOM)
- /sethome - Ustaw dom
- /tpa - Prosba o teleport
- /warp - Teleport do warpu

### Narzedzia
- /seen - Kiedy gracz byl online
- /invsee - Podglad ekwipunku
- /ec - Otworz enderchest
- /wb - Stol rzemieslniczy
- /balance - Stan konta
- /pay - Przelew

### Admin
- /sa reload - Przeladuj config

## Uprawnienia

- serveradditions.admin - Admin
- serveradditions.rtp - RTP
- serveradditions.home - Dom
- serveradditions.tpa - TPA
- serveradditions.warp - Warpy
- serveradditions.hearts - Serca

## System Ostatniego Krzyku

Gdy gracz mialby umrzec:
1. Przywrocony do 0.5 HP (pol serca)
2. Dostaje Spowolnienie II i Slabosc V na 5 sekund
3. Jesli przetrwa - traci 1 serce ale zyje
4. Jesli zginie - normalna smierc

## Zlote Jabłka

- Podstawa: 2 serca leczenia
- Bonus: +0.5 serca za kazdy poziom
- Poziom 10 = 7 serc leczenia

## Budowanie (Maven)

```bash
cd plugin
mvn clean package
```

Lombok jest automatycznie obslugiwany przez Maven.

## Instalacja

1. Skopiuj JAR do plugins/
2. Zrestartuj serwer
3. Edytuj plugins/ServerAdditions/config.yml
4. /sa reload aby zastosowac zmiany
