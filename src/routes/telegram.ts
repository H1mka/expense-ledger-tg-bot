import { webhookCallback } from 'grammy'

import { createBot } from '../bot/createBot'
import { Env } from '../index'

export async function handleTelegramWebhook(request: Request, env: Env): Promise<Response> {
	console.log('1. === Handle Telegram Webhook ===')

	try {
		const bot = createBot(env)

		return webhookCallback(bot, 'cloudflare-mod')(request)
	} catch (error) {
		console.error('Create bot initialize error:', error)

		return new Response('Internal server error', { status: 500 })
	}
}
