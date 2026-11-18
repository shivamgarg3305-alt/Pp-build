import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";
import Navbar from "@/components/Navbar";
import ProjectsCarousel from "@/components/ProjectsCarousel";
import { getProjects } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const projects = await getProjects();

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <ProjectsCarousel projects={projects} />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
