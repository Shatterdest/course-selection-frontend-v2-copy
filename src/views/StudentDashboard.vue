<template>
  <div class="h-[75vh] w-full flex flex-row justify-center items-center">
    <div
      v-if="userStore.studentSurveyPreview.grade === null"
      id="left"
      class="w-5/6 flex flex-col justify-center items-center text-center space-y-4 lg:items-start lg:text-left md:w-3/4 lg:max-w-2xl xl:max-w-3xl lg:space-y-6 lg:ml-12"
    >
      <h2 id="name" class="text-5xl font-bold">
        Welcome,
        {{ toTitleCase(`${userStore.first_name} ${userStore.last_name}`) }}
      </h2>
      <div id="announcements" class="text-xl text-center flex ml-2 md:text-left">
        Thank you for signing up. Your account information is in the process of being updated. Please come back later.
      </div>
    </div>
    <div
      v-else
      id="left"
      class="w-5/6 flex flex-col justify-center items-center text-center space-y-4 lg:items-start lg:text-left md:w-3/4 lg:max-w-2xl xl:max-w-3xl lg:space-y-6 lg:ml-12"
    >
      <h1 id="name" class="text-3xl sm:text-4xl md:text-5xl font-bold">
        Welcome back,
        <span>{{ toTitleCase(`${userStore.first_name} ${userStore.last_name}`) }}</span>
      </h1>
      <div
        id="announcements"
        class="text-lg md:text-xl text-left flex justify-center items-center ml-4 lg:ml-0 lg:justify-start"
      >
        <BellIcon />
        <h2 v-if="surveyStore.open">Surveys are closing on {{ closeTime }}.</h2>
        <h2 v-else-if="userStore.studentSurveyPreview.status === 'FINALIZED'">
          Your guidance counselor has finalized your survey. If you wish to make changes, please contact them.
        </h2>
        <h2 v-else>
          The due date for completion has passed. Please contact your guidance counselor to request changes.
        </h2>
      </div>

      <!-- survey status -->
      <div
        v-if="userStore.studentSurveyPreview.status === 'NOT STARTED'"
        class="text-[#461616] bg-[#EA9F9F] font-semibold text-center p-3 lg:px-6 lg:text-base text-sm rounded-md"
      >
        Survey Status:
        <span class="font-medium">Not Started</span>
      </div>
      <div
        v-else-if="userStore.studentSurveyPreview.status === 'COMPLETE'"
        class="text-[#174616] bg-[#A8D480] font-semibold text-center p-3 lg:px-6 lg:text-base text-sm rounded-md"
      >
        Survey Status:
        <span class="font-medium">Submitted</span>
      </div>
      <div
        v-else-if="userStore.studentSurveyPreview.status === 'INCOMPLETE'"
        class="text-[#461616] bg-[#F9D477] font-semibold text-center p-3 lg:px-6 lg:text-base text-sm rounded-md"
      >
        Survey Status:
        <span class="font-medium">In Progress</span>
      </div>
      <div
        v-else-if="userStore.studentSurveyPreview.status === 'FINALIZED'"
        class="text-[#461616] bg-[#D1A4DE] font-semibold text-center p-3 lg:px-6 lg:text-base text-sm rounded-md"
      >
        Survey Status:
        <span class="font-medium">Finalized</span>
      </div>

      <div>
        <div class="flex flex-col justify-start items-center mb-2 lg:flex-row lg:space-y-0 lg:space-x-4">
          <a href="https://siths-catalog.netlify.app/" target="_blank" rel="noopener" class="font-semibold"
            ><button class="mb-2 lg:m-0 bg-primary-s w-48 h-14 rounded-md text-xl hover:bg-other-s">Courses</button></a
          >
          <!-- check if survey exists, if not create new and set current -->
          <RouterLink v-if="surveyStore.open" to="/student/survey">
            <button class="mb-2 lg:m-0 bg-primary-s w-48 h-14 rounded-md text-xl font-semibold hover:bg-other-s">
              Course Survey
            </button>
          </RouterLink>
          <RouterLink v-else to="/student/survey/closed">
            <button class="mb-2 lg:m-0 bg-primary-s w-48 h-14 rounded-md text-xl font-semibold hover:bg-other-s">
              View Survey
            </button>
          </RouterLink>
        </div>
        <p>For bug reports: <a href="https://forms.gle/HL8aZfW7Av3eHdAt6" class="text-blue-500">Click Here</a></p>
        <p
          v-if="
            userStore.studentSurveyPreview.meetingDate != undefined ||
            userStore.studentSurveyPreview.meetingDate != null
          "
        >
          You have a scheduled meeting with your guidance counselor on {{ date }} at {{ time }}.
        </p>
        <p v-else>Your guidance counselor has not scheduled a meeting with you yet.</p>
      </div>
    </div>
    <div
      id="circles"
      class="-z-10 absolute h-96 w-112 sm:h-128 sm:w-128 lg:h-96 lg:w-112 xl:h-128 xl:w-128 hidden lg:flex justify-center items-center lg:relative lg:mx-8"
    >
      <div
        id="big"
        class="h-80 w-80 sm:h-96 sm:w-96 lg:h-80 lg:w-80 xl:h-96 xl:w-96 bg-tertiary-s rounded-full right-32"
      ></div>
      <div
        id="small"
        class="h-32 w-32 sm:h-40 sm:w-40 lg:h-32 lg:w-32 xl:h-40 xl:w-40 absolute bottom-4 left-12 bg-other-s rounded-full"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BellIcon from "../components/icons/BellIcon.vue";
import { useUserStore } from "../stores/user";
import { useSurveyStore } from "../stores/survey";
//@ts-ignore
import dateFormat from "dateformat";
import { onMounted, Ref, ref, watch, computed } from "vue";

document.title = "Dashboard | SITHS Course Selection";

const userStore = useUserStore();
const surveyStore = useSurveyStore();

let time: String;
let date: String;

const closeTime = computed(() => {
  if (userStore.studentSurveyPreview.dueDate) {
    const ISOString = userStore.studentSurveyPreview.dueDate.substring(0, 10).split("-");
    return dateFormat(ISOString, "shortDate");
  }
});

if (userStore.studentSurveyPreview.meetingDate != undefined || userStore.studentSurveyPreview.meetingDate != null) {
  const datetime = new Date(userStore.studentSurveyPreview.meetingDate);
  date = dateFormat(datetime, "shortDate");
  time = dateFormat(datetime, "shortTime");
}

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
