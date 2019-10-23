<template>
  <div class="resources">
    <div class="categories">
      <output v-for="({ id }, index) in categories" :key="id">{{id}}</output>
      <input type="range" v-model="active" min="0" :max="categories.length - 1" step=".1" list="t" />
      <datalist id="t">
        <option v-for="({ id }, index) in categories" :key="id">{{ index }}</option>
      </datalist>
    </div>
    <earth></earth>
    <div class="select">
      <select>
        <option>Infrastructure</option>
      </select>
      <select multiple>
        <option v-for="({ id }, index) in tags" :key="id">{{ id }}</option>
      </select>
    </div>
    <div class="main">
      <div class="tags">
        <template v-for="{ id, title, category, screenshot } in resources">
          <img :src="screenshot.w400" v-show="!activename || category === activename" :key="id" />
          <a :href="screenshot.w400" :key="category+id+Math.random()">{{ title }}</a>
        </template>
      </div>
      <div class="tags tag">
        <template v-for="({ id: tag, count, byCategoryResources }) in filtered">
          <div class="title" :key="tag">{{ tag }}</div>
          <template v-for="{category, resources} in byCategoryResources">
            <template v-for="{ id, title, category, screenshot } in resources">
              <a :href="screenshot.w400" :key="category+tag+id+Math.random()">{{ title }}</a>
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
        screenshot {
          w400
          w800
        }
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
            screenshot {
              w400
              w800
            }
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
            screenshot {
              w400
              w800
            }
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
import earth from "../components/earth.vue";

export default {
  metaInfo: {
    title: "resources"
  },
  components: {
    earth
  },
  setup(props, { parent }) {
    const node = edge => edge.node;
    const resources = computed(() => parent.$page.resources.edges.map(node));
    const categories = computed(() => parent.$page.categories.edges.map(node));
    const tags = computed(() => parent.$page.tags.edges.map(node));
    const active = ref(6);
    const activename = computed(
      () => active.value && categories.value[Math.floor(active.value)].id
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
  grid-area: main;
}

.select {
  grid-area: nav;
  display: grid;
  grid-template-rows: min-content 1fr;
  gap: 7px 7px;
  width: 152px;
}

svg {
  grid-area: map;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0vh;
  pointer-events: none;
  right: 0;
  left: 0;
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
  margin: 5px;
  display: grid;
  grid-template-areas:
    "head head"
    "nav  main"
    "nav  main";
  grid-template-columns: 153px 1fr;
  grid-gap: 5px;
}

.categories {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  grid-area: head;
}

.categories .output {
  display: flex;
  justify-content: space-between;
}

.categories output {
  display: block;
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
  margin-bottom: -5px;
}

a {
  display: block;
}
</style>