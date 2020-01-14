const dialogflow = require('dialogflow')
const uuid = require('uuid')
const {struct} = require('pb-util');

const projectId = "coffee-shop-sjyjqo";
var express = require('express');
var router = express.Router();

function logQueryResult(sessionClient, result) {

  // Instantiates a context client
  const contextClient = new dialogflow.ContextsClient();

  console.log(`  Query: ${result.queryText}`);
  console.log(`  Response: ${result.fulfillmentText}`);
  if (result.intent) {
    console.log(`  Intent: ${result.intent.displayName}`);
  } else {
    console.log(`  No intent matched.`);
  }
  const parameters = JSON.stringify(struct.decode(result.parameters));
  console.log(`  Parameters: ${parameters}`);
  if (result.outputContexts && result.outputContexts.length) {
    console.log(`  Output contexts:`);
    result.outputContexts.forEach(context => {
      const contextId = contextClient.matchContextFromContextName(context.name);
      const contextParameters = JSON.stringify(
        struct.decode(context.parameters)
      );
      console.log(`    ${contextId}`);
      console.log(`      lifespan: ${context.lifespanCount}`);
      console.log(`      parameters: ${contextParameters}`);
    });
  }
}

function detectEventInput(projectId, sessionId, event, params) {
  // [START dialogflow_detect_intent_text]
  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();
  console.log("event:", event);
  if (!event) {
    return;
  }

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  let promise;

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      event: {
        name: event,
        languageCode: "en-US",
      },
    },
  };

  if (!promise) {
    // First query.
    console.log(`Sending query "${event}"`);
    promise = sessionClient.detectIntent(request);

  } else {
    promise = promise.then(responses => {
      console.log('Detected intent');
      const response = responses[0];
      logQueryResult(sessionClient, response.queryResult);

      // Use output contexts as input contexts for the next query.
      response.queryResult.outputContexts.forEach(context => {
        // There is a bug in gRPC that the returned google.protobuf.Struct
        // value contains fields with value of null, which causes error
        // when encoding it back. Converting to JSON and back to proto
        // removes those values.
        context.parameters = struct.encode(struct.decode(context.parameters));
      });
      request.queryParams = {
        contexts: response.queryResult.outputContexts,
      };

      console.log(`Sending query "${event}"`);
      return sessionClient.detectIntent(request);
    });
  }


  promise
    .then(responses => {
      console.log('Detected intent');
      logQueryResult(sessionClient, responses[0].queryResult);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  return promise

  // [END dialogflow_detect_intent_text]
}


function detectTextIntent(projectId, sessionId, query) {
  // [START dialogflow_detect_intent_text]
  // Instantiates a session client
  const sessionClient = new dialogflow.SessionsClient();
  console.log("query:", query);
  if (!query) {
    return;
  }

  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);

  let promise;

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: "en-US",
      },
    },
  };

  if (!promise) {
    // First query.
    console.log(`Sending query "${query}"`);
    promise = sessionClient.detectIntent(request);

  } else {
    promise = promise.then(responses => {
      console.log('Detected intent');
      const response = responses[0];
      logQueryResult(sessionClient, response.queryResult);

      // Use output contexts as input contexts for the next query.
      response.queryResult.outputContexts.forEach(context => {
        // There is a bug in gRPC that the returned google.protobuf.Struct
        // value contains fields with value of null, which causes error
        // when encoding it back. Converting to JSON and back to proto
        // removes those values.
        context.parameters = struct.encode(struct.decode(context.parameters));
      });
      request.queryParams = {
        contexts: response.queryResult.outputContexts,
      };

      console.log(`Sending query "${query}"`);
      return sessionClient.detectIntent(request);
    });
  }


  promise
    .then(responses => {
      console.log('Detected intent');
      logQueryResult(sessionClient, responses[0].queryResult);
    })
    .catch(err => {
      console.error('ERROR:', err);
    });

  return promise

  // [END dialogflow_detect_intent_text]
}

/* GET home page. */
router.get('/', async function(req, res, next) {
  // A unique identifier for the given session
  let sessionId = req.query.sessionId;
  if (!sessionId) {
    sessionId = uuid.v4();
  }

  // 0 = intent; 1 = event
  let reqType = 0

  if(req.query.type)
    reqType = parseInt(req.query.type);

  console.log(reqType);

  // Send request and log result
  let responses;
  if (reqType === 1)
    responses = await detectEventInput(projectId, sessionId, req.query.event, req.query.params);
  else {
    const query = req.query.query;
    responses = await detectTextIntent(projectId, sessionId, query);
  }
  const result = responses[0].queryResult;
  result.sessionId = sessionId;
  if (!result.intent) {
    console.log(`  No intent matched.`);
  }
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result))
});

module.exports = router;
