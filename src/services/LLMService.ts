import { formatTextFromImageRules, formatTextRules, jsonSchema } from './rules'

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
	| null

type WorkersAiTextResponse = {
	response?: unknown
}

type WorkersAiMessage = {
	role: 'system' | 'user'
	content: string
}

export class LLMService {
	constructor(private readonly ai: Ai) {}

	async formatImageText(textFromImage: string | Array<string>): Promise<TextParseOutput> {
		const stringifyText = JSON.stringify(textFromImage)

		return this.generateJson<NonNullable<TextParseOutput>>(formatTextFromImageRules, stringifyText)
	}

	async formatText(userText: string): Promise<TextParseOutput> {
		return this.generateJson<NonNullable<TextParseOutput>>(formatTextRules, userText)
	}

	private async generateJson<T>(systemPrompt: string, userText: string): Promise<T | null> {
		try {
			const messages: WorkersAiMessage[] = [
				{ role: 'system', content: systemPrompt },
				{ role: 'user', content: userText },
			]

			const result = (await this.ai.run(LLM_MODEL, {
				messages,
				temperature: 0.1,
				max_tokens: 1024,
				response_format: { type: 'json_object', json_schema: jsonSchema },
			})) as WorkersAiTextResponse

			const response = result.response ?? result
			console.log(JSON.stringify(response), typeof response)

			if (!response) {
				throw new Error('Workers AI returned an empty response')
			}

			return this.parseJsonResponse<T>(response)
		} catch (error) {
			console.error('Error with LLM Service', error)
			return null
		}
	}

	private parseJsonResponse<T>(response: unknown): T {
		if (typeof response === 'object' && response !== null) {
			return response as T
		}

		if (typeof response !== 'string') {
			throw new Error(`Workers AI response has unsupported type: ${typeof response}`)
		}

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
