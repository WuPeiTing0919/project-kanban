import { mockProjects } from "@/lib/mock-data";
import ProjectEditClient from "./ProjectEditClient";

export function generateStaticParams() {
  return mockProjects.map((p) => ({ id: p.id }));
}

export default function ProjectEditPage() {
  return <ProjectEditClient />;
}
