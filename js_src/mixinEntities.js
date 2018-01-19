//defines the various mixins that can be added to an Entity
import {Message} from './message.js';
import {SCHEDULER,TIME_ENGINE,initTiming} from'./timing.js';
import {DATASTORE} from './datastore.js';
import {Map} from './map.js';
import {randomInt} from './util.js';

let ExampleMixin = {
  META:{
    mixinName: 'ExampleMixin',
    mixinGroupName: 'ExampleMixinGroup',
    stateNameSpace: '_ExampleMixin',
    stateModel: {
      foo: 10
    },
    initialize: function(){
      //do any initialization
    }
  },
  METHODS: {
    method1: function(p){
      //do stuff
      //can access / manipulate this.state.ExampleMixin
    }
  },
  LISTENERS: {
    'evtLabel': function(evtData) {

    }
  }
};

//******************************************

export let PlayerMessage = {
  META:{
    mixinName: 'PlayerMessage',
    mixinGroupName: 'Messager',
    stateModel: {
      timeTaken: 0
    },
  },
  LISTENERS: {
    'wallBlocked': function(evtData) {
      Message.send('can\'t move there because ' + evtData.reason);
    },
    'attacks': function(evtData){
      Message.send(this.getName()+" attacks "+evtData.target.getName());
    },
    'damages': function(evtData){
      Message.send(this.getName()+" deals "+evtData.damageAmount + " damage to" + evtData.target.getName());
    },
    'kills': function(evtData){
      Message.send(this.getName()+" kills " + evtData.target.getName());
    },
    'killedBy': function(evtData){
      Message.send(evtData.target.getName()+ " was killed by " + this.getName());
    }
  }
};

//******************************************

export let TimeTracker = {
  META:{
    mixinName: 'TimeTracker',
    mixinGroupName: 'Tracker',
    stateNameSpace: '_TimeTracker',
    stateModel: {
      timeTaken: 0
    }
  },
  METHODS:{
    getTime: function(){
      return this.state._TimeTracker.timeTaken;
    },
    setTime: function(t){
      this.state._TimeTracker.timeTaken = t;
    },
    addTime: function(t){
      this.state._TimeTracker.timeTaken += t;
    }
  },
  LISTENERS: {
    'turnTaken': function(evtData) {
      this.addTime(evtData.timeUsed);
    }
  }
};

//******************************************

export let WalkerCorporeal = {
  META:{
    mixinName: 'WalkerCorporeal',
    mixinGroupName: 'Walker',
  },
  METHODS:{
    tryWalk: function(dx, dy){
      let newX = this.state.x*1 + dx*1;
      let newY = this.state.y*1 + dy*1;

      let targetPositionInfo = this.getMap().getTargetPositionInfo(newX,newY);
      if (targetPositionInfo.entity){
        console.log("entity");
        this.raiseMixinEvent('bumpEntity', {actor: this, target: targetPositionInfo.entity});
        return false;
      } else {
        if(targetPositionInfo.tile.isImpassable()){
          this.raiseMixinEvent('wallBlocked',{reason:"there is a wall in the way"})
        } else{
          this.state.x = newX;
          this.state.y = newY;
          this.getMap().updateEntityPosition(this, this.state.x, this.state.y);

          this.raiseMixinEvent('turnTaken', {timeUsed: 1});

          return true;
        }
      }
      return false;
    }
  }
};

//******************************************

export let HitPoints = {
  META:{
    mixinName: 'HitPoints',
    mixinGroupName: 'HitPoints',
    stateNameSpace: '_HitPoints',
    stateModel: {
      maxHp: 1,
      curHp: 1
    },
    initialize: function(template){
      this.state._HitPoints.maxHp = template.maxHp;
      this.state._HitPoints.curHp = template.curHp || template.maxHp;
    }
  },
  METHODS: {
    gainHp: function (amt){
      this.state._HitPoints.curHp += amt;
      this.state._HitPoints.curHp - Math.min(this.maxHp, this.curHp);
    },
    loseHp: function (amt){
      this.state._HitPoints.curHp -= amt;
      this.state._HitPoints.curHp = Math.min(this.maxHp, this.curHp);
    },
    getHp: function (){
      return this.state._HitPoints.curHp;
    },
    setHp: function (amt){
      this.state._HitPoints.curHp = amt;
      this.state._HitPoints.curHp = Math.min(this.maxHp, this.curHp);
    },
    getMaxHp: function (){
      return this.state._HitPoints.maxHp;
    },
    setMaxHp: function (amt){
      this.state._HitPoints.maxHp = amt;
    }
  },
  LISTENERS: {
    'damaged': function(evtData) {
      //evtData.src
      console.log("damaged again");
      this.loseHp(evtData.damageAmount);
      evtData.src.raiseMixinEvent('damages',
      {target: this,damageAmount:evtData.damageAmount});
      console.log("hp "+ this.getHp());

      if (this.getHp() == 0){
        this.raiseMixinEvent('killedBy',{src:evtData.src});
        evtData.src.raiseMixinEvent('killedBy',{src:evtData.src});
        console.log("destroy");
        this.destroy();
      }
    }
  }
};

export let MeleeAttacker = {
  META:{
    mixinName: 'MeleeAttacker',
    mixinGroupName: 'MeleeAttacker',
    stateNameSpace: '_MeleeAttacker',
    stateModel: {
        meleeDamage: 1
    },
    initialize: function(template){
      this.state._MeleeAttacker.meleeDamage = template.meleeDamage || 1;
      console.log("initialize MeleeAttacker");
    }
  },
  METHODS: {
    getMeleeDamage: function(){return this.state._MeleeAttacker.meleeDamage; },
    setMeleeDamage: function(amt){ this.state._MeleeAttacker.meleeDamage = amt; },

  },
  LISTENERS: {
    'bumpEntity': function(evtData) {
      evtData.target.raiseMixinEvent('damaged',{src:this,damageAmount:this.getMeleeDamage()});
      this.raiseMixinEvent('attacks', {actor:this,target:evtData.target});
    }
  }
};

//********************************
export let ActorPlayer = {
  META: {
    mixInName:'ActorPlayer',
    mixInGroupName: 'ActorPlayer',
    stateNamespace: '_ActorPlayer',
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },

    initialize: function(){
      console.log("initialize Player Actor");
      SCHEDULER.add(this,true,1)
    }
  },

  METHODS: {
    getBaseActionDuration: function () {
      return this.state._ActorPlayer.baseActionDuration;
    },
    setBaseActionDuration: function (newValue) {
      this.state._ActorPlayer.baseActionDuration = newValue;
    },
    getCurrentActionDuration: function () {
      return this.state._ActorPlayer.currentActionDuration;
    },
      setCurrentActionDuration: function (newValue) {
      this.state._ActorPlayer.currentActionDuration = newValue;
    },
    isActing: function(state) {
      if (state !== undefined) {
      this.state._ActorPlayer.actingState = state;
      }
      console.dir(this.state);
      return this.state._ActorPlayer.actingState;
    },


    act: function(){
      if (this.isActing()) {
        return;
      }
      this.isActing(true);
      TIME_ENGINE.lock();
      this.isActing(false);
      console.log("Player is Acting");
    }
  },

  LISTENERS: {
    'actionDone': function(evtData){
      SCHEDULER.setDuration(this.getCurrentActionDuration());
      this.setCurrentActionDuration(this.getBaseActionDuration()+randomInt(-5,5));
      setTimeout(function(){ TIME_ENGINE.unlock();},1);
      console.log("Player still working");
    }
  }
};


export let ActorWanderer = {
  META: {
    mixInName:'ActorWanderer',
    mixInGroupName: 'ActorWanderer',
    stateNamespace: '_ActorWanderer',
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },

    initialize: function(template){
      SCHEDULER.add(this,true,randomInt(2,this.getBaseActionDuration()));
      this.state._ActorWanderer.baseActionDuration = template.wanderActionDuration || 1000;
      this.state._ActorWanderer.currentActionDuration = this.state._ActorWanderer.baseActionDuration;
    }
  },

  METHODS: {
    getBaseActionDuration: function () {
      return this.state._ActorWanderer.baseActionDuration;
    },
    setBaseActionDuration: function (newValue) {
      this.state._ActorWanderer.baseActionDuration = newValue;
    },
    getCurrentActionDuration: function () {
      return this.state._ActorWanderer.currentActionDuration;
    },
    setCurrentActionDuration: function (newValue) {
      this.state._ActorWanderer.currentActionDuration = newValue;
    },
    act: function(){
      TIME_ENGINE.lock();
      let dx = randomInt(-1,1);
      let dy = randomInt(-1,1);
      this.raiseMixinEvent('walkAttempt',{'dx':dx, 'dy':dy});
      SCHEDULER.setDuration(1000);
      TIME_ENGINE.unlock();
    }
  },

  LISTENERS: {
    'actionDone': function(evtData){
      SCHEDULER.setDuration(this.getCurrentActionDuration());
      this.setCurrentActionDuration(this.getBaseActionDuration()+randomInt(-5,5));
      setTimeout(function(){ TIME_ENGINE.unlock();},1);
      console.log("Player still working");
    }
  }
};
