const f = require("faker");

const { pick, several, normal, lognormal } = require("./distributions.js");

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
      type: "customer",
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
      type: "product",
      id,
      unitPrice: Math.ceil(normal(50, 15), 0.01)
    };
  }
}

function* generateOrders(customers, products, count = 1000) {
  for (let i = 0; i < count; i++) {
    const id = f.random.uuid();
    yield {
      type: "order",
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

module.exports = { generateData, envelope };
