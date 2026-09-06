import { Env } from '../index'

interface GoogleVisionResponse {
	responses: {
		fullTextAnnotation?: {
			text: string
		}
		error?: {
			code: number
			message: string
		}
	}[]
}

export class GoogleVisionService {
	google_token: string

	constructor(googleApiKey: string) {
		this.google_token = googleApiKey
	}

	async parseImageToText(image: string): Promise<Array<string>> {
		try {
			const response = await fetch(`https://vision.googleapis.com/v1/images:annotate?key=${this.google_token}`, {
				method: 'POST',
				body: JSON.stringify({
					requests: [
						{
							image: { content: image },
							features: [
								{
									type: 'DOCUMENT_TEXT_DETECTION',
								},
							],
						},
					],
				}),
			})

			const data = (await response.json()) as GoogleVisionResponse
			const responseArray = data?.responses || []

			if (!response.ok || !responseArray.length) return []

			return responseArray.map((item) => item.fullTextAnnotation?.text || '')
		} catch (error) {
			throw new Error(`Error while reading the image ${error}`)
		}
	}
}
