<template>
  <div class="w-[25vw] border border-gray-500 rounded-md">
    <div class="border-b border-gray-500">
      <h1 class="py-2 px-4 text-center font-extrabold text-2xl">
        Upcoming Meetings
      </h1>
    </div>
    <div class="p-4">
      <div class="overflow-y-auto max-h-100">
        <div v-for="(meetings, date) in groupedStudentMeetings" :key="date">
          <h2 class="font-bold text-lg">{{ date }}</h2>
          <ul class="my-2">
            <li v-for="(meeting, index) in meetings" :key="index" class="ml-6 mt-2 list-disc">
              {{ meeting.meetingTime }} - {{ meeting.name }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, computed, watch, onMounted } from "vue";
import { useUserStore } from "../../stores/user";
import { studentMeetings } from "../../types/interface";
const userStore = useUserStore();
const meetingsData: Ref<studentMeetings[]> = ref([]);
const todaysDate = new Date();

async function updateStudentMeetings() {
  //@ts-ignore
  meetingsData.value = userStore.guidanceMeetings.map((student: studentMeetings) => ({
    name: student.name,
    meetingDate: new Date(student.meetingDate),
    meetingTime: new Date(student.meetingDate).toTimeString().slice(0, 5),
    description: student.description,
    email: student.email,
    grade: student.grade,
  }))
  .sort((a, b) => a.meetingDate.getTime() - b.meetingDate.getTime());
}

const groupedStudentMeetings = computed(() => {
  const groupedMeetings: Record<string, studentMeetings[]> = {};
  meetingsData.value
    .filter((meeting) => meeting.meetingDate > todaysDate)
    .forEach((meeting) => {
      const formattedDate = (new Date(meeting.meetingDate)).toDateString();
      if (!groupedMeetings[formattedDate]) {
        groupedMeetings[formattedDate] = [];
      }
      groupedMeetings[formattedDate].push(meeting);
    });
  return groupedMeetings;
});

// update upcoming meetings on load
onMounted(() => {
  updateStudentMeetings();
});

// update upcoming meetings whenever a meeting is added
userStore.$subscribe(() => {
  updateStudentMeetings();
})
</script>