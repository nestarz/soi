<template>
  <div class="resources">
    <div class="categories">
      <output @click="active = 0">everything</output>
      <output v-for="({ id }, index) in categories" :key="id" @click="active = index + 1">{{id}}</output>
      <input type="range" v-model="active" min="0" :max="categories.length" step=".1" list="t" />
      <datalist id="t">
        <option>everything</option>
        <option v-for="({ id }, index) in categories" :key="id">{{ index }}</option>
      </datalist>
    </div>
    <div class="select">
      <select v-model="project">
        <option :value="null">Everything</option>
        <option v-for="{id} in projects" :key="id">{{ id }}</option>
      </select>
      <input type="range" v-model="mode" min="0" :max="modes" step=".1" list="t" />
      <select multiple v-model="selected">
        <option :value="null">Everything</option>
        <optgroup :label="selected.length ? selected : 'Filter by tags'">
          <option v-for="({ id }) in tags" :key="id">{{ id }}</option>
        </optgroup>
      </select>
    </div>
    <div class="main" :class="[`mode${Math.floor(mode)}`]">
      <div v-for="({ id, title, description, url, screenshot }) in filtered" :key="id">
        <a class="image-container" :href="url">
          <g-image :src="screenshot.w200" width="200" v-if="screenshot.w200" />
        </a>
        <a :href="url">{{ title }}</a>
        <p v-if=" Math.floor(mode) === 2">{{ description }}</p>
        <p v-else>{{ digest(description, 100) }}</p>
      </div>
    </div>
    <nav>
      <a href="https://generativeart.netlify.com/"></a>
    </nav>
  </div>
</template>

<script>
import { ref, reactive, computed } from "@vue/composition-api";

const digest = (string, length) =>
  string && string.length > length
    ? `${
        (string.match(RegExp(`.{${length}}\\S*`)) || [
          string.substring(0, length)
        ])[0]
      }...`
    : string;

export default {
  metaInfo: {
    title: "resources"
  },
  setup(props, { parent }) {
    const node = edge => edge.node;
    const resources = computed(() => parent.$page.resources.edges.map(node));
    const categories = computed(() => parent.$page.categories.edges.map(node));
    const tags = computed(() => parent.$page.tags.edges.map(node));
    const projects = computed(() => parent.$page.projects.edges.map(node));
    const project = ref(null);
    const active = ref(0);
    const selected = ref([null]);
    const activename = computed(
      () =>
        (Math.floor(active.value) &&
          categories.value[Math.floor(active.value) - 1].id) ||
        null
    );
    const filtered = computed(() =>
      resources.value
        .filter(resource =>
          activename.value ? resource.category === activename.value : true
        )
        .filter(resource =>
          selected.value[0]
            ? resource.main.some(tag => selected.value.includes(tag))
            : true
        )
        .filter(resource =>
          project.value
            ? (project.value === "undefined" &&
                resource.project.length === 0) ||
              resource.project === project.value
            : true
        )
    );
    return {
      resources,
      categories,
      selected,
      tags,
      projects,
      project,
      active,
      activename,
      filtered,
      modes: 4,
      mode: ref(3),
      digest
    };
  }
};
</script>

<style scoped>
.resources {
  font-family: system-ui;
}

nav {
  position: fixed;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  mix-blend-mode: hard-light;
}

nav a {
  width: 10rem;
  height: 10rem;
  border-radius: 5rem;
  margin: 2rem;
  background: hsl(100, 180%, 31%);
}

.main {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  grid-gap: 10px;
  grid-area: main;
  grid-auto-rows: min-content;
}

.main .image-container:empty {
  width: 100%;
  padding-bottom: 76.2%;
  background: hsl(0, 0%, 97%);
}

.main a {
  white-space: nowrap;
  background: white;
  margin-left: -5px;
  padding-left: 5px;
}

.main p {
  margin: 0;
}

.main p,
.main a:nth-child(1),
.main a:nth-child(2) {
  display: none;
}

.main.mode2,
.main.mode0 {
  display: grid;
  grid-template-columns: 1fr;
  max-width: 44em;
}

.main.mode1 a:nth-child(1),
.main.mode0 a:nth-child(2),
.main.mode2 a:nth-child(2),
.main.mode2 p,
.main.mode3 a:nth-child(1),
.main.mode4 a:nth-child(1),
.main.mode3 a:nth-child(2),
.main.mode4 a:nth-child(2),
.main.mode4 p {
  display: block;
}

.select {
  grid-area: nav;
  display: grid;
  grid-template-rows: min-content min-content 1fr;
  gap: 7px 7px;
  width: 152px;
  min-height: 93vh;
}

.select select {
  max-width: 150px;
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
  grid-gap: 10px;
}

@media screen and (max-width: 992px) {
  .resources {
    grid-template-areas:
      "head head"
      "nav  nav"
      "main  main";
  }
  .select {
    grid-area: nav;
    display: grid;
    width: 100%;
    min-height: initial;
  }

  .select select {
    max-width: none;
  }
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


<page-query>
query {
  resources: allResources {
    edges {
      node {
        project
        title
        description
        url
        tags
        category
        screenshot {
          w200
        }
      }
    }
  }
  categories: allCategories {
    edges {
      node {
        id
        count
      }
    }
  }

  projects: allProjects {
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
      }
    }
  }
}
</page-query>
