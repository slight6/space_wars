# xTorp Solar System Builder - Outline & Analysis

## Concept Overview
- xTorp is a new mechanic for building entire solar systems, not just planets/moons.
- When launched, xTorp creates a complete area formation adjacent to the player's current location.
- Beginner solar system grants all resources for mining/refining/selling; progression unlocks higher quality ores/materials and blueprints.
- Genisys Torpedo (Genisys Corp) still allows a player to build a single, restricted-access home base.
- Players can only have one home base at a time; once abandoned or depleted, access rights are lost.
- Solar system travel takes hours, with time/fuel cost randomized; autopilot can plot courses with manual intervention.
- Static, hard-coded starting solar system; destinations show time/fuel cost, with fog of war and map trading.
- Teamwork and map sharing are core gameplay elements.
- xTorp launches expand the universe in a branching pattern (1→2→3... up to 10 per system), then Genisys Torpedoes become the main expansion tool.

## Pros
- Enables large, expandable universe with player-driven growth
- Encourages teamwork, map sharing, and specialization
- Progression system for mining/refining unlocks new opportunities and blueprints
- Home base mechanic provides personal progression and territory control
- Flexible travel system with fuel/time management and risk/reward
- Rich starting solar system with diverse planets, stations, and gameplay roles
- Government/faction/corporate dynamics for advanced play

## Cons
- Complexity in managing solar system branching and access rights
- Balancing resource distribution and progression may be challenging
- Requires robust backend for universe persistence and player territory
- Travel time/fuel mechanics may frustrate some players
- Fog of war and map trading need careful design to avoid confusion
- Home base restriction may limit some playstyles
- Risk of feature creep if too many systems are added at once

## Key Mechanics & Features
- xTorp launches create new solar systems, branching from existing ones
- Genisys Torpedo creates a single, restricted home base per player
- Solar system travel: time/fuel cost, autopilot/manual, fallback to ion-pulse engine
- Static starting solar system: 1 star, 1 star port, 7 planets (molten, colonized, mining, colonized, mining, colonized, icy/mining)
- Asteroid belt between 4th/5th planets, risk/reward mining
- Space station (spawn point): shipyard, hangar, government office, corporate HQ, faction hideout, marketplace, trading center, religious area
- Reputation gates for station access, government tracking of underground tavern
- Resource depletion and territory abandonment mechanics

## Questions for Further Design
1. How will solar system branching be tracked and visualized for players?
2. What data structure will represent solar systems, planets, stations, and connections?
3. How will resource depletion and territory abandonment be handled in code?
4. What rules govern map trading and fog of war reveal?
5. How will government/faction/corporate control be implemented and enforced?
6. What environmental and elemental effects will xTorp/Genisys Torpedo support?
7. How will home base restrictions and transfer of ownership work?
8. What backend requirements are needed for universe persistence and player territory?
9. How will travel time/fuel cost be calculated and displayed to players?
10. What UI/UX will support teamwork, map sharing, and progression?
