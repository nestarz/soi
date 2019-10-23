<template>
  <div class="resources">
    <div class="categories">
      <div class="output">
        <output v-for="({ id }, index) in categories" :key="id">{{id}}</output>
      </div>
      <input
        type="range"
        min="0"
        v-model="active"
        :max="categories.length - 1"
        step="1"
        list="ticks"
      />
      <datalist id="ticks">
        <option v-for="({ id }, index) in categories" :key="id">{{ index }}</option>
      </datalist>
    </div>
    <div class="main">
      <div class="tags">
        <template v-for="{ id, title, category, screenshot } in resources">
          <img :src="screenshot" v-show="!activename || category === activename" :key="id" />
        </template>
      </div>
      <div class="tags tag">
        <template v-for="({ id: tag, count, byCategoryResources }) in filtered">
          <div class="title" :key="tag">{{ tag }}</div>
          <template v-for="{category, resources} in byCategoryResources">
            <template v-for="{ id, title, category, screenshot } in resources">
              <a :href="screenshot" :key="category+tag+id+Math.random()">{{ title }}</a>
            </template>
          </template>
        </template>
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
    title: "resources"
  },
  setup(props, { parent }) {
    const node = edge => edge.node;
    const resources = computed(() => parent.$page.resources.edges.map(node));
    const categories = computed(() => parent.$page.categories.edges.map(node));
    const tags = computed(() => parent.$page.tags.edges.map(node));
    const active = ref(6);
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
  grid-gap: 25px;
}

img {
  width: 100%;
}

.title {
  font-size: 24px;
  line-height: 24px;
  padding-bottom: 11px;
}

.title:not(:first-of-type) {
  margin-top: 24px;
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

a {
  display: block;
}
</style>