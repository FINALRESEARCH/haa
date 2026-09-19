import SectionPage, { sectionMetadata } from "@/components/SectionPage";

export const generateMetadata = () => sectionMetadata("about");

export default function AboutPage() {
  return <SectionPage id="about" />;
}
