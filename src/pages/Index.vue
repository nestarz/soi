<template>
  <div class="resources">
    <div class="categories">
      <output v-for="({ id }) in categories" :key="id">{{id}}</output>
      <input type="range" v-model="active" min="0" :max="categories.length - 1" step=".1" list="t" />
      <datalist id="t">
        <option v-for="({ id }, index) in categories" :key="id">{{ index }}</option>
      </datalist>
    </div>
    <div class="select">
      <select>
        <option>Everything</option>
        <option disabled>Infrastructure</option>
        <option disabled>HTLT TV</option>
      </select>
      <input type="range" v-model="mode" min="0" :max="modes" step=".1" list="t" />
      <select multiple v-model="selected">
        <option :value="[]">Everything</option>
        <optgroup :label="selected.length ? selected : 'Filter by tags'">
        <option v-for="({ id }) in tags" :key="id">{{ id }}</option>
        </optgroup>
      </select>
    </div>
    <div class="tags" :class="[`mode${Math.floor(mode)}`]">
      <div v-for="({ id, title, category, screenshot, description, url, tags }) in resources" 
      v-if="(!activename || category === activename) && (!selected[0].length || tags.some(t => selected.includes(t)))" :key="id">
        <a :href="url" v-if="screenshot.w400"><img :src="screenshot.w400" /></a>
        <a :href="url">{{ title }}</a>
        <p>{{ Math.floor(mode) !== 2 ? digest(description, 100): description }}</p>
      </div>
    </div>
  </div>
</template>

<page-query>
query {
  resources: allResources {
    edges {
      node {
        title
        description
        url
        tags
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
    return {
      resources,
      categories,
      tags,
      active,
      activename,
      filtered,
      selected: ref([[]]),
      modes: 4,
      mode: ref(1),
      digest: (string, length) =>
        string && string.length > length
          ? `${
              (string.match(RegExp(`.{${length}}\\S*`)) || [
                string.substring(0, length)
              ])[0]
            }...`
          : string
    };
  }
};
</script>

<style scoped>
.tags {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 5px;
}

.tags a {
  white-space: nowrap; 
  background: white; 
  margin-left: -5px; 
  padding-left: 5px;
}

.tags p {
  margin: 0;
}

.tags p,
.tags a:nth-child(1),
.tags a:nth-child(2) {
  display: none;
}

.tags.mode2,
.tags.mode0 {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 44em;
}

.tags.mode1 a:nth-child(1),
.tags.mode0 a:nth-child(2),
.tags.mode2 a:nth-child(2),
.tags.mode2 p,
.tags.mode3 a:nth-child(1),
.tags.mode4 a:nth-child(1),
.tags.mode3 a:nth-child(2),
.tags.mode4 a:nth-child(2),
.tags.mode4 p {
  display: block;
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
  grid-template-rows: min-content min-content 1fr;
  gap: 7px 7px;
  width: 152px;
  min-height: 100vh;
}

.select select {
  max-width: 150px;
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