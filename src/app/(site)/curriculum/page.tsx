import SectionPage, { sectionMetadata } from "@/components/SectionPage";

export const generateMetadata = () => sectionMetadata("curriculum");

export default function CurriculumPage() {
  return <SectionPage id="curriculum" />;
}
