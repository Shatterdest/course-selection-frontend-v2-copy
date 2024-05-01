<template>
  <section class="flex justify-center items-center flex-col">
    <div class="lg:w-2/3 w-11/12">
      <div
        v-for="question in surveyStore.currentSurvey.question"
        :key="question.question"
        class="flex justify-center mb-8"
      >
        <div class="flex flex-col w-11/12">
          <booleanComponent
            v-if="question.questionType === 'BOOLEAN'"
            :question="question"
            :warn="surveyStore.missingAnswers.filter((answer) => answer === question.id).length > 0 && shouldWarn"
          />
          <generalComponent
            v-else-if="question.questionType === 'GENERAL'"
            :question="question"
            :warn="surveyStore.missingAnswers.filter((answer) => answer === question.id).length > 0 && shouldWarn"
          />
          <dropdownComponent
            v-else-if="question.questionType === 'DROPDOWN'"
            :question="question"
            :warn="surveyStore.missingAnswers.filter((answer) => answer === question.id).length > 0 && shouldWarn"
          />
          <checkboxComponent
            v-else
            :question="question"
            :choices="getChoices(question)"
            :color="'D6EEFF'"
            :warn="surveyStore.missingAnswers.filter((answer) => answer === question.id).length > 0 && shouldWarn"
          />
        </div>
      </div>
      <div class="my-6">
        <p class="text-lg xl:leading-10 md:text-xl xl:text-3xl my-4">
          For the final part of the survey, please drag your classes in the order of priority, with the first choice
          being your top priority.
        </p>
        <surveyDraggable
          :courses="(surveyStore.currentResponse[indexAllCourses] as allCoursesAnswer).answer.preference"
          :index="indexAllCourses"
          :numbered="true"
          :key="x"
          :color="'D6EEFF'"
        />
      </div>
      <div class="mt-14">
        <p class="text-lg xl:leading-10 md:text-xl xl:text-3xl">Final note to your guidance counselor:</p>
        <input
          class="block py-2 px-3 mt-3 w-full md:w-3/5 text-base bg-transparent rounded-md border border-solid border-zinc-400 focus:outline-none focus:ring-0 focus:border-blue-400"
          type="text"
          v-model="surveyStore.currentResponse[indexNoteGuidance].answer"
        />
      </div>
      <div class="flex justify-center my-10 flex-col items-center">
        <p v-if="surveyStore.missingAnswers.length === 0" class="mb-4 text-center">
          Once you submit, you will still be able to make changes to your survey before the due date. Once your guidance
          counselor finalizes your survey, you will not be able to edit.
        </p>
        <p v-else class="mb-4 text-center text-red-500">Please answer all required questions before submitting.</p>
        <button
          @click="submit()"
          class="bg-[#D6EEFF] shadow-[2px_3px_2px_rgba(0,0,0,0.25)] w-36 h-12 text-2xl font-bold text-[#37394F]"
        >
          Submit
        </button>
      </div>
    </div>
  </section>
  <ScrollPage :guidance="false" />
</template>

<script setup lang="ts">
import { useUserStore } from "../stores/user";
import { useSurveyStore } from "../stores/survey";
import booleanComponent from "../components/SurveyPageComponents/Reusables/SurveyBoolean.vue";
import generalComponent from "../components/SurveyPageComponents/Reusables/SurveyGeneral.vue";
import checkboxComponent from "../components/SurveyPageComponents/Reusables/SurveyCheckbox.vue";
import surveyDraggable from "../components/SurveyPageComponents/Reusables/SurveyDraggable.vue";
import dropdownComponent from "../components/SurveyPageComponents/Reusables/SurveyDropdown.vue";
import ScrollPage from "../components/SurveyPageComponents/Reusables/ScrollPage.vue";
import { allCoursesAnswer, surveyQuestion } from "../types/interface";
import { watch, ref, Ref } from "vue";
import { useRouter, onBeforeRouteLeave } from "vue-router";

document.title = "Survey | SITHS Course Selection";

const userStore = useUserStore();
const surveyStore = useSurveyStore();
const router = useRouter();

surveyStore.missingAnswers = [];
surveyStore.checkSurveyAnswers(surveyStore.currentResponse);

if (surveyStore.currentAnsweredSurvey.status === "COMPLETE") {
  surveyStore.fetchSurvey();
}

const indexAllCourses: number = surveyStore.currentResponse.findIndex((question) => question.id === "allChosenCourses");
const indexNoteGuidance: number = surveyStore.currentResponse.findIndex((question) => question.id === "noteToGuidance");
const x: Ref<number> = ref(0);

const getChoices = (question: surveyQuestion) => {
  const classes = surveyStore.studentCourses.coursesAvailable;
  return classes.filter((x) => x.subject === question.questionType);
};

const shouldWarn = ref(false);

const submit = async () => {
  surveyStore.checkSurveyAnswers(surveyStore.currentResponse);
  if (surveyStore.missingAnswers.length > 0) {
    alert("Please answer all required questions before submitting.");
    shouldWarn.value = true;
    return;
  }
  if (userStore.userType === "student") {
    await surveyStore.saveSurvey();
    router.push("/student/dashboard");
  } else if (userStore.userType === "guidance") {
    router.push("/guidance/studentlist");
  }
};

onBeforeRouteLeave((to, from, next) => {
  //@ts-ignore
  if (
    JSON.stringify(surveyStore.currentResponse) === surveyStore.currentAnsweredSurvey.answers ||
    to.path === "/student/survey/review"
  ) {
    window.removeEventListener("beforeunload", reminder);
    next();
  } else {
    const answer = window.confirm("Changes you made might not be saved.");
    if (answer) {
      window.removeEventListener("beforeunload", reminder);
      next();
    } else {
      next(false);
    }
  }
});

const reminder = (e: Event) => {
  e.preventDefault();
  e.returnValue = false;
};

watch(
  () => surveyStore.currentResponse,
  (newResponse, oldResponse) => {
    if (
      //@ts-ignore
      JSON.stringify(newResponse) === surveyStore.currentAnsweredSurvey.answers
    ) {
      window.removeEventListener("beforeunload", reminder);
    } else {
      window.addEventListener("beforeunload", reminder);
    }
  },
  { deep: true }
);

watch(
  () => surveyStore.currentAnsweredSurvey.answers,
  (newResponse, oldResponse) => {
    //@ts-ignore
    if (newResponse === JSON.stringify(surveyStore.currentResponse)) {
      window.removeEventListener("beforeunload", reminder);
    } else {
      window.addEventListener("beforeunload", reminder);
    }
  },
  { deep: true }
);

watch(
  () => (surveyStore.currentResponse[indexAllCourses] as allCoursesAnswer).answer.preference,
  (newResponse) => {
    x.value = x.value + 1;
  },
  { deep: true }
);
</script>
