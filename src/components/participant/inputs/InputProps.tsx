import type { SlideData, ResponsePayload } from "../../../core/types";

export interface InputProps {
  slideData: SlideData;
  onSubmit: (payload: ResponsePayload) => void;
  disabled?: boolean;
  submitted?: boolean;
}