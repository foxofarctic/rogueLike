// storing code for all entities handleRestoreGame

import {Factory} from './factory.js';
import {Entity} from './entity.js';

export let EntityFactory = new Factory(Entity,'ENTITIES');

EntityFactory.learn({
  'name': 'avatar',
  'chr': '@',
  'fg': '#eb4',
  'mixinNames': ['TimeTracker','WalkerCorporeal','PlayerMessage','HitPoints','MeleeAttacker','ActorPlayer'],
  'maxHp': 10

});

EntityFactory.learn({
  'name': 'moss',
  'chr': '#',
  'fg': '#3d5',
  'mixinNames': ['HitPoints'],
  'maxHp': 3

});

EntityFactory.learn({
    'name': 'monster',
    'chr': '&',
    'fg': '#d63',
    'maxHp': 50,
    'mixInNames':['ActorWanderer','WalkerCorporeal','HitPoints']

  });
