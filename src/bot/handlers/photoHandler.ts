import { Bot, Context } from 'grammy'

export const registerPhotoHandler = (bot: Bot) => {
	console.log('=== Register photo handler ===')

	bot.on('message:photo', async (ctx: Context) => {
		console.log('Bot received a photo', JSON.stringify(ctx.message))

		const photo = ctx.message?.photo?.at(-1)

		if (!photo) {
			await ctx.reply('Image not found')
			return
		}

		await ctx.replyWithPhoto(photo.file_id, { caption: 'This is your photo' })
	})
}
