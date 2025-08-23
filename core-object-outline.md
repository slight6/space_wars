# Space Explorer Game: Core Object Outline

## 1. Player

### Characteristics
- `username` / `playerId`
- `credits`
- `reputation`
- `licenses` (e.g., scout pilot)
- `owned_ship_ids` / `active_ship_id`
- `inventory` (items, resources, equipment)
- `currentLocation` (coordinates or location object)
- `militaryService`, `factionMembership`, `governmentClearance`, etc. (for requirements)
- `achievements`, `missions`, `questChains`
- `specialists` (reputation, progress, dialogue)
- `session` (login/logout, persistence)

### Actions
- Purchase ships
- Manage inventory
- Travel between locations
- Complete missions/quests
- Interact with specialists/NPCs
- Trade (marketplace, trade center)
- Scan, mine, refine, manufacture
- Upgrade ships/equipment
- Earn/spend credits
- Save/load game state

---

## 2. Ship

### Characteristics
- `shipId` / `instanceId`
- `ship_class` (e.g., basic_scout)
- `name` / `customName`
- `owner_player_id`
- `status` (active, docked, destroyed, etc.)
- `location` (coordinates, docked status)
- `base_specifications` (hull, shields, cargo, crew, fuel, power, speed, jump range, sensor range)
- `current_specifications` (current hull, shields, cargo used, crew, fuel, power usage, etc.)
- `capabilities` (can_mine_asteroids, can_land_on_planets, can_dock_with_stations, etc.)
- `upgrade_slots` (engine, weapon, utility, cargo, special)
- `installed_upgrades` (ion drive, quantum drive, stealth, advanced shields, etc.)
- `special_features` (secret cargo bay, self-destruct, escape pods, black box, etc.)
- `equipment` (engines, weapons, utilities, cargo modules, special modules)
- `cargo_inventory` (ores, refined products, equipment)
- `modification_history`
- `combat_history` (battles, damage, ships destroyed)
- `travel_history` (distance, jumps, planets visited, systems explored)
- `operationLog`, `maintenanceLog`, `upgradeHistory`
- `powerAllocation` (mining, scanners, propulsion, shields, life support)
- `statistics` (mined, refined, scanned, traveled, credits earned, efficiency)

### Actions
- Travel (move, jump, dock/undock)
- Scan (spatial, surface, prospecting, skimming, ship)
- Mine, refine, manufacture
- Upgrade/install equipment
- Manage cargo/inventory
- Engage in combat
- Repair/maintain
- Log operations/history
- Change loadouts/configurations
- Trade/sell cargo
- Self-destruct, emergency jump, use escape pods

---

## 3. Location

### Characteristics
- `locationId` / `name`
- `coordinates` (x, y, z)
- `type` (space station, planet, moon, asteroid, etc.)
- `availableFacilities` (shipyard, equipment center, marketplace, trading zone, tavern, government, specialists, maps, news, missions, manufacturing, research, agriculture, museum, temple)
- `localMap` (upload/sync/download)
- `neighborhood` (awareness, nearby locations)
- `resources` (mining yields, difficulty, market values)
- `npcPresence` (specialists, traders, quest givers)
- `accessRestrictions` (civilian, government, military zones)
- `events` (local news, missions, anomalies, ruins, etc.)

### Actions
- Dock/undock ships
- Trade/buy/sell
- Scan/explore
- Mine resources
- Accept/complete missions
- Interact with NPCs/specialists
- Upload/download local maps
- Participate in events/quests
- Travel to/from other locations

---

## Questions & Clarifications

1. **Player-Ship Relationship:**  
   - Can a player own multiple ships? Is there always one “active” ship?
   - How is ship switching handled? Are there restrictions?

2. **Ship-Location Interaction:**  
   - How is a ship’s location tracked? Is it always coordinates, or can it be a named location (e.g., “Space Station Nexus”)?
   - What triggers location changes (manual travel, docking, missions)?

3. **Location Details:**  
   - Are locations always static, or can they change (e.g., moving asteroids, dynamic events)?
   - How are resources and NPCs assigned to locations?

4. **Inventory & Cargo:**  
   - Is cargo managed per ship, per player, or both?
   - How do upgrades and equipment affect cargo/inventory?

5. **Session & Persistence:**  
   - How is player/session data saved and loaded? Is it localStorage, backend, or both?

6. **Combat & Events:**  
   - How are combat and random events triggered and resolved? Is it turn-based, real-time, or event-driven?

---

**Instructions:**  
- Edit this outline as needed, add answers to the questions, or expand on any section.
- Let me know when you’re ready for a deeper dive or want to generate code/data schemas for any object!
