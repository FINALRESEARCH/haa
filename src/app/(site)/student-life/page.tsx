import SectionPage, { sectionMetadata } from "@/components/SectionPage";

export const generateMetadata = () => sectionMetadata("student-life");

export default function StudentLifePage() {
  return <SectionPage id="student-life" />;
}
