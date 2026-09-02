import { Bot } from 'grammy'
import { handleTextMessages } from './messageHandler'

export const registerHandlers = (bot: Bot) => {
	handleTextMessages(bot)
}
