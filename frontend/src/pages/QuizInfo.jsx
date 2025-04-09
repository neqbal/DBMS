import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createTheme } from "flowbite-react";
import { Card } from "flowbite-react";
import { Badge } from "flowbite-react";
import EditIcon from "@mui/icons-material/Edit";
import api from "../api";

function QuizInfo() {
  const [searchParams] = useSearchParams();
  const quiz_id = searchParams.get("quizId");
  const [quizData, setQuizData] = useState({});
  const getQuizInfo = async () => {
    try {
      const response = await api.get("/api/quizInfo/", {
        params: {
          quiz_id,
        },
      });
      console.log(response.data);
      setQuizData(response.data);
    } catch {}
  };

  useEffect(() => {
    getQuizInfo();
  }, []);

  const cardTheme = createTheme({
    shadow: {
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
    },
    noShadow: {
      root: {
        base: "flex rounded-lg bg-white",
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
    },
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="max-w-7xl mx-auto">
        <Card
          theme={cardTheme.shadow}
          className="mb-6"
          clearTheme={{
            root: {
              base: true,
            },
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
              {quizData.title}
            </h5>
            <button
              onClick={() => {
                navigate();
              }}
            >
              <EditIcon></EditIcon>
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {quizData.description}
          </p>
          <p className="text-smtext-blue-900">Course {quizData.course_id}</p>
          <div className="space-y-4">
            <div className="space-y-2"></div>
          </div>
        </Card>

        <Card
          theme={cardTheme.shadow}
          className="mb-6"
          clearTheme={{
            root: {
              base: true,
            },
          }}
        >
          <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
            Questions
          </h5>
          <div className="space-y-4">
            {quizData.questions &&
              quizData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="bg-slate-50 p-4 rounded-md border"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">Question {index + 1}</h3>
                    <Badge color="success">
                      {question.answers.filter((a) => a.isCorrect).length}{" "}
                      correct answer
                      {question.answers.filter((a) => a.isCorrect).length !== 1
                        ? "s"
                        : ""}
                    </Badge>
                  </div>
                  <p className="mb-4">{question.text}</p>

                  <h4 className="text-sm font-medium mb-2">Answer Options:</h4>
                  <ul className="space-y-2">
                    {question.answers.map((answer) => (
                      <li
                        key={answer.id}
                        className={`p-2 rounded-md text-sm ${answer.isCorrect ? "bg-green-50 border border-green-200" : "bg-white border"}`}
                      >
                        <div className="flex items-start">
                          <div
                            className={`w-4 h-4 mr-2 rounded-full flex-shrink-0 mt-0.5 ${answer.isCorrect ? "bg-green-500" : "bg-gray-200"}`}
                          ></div>
                          <span>{answer.text}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default QuizInfo;
