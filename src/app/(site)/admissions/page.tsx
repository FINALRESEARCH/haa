import SectionPage, { sectionMetadata } from "@/components/SectionPage";

export const generateMetadata = () => sectionMetadata("admissions");

export default function AdmissionsPage() {
  return <SectionPage id="admissions" />;
}
