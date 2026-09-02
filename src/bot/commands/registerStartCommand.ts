import { Bot, Context } from 'grammy'

export const registerStartCommand = (bot: Bot) => {
	bot.command('start', async (ctx: Context) => {
		await ctx.reply('Hello world!')
	})
}
