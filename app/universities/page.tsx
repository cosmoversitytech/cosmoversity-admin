"use client";

export default function UniversitiesPage() {
  const handleAddUniversity = () => {
    window.location.href = "/universities/add";
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Universities</h1>

      <button
        className="mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleAddUniversity}
      >
        Add New University
      </button>

      <p className="text-gray-700">
        This page will display the list of universities and related management
        features.
      </p>
    </div>
  );
}
