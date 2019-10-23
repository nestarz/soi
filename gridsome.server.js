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

    // Tags
    const tags = {
      collection: store.addCollection({ typeName: "Tags" }),
      items: resources.items.reduce((res, resource) => {
        if (!resource.tags) return res;
        resource.tags.forEach(
          tag => (res[tag] = [...(res[tag] || []), resource])
        );
        return res;
      }, {})
    };

    // Categories
    const categories = {
      collection: store.addCollection({ typeName: "Categories" }),
      items: resources.items.reduce((res, resource) => {
        const { category } = resource;
        res[category] = [...(res[category] || []), resource];
        return res;
      }, {})
    };

    // Tags by Category
    tags.byCategory = Object.entries(tags.items).reduce((res, [tag, _]) => {
      const resourcesByCategory = Object.entries(categories.items).map(
        ([category, resources]) => ({
          category,
          resources: resources.filter(resource =>
            (resource.tags || []).includes(tag)
          )
        })
      );
      res[tag] = [
        ...(res[tag] || []),
        ...resourcesByCategory.filter(({ _, resources }) => resources.length)
      ];
      return res;
    }, {});

    // Categories by Tags
    categories.byTag = Object.entries(categories.items).reduce(
      (res, [category, _]) => {
        const resourcesByTag = Object.entries(tags.items).map(
          ([tag, resources]) => ({
            tag,
            resources: resources.filter(
              resource => resource.category === category
            )
          })
        );
        res[category] = [
          ...(res[category] || []),
          ...resourcesByTag.filter(({ _, resources }) => resources.length)
        ];
        return res;
      },
      {}
    );

    // Populate Tags
    console.log(tags.byCategory);
    Object.entries(tags.items).forEach(([tag, resources]) =>
      tags.collection.addNode({
        id: tag,
        count: resources.length,
        allResources: resources.map(({ slug: id }) =>
          store.createReference("Resources", id)
        ),
        byCategoryResources: tags.byCategory[tag].map(
          ({ category, resources }) => ({
            category,
            resources: resources.map(({ slug: id }) =>
              store.createReference("Resources", id)
            )
          })
        )
      })
    );

    // Populate Categories
    Object.entries(categories.items).forEach(([category, resources]) => {
      categories.collection.addNode({
        id: category,
        count: resources.length,
        allResources: resources.map(({ slug: id }) =>
          store.createReference("Resources", id)
        ),
        byTagResources: categories.byTag[category].map(
          ({ tag, resources }) => ({
            tag,
            resources: resources.map(({ slug: id }) =>
              store.createReference("Resources", id)
            )
          })
        )
      });
    });
  });
  api.createPages(({ createPage }) => {});
};
