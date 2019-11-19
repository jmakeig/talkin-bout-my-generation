#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { docopt } = require('docopt');
const { generateData, envelope } = require('./src/generator.js');
const name = require('./package.json').name;

const doc = `
Generate customer-product-order data.

Usage:
  ${name} [--output DIR]
  ${name} entities ([--orders=<num> --products=<num> --customers=<num>]) [--output DIR]

Options:
  -h --help           Show this screen
  --orders=<num>      Number of orders    [default: 100]
  --products=<num>    Number of products  [default: 5]
  --customers=<num>   Number of customers [default: 25]
  -o --output DIR     Output directory
`;

const options = docopt(doc);
const outputDir = path.resolve(coalesce(options['--output'], 'data'));

function coalesce(...values) {
	for (const value of values) {
		if (null !== value && undefined !== value) return value;
	}
}

// console.log(outputDir);

const totals = { index: 0, customer: 0, product: 0, order: 0 };

/** Number of each type of entity to create */
const counts = {
	customers: parseInt(options['--customers'], 10),
	products: parseInt(options['--products'], 10),
	orders: parseInt(options['--orders'], 10)
};

const diagnostics = process.stderr;

diagnostics.write(
	`Generating ${counts.customers} customers, ${counts.products} products, and ${counts.orders} orders in ${outputDir}.\n`
);

/** Total number of entities */
const total = Object.getOwnPropertyNames(counts).reduce(
	(p, c) => p + counts[c],
	0
);

/** Limit to 25 output messages */
const reportFrequency = Math.floor(total / 25);

const start = process.hrtime();

function fileWriter(directory) {
	return function write(name, instance) {
		return fs.writeFileSync(`${directory}/${name}`, JSON.stringify(instance, null, 2));
	};
}

// TODO: Create a MarLogic command to write to a database
const write = fileWriter(outputDir);

for (const item of generateData(counts)) {
	totals[item.type] = totals[item.type] + 1;
	totals.index = totals.index + 1;
	if (0 === totals.index % reportFrequency || totals.index >= total) {
		diagnostics.write(
			`Customers: ${totals.customer}, Products: ${totals.product}, Orders: ${totals.order}\n`
		);
	}
	write(
		`${item.type}s/${item.id}.json`,
		envelope(item)
	);
}
const duration = process.hrtime(start);
diagnostics.write(
	`Generated ${totals.index} files in ${duration[0]}s ${duration[1] /
	1000000}ms\n`
);

process.exit(0);
