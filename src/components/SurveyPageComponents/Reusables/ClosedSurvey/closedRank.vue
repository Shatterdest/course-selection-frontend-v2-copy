<template>
  <section class="lg:text-left text-center h-full w-full">
    <div class="flex flex-col lg:flex-row h-full w-full">
        <div class="flex items-center justify-center overflow-hidden w-full">
          <fieldset class="flex items-center justify-start w-full">
            <legend class="text-lg xl:leading-10 md:text-xl xl:text-3xl overflow-visible mb-4"> {{ question.question }} </legend> 
        <div class="block py-2 px-3 mt-3 w-full md:w-3/5 text-base md:text-lg xl:text-2xl bg-transparent rounded-md border border-solid border-zinc-400 focus:outline-none focus:ring-0 focus:border-blue-400">
          <div v-if="(surveyStore.currentResponse[index] as surveyAnswer).answer.preference.length != 0">
            <p v-for="choice in (surveyStore.currentResponse[index] as surveyAnswer).answer.preference" :key="choice.rank" class="mt-2 mb-2 text-base md:text-lg xl:text-2xl">
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
import { useSurveyStore } from "../../../../stores/survey";
import { PropType } from 'vue'
import { surveyQuestion, surveyAnswer, course } from "../../../../types/interface";

const props = defineProps({
  choices: Array as PropType<Array<course>>,
  question: {
    type: Object as PropType<surveyQuestion>,
    required: true
  },
  answers: Array as PropType<Array<surveyAnswer>>,
});

const surveyStore = useSurveyStore();

let index: number = surveyStore.currentResponse.findIndex((x) => x.id == props.question?.id);


if (index < 0) {
  const questionAnswer = {
    id: props.question.id,
    question: props.question.question,
    answer: { courses: [''], preference: [{rank:0,name:''}] },
  };
  surveyStore.currentResponse.push(questionAnswer);

  index = surveyStore.currentResponse.findIndex(
    (x) => x.id == props.question?.id
  );
}



</script>
