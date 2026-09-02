import { webhookCallback } from 'grammy'

import { createBot } from '../bot/createBot'
import { Env } from '../index'

export async function handleTelegramWebhook(request: Request, env: Env) {
	console.log('Init bot')
	const bot = createBot(env)

	return webhookCallback(bot, 'cloudflare-mod')(request)
}
