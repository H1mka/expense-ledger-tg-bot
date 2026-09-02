import { Bot, Context } from 'grammy'

export const registerStartCommand = (bot: Bot) => {
	console.log('4. === Register Start command ===')

	bot.command('start', async (ctx: Context) => {
		console.log('START COMMAND WORKED', ctx.chat, ctx.from)

		await ctx.reply(`Hello world! \n\n Chat Info: ${JSON.stringify(ctx.chat)} ${ctx.chatId}, \n\n From Info: ${JSON.stringify(ctx.from)}`)
	})
}
