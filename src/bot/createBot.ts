import { Bot } from 'grammy'
import { Env } from '../index'

// Event registration helpers
import { registerCommands } from './commands/registerCommands'
import { registerHandlers } from './handlers/registerHandlers'

export const createBot = (env: Env) => {
	console.log('2. === Create bot ===')
	const bot = new Bot(env.BOT_TOKEN, { botInfo: env.BOT_INFO })

	console.log('3. === Bot was created successfully ===')

	registerCommands(bot)
	registerHandlers(bot)

	return bot
}
