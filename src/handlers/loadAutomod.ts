import { Collection } from "discord.js";
import type Client from "../interfaces/ICustomClient.js";
import type IAutomod from "../interfaces/Iautomod.js";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import chalk from "chalk";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * Carga de forma asíncrona todas las funciones de automoderación.
 * @param {Client} client La instancia del cliente de Discord.
 */
export default async (client: Client): Promise<void> => {
  client.automod = new Collection<string, IAutomod>();
  console.log(chalk.whiteBright("🤖 Cargando funciones de automoderación..."));

  const automodPath = path.join(__dirname, "..", "functions", "automod");
  let loadedCount = 0;

  try {
    const automodFolders = await fs.readdir(automodPath, { withFileTypes: true });
    const automodPromises: Promise<IAutomod | null>[] = [];

    // 1. Recorrer las carpetas y recolectar las promesas de importación
    for (const folder of automodFolders) {
      if (!folder.isDirectory()) continue;

      const folderPath = path.join(automodPath, folder.name);
      const automodFiles = await fs.readdir(folderPath);

      for (const file of automodFiles.filter(f => f.endsWith(".js"))) {
        const filePath = path.join(folderPath, file);
        const fileUrl = pathToFileURL(filePath);

        // 2. Crear una promesa para cada importación y añadirla al array
        const importPromise = import(fileUrl.href)
          .then(module => {
            const automod: IAutomod = module.default;
            console.log(chalk.yellowBright(`[AUTOMOD LOADED] ${automod.name}`));
            return automod;
          })
          .catch(error => {
            console.error(chalk.redBright(`❌ Error al cargar el archivo de automod ${filePath}:`), error);
            return null; // Devolver null para que Promise.all no falle
          });

        automodPromises.push(importPromise);
      }
    }

    // 3. Esperar a que todas las promesas se resuelvan en paralelo
    const loadedAutomods = await Promise.all(automodPromises);

    // 4. Recorrer los resultados y añadir los módulos válidos a la colección
    for (const automod of loadedAutomods) {
      if (automod) {
        client.automod.set(automod.name, automod);
        loadedCount++;
      }
    }

    console.log(chalk.greenBright(`[ÉXITO] Se cargaron ${loadedCount} funciones de automoderación.`));

  } catch (error) {
    console.error(chalk.redBright("❌ No se pudo leer el directorio de automoderación:"), error);
  }
};
