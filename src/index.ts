/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { handleTelegramWebhook } from './routes/telegram'
import { UserFromGetMe } from 'grammy/types'

export interface Env {
	BOT_TOKEN: string
	BOT_INFO: UserFromGetMe
}

export default {
	async fetch(request: Request, env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url)
		console.log('\n\n\n\n\n REQUEST', JSON.stringify(request), '\n\n\n\n\n')
		// console.log(url)

		if (url.pathname === '/telegram') {
			handleTelegramWebhook(request, env)
		}

		return new Response("Request doesn't match any existing route")
	},
} satisfies ExportedHandler<Env>
