import { mockProjects } from "@/lib/mock-data";
import ProjectDetailClient from "./ProjectDetailClient";

export function generateStaticParams() {
  return mockProjects.map((p) => ({ id: p.id }));
}

export default function ProjectDetailPage() {
  return <ProjectDetailClient />;
}
