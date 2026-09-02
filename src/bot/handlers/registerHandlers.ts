import { Bot } from 'grammy'
import { handleTextMessages } from './messageHandler'
import { registerPhotoHandler } from './photoHandler'

export const registerHandlers = (bot: Bot) => {
	console.log('=== Register event handlers ===')

	handleTextMessages(bot)
	registerPhotoHandler(bot)
}
