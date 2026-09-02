import { registerStartCommand } from './registerStartCommand'
import { Bot } from 'grammy'

export const registerCommands = (bot: Bot) => {
	registerStartCommand(bot)
}
