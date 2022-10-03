const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const { PubSub } = require('graphql-subscriptions');
const pizzas = require('../data/pizzas.json');
const orders = require('../data/orders.json');
const modifications = require('../data/modifications.json');
let { amount } = require('../data/amount.json');

const pubsub = new PubSub();

const resolvers = {
  Query: {
    orders: () => orders,
    pizzas: () => pizzas,
    amount: () => amount,
  },
  Pizza: {
    modifications: (parentValue) =>
      modifications.filter((modification) =>
        modification.pizzasIds.includes(parentValue.id)
      ),
  },
  Mutation: {
    createOrder: (_, { order }) => {
      const { totalPrice, totalAmount, orderedPizzas } = order;
      const newOrder = {
        id: uuidv4(),
        totalAmount,
        totalPrice,
        orderedPizzas,
      };

      orders.push(newOrder);

      fs.readFile('data/orders.json', 'utf8', (err, data) => {
        if (err) {
          console.log(err);
        } else {
          const ordersArray = JSON.parse(data);
          ordersArray.push(newOrder);
          fs.writeFile(
            'data/orders.json',
            JSON.stringify(ordersArray),
            'utf8',
            () => newOrder
          );
        }
      });
      return newOrder;
    },
    updateAmount(_, { amount: newAmount = 0 }) {
      amount += newAmount;

      pubsub.publish('AMOUNT_UPDATED', { amountUpdated: amount });
      fs.readFile('data/amount.json', 'utf8', (err, data) => {
        if (err) {
          console.log(err);
        } else {
          fs.writeFile(
            'data/amount.json',
            JSON.stringify({ amount }),
            'utf8',
            () => amount
          );
        }
      });
      return amount;
    },
  },
  Subscription: {
    amountUpdated: {
      subscribe: () => pubsub.asyncIterator('AMOUNT_UPDATED'),
    },
  },
};

module.exports = resolvers;
