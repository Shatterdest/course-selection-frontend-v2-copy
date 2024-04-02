<template>
  <div class="flex items-center justify-center w-full">
    <fieldset class="flex flex-col justify-start" :aria-invalid="warn" :aria-describedby="warn ? question.id+'required' : ''">
      <legend class="text-lg xl:leading-10 md:text-xl xl:text-3xl overflow-visible mb-4">{{ question.question }}</legend>
      <select
        class="block py-2 px-3 mt-3 w-full md:w-3/5 text-base md:text-lg xl:text-2xl bg-transparent rounded-md border border-solid border-zinc-400 focus:outline-none focus:ring-0 focus:border-blue-400 disabled:bg-gray-100"
        v-model="surveyStore.currentResponse[index].answer">
        <option v-for="value in options" :key="value" :value="value">{{ value }}</option>
      </select>
    </fieldset>
  </div>
</template>

<script lang="ts" setup>
import { useSurveyStore } from "../../../stores/survey";
import { watch, PropType, ref } from "vue";
import { surveyQuestion } from "../../../types/interface";

const props = defineProps({
  question:{
    type: Object as PropType<surveyQuestion>, 
      required: true
    },
    isDisabled: Boolean,
    warn: Boolean,
});

const surveyStore = useSurveyStore();
const index = ref(0);
const options = [1, 2, 3, 4];

const getQuestionIndex = (question: string): number => {
  return surveyStore.currentResponse.findIndex((entry) => entry.question === question);
}

function startQuestion() {
  const currentQuestion: string = props.question.question;
  index.value = getQuestionIndex(currentQuestion);
  if (index.value < 0) {
    const newQuestion = {
      id: props.question.id,
      question: currentQuestion,
      questionType: "DROPDOWN",
      answer: "",
    };
    surveyStore.currentResponse.push(newQuestion);
  }
}

startQuestion();

watch(() => props.question.question, (newResponse) => {
  startQuestion();
})

watch(
  () => (surveyStore.currentResponse[index.value].answer),
  () => {
    surveyStore.checkSurveyAnswers([surveyStore.currentResponse[index.value]])
  }
);
</script>