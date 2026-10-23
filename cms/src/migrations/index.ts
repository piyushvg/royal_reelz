import * as migration_20261016_211518_initial from './20261016_211518_initial';
import * as migration_20261023_164500_users_name_role from './20261023_164500_users_name_role';
import * as migration_20261023_171000_customer_files from './20261023_171000_customer_files';

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
  {
    up: migration_20261023_171000_customer_files.up,
    down: migration_20261023_171000_customer_files.down,
    name: '20261023_171000_customer_files'
  },
];
