import { Bot } from 'grammy'
import { handleTextMessages } from './messageHandler'

export const registerHandlers = (bot: Bot) => {
	console.log('=== Register event handlers ===')

	handleTextMessages(bot)
}
