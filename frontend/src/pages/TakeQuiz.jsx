import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "flowbite-react";
import { Button, Radio, RadioGroup } from "@mui/material";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Clock } from "lucide-react";
import { Flag } from "lucide-react";
import { Check } from "lucide-react";
import Checkbox from "@mui/material/Checkbox";
import { createTheme } from "flowbite-react";

import api from "../api";

function TakeQuiz() {
  const [searchParams] = useSearchParams();
  const quiz_id = searchParams.get("quizId");
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    questions: [
      {
        id: "",
        text: "",
        answers: [
          {
            id: "",
            text: "",
          },
        ],
        isMultiple: false,
      },
    ],
  });
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([
    {
      questionId: "",
      selectedAnswerIds: [],
    },
  ]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10); // 1 hour in seconds
  const [flaggedQuestions, setFlaggedQuestions] = useState([]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          submitQuiz();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [quizSubmitted]);

  // Format time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const fetchQuiz = async () => {
    try {
      const res = await api.get("/api/quizQuestions/", {
        params: {
          quiz_id,
        },
      });
      console.log(res.data);

      setQuiz(res.data);

      //Initialize userAnswers with empty arrays for each question
      setUserAnswers(
        res.data.questions.map((q) => ({
          questionId: q.id,
          selectedAnswerIds: [],
        })),
      );

      document.title = `Taking: ${res.data.title} | EduLearn Platform`;
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    fetchQuiz();
  }, [quiz_id]);

  const handleAnswerSelection = (questionId, answerId, isMultiple) => {
    setUserAnswers((prev) =>
      prev.map((userAnswer) =>
        userAnswer.questionId === questionId
          ? {
              ...userAnswer,
              selectedAnswerIds: isMultiple
                ? userAnswer.selectedAnswerIds.includes(answerId)
                  ? userAnswer.selectedAnswerIds.filter((id) => id !== answerId)
                  : [...userAnswer.selectedAnswerIds, answerId]
                : [answerId],
            }
          : userAnswer,
      ),
    );
  };

  const handleFlagQuestion = (questionId) => {
    setFlaggedQuestions((prev) =>
      prev.includes(questionId)
        ? prev.filter((id) => id !== questionId)
        : [...prev, questionId],
    );
  };

  const navigateToQuestion = (index) => {
    if (index >= 0 && index < (quiz?.questions.length || 0)) {
      setCurrentQuestionIndex(index);
    }
  };

  const submitQuiz = async () => {
    // Check if all questions have been answered
    const unansweredQuestions = userAnswers.filter(
      (a) => a.selectedAnswerIds.length === 0,
    );

    if (unansweredQuestions.length > 0 && !quizSubmitted) {
      const confirmation = window.confirm(
        `You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit?`,
      );

      if (!confirmation) return;
    }

    const res = { quiz_id: quiz_id, answers: userAnswers };
    console.log(res);
    const str = JSON.stringify(res, null, 2);
    console.log(str);
    try {
      const response = api.post("/api/submitQuiz/", str, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch {}
    setQuizSubmitted(true);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isMultipleChoice = currentQuestion.isMultiple;
  const userAnswerForCurrentQuestion = userAnswers.find(
    (a) => a.questionId === currentQuestion.id,
  );
  const isQuestionFlagged = flaggedQuestions.includes(currentQuestion.id);

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
    <>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6">
          {quizSubmitted ? (
            <Card
              theme={cardTheme.shadow}
              clearTheme={{
                root: {
                  base: true,
                },
              }}
            >
              <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                Quiz Completed!
              </h5>
              <p className="text-m text-blue-900">
                Thank you for completing the quiz
              </p>

              <p className="text-sm text-blue-900">Submission successful</p>
              <p className="text-green-700">
                Your answers have been submitted successfully.
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Quiz Summary</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-3 bg-slate-100 rounded-md">
                      <p className="text-sm font-medium">Total Questions</p>
                      <p className="text-2xl font-bold">
                        {quiz.questions.length}
                      </p>
                    </div>
                    <div className="p-3 bg-slate-100 rounded-md">
                      <p className="text-sm font-medium">Answered</p>
                      <p className="text-2xl font-bold">
                        {
                          userAnswers.filter(
                            (a) => a.selectedAnswerIds.length > 0,
                          ).length
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="w-full" onClick={() => navigate(`/quizzes`)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Quiz Details
              </Button>
              <Button
                className="w-full"
                onClick={() => navigate(`/result?quizId=${quiz_id}`)}
              >
                Show result
              </Button>
            </Card>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center">
                  <Button
                    variant="contained"
                    onClick={() => {
                      const confirmation = window.confirm(
                        "Are you sure you want to exit the quiz? Your progress will be lost.",
                      );
                      if (confirmation) navigate(`/quizzes`);
                    }}
                    className="mr-4"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Exit Quiz
                  </Button>
                  <h1 className="text-2xl ml-10 font-bold text-edu-dark hidden md:block">
                    {quiz.title}
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-md flex items-center text-sm">
                    <Clock className="h-4 w-4 mr-1 text-slate-500" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={submitQuiz}
                  >
                    Submit Quiz
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Question Navigation Sidebar - Only visible on large screens */}
                <div className="hidden lg:block">
                  <Card
                    theme={cardTheme.shadow}
                    clearTheme={{
                      root: {
                        base: true,
                      },
                    }}
                  >
                    <h3 className="flex text-base font-bold tracking-tight text-blue-900">
                      Question Navigator
                    </h3>
                    <div className="w-full">
                      <div className="grid grid-cols-2 gap-2">
                        {quiz.questions.map((question, index) => {
                          const answered =
                            userAnswers.find(
                              (a) => a.questionId === question.id,
                            )?.selectedAnswerIds.length || 0;
                          const isFlagged = flaggedQuestions.includes(
                            question.id,
                          );
                          return (
                            //<div className="bg-black w-2 h-2"></div>
                            <Button
                              key={question.id}
                              variant={
                                currentQuestionIndex === index
                                  ? "contained"
                                  : "outlined"
                              }
                              size="small"
                              color={`${answered > 0 ? "success" : "error"}`}
                              onClick={() => navigateToQuestion(index)}
                            >
                              {index + 1}
                              {isFlagged && (
                                <span className="absolute -top-1 -right-1 bg-orange-500 rounded-full w-2 h-2"></span>
                              )}
                            </Button>
                          );
                        })}
                      </div>
                      <div className="mt-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-3 h-3 border border-green-500 rounded"></div>
                          <span>Answered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 border border-orange-500 rounded"></div>
                          <span>Flagged</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Question and Answers Section */}
                <div className="lg:col-span-3 space-y-4">
                  <Card
                    theme={cardTheme.shadow}
                    clearTheme={{
                      root: {
                        base: true,
                      },
                    }}
                  >
                    <div className="flex justify-between">
                      <p className="text-lg">
                        Question {currentQuestionIndex + 1} of{" "}
                        {quiz.questions.length}
                      </p>
                      <Button
                        variant="outlined"
                        size="sm"
                        onClick={() => handleFlagQuestion(currentQuestion.id)}
                        className={
                          isQuestionFlagged
                            ? "text-orange-500 border-orange-500"
                            : ""
                        }
                      >
                        <Flag
                          className={`h-4 w-4 mr-2 ${isQuestionFlagged ? "fill-orange-500" : ""}`}
                        />
                        {isQuestionFlagged ? "Unflag" : "Flag for Review"}
                      </Button>
                    </div>
                    {isMultipleChoice && (
                      <>Select all correct answers (multiple choice)</>
                    )}
                    <div className="pt-6">
                      <div className="mb-6">
                        <p className="text-lg font-medium">
                          {currentQuestion.text}
                        </p>
                      </div>

                      <div className="space-y-3">
                        {isMultipleChoice ? (
                          // Multiple choice (checkbox)
                          currentQuestion.answers.map((answer) => (
                            <div className="flex">
                              <Checkbox
                                id={answer.id}
                                checked={userAnswerForCurrentQuestion?.selectedAnswerIds.includes(
                                  answer.id,
                                )}
                                onChange={() =>
                                  handleAnswerSelection(
                                    currentQuestion.id,
                                    answer.id,
                                    true,
                                  )
                                }
                              />
                              <p
                                htmlFor={answer.id}
                                className="text-base cursor-pointer flex-grow pt-0.5"
                              >
                                {answer.text}
                              </p>
                            </div>
                          ))
                        ) : (
                          // Single choice (radio)
                          <RadioGroup
                            value={
                              userAnswerForCurrentQuestion
                                ?.selectedAnswerIds[0] || ""
                            }
                            onChange={(e) =>
                              handleAnswerSelection(
                                currentQuestion.id,
                                e.target.value,
                                false,
                              )
                            }
                          >
                            {currentQuestion.answers.map((answer) => (
                              <FormControlLabel
                                value={answer.id}
                                control={<Radio />}
                                label={answer.text}
                              />
                            ))}
                          </RadioGroup>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <Button
                        variant="outlined"
                        onClick={() =>
                          navigateToQuestion(currentQuestionIndex - 1)
                        }
                        disabled={currentQuestionIndex === 0}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>

                      {currentQuestionIndex < quiz.questions.length - 1 ? (
                        <Button
                          onClick={() =>
                            navigateToQuestion(currentQuestionIndex + 1)
                          }
                        >
                          Next
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      ) : (
                        <Button
                          onClick={submitQuiz}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Submit Quiz
                        </Button>
                      )}
                    </div>
                  </Card>

                  {/* Mobile Question Navigator */}
                  <div className="flex items-center justify-between lg:hidden">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigateToQuestion(currentQuestionIndex - 1)
                      }
                      disabled={currentQuestionIndex === 0}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>

                    <span className="text-sm text-muted-foreground">
                      {currentQuestionIndex + 1} of {quiz.questions.length}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigateToQuestion(currentQuestionIndex + 1)
                      }
                      disabled={
                        currentQuestionIndex >= quiz.questions.length - 1
                      }
                    >
                      Next
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default TakeQuiz;
