import ApplicantRow from "@/components/ApplicantRow";
import SectionPage, { sectionMetadata } from "@/components/SectionPage";
import { getSiteContent } from "@/sanity/content";

export const generateMetadata = () => sectionMetadata("admissions");

export default async function AdmissionsPage() {
  const { sections } = await getSiteContent();

  return (
    <>
      <SectionPage id="admissions" />
      {/* The same row as the homepage, by design: the applicants belong on
          this page too, and the component takes its tiles as a prop so both
          places read from one collection. */}
      <section className="flex flex-col items-center gap-[6vh] overflow-hidden py-[12vh]">
        <ApplicantRow applicants={sections.admissions.applicants} />
      </section>
    </>
  );
}
