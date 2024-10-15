import {Events} from "discord.js"
export default interface IEvents  {
	name: Events,
	execute(arg1: unknown, arg2?: unknown, arg3?: unknown, arg4?: unknown) : void
};