import { Bot, Context } from 'grammy'
import { Env } from '../../index'

import { LLMService } from '../../services/LLMService'
import { GoogleVisionService } from '../../services/GoogleVisionService'

import { downloadTelegramPhoto, arrayBufferToBase64, type TelegramPhotoResult } from '../../utils/imageHelper'
import { getReceiptInfoTemplate } from '../../utils/expenseTextHelper'

export const registerPhotoHandler = (bot: Bot, env: Env) => {
	console.log('=== Register photo handler ===')

	bot.on('message:photo', async (ctx: Context) => {
		console.log('Bot received a photo', JSON.stringify(ctx.message))

		const photo = ctx.message?.photo?.at(-1)

		if (!photo) {
			await ctx.reply('Image not found')
			return
		}

		// Get image in base64 format
		const photoResponse: TelegramPhotoResult = await downloadTelegramPhoto(photo.file_id, env.BOT_TOKEN, ctx.api)
		if (!photoResponse || typeof photoResponse === 'string' || !photoResponse.ok) {
			await ctx.reply(`Image download failed ${photoResponse}`)
			return
		}

		const buffer = await photoResponse.arrayBuffer()
		const base64 = arrayBufferToBase64(buffer)
		console.log('Image buffer length', base64.length)

		// Get image recognize from Google Vision
		const googleVision = new GoogleVisionService(env.GOOGLE_VISION_API_KEY)
		const textArray = await googleVision.parseImageToText(base64)
		console.log('TEXT RECOGNIZE RESULT', JSON.stringify(textArray))
		await ctx.reply(`TEXT RECOGNIZE RESULT ${JSON.stringify(textArray)}`)
		// await ctx.replyWithPhoto(photo.file_id, { caption: 'This is your photo' })

		// Text formatter with ai
		const llmService = new LLMService(env.AI)
		const response = await llmService.processImageToText(textArray)

		if (!response) {
			await ctx.reply(`⛔️ Something went wrong`)
			return
		}

		const receiptTemplate = getReceiptInfoTemplate(response)

		await ctx.reply(receiptTemplate)
	})
}
