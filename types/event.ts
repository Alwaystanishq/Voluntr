export const EVENT_CATEGORIES = [
  "Environment", "Education", "Health", "Animal Welfare", "Community", "Food & Relief", "Other",
] as const;

export interface EventDetails {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location?: string;
  category?: string;
  requiredSkills?: string[];
  capacity?: number | null;
  registrationDeadline?: string;
  coverImage?: string;
}
