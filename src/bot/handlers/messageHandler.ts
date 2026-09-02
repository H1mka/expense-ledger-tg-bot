import { Bot, Context } from 'grammy'

export const handleTextMessages = (bot: Bot) => {
	bot.on('message', (ctx: Context) => {
		ctx.reply('Your message is', ctx.message)
	})
}
