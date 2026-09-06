import { formatTextFromImageRules, formatTextRules } from './rules'

const LLM_MODEL = '@cf/meta/llama-3.1-8b-instruct-fast'

type ExpenseData = {
	date: string | null
	store: string | null
	category: string | null
	price: number | null
	amount: number
	currency: string | null
	description: string | null
	paymentMethod: string | null
	confidence: number
	missingFields: string[]
}

type TextParseOutput =
	| {
			success: true
			message: null
			data: ExpenseData
	  }
	| {
			success: false
			message: string
			data: null
	  }

type WorkersAiTextResponse = {
	response?: string
}

type WorkersAiMessage = {
	role: 'system' | 'user'
	content: string
}

export class LLMService {
	constructor(private readonly ai: Ai) {}

	async formatImageText(textFromImage: string | Array<string>): Promise<TextParseOutput> {
		const stringifyText = JSON.stringify(textFromImage)

		return this.generateJson<TextParseOutput>(formatTextFromImageRules, stringifyText)
	}

	async formatText(userText: string): Promise<TextParseOutput> {
		return this.generateJson<TextParseOutput>(formatTextRules, userText)
	}

	private async generateJson<T>(systemPrompt: string, userText: string): Promise<T> {
		const messages: WorkersAiMessage[] = [
			{ role: 'system', content: systemPrompt },
			{ role: 'user', content: userText },
		]

		const result = (await this.ai.run(LLM_MODEL, {
			messages,
			temperature: 0.1,
			max_tokens: 1024,
			response_format: { type: 'json_object' },
		})) as WorkersAiTextResponse

		if (!result.response) {
			throw new Error('Workers AI returned an empty response')
		}

		return this.parseJsonResponse<T>(result.response)
	}

	private parseJsonResponse<T>(response: string): T {
		try {
			return JSON.parse(response) as T
		} catch {
			const jsonMatch = response.match(/\{[\s\S]*\}/)

			if (!jsonMatch) {
				throw new Error(`Workers AI response is not valid JSON: ${response}`)
			}

			return JSON.parse(jsonMatch[0]) as T
		}
	}
}
