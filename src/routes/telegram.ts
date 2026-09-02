import { webhookCallback } from 'grammy'

import { createBot } from '../bot/createBot'
import { Env } from '../index'

export async function handleTelegramWebhook(request: Request, env: Env) {
	const bot = createBot(env)

	return webhookCallback(bot, 'cloudflare-mod')(request)
}
