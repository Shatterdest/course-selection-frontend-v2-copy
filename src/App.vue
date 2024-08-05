<script setup lang="ts">
import NavBar from './components/NavbarComponents/NavBar.vue';
import { useSurveyStore } from './stores/survey';
import { useUserStore } from './stores/user';
import { useResetStore } from './stores/reset';

const surveyStore = useSurveyStore()
const userStore = useUserStore()
const resetStore = useResetStore()

const currentTime = new Date()

const session = localStorage.getItem('session');
const sessionExpiration = session ? (JSON.parse(session).expire_time) : null;

if(currentTime.getTime() > userStore.expire_time && currentTime > sessionExpiration) {
  resetStore.all()
}
</script>

<template>
  <div class="fixed place-content-center items-center inset-x-0 bottom-0 w-full flex z-20 text-[#174616] bg-[#A8D480] h-[10%] lg:text-xl text-lg duration-[0.75s]" :class="{'translate-y-full': !surveyStore.submit}">
      <p class="">Your survey has been submitted</p>
  </div>
  <div id="app">
    <nav-bar></nav-bar>
    <router-view></router-view>
  </div>
  
</template>

<style scoped>
</style>