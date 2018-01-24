//defines the various mixins that can be added to an Entity
import {Message} from './message.js';
import {SCHEDULER,TIME_ENGINE,initTiming} from'./timing.js';
import {DATASTORE} from './datastore.js';
import {Map} from './map.js';
import {randomInt} from './util.js';
import ROT from 'rot-js';


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
    stateNameSpace: '_PlayerMessage',
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
      Message.send(this.getName()+" deals "+evtData.damageAmount + " damage to " + evtData.target.getName());
    },
    'kills': function(evtData){
      Message.send(this.getName()+" kills " + evtData.target.getName());
    },
    'killedBy': function(evtData){
      if (evtData.target.chr == '#' && this.chr == '@' ){
        this.gainHp(20);
      }
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
      //console.log("Time: " + t);
      this.state._TimeTracker.timeTaken += t;
    }
  },
  LISTENERS: {
    'turnTaken': function(evtData) {
      //this.addTime(evtData.timeUsed);
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

      //console.log("walking " + this.chr);
      let targetPositionInfo = this.getMap().getTargetPositionInfo(newX,newY);
    //  console.dir(targetPositionInfo.entity);
      if (targetPositionInfo.entity.chr == '0' && this.chr == '@'){
        this.raiseMixinEvent('newLevel');
        return true;
      }
      if (targetPositionInfo.entity.chr == '*' && this.chr == '@'){
        this.setWin(true);
        return false;
      }
      //if (targetPositionInfo.entity && targetPositionInfo.entity.chr != this.chr){
      if (targetPositionInfo.entity && targetPositionInfo.entity != this){//&& targetPositionInfo.entity.chr != this.chr){
        //if (targetPositionInfo.entity.chr == this.chr){
        this.raiseMixinEvent('bumpEntity', {actor: this, target: targetPositionInfo.entity});
        console.log(targetPositionInfo.entity.chr + " bumped by " + this.chr);
        this.raiseMixinEvent('actionDone');
        return true;
      } else {
        if(targetPositionInfo.tile.isImpassable()){
          this.raiseMixinEvent('wallBlocked',{reason:"there is a wall in the way"})
        } else{
          this.state.x = newX;
          this.state.y = newY;
          this.getMap().updateEntityPosition(this, this.state.x, this.state.y);

          this.raiseMixinEvent('turnTaken', {timeUsed: 1});
          this.raiseMixinEvent('actionDone');

          return true;
        }
      }
      return false;
    }
  },
  LISTENERS: {
    'tryWalking': function(evtData) {
      console.log("trying to walk");
      console.dir(this);
      this.tryWalk(evtData.dx, evtData.dy);
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
      maxHp: 0,
      curHp: 0
    },
    initialize: function(template){
      this.state._HitPoints.maxHp = template.maxHp || 1;
      this.state._HitPoints.curHp = template.curHp || template.maxHp;
      console.log("curHp: " + this.state._HitPoints.curHp);
    }
  },
  METHODS: {
    gainHp: function (amt){
      this.state._HitPoints.curHp += amt;
      this.state._HitPoints.curHp = Math.min(this.state._HitPoints.maxHp, this.state._HitPoints.curHp);
    },
    loseHp: function (amt){
      this.state._HitPoints.curHp -= amt*1;
      this.state._HitPoints.curHp = Math.min(this.state._HitPoints.maxHp, this.state._HitPoints.curHp);
    },
    getHp: function (){
      return this.state._HitPoints.curHp;
    },
    setHp: function (amt){
      this.state._HitPoints.curHp = amt;
      this.state._HitPoints.curHp = Math.min(this.state._HitPoints.maxHp, this.state._HitPoints.curHp);
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
      this.loseHp(evtData.damageAmount);
      evtData.src.raiseMixinEvent('damages',
      {target: evtData.target,damageAmount:evtData.damageAmount, src: evtData.src});
      console.log("hp "+ this.getHp());

      if (this.getHp() <= 0){
        this.raiseMixinEvent('killedBy',{src:evtData.src, target: evtData.target});
        evtData.src.raiseMixinEvent('killedBy',{src:evtData.src, target: evtData.target});
        console.log("destroy");
        console.dir(evtData.src);
        if(evtData.src.chr == "@"){
          this.raiseMixinEvent('scoreEvent',{monsterHp: this.getMaxHp(), avatar: evtData.src});
        } else if(this.chr == "@" ){
          console.log("you suck");
          console.dir(this);
          evtData.target.setLose(true);
            TIME_ENGINE.lock();
        }

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
      console.log("bumped entity");
      evtData.target.raiseMixinEvent('damaged',{src:this,damageAmount:this.getMeleeDamage(), target: evtData.target});
//      evtData.target.raiseMixinEvent('damaged',{src:evtData.target,damageAmount:this.getMeleeDamage(), target: this});

      this.raiseMixinEvent('attacks', {actor:this,target:evtData.target});
    }
  }
};

//********************************
export let ActorPlayer = {
  META: {
    mixInName:'ActorPlayer',
    mixInGroupName: 'ActorPlayer',
    stateNameSpace: '_ActorPlayer',
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000,
      newLevel: false,
      win: false,
      lose: false
    },

    initialize: function(){
      console.log("initialize Player Actor");
      SCHEDULER.add(this,true,1);
      TIME_ENGINE.lock();
      //let newLevel = false;
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
      return this.state._ActorPlayer.actingState;
    },
    getNewLevel: function(){return this.state._ActorPlayer.newLevel;},
    setNewLevel: function(bool){ this.state._ActorPlayer.newLevel = bool;},
    setWin: function(bool){this.state._ActorPlayer.win = bool;},
    getWin: function(){return this.state._ActorPlayer.win},
    setLose: function(bool){this.state._ActorPlayer.lose = bool;},
    getLose: function(){return this.state._ActorPlayer.lose},
    act: function(){
      if (this.isActing()) {
        return;
      }
      // SCHEDULER.next().raiseMixinEvent('enemyTurn');
      this.isActing(true);
      TIME_ENGINE.lock();
      this.isActing(false);
      console.log("Player is Acting");
    }
  },

  LISTENERS: {
    'actionDone': function(){
      console.log(this.getCurrentActionDuration());

      SCHEDULER.setDuration(this.getCurrentActionDuration());
      console.log("scheduler");
      console.dir(SCHEDULER);
      this.setCurrentActionDuration(this.getBaseActionDuration()+randomInt(-5,5));
      setTimeout(function(){ TIME_ENGINE.unlock();},1);
      console.log("Player still working");
      //this.act();
    },
    'newLevel': function(){
      this.state._ActorPlayer.newLevel = true;
    }

  }
};

//*******************************
export let ActorWanderer = {
  META: {
    mixInName:'ActorWanderer',
    mixInGroupName: 'ActorWanderer',
    stateNameSpace: '_ActorWanderer',
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
      this.raiseMixinEvent('tryWalking',{'dx':dx, 'dy':dy});
      // SCHEDULER.setDuration(1000);
      // TIME_ENGINE.unlock();
    }
  },

  LISTENERS: {
    // 'killedBy': function(){
    //   SCHEDULER.remove(this);
    // },
    'actionDone': function(){
      SCHEDULER.setDuration(this.getCurrentActionDuration());
      this.setCurrentActionDuration(this.getBaseActionDuration()+randomInt(-5,5));
      setTimeout(function(){ TIME_ENGINE.unlock();},1);
      console.log("Wanderer still working");
    }
  }
};

//*********************************
export let Scorekeeper = {
  META:{
    mixinName: 'Scorekeeper',
    mixinGroupName: 'Scorekeeper',
    stateNameSpace: '_Scorekeeper',
    stateModel: {
      score: 0
    },
    // initialize: function(){
    //   //do any initialization
    // }
  },
  METHODS: {
    getScore: function(){
      return this.state._Scorekeeper.score;
    },
    addScore: function(amt){
      this.state._Scorekeeper.score += amt;
    }
  },
  LISTENERS: {
    'scoreEvent': function(evtData) {
      console.log("entering score event");
      let bonus = evtData.monsterHp * 10;
      evtData.avatar.addScore(bonus);
    }
  }
};

export let ActorAttacker = {
  META: {
    mixInName:'ActorAttacker',
    mixInGroupName: 'ActorAttacker',
    stateNameSpace: '_ActorAttacker',
    stateModel: {
      baseActionDuration: 1000,
      actingState: false,
      currentActionDuration: 1000
    },

    initialize: function(template){
      SCHEDULER.add(this,true,randomInt(2,this.getBaseActionDuration()));
      this.state._ActorAttacker.baseActionDuration = template.attackerActionDuration || 1000;
      this.state._ActorAttacker.currentActionDuration = this.state._ActorAttacker.baseActionDuration;
    }
  },

  METHODS: {
    getBaseActionDuration: function () {
      return this.state._ActorAttacker.baseActionDuration;
    },
    setBaseActionDuration: function (newValue) {
      this.state._ActorAttacker.baseActionDuration = newValue;
    },
    getCurrentActionDuration: function () {
      return this.state._ActorAttacker.currentActionDuration;
    },
    setCurrentActionDuration: function (newValue) {
      this.state._ActorAttacker.currentActionDuration = newValue;
    },
    act: function(){
      TIME_ENGINE.lock();
      let newX;
      let newY;
      for(let x = -1 *1; x<2; x++ ){
        for(let y = -1 *1; y<2; y++ ){
          newX = this.state.x*1 + x*1;
          newY = this.state.y*1 + y*1;
          let targetPositionInfo = this.getMap().getTargetPositionInfo(newX,newY);
          if (targetPositionInfo.entity && targetPositionInfo.entity.chr != this.chr){
            this.raiseMixinEvent('tryWalking',{'dx':x, 'dy':y});
            return;
          }
        }
      }

      let dx = randomInt(-1,1);
      let dy = randomInt(-1,1);
      this.raiseMixinEvent('tryWalking',{'dx':dx, 'dy':dy});
      // SCHEDULER.setDuration(1000);
      // TIME_ENGINE.unlock();
    }
  },

  LISTENERS: {
    // 'killedBy': function(){
    //   SCHEDULER.remove(this);
    // },
    'actionDone': function(){
      SCHEDULER.setDuration(this.getCurrentActionDuration());
      this.setCurrentActionDuration(this.getBaseActionDuration()+randomInt(-5,5));
      setTimeout(function(){ TIME_ENGINE.unlock();},1);
    }
  }
};
