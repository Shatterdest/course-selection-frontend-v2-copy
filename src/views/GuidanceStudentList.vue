<template>
  <div class="h-auto w-full flex flex-col justify-center items-center mb-10">
    <div class="flex flex-row items-center justify-center w-5/6">
      <div class="w-1/3 flex flex-row justify-evenly">
        <div v-if="loading">Loading students...</div>
        <div @click="viewAll = !viewAll"
          class="h-10 px-4 w-60 mx-10 flex flex-row bg-primary-g text-black justify-evenly font-semibold items-center cursor-pointer shadow-[4px_3px_3px_rgba(0,0,0,0.25)]">
          <label class="cursor-pointer">View all students</label>
          <input class="ml-2" type="checkbox" v-model="viewAll" />
        </div>
        <Sort class="mr-0" @filter-selected="updateSortOption" />
      </div>
      <SearchBar class="w-2/3" type="text" v-model="input" placeholder="Search Students..." />
    </div>
    <StudentTable :viewall="viewAll" :new-students="sortedAndFilteredStudents.slice(x, y)" />
    <div class="max-w-[80%] overflow-x-auto mt-4 flex flex-row justify-between">
      <button v-if="currentChunk > 1" class="mx-2 bg-[#ebebeb] h-8 w-8 rounded-lg font-bold" @click="previousChunk">
        ❮❮
      </button>
      <button class="mx-2 bg-[#ebebeb] h-8 w-8 rounded-lg font-bold" @click="previousPage"
        :disabled="currentPage === 1">
        ❮
      </button>
      <button v-for="n in visiblePages" @click="updatePagination(n)" :class="{
          'bg-[#cdeeb4] focus:bg-[#cdeeb4]': currentPage === n,
          'bg-[#ebebeb]': currentPage !== n,
        }" class="h-8 w-8 rounded-lg hover:opacity-75 ease-in-out duration-300 font-bold mx-2">
        {{ n }}
      </button>
      <button class="mx-2 bg-[#ebebeb] h-8 w-8 rounded-lg font-bold" :disabled="currentPage === totalPages"
        @click="nextPage">
        ❯
      </button>
      <button v-if="currentChunk < totalChunks" class="mx-2 bg-[#ebebeb] h-8 w-8 rounded-lg font-bold"
        @click="nextChunk">
        ❯❯
      </button>
    </div>
    <h5 class="mt-4">
      Page
      <span class="font-bold m-1"> {{ currentPage }}</span>
      of
      <span class="font-bold m-1">{{ totalPages }}</span>
    </h5>
  </div>
</template>


<script setup lang="ts">
//@ts-nocheck
import SearchBar from "../components/GuidanceComponents/SearchBar.vue";
import Sort from "../components/GuidanceComponents/SortButton.vue";
import StudentTable from "../components/GuidanceComponents/StudentTable.vue";
import { useUserStore } from "../stores/user";
import { studentGuidance, studentPreview } from "../types/interface";
import { ref, Ref, computed, watch, onMounted } from "vue";

document.title = "Student List | SITHS Course Selection";

const userStore = useUserStore();
const allStudents: Ref<studentPreview[]> = ref([]);

const loading: Ref<boolean> = ref(false);
const viewAll: Ref<boolean> = ref(false);
const input: Ref<string> = ref("");
const sortBy: Ref<string> = ref("lastnameaz");

const x: Ref<number> = ref(0);
const y: Ref<number> = ref(10);

const currentPage: Ref<number> = ref(1);
const pageCapacity: number = 10;
const currentChunk: Ref<number> = ref(1);
const pagesPerChunk: number = 10;

onMounted(async () => {
  userStore.currentlyViewingStudents = await userStore.guidanceStudents;
});

async function fetchStudents() {
  const { access_token } = useUserStore();
  try {
    // GET request for all students
    loading.value = true;
    const profilesResponse = await fetch(
      `${import.meta.env.VITE_URL}/guidance/profiles`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
      }
    );
    loading.value = false;
    const data = await profilesResponse.json();
    allStudents.value = data;
  } catch (error) {
    console.error("Error:", error);
  }
}

const updateSortOption = (selected: string) => {
  sortBy.value = selected;
};

const sortedAndFilteredStudents = computed(() => {
  try {
    if (viewAll.value === false) {
      return applyFiltersAndSort(
        userStore.guidanceStudents,
        sortBy.value,
        input.value
      );
    } else {
      return applyFiltersAndSort(
        allStudents.value as studentGuidance[],
        sortBy.value,
        input.value
      );
    }
  } finally {
    updatePagination(1);
  }
});

function filterStudentsByCategory(students: studentGuidance[], sortBy: string) {
  let categorizedStudents: studentGuidance[] = students;
  switch (sortBy) {
    case "lastnameaz":
      categorizedStudents = categorizedStudents.sort(
        (a: studentGuidance, b: studentGuidance) => a.name.localeCompare(b.name)
      );
      break;
    case "lastnameza":
      categorizedStudents = categorizedStudents.sort(
        (a: studentGuidance, b: studentGuidance) => b.name.localeCompare(a.name)
      );
      break;
    case "ns":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.status === "NOT STARTED"
      );
      break;
    case "ip":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.status === "INCOMPLETE"
      );
      break;
    case "com":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.status === "COMPLETE"
      );
      break;
    case "final":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.status === "FINALIZED"
      );
      break;
    case "nine":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.grade === "FRESHMAN"
      );
      break;
    case "ten":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.grade === "SOPHOMORE"
      );
      break;
    case "eleven":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.grade === "JUNIOR"
      );
      break;
    case "transfer":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.flag === "Transfer"
      );
      break;
    case "regents":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.flag === "Regents"
      );
      break;
    case "sports":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.flag === "Team"
      );
      break;
    case "enl":
      categorizedStudents = categorizedStudents.filter(
        (student: studentGuidance) => student.flag === "ENL"
      );
      break;
  }
  return categorizedStudents;
}

function filterStudentBySearch(students: studentGuidance[], query: string) {
  if (query.length === 0) {
    return students;
  }
  const lowerCaseQuery = query.toLowerCase();
  return students.filter(
    (student: studentGuidance) =>
      student.name.toLowerCase().includes(lowerCaseQuery) ||
      student.email.toLowerCase().includes(lowerCaseQuery)
  );
}

function applyFiltersAndSort(
  students: studentGuidance[],
  sortBy: string,
  searchQuery: string
): studentGuidance[] {
  // filter by category -> filter by name or email -> return result
  const categorizedStudents = filterStudentsByCategory(students, sortBy);
  const searchedStudents = filterStudentBySearch(
    categorizedStudents,
    searchQuery
  );
  return searchedStudents;
}

watch(viewAll, async (newValue) => {
  handleViewAllChange(newValue);
});

async function handleViewAllChange(isEnabled: boolean) {
  input.value = "";
  /*sortBy.value = "lastnameaz";*/ //add this line back if default sorting is not working

  if (isEnabled) {
    await fetchStudents();
    userStore.currentlyViewingStudents = allStudents.value;
  } else {
    userStore.currentlyViewingStudents = userStore.guidanceStudents;
  }
  updatePagination(1);
}

const totalPages = computed(() => {
  const numStudents = sortedAndFilteredStudents.value.length;
  if (numStudents < 1) {
    return 1;
  } else {
    return Math.ceil(numStudents / pageCapacity);
  }
});

watch(
  [sortedAndFilteredStudents],
  // adjust pagination after students are filtered and categorized
  (currentValue, previousValue) => {
    const displayedStudents = sortedAndFilteredStudents.value;
    userStore.currentlyViewingStudents = displayedStudents;
    currentChunk.value = 1;
    updatePagination(1);
  },
  { deep: true }
);

function changePage(increment: number) {
  if (increment > 0) {
    currentPage.value += increment;
    x.value += pageCapacity;
    y.value += pageCapacity;
  } else if (increment < 0) {
    currentPage.value += increment;
    x.value -= pageCapacity;
    y.value -= pageCapacity;
  } else {
    console.error("Invalid increment; Unable to change pages.");
    return;
  }
  updatePagination(currentPage.value);
}

function nextPage() {
  changePage(1);
}

function previousPage() {
  changePage(-1);
}

function updatePagination(pageNumber: number) {
  const startIndex = pageNumber * pageCapacity - pageCapacity;
  const endIndex = pageNumber * pageCapacity;
  x.value = startIndex;
  y.value = endIndex;

  currentPage.value = pageNumber;
}

const totalChunks = computed(() => {
  return Math.ceil(totalPages.value / pagesPerChunk);
});

const visiblePages = computed(() => {
  const start = (currentChunk.value - 1) * (pagesPerChunk + 1);
  const end = Math.min(start + pagesPerChunk - 1, totalPages.value);
  const range = Array.from({ length: end - start + 1 });
  return range.map((_, i) => start + i);
});

function nextChunk() {
  if (currentChunk.value < totalChunks.value) {
    currentChunk.value += 1;
  }
}

function previousChunk() {
  if (currentChunk.value > 1) {
    currentChunk.value -= 1;
  }
}
</script>
