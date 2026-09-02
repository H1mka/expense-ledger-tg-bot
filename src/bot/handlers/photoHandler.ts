import { Bot, Context } from 'grammy'

export const registerPhotoHandler = (bot: Bot) => {
	console.log('=== Register photo handler ===')

	bot.on('message:photo', (ctx: Context) => {
		console.log('Bot received a photo', JSON.stringify(ctx.message))

		try {
			const photo = ctx.message?.photo?.at(-1)

			if (!photo) {
				ctx.reply('Image not found')
				return
			}

			ctx.replyWithPhoto(photo.file_id, { caption: 'This is your photo' })
			console.log('Bot respond by photo')
		} catch (error) {
			console.error('Register photo handler error:', error)
		}
	})
}
