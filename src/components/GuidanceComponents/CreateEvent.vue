<template>
  <div
    v-if="show"
    class="absolute left-[20%] right-[20%] top-[30%] bg-white flex flex-row m-auto mt-5 w-fit h-fit rounded-[1rem] border border-black"
  >
    <div class="event flex flex-col">
      <div class="top flex-row flex items-center justify-between">
        <h2 class="h2 font-bold text-[2rem] m-8 mb-4">Schedule Meeting</h2>
        <button class="mt-5 mr-12" @click="toggleEvent">
          <svg
            class="x fill-current text-37394f transition duration-300 mt-4 hover:opacity-80 cursor-pointer"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512"
          >
            <path
              d="M310.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L160 210.7 54.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L114.7 256 9.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 301.3 265.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L205.3 256 310.6 150.6z"
            />
          </svg>
        </button>
      </div>
      <form id="form" ref="form" @submit.prevent="empty()">
        <div class="times flex flex-col lg:flex-row">
          <div class="item mb-6">
            <label class="formt flex flex-row text-[#717494] ml-8 xl:text-2xl font-bold" for="date">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                <path
                  d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64H344V24c0-13.3-10.7-24-24-24s-24 10.7-24 24V64H152V24zM48 192H400V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z"
                />
              </svg>
              Date</label
            >
            <input
              class="space d rounded-md border border-solid border-zinc-400 h-10 p-2 ml-6 mt-1 w-80"
              type="text"
              v-model="date"
              ref="dateElement"
              onfocus="(this.type='date')"
              id="date"
            />
            <p v-if="dateError" class="error text-red-600 ml-6 mt-1">Field empty/invalid</p>
          </div>
          <div class="item mb-6">
            <label class="formt flex flex-row text-[#717494] ml-8 xl:text-2xl font-bold" for="time">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
                <path
                  d="M464 256A208 208 0 1 1 48 256a208 208 0 1 1 416 0zM0 256a256 256 0 1 0 512 0A256 256 0 1 0 0 256zM232 120V256c0 8 4 15.5 10.7 20l96 64c11 7.4 25.9 4.4 33.3-6.7s4.4-25.9-6.7-33.3L280 243.2V120c0-13.3-10.7-24-24-24s-24 10.7-24 24z"
                />
              </svg>
              Time</label
            >
            <input
              class="space d mr-8 rounded-md border border-solid border-zinc-400 w-80 h-10 p-2 ml-6 mt-1"
              type="time"
              v-model="time"
              placeholder="Time"
            />
            <p v-if="timeError" class="error text-red-600 ml-6 mt-1">Field empty/invalid</p>
          </div>
        </div>
        <div class="item mb-6">
          <label class="formt flex flex-row text-[#717494] ml-8 xl:text-2xl font-bold" for="emails">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
              <!--! Font Awesome Pro 6.3.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path
                d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"
              />
            </svg>
            Student
          </label>
          <datalist id="suggestions">
            <option v-for="student in studentList" :key="student.email">
              {{ titleCaseName(student.name) }}, | {{ student.email }}@nycstudents.net
            </option>
          </datalist>
          <input
            class="space rounded-md border border-solid border-zinc-400 h-10 p-2 ml-6 mt-1 w-80"
            placeholder="Select Student From List"
            autoComplete="on"
            list="suggestions"
            v-model="selectedStudent"
            id="student"
          />
          <p v-if="nameError" class="error text-red-600 ml-6 mt-1">Field empty/invalid</p>
        </div>
        <div class="item mb-6">
          <label class="formt flex flex-row text-[#717494] ml-8 xl:text-2xl font-bold" for="description"
            ><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
              <!--! Font Awesome Pro 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
              <path
                d="M471.6 21.7c-21.9-21.9-57.3-21.9-79.2 0L362.3 51.7l97.9 97.9 30.1-30.1c21.9-21.9 21.9-57.3 0-79.2L471.6 21.7zm-299.2 220c-6.1 6.1-10.8 13.6-13.5 21.9l-29.6 88.8c-2.9 8.6-.6 18.1 5.8 24.6s15.9 8.7 24.6 5.8l88.8-29.6c8.2-2.7 15.7-7.4 21.9-13.5L437.7 172.3 339.7 74.3 172.4 241.7zM96 64C43 64 0 107 0 160V416c0 53 43 96 96 96H352c53 0 96-43 96-96V320c0-17.7-14.3-32-32-32s-32 14.3-32 32v96c0 17.7-14.3 32-32 32H96c-17.7 0-32-14.3-32-32V160c0-17.7 14.3-32 32-32h96c17.7 0 32-14.3 32-32s-14.3-32-32-32H96z"
              />
            </svg>
            Memo
          </label>
          <input
            class="space rounded-md border border-solid border-zinc-4a00 w-80 h-10 p-2 ml-6 mt-1"
            type="text"
            v-model="description"
            placeholder="Memo"
          />
        </div>
        <div class="flex flex-row items-center ml-6 mb-6">
          <input type="checkbox" class="ml-2" id="notify" selectedStudent="notify" v-model="notify" />
          <label class="ml-2" for="notify">Notify Student via Email</label>
        </div>
        <div class="item submit ml-6 mb-6 xl:text-2xl transition duration-300 hover:opacity-50 cursor-pointer w-fit">
          <button
            type="submit"
            class="text-[1.5rem] mb-8 duration-300 font-bold bg-primary-g px-4 py-2 rounded-xl w-fit h-fit opacity-0.5:hover"
            id="save"
            ref="save"
          >
            Save
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, defineProps, onMounted } from "vue";
import { useUserStore } from "../../stores/user";
import { studentGuidance } from "../../types/interface";

const userStore = useUserStore();

const date: Ref<string> = ref("");
const time: Ref<string> = ref("");
const description: Ref<string> = ref("");
const selectedStudent: Ref<string> = ref("");

let email: string;

const save = ref();
const form = ref();

const studentList: Ref<studentGuidance[]> = ref([]);
const dateError: Ref<boolean> = ref(false);
const timeError: Ref<boolean> = ref(false);
const nameError: Ref<boolean> = ref(false);
const notify: Ref<boolean> = ref(false);
const show: Ref<boolean> = ref(true);

onMounted(() => {
  studentList.value = userStore.guidanceStudents;
});



//toggle modal
function toggleEvent() {
  show.value = !show.value;
}

const dateElement = ref();

const props = defineProps({
  todaysDate: String,
});
onMounted(() => {
  date.value = props.todaysDate!;
  dateElement.value.type = "date";
  dateElement.value.value = props.todaysDate!;
});

//check for empty input values before submitting form
function empty() {
  //if the input value is an empty string, the error is true; otherwise it is false
  dateError.value = !date.value;
  timeError.value = !time.value;
  nameError.value = !selectedStudent.value;

  if (!dateError.value && !timeError.value && !nameError.value) {
    // convert meeting date to an ISO string
    const meetingDateTime: Date = new Date(date.value + "T" + time.value);
    const meetingISO: string = meetingDateTime.toISOString();

    // locate student
    for (const student of studentList.value) {
      const studentEmail = student.email;
      if (selectedStudent.value.includes(`${studentEmail}@nycstudents.net`)) {
        email = `${student.email}@nycstudents.net`;
      }
    }

    save.value.innerHTML = "Saved";
    userStore.changeMeeting(email, meetingISO, description.value, notify.value);
    form.value.reset();
    show.value = !show.value;

    // clear form input values
    selectedStudent.value = "";
    email = "";
    date.value = "";
    time.value = "";
  }
}

function titleCaseName(selectedStudent: string): string {
  return selectedStudent
    .split(",")
    .map((chunk) =>
      chunk
        .split(" ")
        .map((part) => part.trim().toLowerCase())
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ")
    )
    .join(", ");
}
</script>

<style scoped>
svg {
  width: 1.2rem;
  margin-right: 10px;
  fill: #717494;
}

input:invalid {
  border-color: red;
}
</style>
