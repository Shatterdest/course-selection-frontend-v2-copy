<script setup lang="ts">
import { useUserStore } from "../stores/user";
const userStore = useUserStore();
document.title = "Home | SITHS Course Selection";

function toTitleCase(string: string) {
  return string
    .split(",")
    .map((chunk) =>
      chunk
        .split(" ")
        .map((part) => part.trim().toLowerCase())
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    )
    .join(",");
}
</script>

<template>
  <div class="h-[80vh] w-full flex flex-row justify-center items-center">
    <div
      id="left"
      class="w-5/6 flex flex-col justify-center items-center text-center space-y-4 lg:items-start lg:text-left lg:w-3/4 lg:max-w-2xl xl:max-w-3xl lg:space-y-6 lg:ml-12"
    >
      <h1 id="heading" class="text-4xl font-bold lg:text-5xl">
        Hello
        {{ toTitleCase(`${userStore.first_name} ${userStore.last_name}`) }},
      </h1>
      <h2 class="text-lg lg:text-xl">
        Welcome to Staten Island Technical High School's Course Selection Guidance platform.
      </h2>
      <div class="flex justify-start items-center space-x-4">
        <RouterLink to="/guidance/studentlist">
          <button class="bg-other-g w-48 h-14 rounded-md text-xl font-semibold hover:bg-primary-g">
            View Students
          </button>
        </RouterLink>
      </div>
    </div>
    <div
      id="circles"
      class="-z-10 absolute h-96 w-112 sm:h-128 sm:w-128 lg:h-96 lg:w-112 xl:h-128 xl:w-128 flex justify-center items-center lg:relative lg:mx-8"
    >
      <div
        id="big"
        class="h-80 w-80 sm:h-96 sm:w-96 lg:h-80 lg:w-80 xl:h-96 xl:w-96 bg-tertiary-g rounded-full right-32"
      ></div>
      <div
        id="small"
        class="h-32 w-32 sm:h-40 sm:w-40 lg:h-32 lg:w-32 xl:h-40 xl:w-40 absolute bottom-4 left-12 bg-primary-g rounded-full"
      ></div>
    </div>
  </div>
</template>
