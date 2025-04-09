import React from "react";
import { Checkbox, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { Card, Label } from "flowbite-react";
import { BookOpen } from "lucide-react";
import { createTheme } from "flowbite-react";
import DeleteForeverRoundedIcon from "@mui/icons-material/DeleteForeverRounded";
import { Plus } from "lucide-react";
import Button from "@mui/material/Button";
import { Save } from "lucide-react";
import api from "../api";

function CreateQuiz() {
  const [searchParams] = useSearchParams();
  const course_id = searchParams.get("course_id");

  const [quiz, setQuiz] = useState({
    title: "",
    description: "",
    course_id: course_id,
    questions: [],
  });

  useEffect(() => {
    if (quiz.questions.length === 0) {
      addQuestion();
    }
  }, []);

  const addQuestion = () => {
    const newQuestion = {
      id: `question-${Date.now()}`,
      text: "",
      answers: [
        {
          id: `answer-${Date.now()}`,
          text: "",
          isCorrect: false,
        },
      ],
    };

    setQuiz((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }));
  };

  const removeQuestion = (question_id) => {
    if (quiz.questions.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "A quiz must have at least one question.",
        variant: "destructive",
      });
      return;
    }

    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== question_id),
    }));
  };

  const updateQuestionText = (questionId, text) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, text } : q,
      ),
    }));
  };

  const addAnswer = (questionId) => {
    const newAnswer = {
      id: `answer-${Date.now()}`,
      text: "",
      isCorrect: false,
    };

    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q,
      ),
    }));
  };

  const removeAnswer = (questionId, answerId) => {
    // Don't allow removing the last answer
    const question = quiz.questions.find((q) => q.id === questionId);
    if (question && question.answers.length <= 1) {
      toast({
        title: "Cannot remove",
        description: "A question must have at least one answer option.",
        variant: "destructive",
      });
      return;
    }

    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.filter((a) => a.id !== answerId),
            }
          : q,
      ),
    }));
  };

  const updateAnswerText = (questionId, answerId, text) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, text } : a,
              ),
            }
          : q,
      ),
    }));
  };

  const toggleAnswerCorrect = (questionId, answerId) => {
    setQuiz((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              answers: q.answers.map((a) =>
                a.id === answerId ? { ...a, isCorrect: !a.isCorrect } : a,
              ),
            }
          : q,
      ),
    }));
  };

  const handleSubmit = async () => {
    // Validate the quiz
    if (!quiz.title.trim()) {
      toast({
        title: "Missing title",
        description: "Please add a title for your quiz.",
        variant: "destructive",
      });
      return;
    }

    // Validate questions
    for (const question of quiz.questions) {
      if (!question.text.trim()) {
        toast({
          title: "Empty question",
          description: "All questions must have text.",
          variant: "destructive",
        });
        return;
      }

      // Check if question has at least one correct answer
      const hasCorrectAnswer = question.answers.some((a) => a.isCorrect);
      if (!hasCorrectAnswer) {
        toast({
          title: "Missing correct answer",
          description: "Each question must have at least one correct answer.",
          variant: "destructive",
        });
        return;
      }

      // Validate answers
      for (const answer of question.answers) {
        if (!answer.text.trim()) {
          toast({
            title: "Empty answer",
            description: "All answers must have text.",
            variant: "destructive",
          });
          return;
        }
      }
    }

    // Format quiz as JSON
    const quizJson = JSON.stringify(quiz, null, 2);
    try {
      console.log("Posting");
      const response = api.post("/api/questions/", quizJson, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch {}

    // Show success message
    //toast({
    //  title: "Quiz created successfully!",
    //  description: "Your quiz has been created and ready to be assigned.",
    //});

    // In a real app, you would send this data to an API endpoint
    // For now we'll just log it and navigate back to the quizzes page
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
  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="max-w-7xl mx-auto">
        {/* Navigation breadcrumb */}
        <div className="flex items-center mb-6">
          <Link
            to="/course"
            className="flex items-center text-sm text-primary hover:underline mr-9"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to My courses
          </Link>
          <h1 className="text-3xl font-bold text-edu-dark">Create New Quiz</h1>
        </div>

        {/*Quiz details*/}
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
            Quiz Details
          </h5>
          <p className="text-m font-bold text-blue-900">{course_id}</p>
          <p className="text-sm text-muted-foreground mt-1">
            Enter basic information about your quiz
          </p>
          <div className="space-y-4">
            <div className="space-y-2">
              <h2>Quiz Title</h2>
              <div className="space-y-2">
                <TextField
                  className="w-full"
                  size="small"
                  value={quiz.title}
                  placeholder="Enter a title"
                  onChange={(e) =>
                    setQuiz((prev) => ({ ...prev, title: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <h2>Description (Optional)</h2>
              <div className="space-y-2">
                <TextField
                  className="w-full"
                  multiline
                  placeholder="Provide a description of this quiz"
                  value={quiz.description}
                  onChange={(e) =>
                    setQuiz((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          {quiz.questions.map((question, qIndex) => (
            <Card
              theme={cardTheme.shadow}
              clearTheme={{
                root: {
                  base: true,
                },
              }}
            >
              <div className="flex justify-between items-start">
                <h5 className="flex text-2xl font-bold tracking-tight text-blue-900">
                  Question {qIndex + 1}
                </h5>
                {quiz.questions.length > 1 && (
                  <DeleteForeverRoundedIcon
                    size="sm"
                    onClick={() => removeQuestion(question.id)}
                    className="text-destructive"
                  ></DeleteForeverRoundedIcon>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Question Text
              </p>
              <div className="space-y-4">
                <div className="space-y-2">
                  <TextField
                    id={`question-${question.id}`}
                    className="w-full"
                    size="small"
                    multiline
                    placeholder="Enter Your question here"
                    value={question.text}
                    onChange={(e) =>
                      updateQuestionText(question.id, e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground mt-1">
                      Question Text
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addAnswer(question.id)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Answer
                    </Button>
                  </div>

                  {/*Answers*/}
                  <div className="space-y-3 mt-2">
                    {question.answers.map((answer) => (
                      <div
                        key={answer.id}
                        className="flex items-start gap-3 bg-slate-50 p-3 rounded-md"
                      >
                        <div className="pt-2">
                          <Checkbox
                            id={`correct-${answer.id}`}
                            checked={answer.isCorrect}
                            onChange={() =>
                              toggleAnswerCorrect(question.id, answer.id)
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <p
                            className={
                              answer.isCorrect
                                ? "text-green-600 font-medium"
                                : ""
                            }
                          >
                            {answer.isCorrect
                              ? "Correct Answer"
                              : "Mark as correct"}
                          </p>
                          <TextField
                            placeholder="Enter answer text"
                            size="small"
                            className="mt-1 w-full"
                            value={answer.text}
                            onChange={(e) =>
                              updateAnswerText(
                                question.id,
                                answer.id,
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        {question.answers.length > 1 && (
                          <DeleteForeverRoundedIcon
                            size="sm"
                            onClick={() => removeAnswer(question.id, answer.id)}
                            className="text-destructive"
                          ></DeleteForeverRoundedIcon>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          ))}
          <div className="mt-6 mb-12 flex justify-between">
            <Button variant="outline" onClick={addQuestion} className="gap-1">
              <Plus className="h-4 w-4" />
              Add Question
            </Button>
            <div className="space-x-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSubmit} className="gap-1">
                <Save className="h-4 w-4" />
                Create Quiz
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreateQuiz;
