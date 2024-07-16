<template>
  <div
    id="menu"
    class="fixed inset-0 h-screen w-full ease-in duration-200 md:hidden z-30"
  >
    <div
      id="overlay"
      class="absolute inset-0 w-full h-full bg-white opacity-100 -z-10"
    ></div>
    <div
      v-if="userStore.isLoggedIn && userStore.userType === 'student'"
      class="h-full absolute top-40 left-16 flex flex-col justify-start items-start space-y-8 z-10"
    >
      <RouterLink @click="$emit('e')" id="link" to="/student/dashboard"
        ><p class="text-4xl">Home</p></RouterLink
      >
      <RouterLink @click="$emit('e')" id="link" to="/student/survey"
        ><p class="text-4xl">Survey</p></RouterLink
      >
      <a
        @click="$emit('e')"
        id="link"
        href="https://siths-catalog.netlify.app/"
        target="_blank"
        rel="noopener"
      >
        <p class="text-4xl">Courses</p>
      </a>
      <RouterLink to="/" @click="$emit('e')">
        <p
          @click="logout()"
          id="link"
          class="text-4xl text-red-500 cursor-pointer"
        >
          Logout
        </p>
      </RouterLink>
    </div>
    <div
      v-if="userStore.isLoggedIn && userStore.userType === 'guidance'"
      class="h-full absolute top-40 left-16 flex flex-col justify-start items-start space-y-8 z-10"
    >
      <RouterLink @click="$emit('e')" id="link" to="/guidance/dashboard"
        ><p class="text-4xl">Home</p></RouterLink
      >
      <RouterLink @click="$emit('e')" id="link" to="/guidance/studentlist"
        ><p class="text-4xl">Students</p></RouterLink
      >
      <RouterLink @click="$emit('e')" id="link" to="/guidance/calendar"
        ><p class="text-4xl">Calendar</p></RouterLink
      >
      <RouterLink @click="$emit('e')" id="link" to="/guidance/statistics"
        ><p class="text-4xl">Statistics</p></RouterLink
      >
      <RouterLink to="/" @click="$emit('e')">
        <p
          @click="logout()"
          id="link"
          class="text-4xl text-red-500 cursor-pointer"
        >
          Logout
        </p>
      </RouterLink>
    </div>
    <div
      v-if="!userStore.isLoggedIn"
      class="h-full absolute top-56 left-16 flex flex-col justify-start items-start space-y-8 z-10"
    >
      <RouterLink @click="$emit('e')" id="link" to="/"
        ><p class="text-4xl">Home</p></RouterLink
      >
      <p id="link" class="text-4xl" @click="$emit('e')">
        <a
          href="https://siths-catalog.netlify.app/"
          target="_blank"
          rel="noopener"
          >Courses</a
        >
      </p>
      <RouterLink @click="$emit('e')" id="link" to="/login"
        ><p class="text-4xl">Login</p></RouterLink
      >
    </div>
  </div>
</template>

<script setup lang="ts">
import { RouterLink } from "vue-router";
import gsap from "gsap";
import { onMounted } from "vue";
import { useUserStore } from "../../stores/user";
import { useSurveyStore } from "../../stores/survey";
import { useResetStore } from "../../stores/reset";
import router from "../../router";

const userStore = useUserStore();
const surveyStore = useSurveyStore();
const resetStore = useResetStore();

onMounted(() => {
  const tl = gsap.timeline({
    defaults: {
      duration: 1,
      ease: "power2.out",
    },
  });

  tl.from(
    "#link",
    {
      x: -100,
      opacity: 0,
      stagger: 0.2,
    },
    "-=0.2"
  );
});

const surveyNav = () => {
  if (surveyStore.open) {
    router.push("/student/survey");
  } else if (!surveyStore.open) {
    router.push("/student/survey/closed");
  }
};

const logout = async () => {
  await resetStore.all();
  localStorage.clear();
  router.push("/");
};
</script>
