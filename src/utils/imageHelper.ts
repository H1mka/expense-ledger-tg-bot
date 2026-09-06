import { Api } from 'grammy'

const mockFileId: string = 'AgACAgIAAxkBAAMlaphUoqn0wxnSTKiI8aL_8uSaqxgAAqMgaxuYa8FIUldiCp05rC8BAAMCAAN5AAM9BA'

type TelegramPhotoResult = Response | null | string

const getTelegramPhotoURL = (token: string, file_path: string) => `https://api.telegram.org/file/bot${token}/${file_path}`

const downloadTelegramPhoto = async (fileId: string, botToken: string, api: Api): Promise<TelegramPhotoResult> => {
	try {
		const file = await api.getFile(fileId)
		console.log('!!! DEBUGING !!!', 'FILE:', JSON.stringify(file))

		if (!file.file_path) throw new Error('Image download failed')

		const photoResponse = await fetch(getTelegramPhotoURL(botToken, file.file_path))

		console.log('!!! DEBUGING !!!', 'photoResponse', JSON.stringify(photoResponse))

		return photoResponse
	} catch (error) {
		console.error('Error while downloading telegram image', String(error))

		if (error instanceof Error) {
			return error.message
		} else {
			return null
		}
	}
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer)
	const chunkSize = 8192

	let binary = ''

	for (let i = 0; i < bytes.length; i += chunkSize) {
		const chunk = bytes.subarray(i, i + chunkSize)

		binary += String.fromCharCode(...chunk)
	}

	return btoa(binary)
}

export { downloadTelegramPhoto, arrayBufferToBase64, type TelegramPhotoResult }
