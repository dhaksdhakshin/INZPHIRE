import React from "react";
import type { SlideData, ResponsePayload } from "../../../core/types";
import type { InputProps } from "./InputProps";

export type { SlideData, ResponsePayload };
export { InputProps };

import { WordCloudInput } from "./WordCloudInput";
import { MultipleChoiceInput } from "./MultipleChoiceInput";
import { OpenEndedInput } from "./OpenEndedInput";
import { ScalesInput } from "./ScalesInput";
import { RankingInput } from "./RankingInput";
import { HundredPointsInput } from "./HundredPointsInput";
import { TwoByTwoInput } from "./TwoByTwoInput";
import { PinOnImageInput } from "./PinOnImageInput";
import { QaInput } from "./QaInput";
import { TimerInput } from "./TimerInput";
import { InstructionsInput } from "./InstructionsInput";
import { ContentInput } from "./ContentInput";
import { ImageChoiceInput } from "./ImageChoiceInput";
import { SelectAnswerQuizInput } from "./SelectAnswerQuizInput";
import { TypeAnswerQuizInput } from "./TypeAnswerQuizInput";
import { LeaderboardInput } from "./LeaderboardInput";
import { ReactionsInput } from "./ReactionsInput";
import { QuickFormInput } from "./QuickFormInput";
import { CommentsInput } from "./CommentsInput";
import { GatherNamesInput } from "./GatherNamesInput";

const INPUT_COMPONENT_LOOKUP: Record<string, React.ComponentType<InputProps>> = {
  word_cloud: WordCloudInput,
  multiple_choice: MultipleChoiceInput,
  open_ended: OpenEndedInput,
  scales: ScalesInput,
  ranking: RankingInput,
  hundred_points: HundredPointsInput,
  two_by_two: TwoByTwoInput,
  pin_on_image: PinOnImageInput,
  qa: QaInput,
  timer: TimerInput,
  instructions: InstructionsInput,
  content: ContentInput,
  image_choice: ImageChoiceInput,
  select_answer_quiz: SelectAnswerQuizInput,
  type_answer_quiz: TypeAnswerQuizInput,
  leaderboard: LeaderboardInput,
  reactions: ReactionsInput,
  quick_form: QuickFormInput,
  comments: CommentsInput,
  gather_names: GatherNamesInput,
};

export function getParticipantInputComponent(slideType: string): React.ComponentType<InputProps> {
  if (!slideType) return ContentInput;

  let key = slideType.toLowerCase().replace(/-/g, "_");

  if (key === "qna") key = "qa";

  return INPUT_COMPONENT_LOOKUP[key] ?? ContentInput;
}