<template>
  <section class="flex flex-col items-center justify-center">
    <div class="w-2/3">
      <div class="text-2xl mb-4" v-if="studentSurvey">
        <h1 class="font-bold text-[#37394F] text-3xl mb-6">
          {{ studentName }}'s Survey
        </h1>
        <h2 v-if="studentSurvey.grade === 'FRESHMAN'">Grade : 9</h2>
        <h2 v-if="studentSurvey.grade === 'SOPHOMORE'">Grade : 10</h2>
        <h2 v-if="studentSurvey.grade === 'JUNIOR'">Grade : 11</h2>
        <h2 v-if="studentSurvey.grade === 'SENIOR'">Grade : 12</h2>
      </div>

      <p v-if="surveyStore.loading">Setting things up...</p>
      <div v-else>
        <div
          v-for="question in surveyStore.currentSurvey.question"
          :key="question.id"
          class="flex justify-center"
        >
          <div
            v-if="surveyStore.missingAnswers.length > 0"
            class="w-1/12 flex justify-center items-center"
          >
            <exclamationMark
              v-if="surveyStore.missingAnswers.includes(question.id)"
              class="text-red-500 h-8"
            >
            </exclamationMark>
          </div>
          <div class="w-11/12">
            <booleanComponent
              class="mb-2"
              v-if="question.questionType === 'BOOLEAN'"
              :question="question"
            >
            </booleanComponent>
            <generalComponent
              class="mb-6"
              v-else-if="question.questionType === 'GENERAL'"
              :question="question"
            >
            </generalComponent>
            <dropdownComponent
            v-else-if="question.questionType === 'DROPDOWN'"
            :question="question"
            :warn="surveyStore.missingAnswers.filter((answer) => answer === question.id).length > 0 && shouldWarn"
          />
            <checkboxComponent
              v-else
              class="mb-6"
              :question="question"
              :choices="getChoices(question)"
              :color="'DEE9C8'"
            >
            </checkboxComponent>
          </div>
        </div>

        <div class="my-6">
          <p class="text-lg md:text-xl xl:text-3xl my-4">
            Student's order of priority:
          </p>
          <surveyDraggable
            :courses="surveyStore.currentResponse[indexAll].answer.preference"
            :index="indexAll"
            :numbered="true"
            :key="x"
            :color="'DEE9C8'"
          >
          </surveyDraggable>
        </div>
        <div class="mt-14">
          <p class="text-lg md:text-xl xl:text-3xl">Note from the student:</p>
          <input
            disabled
            class="block py-2 px-3 mt-3 w-full md:w-3/5 text-base bg-transparent rounded-md border border-solid border-zinc-400 focus:outline-none focus:ring-0 focus:border-blue-400 disabled:bg-gray-100"
            type="text"
            v-model="surveyStore.currentResponse[indexNoteGuidance].answer"
          />
        </div>
        <div class="my-10">
          <p class="text-lg xl:leading-10 md:text-xl xl:text-3xl">
            Final counselor notes:
          </p>
          <input
            class="block py-2 px-3 mt-3 w-full md:w-3/5 text-base bg-transparent rounded-md border border-solid border-zinc-400 focus:outline-none focus:ring-0 focus:border-blue-400"
            type="text"
            v-model="surveyStore.currentResponse[indexGuidanceFinalNote].answer"
          />
        </div>
      </div>

      <div class="flex justify-center mb-10 flex-col items-center">
        <p
          v-if="surveyStore.missingAnswers.length > 0"
          class="text-red-500 mb-4 text-center"
        >
          Please fill in all questions before submitting.
        </p>
        <p v-else class="mb-4 text-center">
          After finalizing this survey, the student will no longer be able to
          edit their survey
        </p>
        <button
          @click="submit()"
          class="bg-[#DEE9C8] shadow-[2px_3px_2px_rgba(0,0,0,0.25)] w-36 h-12 text-2xl font-bold text-[#37394F]"
        >
          Finalize
        </button>
      </div>
    </div>
  </section>
  <ScrollPage :guidance="true" />
</template>

<script setup lang="ts">
//@ts-nocheck
import { useUserStore } from "../stores/user";
import { useSurveyStore } from "../stores/survey";
import booleanComponent from "../components/SurveyPageComponents/Reusables/SurveyBoolean.vue";
import generalComponent from "../components/SurveyPageComponents/Reusables/SurveyGeneral.vue";
import checkboxComponent from "../components/SurveyPageComponents/Reusables/SurveyCheckbox.vue";
import dropdownComponent from "../components/SurveyPageComponents/Reusables/SurveyDropdown.vue";
import surveyDraggable from "../components/SurveyPageComponents/Reusables/SurveyDraggable.vue";
import exclamationMark from "../components/icons/ExclamationMark.vue";
import ScrollPage from "../components/SurveyPageComponents/Reusables/ScrollPage.vue";
import { surveyQuestion, studentGuidance } from "../types/interface";
import { useRouter, useRoute, onBeforeRouteLeave } from "vue-router";
import { ref, Ref, watch, onMounted } from "vue";

document.title = "Survey | SITHS Course Selection";

const userStore = useUserStore();
const surveyStore = useSurveyStore();
const router = useRouter();
const route = useRoute();
const studentSurvey = ref<studentGuidance | null>(null);

const studentName = ref("");

onMounted(async () => {
  try {
    await surveyStore.fetchSurvey(route.params.email);
    if (surveyStore.currentSurvey) {
      studentSurvey.value = surveyStore.currentSurvey;
      studentName.value = surveyStore.name.replace(",", ", ");
    }
  } catch (error) {
    console.error("Error fetching survey data:", error);
  }
});

surveyStore.missingAnswers = [];

const x: Ref<number> = ref(0);

const indexAll = surveyStore.currentResponse.findIndex(
  (x) => x.id === "allChosenCourses"
);
const indexNoteGuidance = surveyStore.currentResponse.findIndex(
  (x) => x.id === "noteToGuidance"
);
const indexGuidanceFinalNote = surveyStore.currentResponse.findIndex(
  (x) => x.id === "guidanceFinalNote"
);

const getChoices = (question: surveyQuestion) => {
  const classes = surveyStore.studentCourses.coursesAvailable;
  return classes.filter((x) => x.subject === question.questionType);
};

const submit = async () => {
  await surveyStore.checkSurveyAnswers();
  if (surveyStore.missingAnswers.length === 0) {
    if (userStore.userType === "student") {
      router.push("/student/dashboard");
    } else if (userStore.userType === "guidance") {
      router.push("/guidance/studentlist");
    }
  }
};

watch(
  () => surveyStore.currentResponse[indexAll].answer.preference,
  (newResponse) => {
    x.value = x.value + 1;
  },
  { deep: true }
);

onBeforeRouteLeave((to, from, next) => {
  if (
    JSON.stringify(surveyStore.currentResponse) ===
      surveyStore.currentAnsweredSurvey.answers ||
    to.path === "/guidance/dashboard"
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

const reminder = (e: { preventDefault: () => void; returnValue: string }) => {
  e.preventDefault();
  e.returnValue = "";
};

watch(
  () => surveyStore.currentResponse,
  (newResponse, oldResponse) => {
    if (
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
  () => surveyStore.currentAnsweredSurvey,
  (newResponse, oldResponse) => {
    if (newResponse.answers === JSON.stringify(surveyStore.currentResponse)) {
      window.removeEventListener("beforeunload", reminder);
    } else {
      window.addEventListener("beforeunload", reminder);
    }
  },
  { deep: true }
);
</script>
