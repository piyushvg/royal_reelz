import * as migration_20261016_211518_initial from './20261016_211518_initial';

export const migrations = [
  {
    up: migration_20261016_211518_initial.up,
    down: migration_20261016_211518_initial.down,
    name: '20261016_211518_initial'
  },
];
