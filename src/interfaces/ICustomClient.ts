import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient.js";
import ICommand from "../interfaces/command.js";
import Iautomod from "../interfaces/Iautomod.js";
import errorLoggerlib from "../functions/loggers/errorLogger.js";
import automodLoggerlib from "../functions/loggers/automodLogger.js";
import DatabaseManager from "../db/DatabaseManager.js";
import dotenv from "dotenv";
dotenv.config();

export default class CustomClient extends Client implements ICustomClient {
  messageCommands: Collection<string, ICommand>;
  commands: Collection<string, ICommand>;
  iaUser: Collection<string, string>;
  automod: Collection<string, Iautomod>;
  errorLogger: Function;
  automodLogger: Function;
  db: DatabaseManager;

  constructor() {
    const allIntents = Object.values(GatewayIntentBits).filter((v): v is number => typeof v === 'number').reduce((a, b) => a | b, 0);
    super({ intents: [allIntents] });
    this.commands = new Collection();
    this.iaUser = new Collection();
    this.messageCommands = new Collection();
    this.automod = new Collection();
    this.errorLogger = errorLoggerlib;
    this.automodLogger = automodLoggerlib;
    const baseDir = process.env.DATABASE_DIR || "/var/lib/vscbot";
    this.db = new DatabaseManager(baseDir);
    //this.db = new DatabaseManager(`${process.env.DATABASE_DIR}/vscbot.db` || '/var/vscbot/vscbot.db');
    //this.db = new DatabaseManager(`${process.env.DATABASE_DIR}/vscbot.db`);
  }
}
