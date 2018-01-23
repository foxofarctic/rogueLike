// storing code for all entities handleRestoreGame

import {Factory} from './factory.js';
import {Entity} from './entity.js';

export let EntityFactory = new Factory(Entity,'ENTITIES');

EntityFactory.learn({
  'name': 'avatar',
  'chr': '@',
  'fg': '#eb4',
  'mixinNames': ['TimeTracker','WalkerCorporeal','PlayerMessage','HitPoints','MeleeAttacker','ActorPlayer','Scorekeeper'],
  'maxHp': 10

});

EntityFactory.learn({
  'name': 'moss',
  'chr': '#',
  'fg': '#3d5',
  'mixinNames': ['HitPoints','Scorekeeper'],
  'maxHp': 3

});

EntityFactory.learn({
    'name': 'monster',
    'chr': '&',
    'fg': '#d63',
    'maxHp': 5,
    'mixinNames': ['HitPoints','WalkerCorporeal','ActorAttacker','Scorekeeper', 'MeleeAttacker']


  });

  EntityFactory.learn({
    'name': 'portal',
    'chr': '0',
    'fg': '#00CED1',
    'mixinNames': []
  });

  EntityFactory.learn({
    'name': 'finish',
    'chr': '*',
    'fg': '#F5F522',
    'mixinNames': []
  });
