<template>
  <div class="h-auto select-none flex items-center justify-center w-full">
    <div
      v-if="refCourses.length > 0"
      class="flex flex-col mt-2 text-center text-base md:text-lg xl:text-xl"
      ref="courseBox"
    >
      <div
        v-for="course in refCourses.sort((a, b) => {
          return a.rank - b.rank;
        })"
        :key="course.name"
      >
        <div
          v-if="course.name !== undefined"
          class="h-12 mx-2 mb-2.5 xl:h-16 w-full placeholder flex items-center justify-center p-2 rounded-lg shadow-lg text-[#37394F] cursor-grab active:cursor-grabbing font-semibold course"
          :class="`bg-[#${color}]`"
          :course-rank="course.rank"
        >
          <div
            class="w-full h-full flex items-center justify-center"
            :class="`bg-[#${color}]`"
            draggable="true"
            @dragstart="(e: DragEvent) => (dragElement = e.target as HTMLElement)"
            @dragover.prevent="(e: DragEvent) => hoverBoxOver(e)"
            @dragend.prevent="(e: MouseEvent | DragEvent) => hoverBox(e, course.rank)"
            @touchstart.prevent="(e: TouchEvent) => handleTouchStart(e, course.rank)"
            @touchmove.prevent="(e: TouchEvent) => handleTouchMove(e)"
            @touchend.prevent="(e: TouchEvent) => handleTouchEnd(e)"
          >
            {{ course.name }} {{ course.rank }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, computed, PropType, watch } from "vue";
import { useSurveyStore } from "../../../stores/survey";
import { checkboxAnswer, preferences } from "../../../types/interface";

let isTouchDevice =
  "ontouchstart" in window || (navigator.maxTouchPoints !== undefined && navigator.maxTouchPoints > 0);

const props = defineProps({
  courses: {
    type: Array as PropType<Array<preferences>>,
    required: true,
  },
  numbered: Boolean,
  index: Number,
  color: String,
});

const courseBox: Ref<HTMLDivElement | undefined> = ref();
const surveyStore = useSurveyStore();
let dragElement: HTMLElement;

const refCourses = ref(props.courses);

const hoverBoxOver = function (e: DragEvent) {
  const dragParent: HTMLElement | null = dragElement.parentElement;
  const target = e.target as HTMLElement;

  if (target && target.parentElement) {
    target.parentElement.appendChild(dragElement);
    dragParent?.appendChild(target);
  }
};

const hoverBox = function (e: MouseEvent | DragEvent, rank: number) {
  const dragParent: HTMLElement | null = dragElement.parentElement;
  let dragIndex: string = "";

  if (dragParent) {
    dragIndex = dragParent.getAttribute("course-rank") ?? "";
  }
  const target = e.target as HTMLElement;

  if (target && target.parentElement) {
    target.parentElement.appendChild(dragElement);
    dragParent?.appendChild(target);
  }

  updateRank(rank, Number(dragIndex));
};

function updateRank(rank: number, dragIndex: number) {
  if (rank === dragIndex) return;
  const dir = rank > dragIndex; // true=up, false=down
  const course = refCourses.value.splice(rank - 1, 1)[0];
  course.rank = dragIndex;
  refCourses.value.forEach((course) => {
    if (dir) {
      if (course.rank >= dragIndex && course.rank < rank) course.rank++;
    } else {
      if (course.rank <= dragIndex && course.rank > rank) course.rank--;
    }
  });
  refCourses.value.splice(dragIndex - 1, 0, course);

  if (props.index !== undefined) {
    const currentAnswer = surveyStore.currentResponse[props.index].answer as checkboxAnswer;
    currentAnswer.preference = refCourses.value;
  }
}

let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = (e: TouchEvent, rank: number) => {
  if (isTouchDevice) {
    const touch = e.touches[0];
    if (touch) {
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;

      const target = e.target as HTMLElement;
      dragElement = target;
      dragElement.setAttribute("data-rank", rank.toString());
    }
  }
};

const handleTouchMove = (e: TouchEvent) => {
  if (isTouchDevice && dragElement) {
    const touch = e.touches[0];
    const touchX = touch.clientX;
    const touchY = touch.clientY;

    const deltaX = touchX - touchStartX; //finds out much the dragelement will move according to touchevent
    const deltaY = touchY - touchStartY;
    dragElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`; //moves the dragelement according to the deltas
  }
};

const handleTouchEnd = (e: TouchEvent) => {
  // something's gone wrong
  if (!dragElement) {
    return;
  }
  dragElement.style.transform = "";
  const touch = e.changedTouches[0];

  //finds the targeted DOM the dragElement wants to take over via the x and y positioning of the touch event
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target) {
    //finds DOM matching the target
    const targetedCourse = target.closest(".course");
    //takes the current rank of the course and updates accordingly
    if (targetedCourse && dragElement) {
      const rank = parseInt(dragElement.getAttribute("data-rank") ?? ""); //element was at this position
      const dragIndex = parseInt(targetedCourse.getAttribute("course-rank") ?? ""); //element should take this position
      updateRank(rank, dragIndex);
    }
  }
  // dragElement = new HTMLElement;
};
</script>
