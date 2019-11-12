#!/usr/bin/env node

const f = require('faker');

const { pick, several, normal, lognormal } = require('./distributions.js');

function* generateData({ customers, products, orders }) {
	const customerIDs = [];
	const productIDs = [];

	for (const c of generateCustomers(customers)) {
		customerIDs.push(c.id);
		yield c;
	}
	for (const p of generateProducts(products)) {
		productIDs.push(p.id);
		yield p;
	}
	yield* generateOrders(customerIDs, productIDs, orders);
}

function* generateCustomers(count = 100) {
	for (let i = 0; i < count; i++) {
		const id = f.random.uuid();
		yield {
			type: 'customer',
			id,
			name: { first: f.name.firstName(), last: f.name.lastName() },
			address: {
				street: f.address.streetAddress(),
				city: f.address.city(),
				zip: f.address.zipCode()
			},
			notes: several(
				() => ({
					timestamp: f.date.recent(),
					text: f.lorem.sentence()
				}),
				() => lognormal(0, 1.5)
			),
			verified: f.random.boolean()
		};
	}
}

function* generateProducts(count = 100) {
	for (let i = 0; i < count; i++) {
		const id = f.random.uuid();
		yield {
			type: 'product',
			id
		};
	}
}

function* generateOrders(customers, products, count = 1000) {
	for (let i = 0; i < count; i++) {
		const id = f.random.uuid();
		yield {
			type: 'order',
			id,
			customer: pick(customers),
			lines: several(
				() => ({
					product: pick(products),
					quantity: Math.max(1, Math.floor(normal(100, 60)))
				}),
				() => lognormal(0, 1.5)
			)
		};
	}
}

function envelope(entity) {
	return {
		headers: {
			type: entity.type
		},
		instance: entity
	};
}

const fs = require('fs');

const totals = { index: 0, customer: 0, product: 0, order: 0 };

/** Number of each type of entity to create */
const counts = {
	customers: 5033,
	products: 602,
	orders: 20755
};

/** Total number of entities */
const total = Object.getOwnPropertyNames(counts).reduce(
	(p, c) => p + counts[c],
	0
);

/** Limit to 25 output messages */
const reportFrequency = Math.floor(total / 25);

for (const item of generateData(counts)) {
	totals[item.type] = totals[item.type] + 1;
	totals.index = totals.index + 1;
	if (0 === totals.index % reportFrequency) {
		process.stdout.write(
			`Customers: ${totals.customer}, Products: ${totals.product}, Orders: ${totals.order}\n`
		);
	}
	fs.writeFileSync(
		`${process.cwd()}/data/${item.type}s/${item.id}.json`,
		JSON.stringify(envelope(item), null, 2)
	);
}
