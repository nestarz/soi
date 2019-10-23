<template>
  <div class="resources">
    <div class="categories">
      <div class="output">
        <output v-for="({ id }, index) in categories" :key="id">{{id}}</output>
      </div>
      <input type="range" min="0" v-model="active" :max="categories.length" step="1" list="ticks" />
      <datalist id="ticks">
        <option v-for="({ id }, index) in categories" :key="id">{{ index }}</option>
      </datalist>
    </div>
    <div class="main">
    <div class="tags">
      <div v-for="{ id, title, category, screenshot } in resources" :key="id">
        <img :src="screenshot" v-if="!activename || category === activename" />
      </div>
    </div>
    <div class="tags">
      <div class="tag" v-for="({ id, count, byCategoryResources }) in filtered" :key="id">
        <div class="title">{{ id }}</div>
        <div class="category" v-for="{category, resources} in byCategoryResources" :key="category">
          <div v-for="{ id, title, category, screenshot } in resources" :key="id">
            <a :href="screenshot">{{ title }}</a>
          </div>
        </div>
      </div>
    </div>
  </div>
  </div>
</template>

<page-query>
query {
  resources: allResources {
    edges {
      node {
        screenshot
        category
      }
    }
  }
  categories: allCategories {
    edges {
      node {
        id
        count
          allResources {
            id
            title
            description
            screenshot
            category
          }
      }
    }
  }
  tags: allTags(sort: [{ by: "count", order: DESC }]) {
    edges {
      node {
        id
        count
        byCategoryResources {
          category
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
}
</page-query>

<script>
import { ref, reactive, computed } from "@vue/composition-api";

export default {
  metaInfo: {
    title: "About us"
  },
  setup(props, { parent }) {
    const node = edge => edge.node;
    const resources = computed(() => parent.$page.resources.edges.map(node));
    const categories = computed(() => parent.$page.categories.edges.map(node));
    const tags = computed(() => parent.$page.tags.edges.map(node));
    const active = ref(null);
    const activename = computed(
      () => active.value && categories.value[active.value].id
    );
    const filtered = computed(() =>
      tags.value
        .map(tag => ({
          ...tag,
          byCategoryResources: tag.byCategoryResources.filter(
            ({ category }) => category === activename.value || !activename.value
          )
        }))
        .filter(tag => tag.byCategoryResources.length)
    );
    console.log(resources.value);
    return { resources, categories, tags, active, activename, filtered };
  }
};
</script>

<style scoped>
.tags {
  column-width: 200px;
  column-fill: balance;
}

.main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 5px;
}

img {
  width: 100%;
}

h4 {
  margin: 0;
  margin-bottom: 5px;
}

.tag {
  margin-bottom: 7px;
}

.tag > .title {
  font-size: 24px;
  line-height: 32px;
  padding-bottom: 4px;
  margin-bottom: 3px;
  color: grey;
}

.resources {
  margin: 1em;
}

.categories .output {
  display: flex;
  justify-content: space-between;
}

.categories output {
  display: block;
  transform: skewX(10deg);
}
@media screen and (max-width: 992px) {
  .categories output {
    writing-mode: vertical-lr;
    transform: rotate(180deg);
  }
}

.categories input {
  width: 100%;
  box-sizing: content-box;
}
</style>