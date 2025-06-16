import { createClient } from "@libsql/client"
import config from "../config/config.js"

export const turso = createClient({
  synUrl: config.tursoDB,
  authToken: config.authToken,
  syncInterval: 300000
})