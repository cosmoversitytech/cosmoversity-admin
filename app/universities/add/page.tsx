"use client";

import { useState } from "react";

export default function AddUniversityPage() {
  const [universityName, setUniversityName] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setProfilePicture(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { supabase } = await import("@/lib/supabaseClient");

      let profilePicUrl = null;

      if (profilePicture) {
        const fileExt = profilePicture.name.split(".").pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("universities")
          .upload(fileName, profilePicture);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("universities")
          .getPublicUrl(fileName);

        profilePicUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from("universities").insert([
        {
          name: universityName,
          logo: profilePicUrl,
        },
      ]);

      if (error) throw error;

      alert("University added successfully!");
      setUniversityName("");
      setProfilePicture(null);
    } catch (err: any) {
      console.error("Error adding university:", err.message);
      alert("Failed to add university. Check console for details.");
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New University</h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            htmlFor="universityName"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            University Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={universityName}
            onChange={(e) => setUniversityName(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="profilePicture"
            className="block text-gray-700 text-sm font-semibold mb-2"
          >
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="block w-full text-sm text-gray-700"
          />
          {profilePicture && (
            <p className="text-green-600 text-sm mt-1">
              {profilePicture.name} selected
            </p>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
        >
          Add University
        </button>
      </form>
    </div>
  );
}
