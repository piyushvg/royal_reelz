import * as migration_20261016_211518_initial from './20261016_211518_initial';
import * as migration_20261023_164500_users_name_role from './20261023_164500_users_name_role';

export const migrations = [
  {
    up: migration_20261016_211518_initial.up,
    down: migration_20261016_211518_initial.down,
    name: '20261016_211518_initial'
  },
  {
    up: migration_20261023_164500_users_name_role.up,
    down: migration_20261023_164500_users_name_role.down,
    name: '20261023_164500_users_name_role'
  },
];
