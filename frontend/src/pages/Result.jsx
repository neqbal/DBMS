import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { EyeOff, Eye } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import {
  Card,
  TableHeadCell,
  TableCell,
  Table,
  TableRow,
  TableHead,
  TableBody,
} from "flowbite-react";
import { BarChart4 } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { XCircle } from "lucide-react";
import Badge from "@mui/material/Badge";
import { createTheme } from "flowbite-react";

import api from "../api";

function Result() {
  const [searchParams] = useSearchParams();
  const [results, setResult] = useState({
    quiz: {},
    userAnswers: {},
    score: {},
  });
  const quiz_id = searchParams.get("quizId");
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(false);
  const getResult = async () => {
    try {
      const response = await api.get("/api/result/", {
        params: {
          quiz_id,
        },
      });

      const temp = response.data;

      let correctCount = 0;
      const quiz = temp.quiz;
      const answers = temp.answers;
      quiz.questions.forEach((question, index) => {
        const userAnswer = answers[index];
        const correctAnswerIds = question.answers
          .filter((a) => a.isCorrect)
          .map((a) => a.id);

        // For multi-select questions, all correct options must be selected and no incorrect ones
        const isCorrect =
          userAnswer.selectedAnswerIds.length === correctAnswerIds.length &&
          userAnswer.selectedAnswerIds.every((id) =>
            correctAnswerIds.includes(id),
          );

        if (isCorrect) correctCount++;
      });

      const wrongCount = quiz.questions.length - correctCount;
      const percentage = Math.round(
        (correctCount / quiz.questions.length) * 100,
      );

      console.log({
        quiz: quiz,
        userAnswers: answers,
        score: {
          correctCount,
          wrongCount,
          percentage,
        },
      });
      setResult({
        quiz: quiz,
        userAnswers: answers,
        score: {
          correctCount,
          wrongCount,
          percentage,
        },
      });
    } catch {}
  };

  useEffect(() => {
    getResult();
  }, []);

  const getQuestionResult = (questionId) => {
    if (!results) return { isCorrect: false, correctAnswerIds: [] };

    const question = results.quiz.questions.find((q) => q.id === questionId);
    const userAnswer = results.userAnswers.find(
      (a) => a.questionId === questionId,
    );

    if (!question || !userAnswer)
      return { isCorrect: false, correctAnswerIds: [] };

    const correctAnswerIds = question.answers
      .filter((a) => a.isCorrect)
      .map((a) => a.id);

    const isCorrect =
      userAnswer.selectedAnswerIds.length === correctAnswerIds.length &&
      userAnswer.selectedAnswerIds.every((id) => correctAnswerIds.includes(id));

    return { isCorrect, correctAnswerIds };
  };

  const getAnswerText = (questionId, answerId) => {
    if (!results) return "";

    const question = results.quiz.questions.find((q) => q.id === questionId);
    if (!question) return "";

    const answer = question.answers.find((a) => a.id === answerId);
    return answer ? answer.text : "";
  };

  const getSelectedAnswerTexts = (questionId) => {
    if (!results) return [];

    const userAnswer = results.userAnswers.find(
      (a) => a.questionId === questionId,
    );
    if (!userAnswer || userAnswer.selectedAnswerIds.length === 0)
      return ["No answer provided"];

    return userAnswer.selectedAnswerIds.map((id) =>
      getAnswerText(questionId, id),
    );
  };

  const getCorrectAnswerTexts = (questionId) => {
    if (!results) return [];

    const question = results.quiz.questions.find((q) => q.id === questionId);
    if (!question) return [];

    return question.answers.filter((a) => a.isCorrect).map((a) => a.text);
  };

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

  const tableTheme = createTheme({
    root: {
      base: "w-full text-left text-sm text-gray-500",
      shadow:
        "absolute left-0 top-0 -z-10 h-full w-full rounded-lg bg-white drop-shadow-md",
      wrapper: "relative",
    },
    body: {
      base: "group/body",
      cell: {
        base: "px-6 py-4 group-first/body:group-first/row:first:rounded-tl-lg group-first/body:group-first/row:last:rounded-tr-lg group-last/body:group-last/row:first:rounded-bl-lg group-last/body:group-last/row:last:rounded-br-lg",
      },
    },
    head: {
      base: "group/head text-xs uppercase text-gray-700",
      cell: {
        base: "bg-white px-6 py-3 group-first/head:first:rounded-tl-lg group-first/head:last:rounded-tr-lg",
      },
    },
    row: {
      base: "group/row",
      hovered: "hover:bg-gray-50",
      striped: "odd:bg-white even:bg-black",
    },
  });

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center">
            <Button
              variant="text"
              onClick={() => navigate(`/quizzes`)}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-edu-dark">
              {results.quiz.title} - Results
            </h1>
          </div>
          <Button
            variant="outlined"
            onClick={() => setShowCorrectAnswers(!showCorrectAnswers)}
            className="flex items-center gap-2"
          >
            {showCorrectAnswers ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Correct Answers
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Correct Answers
              </>
            )}
          </Button>
        </div>

        {/* Results Summary Card */}
        <Card
          theme={cardTheme}
          clearTheme={{
            root: {
              base: true,
            },
          }}
          className="mb-6"
        >
          <div className="flex items-center">
            <BarChart4 className="h-5 w-5 mr-2" />
            Quiz Results Summary
          </div>
          <p>{results.quiz.description}</p>
          <div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 border border-green-100 rounded-lg p-4 text-center">
                <div className="text-green-600 font-medium text-sm">
                  Correct Answers
                </div>
                <div className="text-3xl font-bold text-green-700 flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  {results.score.correctCount}
                </div>
              </div>
              <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-center">
                <div className="text-red-600 font-medium text-sm">
                  Wrong Answers
                </div>
                <div className="text-3xl font-bold text-red-700 flex items-center justify-center">
                  <XCircle className="h-5 w-5 mr-2" />
                  {results.score.wrongCount}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-center">
                <div className="text-blue-600 font-medium text-sm">Score</div>
                <div className="text-3xl font-bold text-blue-700">
                  {results.score.percentage}%
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Detailed Results Table */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Detailed Responses</h2>

          <Table hoverable theme={tableTheme} clearTheme={true}>
            <TableHead>
              <TableRow>
                <TableHeadCell className="w-[40%]">Question</TableHeadCell>
                <TableHeadCell className="w-[30%]">Your Answer</TableHeadCell>
                {showCorrectAnswers && (
                  <TableHead className="w-[30%]">Correct Answer</TableHead>
                )}
                <TableHeadCell className="w-[80px] text-right">
                  Result
                </TableHeadCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.quiz.questions &&
                results.quiz.questions.map((question) => {
                  const { isCorrect } = getQuestionResult(question.id);
                  return (
                    <TableRow key={question.id}>
                      <TableCell className="font-medium">
                        {question.text}
                      </TableCell>
                      <TableCell>
                        <ul className="list-disc ml-5">
                          {getSelectedAnswerTexts(question.id).map(
                            (text, idx) => (
                              <li key={idx}>{text}</li>
                            ),
                          )}
                        </ul>
                      </TableCell>
                      {showCorrectAnswers && (
                        <TableCell>
                          <ul className="list-disc ml-5">
                            {getCorrectAnswerTexts(question.id).map(
                              (text, idx) => (
                                <li key={idx}>{text}</li>
                              ),
                            )}
                          </ul>
                        </TableCell>
                      )}
                      <TableCell className="text-right">
                        {isCorrect ? (
                          <Badge
                            variant="outline"
                            className="bg-green-50 text-green-700 border-green-200"
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Correct
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="bg-red-50 text-red-700 border-red-200"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Wrong
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export default Result;
