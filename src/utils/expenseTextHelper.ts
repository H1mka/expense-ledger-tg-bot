import { ExpenseData, ExpenseItem } from '../services/types'

const createGroups = (items: Array<ExpenseItem> = []): Record<string, Array<ExpenseItem>> => {
	if (typeof items === 'string') {
		items = JSON.parse(items)
	}

	const groups = new Map()

	items.forEach((item) => {
		const { category } = item

		if (groups.has(category)) {
			groups.get(category).push(item)
		} else {
			groups.set(category, [item])
		}
	})

	return Object.fromEntries(groups)
}

const getReceiptItemsTemplate = (receiptItems: Array<ExpenseItem>) => {
	const groupedItems = createGroups(receiptItems)

	return Object.keys(groupedItems).map((category) => {
		const values = groupedItems[category]
		const itemsText = values
			.map(
				(item) => `
					• ${item.name} — ${item.quantity} x ${item.unitPrice}`,
			)
			.join('\n')

		return `
      ${category}
      
      \t${itemsText}
    `
	})
	// return receiptItems.map((item) => `• ${item.name} — ${item.quantity} x ${item.unitPrice}`).join('\n')
}

const getReceiptInfoTemplate = (data: ExpenseData): string => {
	const { date, currency, items, paymentMethod, receiptTotal, store } = data

	const receiptItems = getReceiptItemsTemplate(items)

	return `
		<b>🧾 Чек</b>
		━━━━━━━━━━━━━━━
    📅 ${date}
    🏪 ${store}

    ${receiptItems}

		━━━━━━━━━━━━━━━
    💳 Оплата: ${paymentMethod}
    💰 Сумма: <b>${currency}${receiptTotal}</b>
  `
}

export { getReceiptInfoTemplate }
