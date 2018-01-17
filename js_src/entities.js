// storing code for all entities handleRestoreGame

import {Factory} from './factory.js';
import {Entity} from './entity.js';

export let EntityFactory = new Factory(Entity,'ENTITIES');

EntityFactory.learn({
  'name': 'avatar',
  'chr': '@',
  'fg': '#eb4',
  'mixinName': ['TimeTracker','WalkerCorporeal','PlayerMessage','HitPoints'],
  maxHp: 10
});
