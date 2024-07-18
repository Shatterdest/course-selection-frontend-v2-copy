<template>
  <div class="h-auto select-none flex items-center justify-center w-full">
    <div
      v-if="ref_courses.length > 0"
      class="flex flex-col mt-2 text-center text-base md:text-lg xl:text-xl"
      ref="courseBox"
    >
      <div
        v-for="course in ref_courses.sort((a, b) => {
          return a.rank - b.rank;
        })"
        :key="course.name"
      >
        <div
          v-if="course.name !== undefined"
          class="h-12 mx-2 mb-2.5 xl:h-16 w-full placeholder flex items-center justify-center p-2 rounded-lg shadow-lg text-[#37394F] cursor-grab active:cursor-grabbing font-semibold course"
          :class="`bg-[#${color}]`"
        >
          <div
            class="w-full h-full flex items-center justify-center"
            :class="`bg-[#${color}]`"
            draggable="true"
            @dragover.prevent="(e: DragEvent) => hoverBoxOver(e)"
            @dragstart="(e: DragEvent) => (dragElement = e.target as HTMLElement)"
            @drop.prevent="updateRank"
            @touchstart.prevent="(e: TouchEvent) => handleTouchStart(e, course.rank)"
            @touchmove.prevent="(e: TouchEvent) => handleTouchMove(e)"
            @touchend.prevent="(e: TouchEvent) => handleTouchEnd(e)"
          >
            {{ course.name }}
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

const isTouchDevice =
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

const ref_courses = ref(props.courses);

const hoverBoxOver = function (e: DragEvent) {
  const dragParent: HTMLElement | null = dragElement.parentElement;
  const target = e.target as HTMLElement;

  if (target && target.parentElement) {
    target.parentElement.appendChild(dragElement);
    dragParent?.appendChild(target);
  }
};

// look at the order of the DOM itself and steal the order from there
function updateRank() {
  if (!courseBox.value) return;
  const children = Array.from(courseBox.value.children);
  // differing amount of elements. this is not good
  if (children.length !== props.courses.length) {
    alert("womp womp");
    ref_courses.value = props.courses;
    return;
  }
  console.log(children.length, props.courses.length);
  const newRanking: Array<preferences> = [];
  // declare index separately because foreach's index will count duped elements
  let index = 0;
  children.forEach((el: Element) => {
    if (!(el instanceof HTMLElement)) return;
    // user is being a menace to society
    if (props.courses.findIndex((course) => course.name === el.innerText) === -1) {
      alert("womp womp");
      ref_courses.value = props.courses;
      return;
    }
    const newCourse = ref_courses.value[ref_courses.value.findIndex((course) => course.name === el.innerText)];
    newCourse.rank = index + 1;
    newRanking.push(newCourse);
    index++;
  });
  ref_courses.value = newRanking;

  if (props.index !== undefined) {
    const currentAnswer = surveyStore.currentResponse[props.index].answer as checkboxAnswer;
    currentAnswer.preference = ref_courses.value;
    console.log(currentAnswer.preference);
  }
  /*   const startObject = ref_courses.value.findIndex((x) => x.rank === +rank);

  if (+rank > +dragIndex) {
    ref_courses.value.forEach((x, index) => {
      if (x.rank >= +dragIndex) {
        ref_courses.value[index].rank = ref_courses.value[index].rank + 1;
      }
    });
    ref_courses.value[startObject].rank = +dragIndex;
  } else if (+rank < +dragIndex) {
    ref_courses.value.forEach((x, index) => {
      if (x.rank > +rank && x.rank <= +dragIndex) {
        ref_courses.value[index].rank = ref_courses.value[index].rank - 1;
      }
    });
    ref_courses.value[startObject].rank = +dragIndex;
  }

  ref_courses.value.sort((a, b) => a.rank - b.rank);

  if (props.index !== undefined) {
    const currentAnswer = surveyStore.currentResponse[props.index].answer as checkboxAnswer;
    currentAnswer.preference = ref_courses.value;
    console.log(currentAnswer.preference);
  } */
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
  dragElement.style.transform = "";
  const touch = e.changedTouches[0];

  //finds the targeted DOM the dragElement wants to take over via the x and y positioning of the touch event
  const target = document.elementFromPoint(touch.clientX, touch.clientY);
  if (target) {
    //finds DOM matching the target
    const targetedCourse = target.closest(".course");
    //takes the current rank of the course and updates accordingly
    if (targetedCourse && dragElement) {
      const dragIndex: string = targetedCourse.getAttribute("course-rank") ?? "";
      const rank = parseInt(dragElement.getAttribute("data-rank") ?? "");

      updateRank();
    }
  }
  // dragElement = new HTMLElement;
};
</script>
