const makeSlug = require('../../../../lib/make-slug')
module.exports = {
  async beforeCreate(event) {
    const { data, where, select, populate } = event.params;
    const { model } = event;
    // Se existirem localizações do documento este documento não é o principal
    if (data.localizations[0]) {
      // Busca o primeiro documento localizado
      const localeDocument = await strapi.entityService.findOne(model.uid, data.localizations[0]);
      // Mantem o mesmo valor para o campo urlized
      data.urlized = localeDocument.urlized;
      // Marca o documento como nao principal
      data.principal = false;
    // Se o documento for o principal
    } else {
      // Atualiza o campo urlized com base no titulo
      data.urlized = makeSlug.format(data.titulo);
      // Marca o documento como principal
      data.principal = true;
      // Verifica se existe outro documento com o mesmo valor no campo
      const [entry] = await strapi.entityService.findMany(model.uid, {
        filters: { urlized: data.urlized }
      });
      // Se houver outro documento, acrescenta a data ao fim do valor do campo
      if (entry) {
        // TODO Formatar a data
        data.urlized = data.urlized + '-' + new Date();
      }
    }
  },
  async beforeUpdate(event) {
    const { data, where, select, populate } = event.params;
    const { model } = event;
    // Se o titulo for alterado
    if (data.titulo) {
      const entity = await strapi.entityService.findOne(model.uid, where.id);
      // Verifica se o documento é o principal
      if (entity.principal) {
        // Se é o principal atualize o campo urlized
        data.urlized = makeSlug.format(data.titulo)
        const [entry] = await strapi.entityService.findMany(model.uid, {
          filters: { urlized: data.urlized }
        });
        data.urlized = data.urlized + (entry ? '-' + new Date() : '');
      }
    }
  },
  async afterUpdate(event) {
    const { model, result } = event;
    // Se o documento atualizado for o principal e houverem localizações do mesmo
    if (result.principal && result.localizations) {
      // Verifica as localizações que possuem valores diferentes no campo urlized
      const localsHaveDifferentUrlized = result.localizations.filter(l => result.urlized !== l.urlized);
      if (result.principal && localsHaveDifferentUrlized.length > 0) {
        for(let i = 0; localsHaveDifferentUrlized.length > i; i++) {
          const entity = localsHaveDifferentUrlized[i];
          // Atualiza cada um dos documentos de localização
          await strapi.entityService.update(model.uid, entity.id, {
            data: { urlized: result.urlized }
          });
        }
      }
    }
  },
};