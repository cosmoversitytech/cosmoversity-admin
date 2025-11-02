"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import RichTextEditor from "@/components/RichTextEditor";

interface School {
  id: number;
  name: string;
  head_of_school: string | null;
  welcome_message: string | null;
  profile_picture: string | null;
  school_offerings: string[] | null;
  created_at: string;
}

interface SchoolCategory {
  id: number;
  name: string;
  school_id: number | null;
  created_at: string;
}

interface University {
  id: number;
  name: string;
  logo: string | null;
  created_at: string;
}

export default function AddProgramPage() {
  const [school, setSchool] = useState("");
  const [category, setCategory] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [brochure, setBrochure] = useState<File | null>(null);
  const [partnerUniversities, setPartnerUniversities] = useState<string[]>([]);
  const [programDetails, setProgramDetails] = useState("");
  const [schools, setSchools] = useState<School[]>([]);
  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);

  // Fetch schools from Supabase
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("schools")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching schools:", error);
        } else {
          setSchools(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Fetch categories when school is selected
  useEffect(() => {
    const fetchCategories = async () => {
      if (!school) {
        setCategories([]);
        setCategory("");
        return;
      }

      try {
        setLoadingCategories(true);
        const { data, error } = await supabase
          .from("school_categories")
          .select("*")
          .eq("school_id", school)
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
        } else {
          setCategories(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [school]);

  // Fetch universities from Supabase
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoadingUniversities(true);
        const { data, error } = await supabase
          .from("universities")
          .select("*")
          .order("name", { ascending: true });

        if (error) {
          console.error("Error fetching universities:", error);
        } else {
          setUniversities(data || []);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
      } finally {
        setLoadingUniversities(false);
      }
    };

    fetchUniversities();
  }, []);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setBanner(file);
  };

  const handleBrochureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    setBrochure(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      let bannerUrl = null;
      let brochureUrl = null;

      // Upload banner if provided
      if (banner) {
        const bannerFileName = `${Date.now()}_${banner.name}`;
        const { data: bannerData, error: bannerError } = await supabase.storage
          .from("program-banners")
          .upload(bannerFileName, banner);

        if (bannerError) {
          console.error("Error uploading banner:", bannerError);
          alert("Failed to upload banner. Please try again.");
          return;
        }

        // Get public URL for the banner
        const { data: bannerPublicData } = supabase.storage
          .from("program-banners")
          .getPublicUrl(bannerFileName);

        bannerUrl = bannerPublicData.publicUrl;
      }

      // Upload brochure if provided
      if (brochure) {
        const brochureFileName = `${Date.now()}_${brochure.name}`;
        const { data: brochureData, error: brochureError } =
          await supabase.storage
            .from("program-brochures")
            .upload(brochureFileName, brochure);

        if (brochureError) {
          console.error("Error uploading brochure:", brochureError);
          alert("Failed to upload brochure. Please try again.");
          return;
        }

        // Get public URL for the brochure
        const { data: brochurePublicData } = supabase.storage
          .from("program-brochures")
          .getPublicUrl(brochureFileName);

        brochureUrl = brochurePublicData.publicUrl;
      }

      // Insert program data into the database
      const { data, error } = await supabase
        .from("programs")
        .insert({
          school_id: school ? parseInt(school) : null,
          school_category_id: category ? parseInt(category) : null,
          banner: bannerUrl,
          brochure: brochureUrl,
          universities: partnerUniversities,
          details: programDetails,
        })
        .select();

      if (error) {
        console.error("Error inserting program:", error);
        alert("Failed to create program. Please try again.");
        return;
      }

      alert("Program created successfully!");

      // Reset form
      setSchool("");
      setCategory("");
      setBanner(null);
      setBrochure(null);
      setPartnerUniversities([]);
      setProgramDetails("");

      // Reset file inputs
      const bannerInput = document.querySelector(
        'input[type="file"][accept="image/*"]'
      ) as HTMLInputElement;
      const brochureInput = document.querySelector(
        'input[type="file"][accept=".pdf,application/pdf"]'
      ) as HTMLInputElement;
      if (bannerInput) bannerInput.value = "";
      if (brochureInput) brochureInput.value = "";
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">Add New Program</h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6 flex flex-col gap-4"
      >
        {/* Schools (Dropdown) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            School
          </label>
          <select
            value={school}
            onChange={(e) => setSchool(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            disabled={loading}
          >
            <option value="">
              {loading ? "Loading schools..." : "Select a School"}
            </option>
            {schools.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category (Dropdown) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2"
            disabled={!school || loadingCategories}
          >
            <option value="">
              {!school
                ? "Select a school first"
                : loadingCategories
                ? "Loading categories..."
                : categories.length === 0
                ? "No categories available"
                : "Select a Category"}
            </option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Banner (Image uploader) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Banner
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
          {banner && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {banner.name}
            </p>
          )}
        </div>

        {/* Brochure (PDF uploader) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brochure
          </label>
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleBrochureChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
          {brochure && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {brochure.name}
            </p>
          )}
        </div>

        {/* Partner Universities (Multi Select Dropdown) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Partner Universities
          </label>
          <select
            multiple
            value={partnerUniversities}
            onChange={(e) =>
              setPartnerUniversities(
                Array.from(e.target.selectedOptions, (option) => option.value)
              )
            }
            className="w-full border border-gray-300 rounded-md p-2 h-32"
            disabled={loadingUniversities}
          >
            {loadingUniversities ? (
              <option disabled>Loading universities...</option>
            ) : universities.length === 0 ? (
              <option disabled>No universities available</option>
            ) : (
              universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Program Details (Rich Text Editor) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Program Details
          </label>
          <RichTextEditor
            content={programDetails}
            onChange={setProgramDetails}
            placeholder="Enter detailed information about the program..."
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition"
        >
          Submit
        </button>
      </form>
    </main>
  );
}
