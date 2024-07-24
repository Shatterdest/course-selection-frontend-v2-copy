<template>
  <div class="flex flex-col">
    <div id="printPage" class="flex w-[40vw] m-4 p-2 border border-gray-500 rounded-md">
      <div class="p-4">
        <div class="overflow-y-auto max-h-100">
          <ul class="my-4">
            <p v-if="studentName">Dear {{ studentName }},</p>
            <br />
            <p v-if="meetingTime && meetingDate">
              Your guidance counselor has scheduled a meeting with you for
              {{ meetingTime }} on {{ meetingDate }}. Please meet with them during the specified time.
            </p>
            <br />
            <p v-if="meetingDescription">
              Your guidance counselor has made the following notes:
              <br />
              {{ meetingDescription }}
            </p>
          </ul>
        </div>
      </div>
    </div>
    <div class="item submit ml-4 mb-6 xl:text-2xl transition duration-300 hover:opacity-50 cursor-pointer w-fit">
      <button class="flex flex-row items-center font-bold text-[1.2rem] bg-[#e5e7be] px-4 py-2 rounded-lg w-fit h-fit"
        type="submit" @click="printMeetingTicket">
        <PrinterIcon class="mr-3" /> Print
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useUserStore } from "../../stores/user";
import PrinterIcon from "../icons/PrinterIcon.vue";
import { useRoute } from "vue-router";
import { studentMeetings } from "../../types/interface";

const route = useRoute();
let email = `${route.params.email}@nycstudents.net`;

const studentIndex = ref(-1);
const studentName = ref("");
const meetingTime = ref("");
const meetingDate = ref("");
const meetingDescription = ref("");

//get students and their meeting info
async function fetchStudentInfo() {
  const { access_token } = useUserStore();
  try {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${access_token}`,
    };
    //GET request for meetings
    const meetingsResponse = await fetch(`${import.meta.env.VITE_URL}/guidance/meetings`, {
      method: "GET",
      headers: headers,
    });
    const meetingsData = (await meetingsResponse.json()).map((student: studentMeetings) => ({
      name: student.name
        .split(",")
        .map((chunk) =>
          chunk
            .split(" ")
            .map((part) => part.trim().toLowerCase())
            .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ")
        )
        .reverse()
        .join(" ")
        .replace(",", "")
        .trim(),
      meetingDate: student.meetingDate,
      description: student.description,
      grade: student.grade,
      email: student.email,
    }));

    //find the index of the student with the specified email
    const index = meetingsData.findIndex((student: studentMeetings) => student.email === email);
    studentIndex.value = index;
    if (index > -1) {
      studentName.value = meetingsData[index].name;
      const DateAndTime = meetingsData[index].meetingDate;
      meetingTime.value = (new Date(DateAndTime).toTimeString()).slice(0, 5);
      meetingDate.value = (new Date(DateAndTime).toDateString());
      meetingDescription.value = meetingsData[index].description;
    }
    return meetingsData;
  } catch (error) {
    console.log("Error:", error);
  }
}

onMounted(async () => {
  const meetingsData = await fetchStudentInfo();
  if (studentIndex.value < 0) {
    console.log("Student not found");
  }
});

const printMeetingTicket = () => {
  const printElement = document.getElementById("printPage");
  if (!printElement) {
    console.error("Elemented with ID printPage not found.");
    return;
  }
  const partPrint = printElement.innerHTML;

  const printPage = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Scheduled Meeting with Guidance Counselor</title>
      </head>
      <body>
        <div>${partPrint}</div>
      </body>
    </html>
  `;

  const newWindow = window.open("", "", "width=800,height=900");
  if (!newWindow) {
    console.error("Failed to open new window. Popup blocker might be enabled.");
    return;
  }
  newWindow.document.write(printPage);
  newWindow.print();
  newWindow.close();
};
</script>

<style scoped>
button:hover {
  opacity: 0.5;
}

svg {
  width: 1.2rem;
  margin-right: 10px;
  fill: #37394f;
}
</style>
