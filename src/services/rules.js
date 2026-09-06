const categoriesEnum = [
	'🛒 Продукты',
	'🍽️ Кафе и рестораны',
	'🚗 Транспорт',
	'⛽ Автомобиль',
	'🏠 Жильё',
	'💊 Здоровье',
	'👕 Одежда',
	'🎮 Развлечения',
	'💳 Подписки',
	'✈️ Путешествия',
	'📦 Другое',
]

const categoriesList = categoriesEnum.map((category) => `- ${category}`).join('\n')
const fallbackCategory = categoriesEnum[categoriesEnum.length - 1]
const today = new Date()

const jsonSchema = {
	type: 'object',
	properties: {
		success: {
			type: 'boolean',
		},
		message: {
			type: ['string', 'null'],
		},
		data: {
			type: ['object', 'null'],
			properties: {
				store: {
					type: ['string', 'null'],
				},
				date: {
					type: 'string',
				},
				currency: {
					type: ['string', 'null'],
				},
				paymentMethod: {
					enum: ['Card', 'Cash', 'Bank Transfer', 'Voucher', null],
				},
				receiptTotal: {
					type: ['number', 'null'],
					minimum: 0,
				},
				items: {
					type: 'array',
					items: {
						type: 'object',
						properties: {
							name: {
								type: 'string',
							},
							quantity: {
								type: 'number',
								exclusiveMinimum: 0,
							},
							unitPrice: {
								type: ['number', 'null'],
								minimum: 0,
							},
							category: {
								type: 'string',
								enum: categoriesEnum,
							},
						},
						required: ['name', 'quantity', 'unitPrice', 'category'],
						additionalProperties: false,
					},
				},
			},
			required: ['store', 'date', 'currency', 'paymentMethod', 'receiptTotal', 'items'],
			additionalProperties: false,
		},
		missingFields: {
			type: 'array',
			items: {
				type: 'string',
			},
		},
		confidence: {
			type: 'number',
			minimum: 0,
			maximum: 1,
		},
	},

	required: ['success', 'message', 'data', 'missingFields', 'confidence'],

	additionalProperties: false,
}

const ParsedReceipt = `
{
  "success": boolean,
  "message": string | null,
  "data": {
    "date": "YYYY-MM-DD" | null,
    "store": string | null,
    "category": string | null,
    "price": number | null,
    "amount": number,
    "currency": string | null,
    "description": string | null,
    "paymentMethod": string | null,
    "confidence": number,
    "missingFields": string[]
  } | null
}
`

/** --- Format text from image rules --- */

const formatTextFromImageRules = `
You are a receipt parser.

Convert raw OCR receipt text into structured purchase data.

Today's date:
${today}

Rules:

Extract the store name, transaction date, currency, payment method, final receipt total, and all purchased items.
Ignore VAT/tax lines, receipt IDs, addresses, payment totals, promotional text, loyalty information, and other non-purchase text.
Do not invent information.

Receipt:

"store": merchant/store name.
"date": transaction date in YYYY-MM-DD format. Convert two-digit years to four digits. If missing, use "${today}".
"currency": ISO code such as EUR, GBP, USD.
"paymentMethod": "Card", "Cash", "Bank Transfer", "Voucher", or null.
"receiptTotal": final amount paid. Prefer the value associated with TOTAL. Do not use VAT, subtotal, cash tendered, change, or item prices.

Items:

Extract every purchased product into "items".
One purchased product = one item object.
Do not create items from TOTAL, VAT, payment, discount, receipt ID, address, or promotional lines.

For each item:

"name": product name.
"quantity": purchased quantity. If no explicit quantity is shown, use 1.
Never infer quantity from package descriptions. "Milk 2L", "12 Slices", and "6 Pack" normally mean quantity 1.
"unitPrice": price of one unit.
If quantity is 1, use the product line price.
If quantity > 1 and the relationship is clear, use the displayed unit price or calculate line total / quantity.
"category": exactly one category from the available categories. Categorize each product separately. If uncertain, use "${fallbackCategory}".

Success:

Set "success" to true if the input is a recognizable receipt and at least one purchased item was reliably extracted.
Otherwise set "success" to false, "data" to null, and provide a short "message".
When success is true, "message" must be null.

Set "confidence" from 0 to 1 based on OCR quality and extraction reliability.
Add uncertain or unavailable fields to "missingFields".

Return only data matching the provided JSON schema.
`

/** --- Format text rules --- */

const formatTextRules = `
You are an expense text parser.

Input:
- You receive any free-form text written by a user.
- The user may describe an expense in a short, messy, informal, or incomplete way.
- The text can be in any language.

Available categories:
${categoriesList}

Task:
- Convert the user's text into one valid JSON object.
- Do not return markdown, comments, explanations, or extra text.
- If the text contains enough information to create an expense record, return "success": true.
- If the text is nonsense, unrelated to expenses, or does not contain enough information, return "success": false.
- "message" must explain briefly what is missing or why the text cannot be parsed.
- When "success" is true, "data" must contain the parsed expense object.
- When "success" is false, "data" must be null.

Required information for success:
- There must be a clear expense amount or price.
- There must be enough context to create a useful "description" or detect a "store".
- If currency is missing but the text clearly uses a local/known default currency from application context, use it. Otherwise set currency to null and include "currency" in "missingFields".

Expense data rules:
- Use ISO date format YYYY-MM-DD.
- If the user writes a relative date such as "today", "yesterday", or "tomorrow", use the current date only if it is provided in the application context. If no current date is provided, use null and include "date" in "missingFields".
- If the user does not mention a date, use null and include "date" in "missingFields".
- Detect "store" only if the user mentions a merchant, shop, restaurant, service, or place. Otherwise use null.
- Choose "category" strictly from the available categories list above. Do not invent new category names. If none of the categories fit reliably, use "${fallbackCategory}".
- "price" must be the total expense amount as a JSON number, not a string.
- "amount" should be the quantity of identical units if the user clearly states it. Otherwise use 1.
- "currency" must be an ISO currency code such as "EUR", "GBP", "USD", or null.
- Detect payment method as "Card", "Cash", "Bank Transfer", "Voucher", or null.
- Keep "description" short and human-readable.
- Set "confidence" from 0 to 1 based on how complete and reliable the parsed data is.
- Add names of fields you could not reliably extract to "missingFields".

Output JSON schema:
${textOutputJsonSchema}

Rules:
- The JSON must be parseable by JSON.parse.
- Use double quotes for all JSON keys and string values.
- Do not include trailing commas.
- Numbers must be JSON numbers, not strings.
- For successful parsing, set "message" to null.
- For failed parsing, set "success" to false, "data" to null, and "message" to a short user-facing explanation.
`

export { formatTextFromImageRules, formatTextRules, jsonSchema, categoriesEnum }
