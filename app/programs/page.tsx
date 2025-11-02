import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { Program } from "@/types/models";

export default async function ProgramsPage() {
  const { data: programs, error } = await supabase
    .from("programs")
    .select(
      `
      id,
      name,
      details,
      banner,
      brochure,
      universities,
      created_at,
      schools (name),
      school_categories (name)
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching programs:", error);
  }

  return (
    <main className="min-h-screen p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Programs</h1>
        <div className="flex gap-4">
          <Link
            href="/programs/categories/add"
            className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
          >
            + Add Program Category
          </Link>
          <Link
            href="/programs/add"
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            + New Program
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error loading programs. Please try again.
        </div>
      )}

      {!programs || programs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg mb-4">No programs found</p>
          <Link
            href="/programs/add"
            className="inline-block px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Create your first program
          </Link>
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {programs.map((program: Program) => (
                <tr key={program.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {program.name || "Untitled"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/programs/${program.id}/edit`}
                      className="text-green-600 hover:text-green-900"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
