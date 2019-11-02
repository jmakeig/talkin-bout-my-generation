#!/usr/bin/env node

const f = require('faker');

const {
  pick,
  several,
  uniform,
  normal,
  poisson
} = require('./distributions.js');

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
        // () => normal(3, 5)
        () => poisson(3)
      ).sort((a, b) => a.timestamp - b.timestamp),
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
        () => poisson(6)
      )
    };
  }
}

function envelope(entity) {
  return {
    instance: entity
  };
}

const fs = require('fs');

const counts = { index: 0, customer: 0, product: 0, order: 0 };

for (const item of generateData({
  customers: 533,
  products: 62,
  orders: 2755
})) {
  // counts[item.type] = counts[item.type] + 1;
  // counts.index = counts.index + 1;
  // if (0 === counts.index % 100) {
  //   process.stdout.write(
  //     `Customers: ${counts.customer}, Products: ${counts.product}, Orders: ${counts.order}\n`
  //   );
  // }
  fs.writeFileSync(
    `${process.cwd()}/data/${item.type}s/${item.id}.json`,
    JSON.stringify(envelope(item), null, 2)
  );
}
