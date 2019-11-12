#!/usr/bin/env node

const { docopt } = require('docopt');

const doc = `Generate customer-product-order data.

Usage:
  ${
		require('./package.json').name
	} [--orders=<num> --products=<num> --customers=<num>]

Options:
  -h --help       Show this screen
  --orders=<num>   Number of orders [default: 100]
  --products=<num>   Number of products [default: 5]
  --customers=<num>  Number of customers [default: 25]

`;

const options = docopt(doc);

// console.log(options);

const { generateData, envelope } = require('./src/generator.js');

const fs = require('fs');

const totals = { index: 0, customer: 0, product: 0, order: 0 };

/** Number of each type of entity to create */
const counts = {
	customers: parseInt(options['--customers'], 10),
	products: parseInt(options['--products'], 10),
	orders: parseInt(options['--orders'], 10)
};
process.stdout.write(
	`Generating ${counts.customers} customers, ${counts.products} products, and ${counts.orders} orders.\n\n`
);

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
