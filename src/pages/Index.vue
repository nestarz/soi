<template>
  <div class="ressources">
    <template v-for="({node}) in $page.ressources.edges">
      <div :key="node.id">
        <div>{{ node.title }}</div>
        <p>{{ node.description.slice(0,110) }}</p>
      </div>
      <img :src="node.screenshot" :key="node.id" />
    </template>
  </div>
</template>

<page-query>
query {
  ressources: allResources {
    edges {
      node {
        id
        title
        description
        screenshot
      }
    }
  }
}
</page-query>

<script>
export default {
  metaInfo: {
    title: "About us"
  }
};
</script>

<style scoped>
.ressources {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
}

img {
  width: 100%;
}
</style>