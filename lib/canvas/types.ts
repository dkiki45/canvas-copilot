export interface CanvasUser {
  id: number;
  name: string;
  email?: string;
}

export interface Course {
  id: number;
  name: string;
  course_code: string;
  enrollment_term_id: number;
  total_students?: number;
}

export interface Assignment {
  id: number;
  name: string;
  description: string | null;
  due_at: string | null;
  points_possible: number | null;
  html_url: string;
  course_id: number;
  attachments?: CanvasAttachment[];
}

export type AssignmentDetail = Assignment;

export interface CanvasAttachment {
  id: number;
  filename: string;
  display_name: string;
  url: string;
  size: number;
  content_type: string;
}

export interface CalendarEvent {
  id: number;
  title: string;
  start_at: string | null;
  end_at: string | null;
  context_code: string;
  html_url: string;
}

export interface Enrollment {
  id: number;
  course_id: number;
  type: string;
  grades?: {
    current_score: number | null;
    final_score: number | null;
    current_grade: string | null;
    final_grade: string | null;
  };
}

export interface Submission {
  id: number;
  assignment_id: number;
  workflow_state: "submitted" | "unsubmitted" | "graded" | "pending_review";
  submitted_at: string | null;
  score: number | null;
  grade: string | null;
  attachments?: CanvasAttachment[];
}

export interface DeadlineItem {
  assignment: Assignment;
  courseId: number;
  courseName: string;
  submission: Submission | null;
}
