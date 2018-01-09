# Design Doc for Weed Strike

### Goals

( names of things are a work in progress)
The "Lucas game" is a simple game of survival, progression, and growth.

  * "The Lucas" is trying to find his way home.
  * The Lucas starts out weak and unable to defeat none, or very few, of his challengers.
  * The Lucas picks up items in order to get stronger
  * Some items are hidden around the castle, others are dropped by vanquished enemies
### Story

Lucas has a poor sense of direction. One night on one of his midnight strolls through Mordor, he stumbles his way into a castle full of dangerous creatures. He must find his way out!
### Mechanics
  * Lucas can attack his enemies by touching the arrow key towardsthem when they are adjacent to him
  * Lucas dies if he does not have adequate meals(nourishment meter?)
  * Lucas also dies when his HP is reduced to 0.
  * to replenish HP Lucas must rest, but resting takes turns so it can be dangerous with monsters around (maybe potions too)
  * armor makes Lucas less vulnerable to attack
  * weapons make his attack more potent
  * he cannot walk through walls
  * can only see objects/monsters in his immediate surroundings
  
### Winning
  * to win the user must navigate through all the castle levels 
  * The users scoreis based on how quickly they manage to escape
### Notes

git:
  * file system = working directory - local
  * move to staging area using add command (remove using reset) - local
  * move to repository using commit (checkout gets old version) - local
  * move to remotes using push (pull takes from remotes to working directory) - remote
