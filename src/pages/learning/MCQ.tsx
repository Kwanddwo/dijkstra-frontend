import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { useLLMContext } from "@/context/LLMContext";

interface MCQComponentProps {
  question: string;
  choices: string[];
  correctIndex: number;
  problemId: string;
  isProblemCompleted: () => Promise<boolean | undefined>;
  handleProblemComplete: () => void;
}

export default function MCQComponent({
  question,
  choices,
  correctIndex,
  problemId,
  isProblemCompleted,
  handleProblemComplete,
}: MCQComponentProps) {
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { setIsOpen, handleSendMessage } = useLLMContext();
  const handleChoiceSelect = (index: number) => {
    if (!isSubmitted) {
      setSelectedChoice(index);
    }
  };

  const handleSubmit = async () => {
    if (selectedChoice !== null) {
      setIsSubmitted(true);
    }
    if (!isCorrect) {
      setIsOpen(true);
      const input = `I selected: ${selectedChoice}`;
      const context = `
                The user answered a multiple-choice question incorrectly. Here are the details:

                - **Question**: ${question}
                - **Choices**: ${choices.join(", ")}
                - **Correct Answer**: ${choices[correctIndex]}
                - **User's Answer**: ${
                  selectedChoice !== null
                    ? choices[selectedChoice]
                    : "No answer selected"
                }
            `;
      handleSendMessage(input, context);
    } else {
      const completed = await isProblemCompleted();
      if (!completed) {
        handleProblemComplete();
      }
    }
  };

  const handleReset = () => {
    setSelectedChoice(null);
    setIsSubmitted(false);
  };

  const isCorrect = selectedChoice !== null && selectedChoice === correctIndex;

  const getChoiceStyle = (index: number) => {
    if (!isSubmitted) {
      return selectedChoice === index
        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
        : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600";
    }

    if (selectedChoice === index) {
      return isCorrect
        ? "border-green-500 bg-green-50 dark:bg-green-950"
        : "border-red-500 bg-red-50 dark:bg-red-950";
    }
    if (index === correctIndex) {
      return "border-green-500 bg-green-50 dark:bg-green-950";
    }

    return "border-gray-200 dark:border-gray-700 opacity-50";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {choices.map((choice, index) => (
            <div
              key={index}
              onClick={() => handleChoiceSelect(index)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${getChoiceStyle(
                index
              )} ${!isSubmitted ? "hover:shadow-sm" : "cursor-default"}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{choice}</span>
                {isSubmitted && selectedChoice === index && (
                  <div className="flex items-center">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                )}
                {isSubmitted &&
                  index === correctIndex &&
                  selectedChoice !== index && (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
              </div>
            </div>
          ))}
        </div>

        {!isSubmitted ? (
          <Button
            onClick={handleSubmit}
            disabled={selectedChoice === null}
            className="w-full"
          >
            Submit Answer
          </Button>
        ) : (
          <div className="space-y-3">
            <div
              className={`p-4 rounded-lg text-center font-medium ${
                isCorrect
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {isCorrect ? (
                <div className="flex items-center justify-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Correct! Well done!
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <XCircle className="w-5 h-5" />
                  Incorrect. The correct answer is "{choices[correctIndex]}"
                </div>
              )}
            </div>
            {!isCorrect && (
              <Button
                onClick={handleReset}
                variant="outline"
                className="w-full"
              >
                Try Again
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
