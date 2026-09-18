export type Section = {
  id: string;
  label: string;
  heading: string;
  body: string[];
};

export const sections: Section[] = [
  {
    id: "curriculum",
    label: "Curriculum",
    heading: "Build your education around what you want to pursue.",
    body: [
      "At HAA, your own pursuits are at the center of your education.",
      "You might start a company, build a new technology, conduct research, make art, write, master a new skill, read a book, or follow a question far enough to discover where it leads.",
      "Courses, faculty, mentors, peers, companies, and the wider HAA network exist around that work: to challenge you, expand what you know, and help you go further.",
    ],
  },
  {
    id: "network",
    label: "Network",
    heading: "A network that keeps working after you leave.",
    body: [
      "Students work alongside founders, researchers, investors, and operators who take their projects seriously.",
      "Introductions are made for the work, not for the résumé: the people you meet here are the people you build with next.",
    ],
  },
  {
    id: "student-life",
    label: "Student Life",
    heading: "A residential campus built for making things.",
    body: [
      "Everyone lives on campus for two years, surrounded by people doing unreasonably ambitious work.",
      "Studios, labs, and shops stay open late, and the day is structured around the work rather than around the timetable.",
    ],
  },
  {
    id: "admissions",
    label: "Admissions",
    heading: "We read for evidence, not credentials.",
    body: [
      "Applications open once a year. We look for what you have already made, questioned, or taught yourself.",
      "There is no test score and no minimum age. Show us the work and tell us where you intend to take it.",
    ],
  },
  {
    id: "about",
    label: "About",
    heading: "A two-year residential academy.",
    body: [
      "The Horowitz Andreessen Academy exists for students who would rather spend their time making, investigating, and experimenting than preparing for a life that starts later.",
    ],
  },
];
