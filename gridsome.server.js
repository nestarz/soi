const getRessources = require("./server/get-resources");

module.exports = function(api) {
  api.loadSource(async store => {
    // Resources
    const config = { typeName: "Resources", route: "/resource/:slug" };
    const collection = store.addContentType(config);
    const resources = await getRessources();
    resources.forEach(resource =>
      collection.addNode({
        id: resource.slug,
        slug: resource.slug,
        ...resource
      })
    );
  });

  api.createPages(({ createPage }) => {});
};
