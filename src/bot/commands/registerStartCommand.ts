import { Bot, Context } from 'grammy'

export const registerStartCommand = (bot: Bot) => {
	console.log('4. === Register Start command ===')

	bot.command('start', async (ctx: Context) => {
		console.log('START COMMAND WORKED')

		await ctx.reply(`Hello world! \n\n Chat Info:${ctx.chat} ${ctx.chatId}, \n\n From Info: ${ctx.from}`)
	})
}
