import { db } from '@/lib/database'

export const offlineDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Region (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        acronym TEXT,
        client INTEGER,
        poligon TEXT,
        from_txt TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table Region created successfully'),
      (_, error) => {
        console.log('Error creating table Region: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS SubRegion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        client INTEGER,
        regions INTEGER,
        acronym TEXT,
        poligon TEXT,
        from_txt TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table Region created successfully'),
      (_, error) => {
        console.log('Error creating table Region: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS City (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        poligon TEXT,
        from_txt TEXT,
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table City created successfully'),
      (_, error) => {
        console.log('Error creating table City: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS PointStatus (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table PointStatus created successfully'),
      (_, error) => {
        console.log('Error creating table PointStatus: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS PointType (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        description TEXT,
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table PointType created successfully'),
      (_, error) => {
        console.log('Error creating table PointType: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS PointReference (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract INTEGER,
        name TEXT,
        device INTEGER,
        applicator INTEGER,
        pointtype INTEGER,
        client INTEGER,
        city INTEGER,
        subregions INTEGER,
        marker TEXT,
        from_txt TEXT,
        latitude REAL,
        longitude REAL,
        altitude REAL,
        accuracy REAL,
        volumebti INTEGER,
        observation TEXT,
        distance INTEGER,
        created_ondevice_at TEXT,
        transmition TEXT,
        image TEXT,
        kml_file TEXT,
        situation TEXT,
        is_active INTEGER,
        is_new INTEGER,
        edit_location INTEGER,
        edit_name INTEGER,
        edit_status INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table PointReference created successfully'),
      (_, error) => {
        console.log('Error creating table PointReference: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Application (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pointreference INTEGER,
        device INTEGER,
        applicator INTEGER,
        marker TEXT,
        from_txt TEXT,
        latitude REAL,
        longitude REAL,
        altitude REAL,
        acuracia REAL,
        volumebti INTEGER,
        container INTEGER,
        card INTEGER,
        plate INTEGER,
        observation TEXT,
        status TEXT,
        image TEXT,
        created_ondevice_at TEXT,
        transmition TEXT,
        contract INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table Application created successfully'),
      (_, error) => {
        console.log('Error creating table Application: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS AdultCollection (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pointreference INTEGER,
        device INTEGER,
        applicator INTEGER,
        marker TEXT,
        from_txt TEXT,
        latitude REAL,
        longitude REAL,
        altitude REAL,
        accuracy REAL,
        wind TEXT,
        climate TEXT,
        temperature TEXT,
        humidity REAL,
        insects_number INTEGER,
        observation TEXT,
        image TEXT,
        contract INTEGER,
        transmition TEXT,
        created_ondevice_at TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table AdultCollection created successfully'),
      (_, error) => {
        console.log('Error creating table AdultCollection: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Trails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract INTEGER,
        device INTEGER,
        applicator INTEGER,
        created_ondevice_at TEXT,
        transmition TEXT,
        marker TEXT,
        from_txt TEXT,
        latitude REAL,
        longitude REAL,
        altitude REAL,
        accuracy REAL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table Trails created successfully'),
      (_, error) => {
        console.log('Error creating table Trails: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS FlowRate (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pointreference INTEGER,
        device INTEGER,
        applicator INTEGER,
        start_date TEXT,
        end_date TEXT,
        average_width REAL,
        average_time REAL,
        average_profundity TEXT,
        observation TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table FlowRate created successfully'),
      (_, error) => {
        console.log('Error creating table FlowRate: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Customer (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        cnpj TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        phone TEXT,
        email TEXT,
        logo TEXT,
        organization_type INTEGER,
        observation TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table Customer created successfully'),
      (_, error) => {
        console.log('Error creating table Customer: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Contract (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        customer INTEGER,
        contract_status INTEGER,
        periodicity TEXT,
        start_date TEXT,
        end_date TEXT,
        point_limit INTEGER,
        point_overload INTEGER,
        volume_bti REAL,
        volume_bti_overload REAL,
        observation TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table Contract created successfully'),
      (_, error) => {
        console.log('Error creating table Contract: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ContractManager (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user INTEGER,
        registration TEXT,
        role TEXT,
        enabled INTEGER,
        log_datetime TEXT,
        contract INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table ContractManager created successfully'),
      (_, error) => {
        console.log('Error creating table ContractManager: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS SystemAdministrator (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user INTEGER,
        registration TEXT,
        role TEXT,
        enabled INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table SystemAdministrator created successfully'),
      (_, error) => {
        console.log('Error creating table SystemAdministrator: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS User (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        first_name TEXT,
        last_name TEXT,
        password TEXT,
        is_active INTEGER,
        is_staff INTEGER,
        is_superuser INTEGER,
        last_login TEXT,
        date_joined TEXT
      );`,
      [],
      () => console.log('Table User created successfully'),
      (_, error) => {
        console.log('Error creating table User: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Applicator (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        contract INTEGER,
        name TEXT,
        cpf TEXT,
        status INTEGER,
        new_marker INTEGER,
        edit_marker INTEGER,
        is_leader INTEGER,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table Applicator created successfully'),
      (_, error) => {
        console.log('Error creating table Applicator: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS Device (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        factory_id TEXT,
        name TEXT,
        authorized INTEGER,
        applicator INTEGER,
        last_sync TEXT,
        color_line TEXT,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table Device created successfully'),
      (_, error) => {
        console.log('Error creating table Device: ', error)
        return true
      },
    )

    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS ConfigApp (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        data_type TEXT,
        data_config TEXT,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );`,
      [],
      () => console.log('Table ConfigApp created successfully'),
      (_, error) => {
        console.log('Error creating table ConfigApp: ', error)
        return true
      },
    )
  })
}

export const dropDatabase = () => {
  db.transaction((tx) => {
    tx.executeSql(
      `DROP TABLE IF EXISTS Application;`,
      [],
      () => console.log('Table Application dropped successfully'),
      (_, error) => {
        console.error('Error dropping table Application: ', error)
        return false
      },
    )
  })
}
