import { Bot, Context } from 'grammy'
import { LLMService } from '../../services/LLMService'
import { Env } from '../../index'

export const handleTextMessages = (bot: Bot, env: Env) => {
	console.log('=== Register handle Text Messages ===')

	bot.on('message:text', async (ctx: Context) => {
		console.log('Bot received a message', JSON.stringify(ctx.message))
		const userText = ctx.message?.text
		if (!userText) return

		const llmService = new LLMService(env.AI)
		const response = await llmService.formatText(userText)

		if (!response || !response.success) {
			await ctx.reply(`⛔️ Something went wrong: ${JSON.stringify(response?.message)}`)
			return
		}

		await ctx.reply(`Json format ${JSON.stringify(response.data)}`)
	})
}
