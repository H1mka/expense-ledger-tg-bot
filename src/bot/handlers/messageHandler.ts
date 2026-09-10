import { Bot, Context } from 'grammy'
import { LLMService } from '../../services/LLMService'
import { Env } from '../../index'
import { getReceiptInfoTemplate } from '../../utils/expenseTextHelper'

export const handleTextMessages = (bot: Bot, env: Env) => {
	console.log('=== Register handle Text Messages ===')

	bot.on('message:text', async (ctx: Context) => {
		console.log('Bot received a message', JSON.stringify(ctx.message))
		const userText = ctx.message?.text
		if (!userText) return

		const llmService = new LLMService(env.AI)
		const response = await llmService.processText(userText)

		if (!response) {
			await ctx.reply(`⛔️ Something went wrong`)
			return
		}

		const receiptTemplate = getReceiptInfoTemplate(response)

		await ctx.reply(receiptTemplate)
	})
}
