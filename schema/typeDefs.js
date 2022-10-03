const { gql } = require('apollo-server');

const typeDefs = gql`
  type Pizza {
    id: ID!
    name: String!
    image: String!
    popularity: Int!
    categories: [String!]!
    modifications: [Modification!]!
  }

  type Modification {
    id: ID!
    dough: String!
    size: Int!
    price: Float!
    pizzasIds: [ID]!
  }

  type Order {
    id: ID!
    totalPrice: Float!
    totalAmount: Int!
    orderedPizzas: [OrderedPizza!]!
  }

  type OrderedPizza {
    dough: String!
    size: Int!
    price: Float!
    amount: Int!
    pizzaName: String!
  }

  type Query {
    pizzas: [Pizza]
    orders: [Order]
    amount: Int
  }

  type Mutation {
    createOrder(order: OrderInput): Order
    updateAmount(amount: Int!): Int
  }

  input OrderInput {
    totalPrice: Float!
    totalAmount: Int!
    orderedPizzas: [OrderPizzaInput!]!
  }

  input OrderPizzaInput {
    dough: String!
    size: Int!
    price: Float!
    amount: Int!
    pizzaName: String!
  }

  type Subscription {
    amountUpdated: Int
  }
`;

module.exports = typeDefs;
