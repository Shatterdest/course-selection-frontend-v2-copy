<template>
  <div class="h-auto select-none flex items-center justify-center w-full">
    <div
      v-if="refCourses.length > 0 && !refCourses.map((course) => course.name).includes('Not Interested')"
      class="flex flex-col mt-2 text-center text-base md:text-lg xl:text-xl"
      ref="courseBox"
    >
      <div v-for="(course, index) in refCourses" :key="course.name + course.rank">
        <div
          v-if="course.name !== undefined"
          class="h-12 mx-2 mb-2.5 xl:h-16 w-full placeholder flex items-center justify-center p-2 rounded-lg shadow-lg text-[#37394F] cursor-grab active:cursor-grabbing font-semibold course"
          :class="`bg-[#${color}]`"
          :course-rank="localCourses[course.name]"
        >
          <div
            class="w-full h-full flex items-center justify-center"
            :class="`bg-[#${color}]`"
            draggable="true"
            @dragstart="(e: DragEvent) => (dragElement = e.target as HTMLElement)"
            @dragover.prevent="(e: DragEvent) => hoverBoxOver(e)"
            @dragend.prevent="(e: MouseEvent | DragEvent) => hoverBox(e, localCourses[course.name])"
            @touchstart.prevent="(e: TouchEvent) => handleTouchStart(e, localCourses[course.name])"
            @touchmove.prevent="(e: TouchEvent) => handleTouchMove(e)"
            @touchend.prevent="(e: TouchEvent) => handleTouchEnd(e)"
          >
            {{ index + 1 }}. {{ course.name }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, type Ref, PropType, onMounted } from "vue";
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
  final: Boolean,
});

const emit = defineEmits(["save"]);

onMounted(() => {
  emit("save");
  if (!props.final) save();
});

const courseBox: Ref<HTMLDivElement | undefined> = ref();
const surveyStore = useSurveyStore();
let dragElement: HTMLElement;

const refCourses = ref(
  props.courses.sort((a, b) => {
    return a.rank - b.rank;
  })
);

// store local rankings
const localCourses: { [key: string]: number } = {};
refCourses.value.forEach((course, index) => {
  localCourses[course.name] = index;
});

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
  // dragIndex: element should take this position (LOCAL)
  // rank: element was at this position (LOCAL)
  // if (rank === dragIndex) return;
  const dir = rank > dragIndex; // true=up, false=down
  const course = refCourses.value.splice(rank, 1)[0];

  localCourses[course.name] = dragIndex;

  refCourses.value.forEach((course) => {
    const localRank = localCourses[course.name];
    if (dir) {
      // console.log("it's going up now");
      if (localRank < rank && localRank >= dragIndex) {
        localCourses[course.name]++;
        // console.log(course.name, "is moving down with a localrank of", localRank);
      }
    } else {
      // console.log("it's going down now");
      if (localRank > rank && localRank <= dragIndex) {
        localCourses[course.name]--;
        // console.log(course.name, "is moving up with a localrank of", localRank);
      }
    }
  });
  // console.log(localCourses);

  refCourses.value.splice(dragIndex - 1, 0, course);

  const ranks = refCourses.value
    .map((course) => course.rank)
    .sort((a, b) => {
      return a - b;
    });
  // console.log(ranks);
  refCourses.value
    .toSorted((a, b) => {
      return localCourses[a.name] - localCourses[b.name];
    })
    .forEach((course, index) => {
      course.rank = ranks[index];
    });

  refCourses.value.sort((a, b) => {
    return a.rank - b.rank;
  });

  save();
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
      const rank = parseInt(dragElement.getAttribute("data-rank") ?? "");
      const dragIndex = parseInt(targetedCourse.getAttribute("course-rank") ?? "");
      updateRank(rank, dragIndex);
    }
  }
  // dragElement = new HTMLElement;
};

function save() {
  if (props.index === undefined) return;
  if (!props.courses.length) return;

  const currentAnswer = surveyStore.currentResponse[props.index].answer as checkboxAnswer;

  // console.log("saving...");
  const ranks = props.courses
    .map((course) => course.rank)
    .sort((a, b) => {
      return a - b;
    });
  // console.log(ranks);
  // console.log(localCourses);
  currentAnswer.preference = refCourses.value.map((course, index) => {
    course.rank = ranks[localCourses[course.name]];
    // course.rank = index + 1;
    return course;
  });

  emit("save");
  // console.log(JSON.stringify(surveyStore.currentResponse[props.index].answer));
}
</script>
