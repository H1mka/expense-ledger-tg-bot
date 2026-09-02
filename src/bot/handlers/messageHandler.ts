import { Bot, Context } from 'grammy'

export const handleTextMessages = (bot: Bot) => {
	console.log('=== Register handle Text Messages ===')

	bot.on('message', async (ctx: Context) => {
		console.log('Bot received a message', JSON.stringify(ctx.message))

		await ctx.reply('Your message is', ctx.message)
	})
}
