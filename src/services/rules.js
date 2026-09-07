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

Available categories:
${categoriesList}

Fallback category:
${fallbackCategory}

Default currency:
€

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

Category rules:

- Use both the product type and the merchant context when choosing a category.
- For supermarket or grocery store receipts, food and drink products should normally be categorized as "Groceries".
- Use "Cafe & Restaurants" only for purchases from restaurants, cafes, takeaways, bars, or similar food-service merchants.
- A food product does NOT belong to "Cafe & Restaurants" merely because it is ready to eat.
- Non-food supermarket products must still use their actual category.

Examples:
- Lidl + Ice Cream → Groceries
- Lidl + Milk → Groceries
- Lidl + Shampoo → Personal Care
- McDonald's + Burger → Cafe & Restaurants
- Starbucks + Coffee → Cafe & Restaurants

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
You are an expense parser.

Convert the user's expense message into structured data matching the provided JSON schema.

Today's date:
${today}

Available categories:
${categoriesList}

Fallback category:
${fallbackCategory}

Default currency:
€

Rules:

Extract all purchased items mentioned by the user.
One product = one item.
Do not invent missing information.
Correct obvious spelling mistakes when the intended store or product is clear.

Receipt fields:

"store": merchant/store name, or null if unknown.
"date": YYYY-MM-DD. Understand relative dates such as "today" and "yesterday". If missing, use "${today}".
"currency": use the mentioned currency, otherwise "${defaultCurrency}".
"paymentMethod": "Card", "Cash", "Bank Transfer", "Voucher", or null.
"receiptTotal": use only if the user clearly provides the total purchase amount; otherwise null.

Item fields:

"name": clean product name.
"quantity": purchased quantity; default to 1.
Do not confuse package size with quantity. "Milk 2L" means quantity 1.
"unitPrice": price for one unit.
If multiple units are bought for one combined price, calculate unitPrice when unambiguous.
"category": exactly one available category. Categorize the product itself, using the merchant only as context.

Category rules:

Supermarket food and drinks → Groceries.
Restaurant, cafe, takeaway or bar purchases → Cafe & Restaurants.
Shampoo, soap, toothpaste, cosmetics and hygiene products → Personal Care.
Clothes means clothing, footwear and wearable accessories.
If uncertain, use "${fallbackCategory}".

Set "success" to true if at least one expense item can be reliably identified.
Otherwise set "success" to false and "data" to null.

Set "confidence" from 0 to 1.
Add fields that could not be reliably determined to "missingFields".

Return only data matching the provided JSON schema.
`

export { formatTextFromImageRules, formatTextRules, jsonSchema, categoriesEnum }
