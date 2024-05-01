<template>
  <div class="flex items-center justify-center w-full">
    <fieldset
      class="flex flex-col justify-start"
      :aria-invalid="warn"
      :aria-describedby="warn ? question.id + 'required' : ''"
    >
      <legend class="text-lg xl:leading-10 md:text-xl xl:text-3xl overflow-visible mb-4">
        {{ question.question }}
      </legend>
      <div class="flex flex-row items-baseline">
        <select
          class="block py-2 px-3 mt-3 w-full md:w-3/5 text-base md:text-lg xl:text-2xl bg-transparent rounded-md border border-solid focus:outline-none focus:ring-0 disabled:bg-gray-100"
          :class="
            warn
              ? 'focus:border-red-500 border-red-400 bg-[#FEE2E2]'
              : 'focus:border-blue-400 border-zinc-400 bg-transparent'
          "
          :disabled="isDisabled"
          v-model="surveyStore.currentResponse[index].answer"
        >
          <option v-for="value in options" :key="value" :value="value">{{ value }}</option>
        </select>
        <Transition
          enter-from-class="opacity-0"
          enter-active-class="transition-opacity duration-200 ease-linear"
          leave-to-class="opacity-0"
          leave-active-class="transition-opacity duration-200 ease-linear"
        >
          <div
            class="flex items-center justify-center text-red-500 gap-2 pb-2 xl:ml-10 md:ml-8 xs:ml-4 ml-2"
            v-if="warn"
          >
            <exclamationMark />
          </div>
        </Transition>
      </div>
    </fieldset>
  </div>
</template>

<script setup lang="ts">
import { useSurveyStore } from "../../../stores/survey";
import { watch, PropType, ref } from "vue";
import { surveyQuestion } from "../../../types/interface";
import exclamationMark from "../../../components/icons/ExclamationMark.vue";

const props = defineProps({
  question: {
    type: Object as PropType<surveyQuestion>,
    required: true,
  },
  isDisabled: Boolean,
  warn: Boolean,
});

const surveyStore = useSurveyStore();
const index = ref(0);
const options = [0, 1, 2, 3, 4];

const getQuestionIndex = (question: string): number => {
  return surveyStore.currentResponse.findIndex((entry) => entry.question === question);
};

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

watch(
  () => props.question.question,
  (newResponse) => {
    startQuestion();
  }
);

watch(
  () => surveyStore.currentResponse[index.value].answer,
  (newResponse) => {
    surveyStore.checkSurveyAnswers([surveyStore.currentResponse[index.value]]);
  }
);
</script>
