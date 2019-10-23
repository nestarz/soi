const getRessources = require("./server/get-resources");

module.exports = function(api) {
  api.loadSource(async store => {
    // Resources
    const config = { typeName: "Resources" };
    const resources = {
      collection: store.addCollection(config),
      items: await getRessources()
    };
    resources.items.forEach(resource =>
      resources.collection.addNode({
        id: resource.slug,
        slug: resource.slug,
        ...resource
      })
    );

    // Categories
    const categories = {
      collection: store.addCollection({ typeName: "Categories" }),
      items: resources.items.reduce((res, { category, slug }) => {
        res[category] = [...(res[category] || []), slug];
        return res;
      }, {})
    };
    Object.entries(categories.items).forEach(([category, resources]) =>
      categories.collection.addNode({
        id: category,
        count: resources.length,
        resources: resources.map(id => store.createReference("Resources", id))
      })
    );

    // Tags
    const tags = {
      collection: store.addCollection({ typeName: "Tags" }),
      items: resources.items.reduce((res, { tags, slug }) => {
        if (!tags) return res;
        tags.forEach(tag => (res[tag] = [...(res[tag] || []), slug]));
        return res;
      }, {})
    };
    Object.entries(tags.items).forEach(([tag, resources]) =>
      tags.collection.addNode({
        id: tag,
        count: resources.length,
        resources: resources.map(id => store.createReference("Resources", id))
      })
    );
  });

  api.createPages(({ createPage }) => {});
};
