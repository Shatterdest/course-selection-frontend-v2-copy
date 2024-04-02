<template>
  <nav
    id="navbar"
    class="w-full top-0 h-[13vh] md:h-[15vh] flex justify-between items-center px-8 md:px-12 lg:px-16 overflow-visible"
  >
    <div @click="redirect()" class="cursor-pointer">
      <p
        class="text-lg sm:text-xl md:text-2xl font-semibold z-50 hover:text-gray-600 flex sm:flex"
        :class="{ hidden: viewingSurvey() }"
      >
        Course Selection
      </p>
    </div>
    <div
      v-if="userStore.isLoggedIn && userStore.userType === 'student' && viewingSurvey() === false"
      class="hidden justify-center items-center space-x-12 md:flex"
    >
      <p>
        <a href="https://siths-catalog.netlify.app/" target="_blank" rel="noopener">Courses</a>
      </p>
      <p v-if="userStore.studentSurveyPreview !== null" @click="surveyNav()" class="cursor-pointer hover:text-gray-500">
        Survey
      </p>
      <RouterLink to="/">
        <p @click="logout()" id="name-link" class="text-base text-red-500 cursor-pointer hover:text-red-400">Logout</p>
      </RouterLink>
    </div>
    <div
      v-if="userStore.isLoggedIn && userStore.userType === 'guidance' && viewingSurvey() === false"
      class="hidden justify-center items-center space-x-12 md:flex"
    >
      <RouterLink to="/guidance/studentlist">
        <p class="text-base hover:text-gray-500">Students</p>
      </RouterLink>
      <RouterLink to="/guidance/calendar">
        <p class="text-base hover:text-gray-500">Calendar</p>
      </RouterLink>
      <RouterLink id="link" to="/guidance/statistics">
        <p class="text-base hover:text-gray-5000">Statistics</p>
      </RouterLink>
      <RouterLink to="/">
        <p @click="logout()" id="name-link" class="text-base text-red-500 cursor-pointer hover:text-red-400">Logout</p>
      </RouterLink>
    </div>
    <!-- login page -->
    <div
      v-if="!userStore.isLoggedIn && viewingSurvey() === false"
      class="hidden justify-center items-center space-x-12 md:flex"
    >
      <p>
        <a href="https://siths-catalog.netlify.app/" target="_blank" rel="noopener">Courses</a>
      </p>
      <RouterLink to="/login">
        <p class="text-base hover:text-gray-500">Login</p>
      </RouterLink>
    </div>

    <div v-if="!viewingSurvey()" id="menu-icon" class="flex justify-center items-center cursor-pointer z-40 md:hidden">
      <MenuIcon @click="toggleMenu" v-if="!menuOpen" />
      <CloseMenu @click="toggleMenu" v-else />
    </div>
    <!-- while viewing survey -->
    <div v-if="viewingSurvey()" class="flex flex-row-reverse w-full sm:w-1/4 md:1/6 justify-between text-xl md:text-xl">
      <p @click="redirect()" class="text-[#37394F] cursor-pointer hover:text-gray-500">Exit</p>
      <p
        v-if="surveyStore.currentAnsweredSurvey.status === 'COMPLETE' && surveyStore.open === true"
        @click="submit()"
        class="text-[#37394F] cursor-pointer hover:text-gray-500"
      >
        Submit
      </p>
      <p
        v-if="surveyStore.currentAnsweredSurvey.status != 'COMPLETE' && surveyStore.open === true"
        @click="
          surveyStore.saveSurvey();
          toggleSave();
        "
        class="text-[#37394F] cursor-pointer hover:text-gray-500"
        ref="save"
      >
        Save
      </p>
    </div>
    <MobileNav v-if="menuOpen" @e="toggleMenu" />
  </nav>
</template>
<script lang="ts" setup>
import { useUserStore } from "../../stores/user";
import { useSurveyStore } from "../../stores/survey";
import { useResetStore } from "../../stores/reset";
import { RouterLink } from "vue-router";
import MenuIcon from "../icons/MenuIcon.vue";
import CloseMenu from "../icons/CloseMenu.vue";
import MobileNav from "./MobileNav.vue";
import { ref, Ref } from "vue";
import router from "../../router";

const userStore = useUserStore();
const surveyStore = useSurveyStore();
const resetStore = useResetStore();
let menuOpen: Ref<boolean> = ref(false);
const save = ref();

const viewingSurvey = () => {
  return router.currentRoute.value.path.includes("survey");
};

const redirect = () => {
  if (userStore.isLoggedIn === true) {
    if (userStore.userType === "student") {
      router.push("/student/dashboard");
    }
    if (userStore.userType === "guidance") {
      router.push("/guidance/studentlist");
    }
  } else {
    return router.push("/");
  }
};

const surveyNav = () => {
  if (surveyStore.open) {
    router.push("/student/survey/");
  } else if (!surveyStore.open) {
    router.push("/student/survey/closed");
  }
};

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

const toggleSave = () => {
  save.value.innerHTML = "Saved";
  setTimeout(() => {
    if (!save.value) return;
    save.value.innerHTML = "Save";
  }, 1500);
};

const logout = async () => {
  await resetStore.all();
  localStorage.clear();
  router.push("/");
};

const submit = async () => {
  surveyStore.saveSurvey();
  if (surveyStore.missingAnswers.length === 0) {
    if (userStore.userType === "student") {
      router.push("/student/dashboard");
    } else if (userStore.userType === "guidance") {
      router.push("/guidance/studentlist");
    }
  }
};
</script>
