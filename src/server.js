'use strict';
import Hapi from 'hapi';
import Inert from 'inert';
import Vision from 'vision';
import chalk from 'chalk';
import Joi from 'joi';
import pkg from '../package.json';
import { apiInfo, objectNote, retrieveFormattedObject } from './utils';

// Schemas
import Schemas from '../resources/schemas';

// Data
import Data from '../resources/data';

const server = new Hapi.Server();
server.connection({ port: process.env.port || 3030, host: 'localhost' });


server.route({
  method: 'GET',
  path: '/',
  config: {
    handler: (request, reply) => reply.redirect(`http://${request.info.host}/docs`),
    description: "Just say hi",
  }
});

server.route({
  method: 'GET',
  path: '/api',
  handler: (request, reply) => reply(apiInfo(server)),
  config: {
    description: "Displays API version information"
  }
});

server.route({
  method: 'GET',
  path: '/api/{resource}/schema',
  config: {
    handler: (request, reply) => reply({ statusCode: 200, ...Schemas[request.params.resource]}),
    description: "Returns the schema for given <code>resource</code>.",
    tags: ['schema'],
    validate: {
      params: {
        resource: Joi.string().required().notes(objectNote()),
      }
    }
  }
});

server.route({
  method: 'GET',
  path: '/api/{resource}/{id?}',
  config: {
    handler: (request, reply) => {
      const { resource, id } = request.params;

      const data = id ? Data[resource].filter(x => x.pk === id) : Data[resource];
      if (!data) {
        reply({ message: "Not Found", statusCode: 404 }).code(404);
        return;
      }

      const result = retrieveFormattedObject(resource, id);

      // console.log(result);

      // data.forEach(function(item) {
      //   retrieveFormattedObject(resource, id);
      // }, this);

      const results = {
        results: Array.isArray(data) ? data : data.fields
      };
      
      reply({ data, statusCode: 200 }).code(200);
    },
    description: "Returns <code>resources</code> with specified <code>id</code>. If no <code>id</code> is included, returns all objects of type <code>resource</code>.",
    validate: {
      params: {
        resource: Joi.string().required().notes(objectNote()),
        id: Joi.number().allow('')
      }
    }
  }
});

server.register([Vision, Inert, {
    register: require('lout'),
    options: {
      apiVersion: pkg.version
    }
  }], function(err) {
  server.start((err) => {
    if (err) {
      throw err;
    }
    console.log(`Server running at: ${chalk.blue(server.info.uri)}`);
  });
});
