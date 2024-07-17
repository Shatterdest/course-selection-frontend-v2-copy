<template>
  <div class="w-full">
    <fieldset
      ref="form"
      :aria-invalid="warn"
      :aria-describedby="warn ? question.id + 'required' : ''"
    >
      <legend
        class="text-lg xl:leading-10 md:text-xl xl:text-3xl overflow-visible mb-4"
      >
        {{ question.question }}
      </legend>
      <div
        class="flex flex-row text-lg md:text-xl xl:text-2xl gap-4 items-baseline"
      >
        <label class="flex justify-center items-center flex-wrap">
          <input
            type="radio"
            :disabled="isDisabled"
            class="w-5 h-5 mx-2 text-blue-400 bg-zinc-100 border-gray-300 focus:ring-transparent"
            :name="`question_${question.question}`"
            value="Yes"
            v-model="surveyStore.currentResponse[index].answer"
          />
          Yes
        </label>
        <label class="flex justify-center items-center flex-wrap">
          <input
            type="radio"
            :disabled="isDisabled"
            class="w-5 h-5 mx-2 text-blue-400 bg-zinc-100 border-gray-300 focus:ring-transparent"
            :name="`question_${question.question}`"
            value="No"
            v-model="surveyStore.currentResponse[index].answer"
          />
          No
        </label>
        <Transition
          leave-to-class="opacity-0"
          leave-active-class="transition-opacity duration-200 ease-linear"
        >
          <div
            class="flex items-center justify-center text-red-500 gap-2 xl:ml-10 md:ml-8 xs:ml-4 ml-2"
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
import exclamationMark from "../../../components/icons/ExclamationMark.vue";
import { useSurveyStore } from "../../../stores/survey";
import { watch, PropType, ref } from "vue";
import {
  surveyQuestion,
  preferences,
  allCoursesAnswer,
} from "../../../types/interface";

const props = defineProps({
  question: {
    type: Object as PropType<surveyQuestion>,
    required: true,
  },
  isDisabled: Boolean,
  referencedClass: Object as PropType<preferences>,
  warn: Boolean,
});

const surveyStore = useSurveyStore();
const index = ref(0);

const getQuestionIndex = (question: string): number => {
  return surveyStore.currentResponse.findIndex(
    (entry) => entry.question === question
  );
};

function startQuestion() {
  const currentQuestion: string = props.question.question;
  index.value = getQuestionIndex(currentQuestion);
  if (index.value < 0) {
    const newQuestion = {
      id: props.question.id,
      question: currentQuestion,
      questionType: "BOOLEAN",
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
  (newResponse, oldResponse) => {
    surveyStore.checkSurveyAnswers([surveyStore.currentResponse[index.value]]);
    const allCoursesIndex = surveyStore.currentResponse.findIndex(
      (item) => item.id === "allChosenCourses"
    );
    const allCourses = surveyStore.currentResponse[
      allCoursesIndex
    ] as allCoursesAnswer;

    const referencedClass = props.question.classReferenced?.name;

    if (!referencedClass) return;

    if (newResponse.toString().toUpperCase() === "YES") {
      //add interested course to array of overall rankings if new response is Yes
      const overallRank = allCourses.answer.courses.length + 1;
      const courseObject = {
        name: props.question.classReferenced.name,
        courseCode: props.question.classReferenced.courseCode,
        subject: props.question.classReferenced.subject,
      };
      const rankedCourseObject = {
        ...courseObject,
        rank: overallRank,
      };
      allCourses.answer.courses.push(courseObject);
      allCourses.answer.preference.push(rankedCourseObject);
    } else if (newResponse.toString().toUpperCase() === "NO" && oldResponse.toString().toUpperCase() === "YES") {
      //if the response has changed from Yes to No, remove the interested course
      allCourses.answer.courses = allCourses.answer.courses.filter(
        (course) => typeof course !== "string" && course.name !== referencedClass
      );
      allCourses.answer.preference = allCourses.answer.preference.filter(
        (preference) => preference.name !== referencedClass
      );
    }
  }
);
</script>

<style lang="css">
button[type="radio"] {
  transform: scale(3);
}

</style>
