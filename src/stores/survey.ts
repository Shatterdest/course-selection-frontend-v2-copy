//@ts-nocheck
import { defineStore } from "pinia";
import { useUserStore } from "./user";
import { surveyAnswer, surveyQuestion, surveyStore, surveyStringAnswer, studentSurveyData } from "../types/interface";

export const useSurveyStore = defineStore("survey", {
  state: (): surveyStore => ({
    currentAnsweredSurvey: { answers: "[{}]", email: "", grade: "FRESHMAN", status: "INCOMPLETE" },
    currentResponse: [{ id: "", question: "", answer: { courses: [], preference: [] } }],
    currentSurvey: {
      dueDate: "",
      grade: "FRESHMAN",
      question: [{ id: "", questionType: "OTHER", status: "STANDARD", question: "", classReferenced: null }],
    },
    loading: false,
    open: true,
    submit: false,
    missingAnswers: [],
    studentCourses: { coursesTaken: [], coursesAvailable: [] },
    name: "",
  }),
  getters: {
    //
  },
  actions: {
    async checkSurveyAnswers(answers: Array<surveyAnswer | surveyStringAnswer>) {
      answers.forEach((question: surveyQuestion) => {
        const isMissingOrNA = (response: surveyStringAnswer | surveyAnswer | undefined) => {
          let r: boolean = false;
          switch (question.questionType) {
            case "GENERAL":
              if (response.trim().length === 0) r = true;
              break;
            case "BOOLEAN":
              if (!response) r = true;
              break;
            case "DROPDOWN":
              if (response === null) r = true;
              break;
            case undefined:
              // final note to guidance counselor has no questionType nor status
              r = false;
              break;
            default:
              // for checkbox question type
              r = question.answer.courses.length === 0;
              break;
          }
          if (question.status === "OPTIONAL") r = false;
          return r;
        };
        if (isMissingOrNA(question.answer)) {
          if (!this.missingAnswers.includes(question.id)) {
            this.missingAnswers.push(question.id);
          }
        } else {
          const index = this.missingAnswers.indexOf(question.id);
          if (index !== -1) this.missingAnswers.splice(index, 1);
        }
      });
    },
    async fetchSurvey(email: string = "") {
      const userStore = useUserStore();
      const url = userStore.userType === "student" ? "/student/survey" : `/guidance/survey/${email}`;

      this.loading = true;
      const res = await fetch(import.meta.env.VITE_URL + url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userStore.access_token}`,
        },
      });
      const surveyData: studentSurveyData = await res.json();
      // console.log("Survey Data:", surveyData);
      this.currentSurvey = surveyData.survey;
      this.currentAnsweredSurvey = surveyData.answeredSurvey;

      this.studentCourses.coursesAvailable = surveyData.coursesAvailable;
      this.studentCourses.coursesTaken = surveyData.coursesTaken;

      this.name = surveyData.name;

      const surveyAnswers = surveyData.answeredSurvey.answers;
      if (surveyAnswers.length === 0) {
        // this.currentResponse = [];
        this.currentResponse = surveyData.survey.question;
      } else {
        // resolve type errors here
        const formattedResponses = JSON.parse(surveyData.answeredSurvey.answers);
        this.currentResponse = formattedResponses;
      }
      console.log("Fetched and set student survey data.");
      // console.log("Current Response:", this.currentResponse);
      // console.log("Answered Survey:", this.currentAnsweredSurvey);
      this.loading = false;
    },
    async postSurvey(status: "INCOMPLETE" | "COMPLETE" | "FINALIZED") {
      const userStore = useUserStore();
      const url =
        userStore.userType === "student" ? "/student/survey/" : `/guidance/survey/${this.currentAnsweredSurvey.email}`;
      try {
        await fetch(import.meta.env.VITE_URL + url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userStore.access_token}`,
          },
          body: JSON.stringify({
            grade: this.currentSurvey.grade,
            status: status,
            answers: JSON.stringify(this.currentResponse),
          }),
        });
      } catch (error) {
        console.error("Error posting survey:", error);
      }
    },
    async saveSurvey() {
      this.currentAnsweredSurvey.answers = JSON.stringify(this.currentResponse);
      const userStore = useUserStore();
      this.loading = true;
      await this.checkSurveyAnswers(this.currentResponse);
      // if (this.missingAnswers.length !== 0) return;
      if (userStore.userType === "student") {
        if (this.missingAnswers.length === 0) {
          await this.postSurvey("COMPLETE");
          userStore.studentSurveyPreview.status = "COMPLETE";
        } else {
          await this.postSurvey("INCOMPLETE");
          userStore.studentSurveyPreview.status = "INCOMPLETE";
        }
      } else if (userStore.userType === "guidance") {
        await this.postSurvey("FINALIZED");
        userStore.studentSurveyPreview.status = "FINALIZED";
      }
      this.loading = false;
    },
  },
  persist: {
    //presist surveyStore is userStore access token is valid/present
    //see if theres any way to check for the expiration of the token
    storage: sessionStorage,
  },
});
