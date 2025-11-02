export interface Program {
  id: number;
  name: string;
  details: string | null;
  banner: string | null;
  brochure: string | null;
  universities: string[] | null;
  created_at: string;
  schools:
    | {
        name: string;
      }[]
    | null;
  school_categories:
    | {
        name: string;
      }[]
    | null;
}
