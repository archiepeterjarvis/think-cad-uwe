"use client";

import {UseChatHelpers} from "@ai-sdk/react";
import {UIMessage} from "ai";
import {memo, useCallback, useEffect, useRef, useState} from "react";
import {useWindowSize} from "usehooks-ts";
import {useScrollToBottom} from "@/hooks/use-scroll-to-bottom";
import {AnimatePresence, motion} from "framer-motion";
import {Button} from "@/components/ui/button";
import {
  AlertCircle,
  ArrowDown,
  ArrowRightToLine,
  ArrowUpIcon,
  CheckCircle,
  Clock,
  Edit3,
  Lightbulb,
  StopCircle
} from "lucide-react";
import {Textarea} from "@/components/ui/textarea";
import {toast} from "sonner";
import {Badge} from "../ui/badge";
import {cx} from "class-variance-authority";

interface Parameter {
  name: string;
  type: "options" | "number" | "text" | "custom";
  options?: string[] | ((context: Record<string, string>) => string[]);
  validation?: {
    pattern?: RegExp;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
    custom?: (value: string, context: Record<string, string>) => boolean;
  };
  placeholder?: string;
  suggestions?: string[] | ((context: Record<string, string>) => string[]);
  description?: string;
}

interface Part {
  type: "text" | "parameter";
  content: string;
  parameter?: Parameter;
}

interface Template {
  id: string;
  name: string;
  description: string;
  parts: Part[];
  example?: string;
}

function PureChatInput({
                         chatId,
                         input,
                         setInput,
                         status,
                         stop,
                         messages,
                         setMessages,
                         append,
                         handleSubmit,
                         className,
                       }: {
  chatId: string;
  input: UseChatHelpers["input"];
  setInput: UseChatHelpers["setInput"];
  status: UseChatHelpers["status"];
  stop: () => void;
  messages: Array<UIMessage>;
  setMessages: UseChatHelpers["setMessages"];
  append: UseChatHelpers["append"];
  handleSubmit: UseChatHelpers["handleSubmit"];
  className?: string;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {width} = useWindowSize();
  const [matchedTemplate, setMatchedTemplate] = useState<Template | null>(null);
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isWaitingForInput, setIsWaitingForInput] = useState(false);
  const [currentParameter, setCurrentParameter] = useState<Parameter | null>(
    null,
  );
  const [inputError, setInputError] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [completedParts, setCompletedParts] = useState<Record<string, string>>(
    {},
  );
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  useEffect(() => {
    if (textareaRef.current) {
      adjustHeight();
    }
  }, []);

  const adjustHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight + 2}px`;
    }
  };

  const resetHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = "98px";
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      const domValue = textareaRef.current.value;
      const finalValue = domValue || ""; // Add localStorage for input
      setInput(finalValue);
      adjustHeight();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(event.currentTarget.value);
    adjustHeight();
  };

  const submitForm = useCallback(() => {
    window.history.replaceState({}, "", `/chat/${chatId}`);
    handleSubmit(undefined, {});

    resetHeight();

    if (width && width > 768) {
      textareaRef.current?.focus();
    }
  }, [handleSubmit, width, chatId]);

  const {isAtBottom, scrollToBottom} = useScrollToBottom();

  useEffect(() => {
    if (status === "submitted") {
      scrollToBottom();
    }
  }, [status, scrollToBottom]);

  const templates: Template[] = [
    {
      id: "basic-shape",
      name: "3D Shape Generator",
      description: "Generate basic 3D shapes with specific dimensions",
      example: "Generate a cube with 5 cm sides",
      parts: [
        {type: "text", content: "Generate a "},
        {
          type: "parameter",
          content: "{shape}",
          parameter: {
            name: "shape",
            type: "options",
            options: ["cube", "sphere", "cylinder", "cone"],
            description: "Choose the type of 3D shape",
          },
        },
        {type: "text", content: " with "},
        {
          type: "parameter",
          content: "{dimension}",
          parameter: {
            name: "dimension",
            type: "number",
            validation: {
              required: true,
              min: 0.1,
              max: 1000,
            },
            placeholder: "Enter size",
            description: "Size of the shape",
          },
        },
        {type: "text", content: " "},
        {
          type: "parameter",
          content: "{unit}",
          parameter: {
            name: "unit",
            type: "options",
            options: ["cm", "mm", "m", "inches"],
            description: "Unit of measurement",
          },
        },
        {type: "text", content: " "},
        {
          type: "parameter",
          content: "{type}",
          parameter: {
            name: "type",
            type: "options",
            options: (context) => {
              const {shape} = context;
              if (shape === "cube") return ["sides"];
              if (shape === "sphere") return ["radius"];
              if (shape === "cylinder") return ["radius", "height"];
              if (shape === "cone") return ["radius", "height"];
              return ["dimension"];
            },
            description: "Type of dimension",
          },
        },
      ],
    },
  ];

  const getParameterOptions = (
    parameter: Parameter,
    context: Record<string, string>,
  ): string[] => {
    if (parameter.type !== "options") return [];

    try {
      if (typeof parameter.options === "function") {
        return parameter.options(context) || [];
      }
      return parameter.options || [];
    } catch (error) {
      console.error("Error getting parameter options:", error);
      return [];
    }
  };

  const extractParameterValues = (
    template: Template,
    inputText: string,
  ): Record<string, string> => {
    const values: Record<string, string> = {};
    let builtText = "";

    try {
      for (const part of template.parts) {
        if (part.type === "text") {
          builtText += part.content;
        } else if (part.type === "parameter" && part.parameter) {
          const paramName = part.parameter.name;

          if (part.parameter.type === "options") {
            const options = getParameterOptions(part.parameter, values);

            for (const option of options) {
              const expectedText = builtText + option;

              if (inputText.startsWith(expectedText)) {
                values[paramName] = option;
                builtText = expectedText;
                break;
              }
            }
          } else {
            let nextTextIndex = -1;

            for (
              let i = template.parts.indexOf(part) + 1;
              i < template.parts.length;
              i++
            ) {
              if (template.parts[i].type === "text") {
                nextTextIndex = i;
                break;
              }
            }

            if (nextTextIndex !== -1) {
              const nextTextContent = template.parts[nextTextIndex].content;
              const nextTextPosition = inputText.indexOf(
                nextTextContent,
                builtText.length,
              );

              if (nextTextPosition !== -1) {
                const paramValue = inputText.substring(
                  builtText.length,
                  nextTextPosition,
                );
                values[paramName] = paramValue;
                builtText += paramValue;
              } else {
                const paramValue = inputText.substring(builtText.length);
                if (paramValue) {
                  values[paramName] = paramValue;
                  builtText += paramValue;
                }
                break;
              }
            } else {
              const paramValue = inputText.substring(builtText.length);
              if (paramValue) {
                values[paramName] = paramValue;
                builtText += paramValue;
              }
              break;
            }
          }

          if (!values[paramName]) {
            break;
          }
        }
      }
    } catch (error) {
      console.error("Error extracting parameter values:", error);
    }

    setCompletedParts((prev) => ({
      ...prev,
      ...values,
    }));
    return values;
  };

  const validateParameter = (
    parameter: Parameter,
    value: string,
    context: Record<string, string>,
  ): {
    isValid: boolean;
    error?: string;
  } => {
    if (!parameter.validation) return {isValid: true};

    const validation = parameter.validation;

    try {
      if (validation.required && (!value || value.trim() === "")) {
        return {isValid: false, error: `${parameter.name} is required`};
      }

      if (!value) return {isValid: true};

      if (parameter.type === "number") {
        const num = Number.parseFloat(value);
        if (isNaN(num)) {
          return {
            isValid: false,
            error: `${parameter.name} must be a number`,
          };
        }
        if (validation.min !== undefined && num < validation.min) {
          return {
            isValid: false,
            error: `${parameter.name} must be at least ${validation.min}`,
          };
        }
        if (validation.max !== undefined && num > validation.max) {
          return {
            isValid: false,
            error: `${parameter.name} must be at most ${validation.max}`,
          };
        }
      }

      if (validation.pattern && !validation.pattern.test(value)) {
        return {isValid: false, error: `${parameter.name} format is invalid`};
      }

      if (
        validation.minLength !== undefined &&
        value.length < validation.minLength
      ) {
        return {
          isValid: false,
          error: `${parameter.name} must be at least ${validation.minLength} characters`,
        };
      }
      if (
        validation.maxLength !== undefined &&
        value.length > validation.maxLength
      ) {
        return {
          isValid: false,
          error: `${parameter.name} must be at most ${validation.maxLength} characters`,
        };
      }

      if (validation.custom && !validation.custom(value, context)) {
        return {
          isValid: false,
          error: `${parameter.name} does not meet requirements`,
        };
      }
    } catch (error) {
      console.error("Error validating parameter:", error);
      return {isValid: false, error: "Validation error occurred"};
    }

    return {isValid: true};
  };

  const getParameterSuggestions = (
    parameter: Parameter,
    context: Record<string, string>,
  ): string[] => {
    try {
      if (parameter.type === "options") {
        return getParameterOptions(parameter, context);
      }

      if (parameter.suggestions) {
        if (typeof parameter.suggestions === "function") {
          return parameter.suggestions(context) || [];
        }
        return parameter.suggestions || [];
      }
    } catch (error) {
      console.error("Error getting parameter suggestions:", error);
    }

    return [];
  };

  const findMatchingTemplate = (inputText: string) => {
    try {
      for (const template of templates) {
        const extractedValues = extractParameterValues(template, inputText);
        let builtText = "";
        let isCompleteMatch = true;

        for (const part of template.parts) {
          if (part.type === "text") {
            builtText += part.content;
          } else if (part.type === "parameter" && part.parameter) {
            const paramName = part.parameter.name;
            const paramValue = extractedValues[paramName];

            if (paramValue) {
              builtText += paramValue;
            } else {
              isCompleteMatch = false;
              break;
            }
          }
        }

        if (inputText === builtText && isCompleteMatch) {
          return {
            template,
            partIndex: template.parts.length - 1,
            isComplete: true,
          };
        }

        if (inputText.startsWith(builtText.substring(0, inputText.length))) {
          let currentBuiltText = "";
          for (let i = 0; i < template.parts.length; i++) {
            const part = template.parts[i];

            if (part.type === "text") {
              const expectedText = currentBuiltText + part.content;
              if (inputText.length <= expectedText.length) {
                if (inputText === expectedText.substring(0, inputText.length)) {
                  return {template, partIndex: i, isComplete: false};
                }
              }
              currentBuiltText = expectedText;
            } else if (part.type === "parameter" && part.parameter) {
              const paramName = part.parameter.name;
              const paramValue = extractedValues[paramName];

              if (paramValue) {
                currentBuiltText += paramValue;
              } else {
                return {template, partIndex: i, isComplete: false};
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error finding matching template:", error);
    }

    return null;
  };

  const getCurrentParameterOptions = (inputText: string) => {
    try {
      for (const template of templates) {
        let builtText = "";
        const extractedValues = extractParameterValues(template, inputText);

        for (let i = 0; i < template.parts.length; i++) {
          const part = template.parts[i];

          if (part.type === "text") {
            const expectedText = builtText + part.content;

            if (inputText === expectedText && i + 1 < template.parts.length) {
              const nextPart = template.parts[i + 1];

              if (nextPart.type === "parameter") {
                const suggestions = getParameterSuggestions(
                  nextPart.parameter!,
                  extractedValues,
                );
                return {
                  template,
                  partIndex: i + 1,
                  parameter: nextPart.parameter!,
                  options: suggestions,
                  prefix: expectedText,
                  context: extractedValues,
                  needsInput: nextPart.parameter!.type !== "options",
                };
              }
            }

            if (!input.startsWith(expectedText)) {
              break;
            }

            builtText = expectedText;
          } else {
            if (part.parameter!.type === "options") {
              const parameterOptions = getParameterOptions(
                part.parameter!,
                extractedValues,
              );
              let foundMatch = false;

              for (const option of parameterOptions) {
                const expectedText = builtText + option;

                if (inputText.startsWith(expectedText)) {
                  builtText = expectedText;
                  foundMatch = true;
                  break;
                }
              }

              if (!foundMatch && inputText === builtText) {
                return {
                  template,
                  partIndex: i,
                  parameter: part.parameter!,
                  options: parameterOptions,
                  prefix: builtText,
                  context: extractedValues,
                  needsInput: false,
                };
              }

              if (!foundMatch) break;
            } else {
              if (inputText.startsWith(builtText)) {
                let parameterEndPos = inputText.length;
                for (let j = i + 1; j < template.parts.length; j++) {
                  if (template.parts[j].type === "text") {
                    const nextTextPos = inputText.indexOf(
                      template.parts[j].content,
                      builtText.length,
                    );
                    if (nextTextPos !== -1) {
                      parameterEndPos = nextTextPos;
                      break;
                    }
                  }
                }

                const actualValue = inputText.substring(
                  builtText.length,
                  parameterEndPos,
                );

                if (actualValue !== undefined) {
                  extractedValues[part.parameter!.name] = actualValue;

                  if (parameterEndPos === inputText.length) {
                    const suggestions = getParameterSuggestions(
                      part.parameter!,
                      extractedValues,
                    );
                    return {
                      template,
                      partIndex: i,
                      parameter: part.parameter!,
                      options: suggestions,
                      prefix: builtText,
                      context: extractedValues,
                      needsInput: true,
                      currentValue: actualValue,
                    };
                  }

                  builtText += actualValue;
                }
              } else {
                break;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error getting current parameter options:", error);
    }

    return null;
  };

  useEffect(() => {
    try {
      const match = findMatchingTemplate(input);
      const parameterMatch = getCurrentParameterOptions(input);

      setInputError("");

      if (input.length === 0) {
        setMatchedTemplate(null);
        setCurrentParameter(null);
        setSuggestions([]);
        setIsOpen(false);
        setCompletedParts({});
        return;
      }

      if (parameterMatch) {
        setMatchedTemplate(parameterMatch.template);
        setCurrentPartIndex(parameterMatch.partIndex);
        setCurrentParameter(parameterMatch.parameter);
        setIsWaitingForInput(parameterMatch.needsInput);
        setSuggestions(parameterMatch.options || []);
        setIsOpen((parameterMatch.options || []).length > 0);

        if (parameterMatch.currentValue !== undefined) {
          const validation = validateParameter(
            parameterMatch.parameter,
            parameterMatch.currentValue,
            parameterMatch.context,
          );

          if (!validation.isValid) {
            setInputError(validation.error || "");
          }
        }
      } else if (match) {
        setMatchedTemplate(match.template);
        setCurrentPartIndex(match.partIndex);
        setCurrentParameter(null);
        setIsWaitingForInput(false);
        setSuggestions([]);
        setIsOpen(false);
      } else {
        setMatchedTemplate(null);
        setCurrentPartIndex(0);
        setCurrentParameter(null);
        setIsWaitingForInput(false);
        setSuggestions([]);
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error in useEffect:", error);
    }
  }, [input]);

  const handleSuggestionClick = (suggestion: string) => {
    try {
      const parameterMatch = getCurrentParameterOptions(input);
      if (parameterMatch) {
        setInput(parameterMatch.prefix + suggestion);
      } else {
        setInput(suggestion);
      }
      setIsOpen(false);

      // Refocus the input after selection
      setTimeout(() => {
        const inputElement = document.querySelector(
          'input[placeholder*="typing"]',
        ) as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 0);
    } catch (error) {
      console.error("Error handling suggestion click:", error);
    }
  };

  const renderTemplatePreview = () => {
    if (!matchedTemplate) return null;

    try {
      return (
        matchedTemplate.parts.map((part, index) => {
          if (part.type === "text") {
            return (
              <span key={index} className="text-foreground">
                {part.content}
              </span>
            );
          } else {
            const parameterName = part.parameter!.name;
            const completedValue = completedParts[parameterName];
            const isCompleted = !!completedValue;
            const isCurrent = index === currentPartIndex;

            return (
              <Badge
                key={index}
                variant={
                  isCompleted
                    ? "default"
                    : isCurrent
                      ? "secondary"
                      : "outline"
                }
                className={`text-xs ${isCurrent ? "animate-bounce" : ""}`}
              >
                {isCompleted
                  ? completedValue
                  : part.parameter!.name}
              </Badge>
            );
          }
        })
      );
    } catch (error) {
      console.error("Error rendering template preview:", error);
      return null;
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-4">
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{opacity: 0, y: 10}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: 10}}
            transition={{type: "spring", stiffness: 300, damping: 20}}
            className="absolute left-1/2 bottom-28 -translate-x-1/2 z-50"
          >
            <Button
              data-testid="scroll-to-bottom-button"
              className="rounded-full"
              size="icon"
              variant="outline"
              onClick={(event) => {
                event.preventDefault();
                scrollToBottom();
              }}
            >
              <ArrowDown/>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && suggestions.length > 0 && (
        <div
          data-suggestions-dropdown
          className="absolute bottom-full left-0 right-0 z-50 mb-1 bg-white border border-border rounded-md shadow-lg max-h-70 overflow-auto"
        >
          <div className="p-2 space-y-1">
            <div className="flex items-start gap-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
              <Lightbulb className="h-4 w-4 mt-0.5"/>
              <div>
                <div className="font-medium">{currentParameter?.name}</div>
                {currentParameter?.description &&
                    <div className="text-blue-600/80">{currentParameter.description}</div>}
              </div>
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                onMouseDown={(e) => {
                  e.preventDefault()
                }}
                onMouseEnter={() => setSelectedSuggestionIndex(index)} // Add hover selection
                onClick={() => handleSuggestionClick(suggestion)}
                className={cx(
                  "w-full flex items-center gap-2 px-2 py-2 text-sm rounded-sm cursor-pointer text-left",
                  index === selectedSuggestionIndex
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <CheckCircle className="h-4 w-4 text-green-500"/>
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {inputError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4"/>
          {inputError}
        </div>
      )}

      <AnimatePresence>
        {matchedTemplate && (
          <TemplatePreview
            matchedTemplate={matchedTemplate}
            currentPartIndex={currentPartIndex}
            completedParts={completedParts}
          />
        )}
      </AnimatePresence>

      <Textarea
        data-testid="chat-input"
        placeholder="Send a message..."
        value={input}
        onChange={(e) => {
          handleInput(e)
          setIsOpen(suggestions.length > 0)
        }}
        onFocus={() => {
          if (suggestions.length > 0) {
            setIsOpen(true)
          }
        }}
        onBlur={(e) => {
          setTimeout(() => {
            if (!document.activeElement?.closest("[data-suggestions-dropdown]")) {
              setIsOpen(false)
            }
          }, 150)
        }}
        className={cx(
          "min-h-[24px] max-h-[calc(75dvh)] overflow-hidden resize-none rounded-2xl !text-base bg-muted pb-10 dark:border-zinc-700",
          className,
        )}
        rows={2}
        autoFocus
        onKeyDown={(event) => {
          if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
            event.preventDefault()

            if (isOpen && suggestions.length > 0 && selectedSuggestionIndex >= 0) {
              handleSuggestionClick(suggestions[selectedSuggestionIndex])
              return
            }

            if (status !== "ready") {
              toast.error("Please wait for the model to finish its response")
            } else {
              submitForm()
            }
          }

          if (event.key === "Tab" && matchedTemplate) {
            event.preventDefault()

            // Check if current part is a text component
            const currentPart = matchedTemplate.parts[currentPartIndex];
            if (currentPart && currentPart.type === "text") {
              // Complete the template by building the full text
              let completedText = "";
              for (const part of matchedTemplate.parts) {
                if (part.type === "text") {
                  completedText += part.content;
                } else if (part.type === "parameter" && part.parameter) {
                  const paramValue = completedParts[part.parameter.name];
                  if (paramValue) {
                    completedText += paramValue;
                  } else {
                    // If we hit an incomplete parameter, stop here
                    break;
                  }
                }
              }
              setInput(completedText);
            }
          }

          if (isOpen && suggestions.length > 0) {
            if (event.key === "ArrowDown") {
              event.preventDefault()
              setSelectedSuggestionIndex(prev =>
                prev < suggestions.length - 1 ? prev + 1 : 0
              )
            }

            if (event.key === "ArrowUp") {
              event.preventDefault()
              setSelectedSuggestionIndex(prev =>
                prev > 0 ? prev - 1 : suggestions.length - 1
              )
            }
          }
        }}
      />

      <div className="absolute bottom-0 right-0 p-2 w-fit flex flex-row justify-end">
        {status === "submitted" ? (
          <StopButton stop={stop} setMessages={setMessages}/>
        ) : (
          <SendButton input={input} submitForm={submitForm}/>
        )}
      </div>

      <div
        className="absolute top-full left-0 right-0 z-50 mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
        <ArrowRightToLine className="w-3"/>
        <span>
          for autocomplete
        </span>
      </div>
    </div>
  );
}

export const ChatInput = memo(PureChatInput, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  if (prevProps.status !== nextProps.status) return false;

  return true;
});

function PureStopButton({
                          stop,
                          setMessages,
                        }: {
  stop: () => void;
  setMessages: UseChatHelpers["setMessages"];
}) {
  return (
    <Button
      data-testid="stop-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        stop();
        setMessages((messages) => messages);
      }}
    >
      <div>
        <StopCircle size={14}/>
      </div>
    </Button>
  );
}

const StopButton = memo(PureStopButton);

function PureSendButton({
                          submitForm,
                          input,
                        }: {
  submitForm: () => void;
  input: string;
}) {
  return (
    <Button
      data-testid="send-button"
      className="rounded-full p-1.5 h-fit border dark:border-zinc-600"
      onClick={(event) => {
        event.preventDefault();
        submitForm();
      }}
      disabled={input.length === 0}
    >
      <div>
        <ArrowUpIcon height={14} width={14}/>
      </div>
    </Button>
  );
}

const SendButton = memo(PureSendButton, (prevProps, nextProps) => {
  if (prevProps.input !== nextProps.input) return false;
  return true;
});

interface TemplatePreviewProps {
  matchedTemplate: Template | null
  currentPartIndex: number
  completedParts: Record<string, string>
}

export function TemplatePreview({matchedTemplate, currentPartIndex, completedParts}: TemplatePreviewProps) {
  if (!matchedTemplate) return null

  const renderTemplatePreview = () => {
    try {
      return (
        <div className="flex flex-wrap items-center gap-1">
          {matchedTemplate.parts.map((part, index) => {
            if (part.type === "text") {
              return (
                <motion.span
                  key={index}
                  initial={{opacity: 0, scale: 0.9}}
                  animate={{opacity: 1, scale: 1}}
                  className="text-foreground font-medium"
                >
                  {part.content}
                </motion.span>
              )
            } else {
              const parameterName = part.parameter!.name
              const completedValue = completedParts[parameterName]
              const isCompleted = !!completedValue
              const isCurrent = index === currentPartIndex

              return (
                <AnimatePresence key={index} mode="wait">
                  <motion.div
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 10}}
                    transition={{duration: 0.2}}
                  >
                    <Badge
                      variant={isCompleted ? "default" : isCurrent ? "secondary" : "outline"}
                      className={`
                        text-xs transition-all duration-200 flex items-center gap-1
                        ${isCurrent ? "ring-2 ring-blue-200 shadow-sm" : ""}
                        ${isCompleted ? "bg-green-100 text-green-800 border-green-200" : ""}
                      `}
                    >
                      {isCompleted && <CheckCircle className="h-3 w-3"/>}
                      {isCurrent && !isCompleted && (
                        <motion.div
                          animate={{scale: [1, 1.2, 1]}}
                          transition={{duration: 1, repeat: Number.POSITIVE_INFINITY}}
                        >
                          <Edit3 className="h-3 w-3"/>
                        </motion.div>
                      )}
                      {!isCurrent && !isCompleted && <Clock className="h-3 w-3 opacity-50"/>}
                      <span>{isCompleted ? completedValue : part.parameter!.name}</span>
                    </Badge>
                  </motion.div>
                </AnimatePresence>
              )
            }
          })}
        </div>
      )
    } catch (error) {
      console.error("Error rendering template preview:", error)
      return null
    }
  }

  return (
    <motion.div
      initial={{opacity: 0, y: -10}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -10}}
      className="relative"
    >
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-3 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="text-sm font-semibold text-blue-900">{matchedTemplate.name}</h4>
            </div>
            <p className="text-xs text-blue-700 mb-3 opacity-80">{matchedTemplate.description}</p>
            <div className="bg-white/60 rounded-md p-2 border border-blue-100">{renderTemplatePreview()}</div>
          </div>
        </div>
      </div>

      {/* Progress indicator */}
      <div className="mt-2 flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
          <motion.div
            className="bg-blue-500 h-1.5 rounded-full"
            initial={{width: 0}}
            animate={{
              width: `${(Object.keys(completedParts).length / matchedTemplate.parts.filter((p) => p.type === "parameter").length) * 100}%`,
            }}
            transition={{duration: 0.3}}
          />
        </div>
        <span className="text-xs text-muted-foreground">
          {Object.keys(completedParts).length} / {matchedTemplate.parts.filter((p) => p.type === "parameter").length}
        </span>
      </div>
    </motion.div>
  )
}
