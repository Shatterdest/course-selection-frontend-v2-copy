import { defineStore } from "pinia";
import { useSurveyStore } from "./survey";
import { useRouter } from "vue-router";
import axios from "axios";
import {
  user,
  account_type,
  userData,
  guidanceData,
  studentGuidance,
  studentMeetings,
  studentPreview,
  studentSurveyPreview,
} from "../types/interface";
import { ref } from "vue";
import router from "../router";

export const useUserStore = defineStore("user", {
  state: () => ({
    first_name: "",
    last_name: "",
    email: "",
    userType: null as account_type | null,
    isLoggedIn: false,
    access_token: "",
    refresh_token: "",
    loading: false,
    expire_time: 0,
    studentSurveyPreview: {} as studentPreview,
    currentlyViewingStudents: [] as studentPreview[],
    guidanceStudents: [] as studentGuidance[],
    guidanceMeetings: [] as studentMeetings[],
  }),
  actions: {
    async init(type: account_type) {
      this.userType = type;
      if (type === "guidance") {
        try {
          fetch(`${import.meta.env.VITE_URL}/guidance/profiles/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${this.access_token}`,
            },
          })
            .then(async (data) => {
              const guidanceProfiles = await data.json();
              this.studentSurveyPreview = guidanceProfiles;
              this.guidanceStudents = await guidanceProfiles.filter(
                (student: studentGuidance) => student.ownStudent
              );
              this.loading = true;
            })
            .then(() => {
              this.loading = false;
            })
            .catch((error) => {
              throw new Error("Error fetching profiles:", error.message);
            });
          fetch(`${import.meta.env.VITE_URL}/guidance/meetings/`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${this.access_token}`,
            },
          })
            .then(async (data) => {
              const meetingsData = (await data.json()).map(
                (student: studentMeetings) => ({
                  name: student.name
                    .split(",")
                    .map((chunk) =>
                      chunk
                        .split(" ")
                        .map((part) => part.trim().toLowerCase())
                        .map(
                          (part) => part.charAt(0).toUpperCase() + part.slice(1)
                        )
                        .join(" ")
                    )
                    .join(","),
                  meetingDate: student.meetingDate,
                  description: student.description,
                  grade: student.grade,
                  email: student.email,
                })
              );
              this.guidanceMeetings = meetingsData;
            })
            .catch((error) => {
              throw new Error("Error fetching meetings:", error.message);
            });
        } catch (error) {
          console.error("Error in init:", error);
        }
      } else {
        const surveyStore = useSurveyStore();
        await surveyStore.fetchSurvey();

        await fetch(`${import.meta.env.VITE_URL}/student/surveyPreview/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.access_token}`,
          },
        })
          .then((res) => res.json())
          .then(async (data) => {
            const surveyStore = useSurveyStore();

            if (
              data.dueDate < new Date().toISOString() ||
              data.status === "FINALIZED"
            ) {
              surveyStore.open = false;
            }
            this.studentSurveyPreview = data;
            surveyStore.currentAnsweredSurvey.status = data.status;
          })
          .catch((error) => {
            console.error("Error fetching surveyPreview:", error);
          });

        this.loading = false;
      }
    },
    async GoogleLogin(res: any) {
      this.loading = true;
      fetch(`${import.meta.env.VITE_URL}/social-login/google/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          access_token: res.access_token,
        }),
      })
        .then((res) => res.json())
        .then(async (data) => {
          this.access_token = data.access_token;
          this.refresh_token = data.refresh_token;
          this.email = data.user.email;
          this.first_name = data.user.first_name;
          this.last_name = data.user.last_name;
          this.isLoggedIn = true;

          const date = new Date();
          const expiration = date.setHours(date.getHours() + 1);

          this.expire_time = expiration;

          this.getUserType(); //make dj rest auth return user type (backend) to remove this function
        })
        .catch((error) => {
          console.error("Error fetching GoogleLogin:", error);
        });
    },
    async EmailLogin(username: string, password: string) {
      try {
        fetch(`${import.meta.env.VITE_URL}/auth/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: username.toLowerCase(),
            password: password,
          }),
        })
          .then((res) => res.json())
          .then(async (data) => {
            const surveyStore = useSurveyStore();
            this.access_token = data.access_token;
            this.refresh_token = data.refresh_token;
            this.email = data.user.email;
            this.first_name = data.user.first_name;
            this.last_name = data.user.last_name;
            this.isLoggedIn = true;

            const date = new Date();
            const expiration = date.setHours(date.getHours() + 1);

            this.expire_time = expiration;
            this.loading = true;
            await this.getUserType();
            await this.init(this.userType);

            this.savePersistentSession();
          })
          .catch((error) => {
            alert("Login failed. Please check your credentials.");
            throw new Error("Error fetching login:", error.message);
          });
      } catch (error) {
        console.error(error);
        this.loading = false;
        alert("Login failed. Please check your credentials.");
      }
    },
    async changeMeeting(
      email: string,
      meetingISO: string,
      description: string,
      notify: boolean
    ) {
      try {
        await fetch(`${import.meta.env.VITE_URL}/guidance/updateMeeting/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.access_token}`,
          },
          body: JSON.stringify({
            email: email,
            description: description,
            notify: notify,
            date: meetingISO,
          }),
        });
        const meetingExists = this.guidanceMeetings.some(
          (meeting) => meeting.email === email
        );
        if (!meetingExists) {
          const student = this.guidanceStudents.find(
            (student: studentGuidance) => student.email === email.split("@")[0]
          );
          if (student !== undefined) {
            const meetingData: studentMeetings = {
              name: student.name
                .replace(",", ", ")
                .split(" ")
                .map((part) => part.trim().toLowerCase())
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join(" "),
              meetingDate: new Date(meetingISO),
              description: description,
              email: email,
              grade: student.grade,
            };
            this.guidanceMeetings.push(meetingData);
          }
        }
      } catch (error) {
        console.error("Error fetching updateMeeting:", error);
      }
    },
    async deleteMeeting(email: string) {
      fetch(`${import.meta.env.VITE_URL}/guidance/updateMeeting/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${this.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      })
        .then(() => {
          const updatedMeetings = this.guidanceMeetings.filter(
            (meeting) => meeting.email !== email
          );
          this.guidanceMeetings = updatedMeetings;
        })
        .catch((error) => {
          console.error("Error fetching updateMeeting:", error);
        });
    },
    async addFlag(email: string, newFlag: string, viewAll: boolean) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_URL}/guidance/updateFlag/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${this.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              flag: newFlag,
            }),
          }
        );
        const data = await res.json();
        if (this.currentlyViewingStudents === null) return;
        const studentIndex = this.currentlyViewingStudents.findIndex(
          (student: studentPreview) =>
            student.email + "@nycstudents.net" === email
        );
        const previewIndex = this.guidanceStudents.findIndex(
          (student: studentGuidance) =>
            student.email + "@nycstudents.net" === email
        );

        if (viewAll === true) {
          //if viewAll students is on
          if (studentIndex !== -1 && previewIndex === -1) {
            //if the guidance counseler is adding flag to a student that is not their's
            this.currentlyViewingStudents[studentIndex].flag = data.flag;
          } else {
            //or else if the guidance counseler has the student
            this.currentlyViewingStudents[studentIndex].flag = data.flag;
            this.guidanceStudents[previewIndex].flag = data.flag;
          }
        } else {
          //else if viewAll is not on
          if (studentIndex !== -1 && previewIndex !== -1) {
            this.currentlyViewingStudents[studentIndex].flag = data.flag;
            this.guidanceStudents[previewIndex].flag = data.flag;
          }
        }
      } catch (error) {
        console.error("Error fetching updateFlag:", error);
      }
    },
    async deleteFlag(email: string, flagToBeRemoved: string, viewAll: boolean) {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_URL}/guidance/updateFlag/`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${this.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: email,
              flag: flagToBeRemoved,
            }),
          }
        );
        const data = await res.json();
        if (this.currentlyViewingStudents === null) return;
        const studentIndex = this.currentlyViewingStudents.findIndex(
          (student: studentPreview) =>
            student.email + "@nycstudents.net" === email
        );
        const previewIndex = this.guidanceStudents.findIndex(
          (student: studentGuidance) =>
            student.email + "@nycstudents.net" === email
        );

        if (viewAll === true) {
          //if viewAll students is on
          if (studentIndex !== -1 && previewIndex === -1) {
            //if the guidance counseler is deleting flag of a student that is not their's
            this.currentlyViewingStudents[studentIndex].flag = data.flag;
          } else {
            //or else if the guidance counseler has the student
            this.currentlyViewingStudents[studentIndex].flag = data.flag;
            this.guidanceStudents[previewIndex].flag = data.flag;
          }
        } else {
          //else if viewAll is not on
          if (studentIndex !== -1 && previewIndex !== -1) {
            this.currentlyViewingStudents[studentIndex].flag = data.flag;
            this.guidanceStudents[previewIndex].flag = data.flag;
          }
        }
      } catch (error) {
        console.error("Error fetching updateFlag:", error);
      }
    },
    async getUserType() {
      try {
        const res = await fetch(`${import.meta.env.VITE_URL}/user/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${this.access_token}`,
          },
        });
        const data = await res.json();
        if (data.is_guidance) {
          this.userType = "guidance";
        } else {
          this.userType = "student";
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    },
    savePersistentSession() {
      const persistentData = JSON.stringify({
        email: this.email,
        first_name: this.first_name,
        last_name: this.last_name,
        account_type: this.userType,
        access_token: this.access_token,
        refresh_token: this.refresh_token,
        expire_time: this.expire_time,
      });

      localStorage.setItem("session", persistentData);
    },
  },
  persist: {
    storage: sessionStorage,
  },
});
