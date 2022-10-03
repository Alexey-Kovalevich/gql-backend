const express = require('express');
const cors = require('cors');
const { useServer } = require('graphql-ws/lib/use/ws');
const { makeExecutableSchema } = require('@graphql-tools/schema');
const {
  getGraphQLParameters,
  processRequest,
  renderGraphiQL,
  sendMultipartResponseResult,
  sendResponseResult,
  shouldRenderGraphiQL,
} = require('graphql-helix');
const { GraphQLError, execute, subscribe } = require('graphql');
const ws = require('ws');
const typeDefs = require('./schema/typeDefs');
const resolvers = require('./schema/resolvers');

const app = express();
const schema = makeExecutableSchema({ typeDefs, resolvers });

app.use(cors());
app.use(express.json());

app.use('/images', express.static(__dirname + '/images'));

app.use('/graphql', async (req, res) => {
  const request = {
    body: req.body,
    headers: req.headers,
    method: req.method,
    query: req.query,
  };

  if (shouldRenderGraphiQL(request)) {
    res.send(
      renderGraphiQL({
        subscriptionsEndpoint: 'ws://localhost:3001/graphql',
      })
    );
    return;
  }

  const { operationName, query, variables } = getGraphQLParameters(request);

  const result = await processRequest({
    operationName,
    query,
    variables,
    request,
    schema,
  });

  if (result.type === 'RESPONSE') {
    sendResponseResult(result, res);
  } else if (result.type === 'MULTIPART_RESPONSE') {
    sendMultipartResponseResult(result, res);
  } else {
    res.status(500);
    res.json({
      errors: [new GraphQLError('Please, send subscriptions over WebSocket')],
    });
  }
});

const port = 3001;

const server = app.listen(port, () => {
  const wsServer = new ws.Server({
    server,
    path: '/graphql',
  });

  useServer({ schema, execute, subscribe }, wsServer);

  console.log(`GraphQL server is running on port ${port}.`);
});
