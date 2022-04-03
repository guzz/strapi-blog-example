'use strict';

/**
 * artigo router.
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::artigo.artigo', {
  config: {
    find: {
      auth: false
    },
    findOne: {
      auth: false
    }
  }
});
