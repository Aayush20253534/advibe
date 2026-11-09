import { notFound } from "next/navigation";

// Every portal section has its own route; unknown sections are a 404.
export default function SectionPage() {
  notFound();
}
