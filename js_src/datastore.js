// a database for all objects the game Using_the_Web_Storage_API
export let DATASTORE ={};

export function clearDataStore(){

  DATASTORE ={
    GAME: {},
    ID_SEQ: 1,
    MAPS: {}
  };
}
