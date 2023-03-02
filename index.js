const { DATABASE_SCHEMA, DATABASE_URL, SHOW_PG_MONITOR } = require("./config");
const massive = require("massive");
const monitor = require("pg-monitor");
const getData = require("./utils/getData");

// Call start
(async () => {
  console.log("main.js: before start");

  const db = await massive(
    {
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    },
    {
      // Massive Configuration
      scripts: process.cwd() + "/migration",
      allowedSchemas: [DATABASE_SCHEMA],
      whitelist: [`${DATABASE_SCHEMA}.%`],
      excludeFunctions: true,
    },
    {
      // Driver Configuration
      noWarnings: true,
      error: function (err, client) {
        console.log(err);
        //process.emit('uncaughtException', err);
        //throw err;
      },
    }
  );

  if (!monitor.isAttached() && SHOW_PG_MONITOR === "true") {
    monitor.attach(db.driverConfig);
  }

  const execFileSql = async (schema, type) => {
    return new Promise(async (resolve) => {
      const objects = db["user"][type];

      if (objects) {
        for (const [key, func] of Object.entries(objects)) {
          console.log(`executing ${schema} ${type} ${key}...`);
          await func({
            schema: DATABASE_SCHEMA,
          });
        }
      }

      resolve();
    });
  };

  //public
  const migrationUp = async () => {
    return new Promise(async (resolve) => {
      await execFileSql(DATABASE_SCHEMA, "schema");

      //cria as estruturas necessarias no db (schema)
      await execFileSql(DATABASE_SCHEMA, "table");
      await execFileSql(DATABASE_SCHEMA, "view");

      console.log(`reload schemas ...`);
      await db.reload();

      resolve();
    });
  };

  try {
    await migrationUp();
    //insert data in db
    const data = await getData();

    const db_data = data.map((dt) => {
      return {
        doc_name: dt["Nation"],
        doc_id: dt["ID Nation"],
        doc_record: dt,
      };
    });

    await db[DATABASE_SCHEMA].api_data.insert(db_data);

    //exemplo de insert
    // const result1 = await db[DATABASE_SCHEMA].api_data.insert({
    //   doc_record: { a: "b" },
    // });
    // console.log("result1 >>>", result1);

    //exemplo select
    const result2 = await db[DATABASE_SCHEMA].api_data.find({
      is_active: true,
    });
    console.log("result2 >>>", result2);
  } catch (e) {
    console.log(e.message);
  } finally {
    console.log("finally");
  }
  console.log("main.js: after start");
})();
