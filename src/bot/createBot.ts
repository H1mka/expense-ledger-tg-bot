import { Bot } from 'grammy'
import { Env } from '../index'
import { registerCommands } from './commands/registerCommands'

export const createBot = (env: Env) => {
	console.log('2. === Create bot ===')
	const bot = new Bot(env.BOT_TOKEN, { botInfo: env.BOT_INFO })

	console.log('3. === Bot was created successfully ===')

	registerCommands(bot)
	return bot
}
