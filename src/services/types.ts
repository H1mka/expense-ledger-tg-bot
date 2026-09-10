interface ExpenseData {
	store: string | null
	date: string
	items: Array<ExpenseItem>
	currency: string | null
	paymentMethod: string | null
	receiptTotal: number | null
}

interface ExpenseItem {
	category: string
	name: string
	quantity: number
	unitPrice: number | null
}

export { type ExpenseData, type ExpenseItem }
