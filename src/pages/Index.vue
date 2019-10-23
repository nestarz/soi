<template>
  <div class="resources">
    <div v-for="({node: { id, count }}) in $page.categories.edges" :key="id">
      <input :placeholder="count" type="number" @click="active = id" />
      {{id}}
    </div>
    <div v-for="({node: { id, count, resources }}) in $page.tags.edges" :key="id">
      <div class="tag">
        {{id}}
      </div>
      <div v-for="{id, category, title} in resources" :key="id">
        <div v-if="!active || active === category">{{title}}</div>
      </div>
    </div>
  </div>
</template>

<page-query>
query {
  categories: allCategories {
    edges {
      node {
        id
        count
      }
    }
  }
  tags: allTags(sort: [{ by: "count", order: DESC }]) {
    edges {
      node {
        id
        count
        resources {
          id
          title
          description
          screenshot
          category
        }
      }
    }
  }
}
</page-query>

<script>
export default {
  metaInfo: {
    title: "About us"
  },
  data() {
    return {
      active: null
    };
  }
};
</script>

<style scoped>
.resources {
  padding: 5px;
  column-width: 300px;
  column-fill: balance;
}

img {
  width: 100%;
}

h4 {
  margin: 0;
  margin-bottom: 5px;
}

.tag {
    font-size: 24px;
    line-height: 32px;
    padding-bottom: 2px;
    border-bottom: 1px #000 solid;
    margin-bottom: 4px;
    padding-left: 8px;
}
</style>