import SectionPage, { sectionMetadata } from "@/components/SectionPage";

export const generateMetadata = () => sectionMetadata("network");

export default function NetworkPage() {
  return <SectionPage id="network" />;
}
