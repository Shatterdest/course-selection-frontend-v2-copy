<template>
  <section class="lg:text-left text-center h-full w-full">
    <div class="flex flex-col lg:flex-row h-full w-full">
        <div class="flex items-center justify-center max-w-[40rem] overflow-hidden w-full">
          <fieldset class="flex items-center justify-start w-full">
        <div class="block py-2 px-3 mt-3 w-full md:w-3/5 text-base md:text-lg xl:text-2xl bg-transparent rounded-md border border-solid border-zinc-400 focus:outline-none focus:ring-0 focus:border-blue-400">
          <div v-if="(surveyStore.currentResponse[indexAll] as allCoursesAnswer).answer.preference.length != 0">
            <p v-for="choice in courses" :key="choice.rank" class="mb-2 mt-2 text-base md:text-lg xl:text-2xl">
            <strong> {{choice.rank + 1}}. </strong> {{choice.name}}
          </p>
          </div>
          <p v-else class="mt-2 mb-2 text-base md:text-lg xl:text-2xl">
            You have no classes chosen.
          </p>
        </div>
          </fieldset>
        </div>
      </div>

  </section>
</template>

<script setup lang="ts">
import { useSurveyStore } from '../../../../stores/survey';
import { allCoursesAnswer, preferences } from '../../../../types/interface';
import { PropType } from 'vue';

const surveyStore = useSurveyStore()
const indexAll = surveyStore.currentResponse.findIndex((x) => x.id === 'allChosenCourses');

const props = defineProps({
  courses: Array as PropType<Array<preferences>>,
});

</script>
