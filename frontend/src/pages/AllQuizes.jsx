import { Card } from "flowbite-react";
import { createTheme } from "flowbite-react";
import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";

function AllQuizes() {
  const [quizData, setQuizData] = useState([{}]);
  const navigate = useNavigate();
  const getQuizSummary = async () => {
    try {
      console.log("getting stuff");
      const response = await api.get("/api/quizsummary/");
      console.log(response);
      setQuizData(response.data);
    } catch {}
  };

  useEffect(() => {
    getQuizSummary();
  }, []);

  const cardTheme = createTheme({
    root: {
      base: "flex rounded-lg border border-gray-200 bg-white shadow-md",
      children: "flex h-full flex-col justify-center gap-4 p-6",
      horizontal: {
        off: "flex-col",
        on: "flex-col md:max-w-xl md:flex-row",
      },
    },
    img: {
      base: "",
      horizontal: {
        off: "rounded-t-lg",
        on: "h-96 w-full rounded-t-lg object-cover md:h-auto md:w-48 md:rounded-none md:rounded-l-lg",
      },
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quizes</h1>
          <p className="text-lg text-gray-600"></p>
        </header>
        {/* Quizzes*/}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {quizData.all &&
            quizData.all.map((quiz, index) => (
              <Card
                theme={cardTheme}
                clearTheme={{
                  root: {
                    base: true,
                  },
                }}
              >
                <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                  {quiz.title}
                </h5>
                <p className="text-m text-blue-900">{quiz.description}</p>
                <p className="text-sm text-blue-900">
                  {quiz.no_of_questions} Questions
                </p>
                <p className="text-sm text-blue-900">{quiz.course_name}</p>
                <Button
                  variant="outlined"
                  className="w-full mt-4"
                  onClick={() =>
                    navigate(
                      localStorage.getItem("type_of_user") === "student"
                        ? `/takeQuiz?quizId=${quiz.quiz_id}`
                        : `/quizInfo?quizId=${quiz.quiz_id}`,
                    )
                  }
                >
                  {localStorage.getItem("type_of_user") === "instructor"
                    ? "View Details"
                    : "Take Quiz"}
                </Button>
              </Card>
            ))}
        </div>
        {localStorage.getItem("type_of_user") === "student" ? (
          <>
            <header className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Submitted Quiz
              </h1>
              <p className="text-lg text-gray-600"></p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              {quizData.submitted &&
                quizData.submitted.map((quiz, index) => (
                  <Card
                    theme={cardTheme}
                    clearTheme={{
                      root: {
                        base: true,
                      },
                    }}
                  >
                    <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                      {quiz.title}
                    </h5>
                    <p className="text-m text-blue-900">{quiz.description}</p>
                    <p className="text-sm text-blue-900">
                      {quiz.no_of_questions} Questions
                    </p>
                    <p className="text-sm text-blue-900">{quiz.course_name}</p>
                    <Button
                      variant="outlined"
                      className="w-full mt-4"
                      onClick={() => navigate(`/result?quizId=${quiz.quiz_id}`)}
                    >
                      View Details
                    </Button>
                  </Card>
                ))}
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}

export default AllQuizes;
