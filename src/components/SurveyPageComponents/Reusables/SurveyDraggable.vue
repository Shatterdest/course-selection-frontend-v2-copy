<template>
  <div class="h-auto select-none flex items-center justify-center w-full">
    <div v-if="ref_courses.length > 0" class="flex flex-col mt-2 text-center text-base md:text-lg xl:text-xl">
      <draggable v-model="ref_courses" item-key="rank" @end="onDragEnd">
        <template #item="{ element, index }">
          <div v-if="element.name !== undefined"
            class="h-12 mx-2 mb-2.5 xl:h-16 w-full placeholder flex items-center justify-center p-2 rounded-lg shadow-lg text-[#37394F] cursor-grab active:cursor-grabbing font-semibold course"
            :class="`bg-[#${color}]`" :course-rank="index">
            <div class="w-full h-full flex items-center justify-center" :class="`bg-[#${color}]`">
              {{ numbered ? index + 1 + '. ' : '' }}{{ element.name }}
            </div>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, PropType } from "vue";
import draggable from "vuedraggable";
import { useSurveyStore } from "../../../stores/survey";
import { preferences } from "../../../types/interface";
import { checkboxAnswer } from "../../../types/interface";

const props = defineProps({
  courses: {
    type: Array as PropType<Array<preferences>>,
    required: true,
  },
  numbered: Boolean,
  index: Number,
  color: String,
});

const surveyStore = useSurveyStore();
const ref_courses = ref([...props.courses]);

//watch for changes in the courses prop and update items accordingly
watch(() => props.courses, (newCourses) => {
  ref_courses.value = [...newCourses];
});

//@ts-ignore
const onDragEnd = (event) => {
  //update the ranks based on the new order
  ref_courses.value.forEach((course, index) => {
    course.rank = index + 1;
  });

  if (props.index !== undefined) {
    const currentAnswer = surveyStore.currentResponse[props.index].answer as checkboxAnswer;
    currentAnswer.preference = ref_courses.value;
  }
}

const x = ref(0); //triggers component rerender

//watch for changes in currentResponse; trigger draggable rerender
surveyStore.currentResponse.forEach((question, questionIndex) => {
  watch(
    () => surveyStore.currentResponse[questionIndex],
    () => {
      x.value++;
    },
    { deep: true }
  );
});
</script>
