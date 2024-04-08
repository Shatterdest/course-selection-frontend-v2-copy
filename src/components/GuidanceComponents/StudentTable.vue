<template>
  <div class="flex flex-col mt-6 justify-center items-center w-5/6" id="table">
    <table class="w-full border-2 border-black table-auto text-left">
      <thead class="fill-primary-g border-2 border-black">
        <tr class="bg-primary-g">
          <th class="p-4">Name</th>
          <th class="p-4">Grade</th>
          <th class="p-4">Email</th>
          <th class="p-4">Status</th>
          <th class="p-4">Details</th>
          <th class="p-4 flex flex-row items-center">
            <p class="p-2 font-bold">Flags</p>
            <div>
              <img
                src="../icons/InfoCircle.png"
                alt="hover for more information on student flags"
                class="h-5"
                @mouseover="tooltip = true"
                @mouseout="tooltip = false"
              />
              <div v-show="tooltip" class="absolute h-auto w-auto bg-white border-primary-g border p-2">
                <div v-for="flag in flags" class="flex flex-row">
                  <div class="m-1 rounded-full h-5 w-5" :class="`${flag.color}`"></div>
                  <p class="m-1">= {{ flag.title }}</p>
                </div>
              </div>
            </div>
          </th>
        </tr>
      </thead>

      <tbody v-for="student in newStudents" :key="student.email" class="border-2 border-black">
        <AddFlag
          v-if="showFlagModal === student.email"
          @exit="toggleFlagModal('')"
          :student="student"
          :viewAll="viewall"
          :flags="flags"
        >
        </AddFlag>
        <DeleteFlag
          v-if="showDeleteFlag === student.email"
          @exit="toggleDeleteFlag('')"
          :student="student"
          :viewAll="viewall"
          :flags="flags"
        >
        </DeleteFlag>
        <tr>
          <td class="p-4">
            {{ titleCaseName(student.name) }}
          </td>
          <td class="p-4" v-if="student.grade === 'FRESHMAN'">9</td>
          <td class="p-4" v-if="student.grade === 'SOPHOMORE'">10</td>
          <td class="p-4" v-if="student.grade === 'JUNIOR'">11</td>
          <td class="p-4" v-if="student.grade === 'SENIOR'">12</td>
          <td class="p-4" v-if="!student.grade.length">&nbsp;</td>
          <td class="p-4">
            {{ student.email ? student.email + "@nycstudents.net" : "&nbsp;" }}
          </td>
          <td class="p-4" v-if="student.status === 'NOT STARTED'">
            <p class="text-[#461616] bg-[#EA9F9F] w-[8rem] font-semibold text-center p-1 rounded-2xl">Not Started</p>
          </td>
          <td class="p-4" v-else-if="student.status === 'INCOMPLETE'">
            <p class="text-[#322911] bg-[#F9D477] w-[8rem] font-semibold text-center p-1 rounded-2xl">In Progress</p>
          </td>
          <td class="p-4" v-else-if="student.status === 'COMPLETE'">
            <p class="text-[#174616] bg-[#A8D480] w-[8rem] font-semibold text-center p-1 rounded-2xl">Completed</p>
          </td>
          <td class="p-4" v-else-if="student.status === 'FINALIZED'">
            <p class="text-[#311638] bg-[#D1A4DE] w-[8rem] font-semibold text-center p-1 rounded-2xl">Finalized</p>
          </td>
          <td @click="viewSurvey(student)" class="p-4 hover:cursor-pointer">View Survey</td>
          <td class="p-4 flex flex-row parent items-center">
            <div v-for="flag in flags" :key="flag.flag">
              <div>
                <div
                  id="flagbox"
                  v-show="student.flag.includes(flag.flag)"
                  :title="flag.title"
                  :class="`${flag.color}`"
                  class="m-1 rounded-full h-5 w-5"
                ></div>
              </div>
            </div>
            <PlusIcon @click="toggleFlagModal(student.email)" class="w-3 m-1 hidden child hover:cursor-pointer">
            </PlusIcon>
            <MinusSign @click="toggleDeleteFlag(student.email)" class="w-3 m-1 hidden child hover:cursor-pointer">
            </MinusSign>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, PropType, Prop } from "vue";
import { useRouter } from "vue-router";
import { studentGuidance } from "../../types/interface";
import { useSurveyStore } from "../../stores/survey";
import PlusIcon from "../icons/PlusIcon.vue";
import MinusSign from "../icons/MinusSign.vue";
import AddFlag from "../GuidanceComponents/AddFlag.vue";
import DeleteFlag from "../GuidanceComponents/DeleteFlag.vue";
import { useUserStore } from "../../stores/user";
import { watch } from "vue";

const userStore = useUserStore();

const props = defineProps({
  newStudents: Array as PropType<Array<studentGuidance>>,
  viewall: Boolean,
});

const surveyStore = useSurveyStore();
const router = useRouter();

let tooltip: Ref<boolean> = ref(false);
let showFlagModal: Ref<string> = ref("");
let showDeleteFlag: Ref<string> = ref("");

const flags = [
  {
    flag: "Transfer",
    title: "Transfer student",
    color: "bg-red-400",
  },
  {
    flag: "Regents",
    title: "Missing regents",
    color: "bg-green-400",
  },
  {
    flag: "Team",
    title: "Three season athlete",
    color: "bg-blue-400",
  },
  {
    flag: "ENL",
    title: "ENL",
    color: "bg-purple-400",
  },
];

const toggleFlagModal = (student: string) => {
  showFlagModal.value = student;
};

const toggleDeleteFlag = (student: string) => {
  showDeleteFlag.value = student;
};

function titleCaseName(name: string): string {
  return name
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

async function viewSurvey(student: studentGuidance) {
  try {
    await surveyStore.fetchSurvey(student.email);
    await router.push(`/guidance/survey/${student.email.replace("@nycstudents.net", "")}`);
  } catch (error) {
    console.error("Error fetching survey data:", error);
  }
}
</script>

<style scoped>
.parent:hover .child {
  display: block;
  transition: 0.3s;
}
</style>
