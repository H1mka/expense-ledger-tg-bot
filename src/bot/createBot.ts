import { Bot, Context, webhookCallback } from 'grammy'
import { Env } from '../index'
import { registerCommands } from './commands/registerCommands'

export const createBot = (env: Env) => {
	const bot = new Bot(env.BOT_TOKEN, { botInfo: JSON.parse(env.BOT_INFO) })

	registerCommands(bot)

	return bot
}
