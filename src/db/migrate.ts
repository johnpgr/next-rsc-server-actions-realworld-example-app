import { migrate } from "drizzle-orm/libsql/migrator"
import { db } from "."

console.log("Running migrations...")
migrate(db, {
    migrationsFolder: "./src/db/migrations",
})
    .then(() => {
        console.log("Migrations complete")
        process.exit(0)
    })
    .catch((err) => {
        console.error("Error running migrations", err)
        process.exit(1)
    })
