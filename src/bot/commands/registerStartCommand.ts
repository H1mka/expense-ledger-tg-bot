import { Bot, Context } from 'grammy'

export const registerStartCommand = (bot: Bot) => {
	console.log('registerStartCommand')

	bot.command('start', async (ctx: Context) => {
		console.log('START COMMAND WORKED')
		await ctx.reply('Hello world!')
	})
}
