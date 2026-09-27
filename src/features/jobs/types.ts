export type JobPlatform =
  | "LinkedIn"
  | "Wellfound"
  | "Y Combinator"
  | "Greenhouse"
  | "Lever"
  | "Company Site";

export type JobWorkMode = "Remote" | "Hybrid" | "On-site";

export type JobSeniority = "Junior" | "Mid" | "Senior" | "Staff";

export type JobRole = {
  id: string;
  title: string;
  company: string;
  platform: JobPlatform;
  location: string;
  workMode: JobWorkMode;
  seniority: JobSeniority;
  compensation: string;
  postedAt: string;
  matchScore: number;
  requiredSkills: string[];
  preferredSkills: string[];
  link: string;
  notes: string;
};

export type JobPlatformFilter = JobPlatform | "All";
