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

const defaultCurrency = '€'

const categoriesList = categoriesEnum.map((category) => `- ${category}`).join('\n')
const fallbackCategory = categoriesEnum[categoriesEnum.length - 1]
const date = new Date()
const formatter = new Intl.DateTimeFormat('ru-RU', {
	day: '2-digit',
	month: '2-digit',
	year: 'numeric',
})
const today = formatter.format().replaceAll('.', '-')

// const jsonSchema = {
// 	type: 'object',
// 	properties: {
// 		text: {
// 			description: 'Short text about receipt',
// 			type: 'string',
// 		},
// 		success: {
// 			description: 'Booleand value about operation status',
// 			type: 'boolean',
// 		},
// 		isStoreLidl: {
// 			description: 'Define boolean value, set true if store equals Lidl',
// 			type: ['boolean', 'null'],
// 		},
// 	},
// 	required: ['text', 'success'],
// 	additionalProperties: false,
// }

// const jsonSchema = {
// 	type: 'object',
// 	properties: {
// 		store: {
// 			type: ['string', 'null'],
// 		},
// 		date: {
// 			type: 'string',
// 			pattern: '^\\d{2}-\\d{2}-\\d{4}$',
// 		},
// 		currency: {
// 			type: ['string', 'null'],
// 		},
// 		paymentMethod: {
// 			enum: ['Card', 'Cash', 'Bank Transfer', 'Voucher', null],
// 		},
// 		receiptTotal: {
// 			type: ['number', 'null'],
// 			minimum: 0,
// 		},
// 		items: {
// 			type: 'array',
// 			description: 'An array that contains receipt items',
// 			items: {
// 				type: 'object',
// 				properties: {
// 					name: {
// 						type: 'string',
// 					},
// 					quantity: {
// 						type: 'number',
// 						exclusiveMinimum: 0,
// 					},
// 					unitPrice: {
// 						type: ['number', 'null'],
// 						minimum: 0,
// 					},
// 					category: {
// 						type: 'string',
// 						enum: categoriesEnum,
// 					},
// 				},
// 				required: ['name', 'quantity', 'unitPrice', 'category'],
// 				additionalProperties: false,
// 			},
// 		},
// 		required: ['store', 'date', 'currency', 'paymentMethod', 'receiptTotal', 'items'],
// 		additionalProperties: false,
// 	},
// }
const jsonSchema = {
	type: 'object',
	properties: {
		store: {
			type: ['string', 'null'],
			description: 'Name of the store or merchant where the purchase was made. Return null if it cannot be identified.',
		},

		date: {
			type: 'string',
			pattern: '^\\d{2}-\\d{2}-\\d{4}$',
			description:
				'Purchase date in DD-MM-YYYY format. Use the date explicitly found in the receipt or user message. For relative dates such as today or yesterday, resolve them using the current date provided in the prompt.',
		},

		currency: {
			type: ['string', 'null'],
			description:
				'Currency used for the purchase, preferably as a standard currency code such as EUR, USD or GBP. Return null if unknown.',
		},

		paymentMethod: {
			enum: ['Card', 'Cash', 'Bank Transfer', 'Voucher', null],
			description: 'Payment method used for the purchase. Return null when the payment method cannot be reliably determined.',
		},

		receiptTotal: {
			type: ['number', 'null'],
			minimum: 0,
			description:
				'Final total amount paid for the purchase. Do not confuse it with change, cashback, deposit amounts, individual item totals, or subtotal. Return null if the final total cannot be reliably identified.',
		},

		items: {
			type: 'array',
			description: 'List of all purchased products or services. Each distinct purchased product must be represented as a separate item.',
			items: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
						description:
							'Clean product name. Preserve the intended product name while correcting obvious OCR or spelling errors. Do not include the price or quantity in the name.',
					},

					quantity: {
						type: 'number',
						exclusiveMinimum: 0,
						description:
							'Number of units purchased. Default to 1 when only one unit is indicated. Do not treat package size or volume as quantity: for example, "Milk 2L" means quantity 1.',
					},

					unitPrice: {
						type: ['number', 'null'],
						minimum: 0,
						description:
							'Price of one purchased unit. If multiple identical units have a combined price, calculate the unit price when the quantity and total price are clear. Return null if the unit price cannot be reliably determined.',
					},

					category: {
						type: 'string',
						enum: categoriesEnum,
						description:
							'Category of the purchased product. Classify the product itself, using the merchant as context. For example, packaged food bought at a supermarket is groceries, not a restaurant purchase.',
					},
				},
				required: ['name', 'quantity', 'unitPrice', 'category'],
				additionalProperties: false,
			},
		},
	},
	required: ['store', 'date', 'currency', 'paymentMethod', 'receiptTotal', 'items'],
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
${defaultCurrency}

Rules:

Extract the store name, transaction date, currency, payment method, final receipt total, and all purchased items.
Ignore VAT/tax lines, receipt IDs, addresses, payment totals, promotional text, loyalty information, and other non-purchase text.
Do not invent information.

Receipt:

"store": merchant/store name.
"date": transaction date in DD-MM-YYYY format. Convert two-digit years to four digits. If missing, use "${today}".
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
- For supermarket or grocery store receipt, food and drink products should normally be categorized as "Groceries".
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
${defaultCurrency}

Rules:

Extract all purchased items mentioned by the user.
One product = one item.
Do not invent missing information.
Correct obvious spelling mistakes when the intended store or product is clear.

Receipt fields:

"store": merchant/store name, or null if unknown.
"date": DD-MM-YYYY. Understand relative dates such as "today" and "yesterday". If missing, use "${today}".
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

const test = {
	confidence: 0.9,
	currency: 'EUR',
	date: '2026-08-25',
	items: [
		{ category: 'Food', name: 'Classic Ice Cream Sticks', quantity: 1, unitPrice: 3.59 },
		{ category: 'Dairy', name: 'Gouda 12 Slices', quantity: 1, unitPrice: 2.89 },
		{ category: 'Dairy', name: 'Whole Milk 2L', quantity: 1, unitPrice: 2.25 },
		{ category: 'Snacks', name: 'Pumpkin Seeds', quantity: 1, unitPrice: 1.45 },
		{ category: 'Personal Care', name: 'Expert Shampoo Hyaluronic', quantity: 1, unitPrice: 2.99 },
	],
	missingFields: [],
	paymentMethod: 'Cash',
	receiptTotal: 13.17,
	store: 'LIDL',
}

const test2 = {
	currency: 'EUR',
	date: '1970-09-01',
	items: [
		{ category: 'Fish Oil', name: 'Omega-3 Fish', quantity: 2, unitPrice: 32.87 },
		{ category: 'Vitamins', name: 'Vitamin D3, 2,000 IU, 120 Softgels', quantity: 1, unitPrice: 5.75 },
		{ category: 'Biotin', name: 'Biotin, 5,000 mcg, 110 Capsules', quantity: 1, unitPrice: 8.38 },
		{ category: 'Calcium', name: 'Calcium 500+ D3, 90 Tablets', quantity: 2, unitPrice: 10.66 },
	],
	missingFields: [],
	paymentMethod: null,
	receiptTotal: 57.66,
	store: 'iHerb',
}

const test3 = {
	confidence: 0.9,
	currency: 'EUR',
	date: '2026-08-25',
	items: [
		{ category: '🍽 Кафе и рестораны', name: 'Classic Ice Cream Sticks', quantity: 1, unitPrice: 3.59 },
		{ category: '🛒 Продукты', name: 'Gouda 12 Slices', quantity: 1, unitPrice: 2.89 },
		{ category: '🛒 Продукты', name: 'Whole Milk 2L', quantity: 1, unitPrice: 2.25 },
		{ category: '🛒 Продукты', name: 'Pumpkin Seeds', quantity: 1, unitPrice: 1.45 },
		{ category: '💊 Здоровье', name: 'Expert Shampoo Hyaluronic', quantity: 1, unitPrice: 2.99 },
	],
	missingFields: [],
	paymentMethod: 'Cash',
	receiptTotal: 13.17,
	store: 'LIDL',
}

const text1 = {
	receipts: [
		{
			currency: '€',
			date: 'Thu Jan 01 1970 00:00:00 GMT+0000 (Coordinated Universal Time)',
			items: [{ category: '🛒 Продукты', name: 'Мороженное', quantity: 1, unitPrice: 3.55 }],
			paymentMethod: null,
			receiptTotal: 3.55,
			store: null,
		},
	],
}

export { formatTextFromImageRules, formatTextRules, jsonSchema, categoriesEnum }
