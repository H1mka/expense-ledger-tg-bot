import { registerStartCommand } from './registerStartCommand'
import { Bot } from 'grammy'

export const registerCommands = (bot: Bot) => {
	console.log('3. === Register commands ===')
	registerStartCommand(bot)
}
