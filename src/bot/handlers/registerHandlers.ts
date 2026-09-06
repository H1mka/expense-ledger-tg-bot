import { Bot } from 'grammy'
import { handleTextMessages } from './messageHandler'
import { registerPhotoHandler } from './photoHandler'
import { Env } from '../../index'

export const registerHandlers = (bot: Bot, env: Env) => {
	console.log('=== Register event handlers ===')

	handleTextMessages(bot, env)
	registerPhotoHandler(bot, env)
}
