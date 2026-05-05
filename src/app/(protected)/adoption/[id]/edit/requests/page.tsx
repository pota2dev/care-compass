import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RequestTable } from './RequestTable';

interface RequestsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdoptionRequestsPage({ params }: RequestsPageProps) {
  const { id } = await params; 

  const adoptionData = await prisma.adoptionPost.findFirst({
    where: { petId: id },
    include: {
      pet: true,
      requests: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!adoptionData) return notFound();

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Adoption Requests</h1>
          <p className="text-gray-500">
            Review applicants for{" "}
            <span className="font-semibold text-green-600">
              {adoptionData.pet.name}
            </span>
          </p>
        </div>
        <Link
          href={`/adoption/${id}`}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
        >
          Back to Pet
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {adoptionData.requests.length === 0 ? (
          <div className="p-20 text-center">
            <p className="text-gray-400 text-lg">
              No one has applied to adopt this pet yet.
            </p>
          </div>
        ) : (
          <RequestTable requests={adoptionData.requests} petId={id} />
        )}
      </div>
    </div>
  );
}