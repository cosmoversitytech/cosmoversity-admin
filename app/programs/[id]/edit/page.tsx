"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
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

interface ProgramData {
  id: number;
  school_id: number | null;
  school_category_id: number | null;
  banner: string | null;
  brochure: string | null;
  universities: string[] | null;
  details: string | null;
}

export default function EditProgramPage() {
  const params = useParams();
  const router = useRouter();
  const programId = params.id as string;

  const [school, setSchool] = useState("");
  const [category, setCategory] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [brochure, setBrochure] = useState<File | null>(null);
  const [currentBannerUrl, setCurrentBannerUrl] = useState<string | null>(null);
  const [currentBrochureUrl, setCurrentBrochureUrl] = useState<string | null>(
    null
  );
  const [partnerUniversities, setPartnerUniversities] = useState<string[]>([]);
  const [programDetails, setProgramDetails] = useState("");
  const [featured, setFeatured] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [categories, setCategories] = useState<SchoolCategory[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch program data
  useEffect(() => {
    const fetchProgram = async () => {
      try {
        const { data, error } = await supabase
          .from("programs")
          .select("*")
          .eq("id", programId)
          .single();

        if (error) {
          console.error("Error fetching program:", error);
          alert("Failed to load program data.");
          return;
        }

        if (data) {
          setSchool(data.school_id?.toString() || "");
          setCategory(data.school_category_id?.toString() || "");
          setCurrentBannerUrl(data.banner);
          setCurrentBrochureUrl(data.brochure);
          setPartnerUniversities(data.universities || []);
          setProgramDetails(data.details || "");
          setFeatured(data.featured || false);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        alert("An unexpected error occurred while loading program data.");
      }
    };

    fetchProgram();
  }, [programId]);

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
      setSubmitting(true);

      let bannerUrl = currentBannerUrl;
      let brochureUrl = currentBrochureUrl;

      // Upload new banner if provided
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

      // Upload new brochure if provided
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

      // Update program data in the database
      const { data, error } = await supabase
        .from("programs")
        .update({
          school_id: school ? parseInt(school) : null,
          school_category_id: category ? parseInt(category) : null,
          banner: bannerUrl,
          brochure: brochureUrl,
          universities: partnerUniversities,
          details: programDetails,
          featured: featured,
        })
        .eq("id", programId)
        .select();

      if (error) {
        console.error("Error updating program:", error);
        alert("Failed to update program. Please try again.");
        return;
      }

      alert("Program updated successfully!");
      router.push("/programs");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Loading program data...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-6">Edit Program</h1>

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
          {currentBannerUrl && !banner && (
            <div className="mb-2">
              <p className="text-xs text-gray-500 mb-1">Current banner:</p>
              <img
                src={currentBannerUrl}
                alt="Current banner"
                className="w-full max-w-md h-32 object-cover rounded border"
              />
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleBannerChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
          {banner && (
            <p className="text-xs text-gray-500 mt-1">
              New file selected: {banner.name}
            </p>
          )}
        </div>

        {/* Brochure (PDF uploader) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Brochure
          </label>
          {currentBrochureUrl && !brochure && (
            <div className="mb-2">
              <p className="text-xs text-gray-500">
                Current brochure:{" "}
                <a
                  href={currentBrochureUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View PDF
                </a>
              </p>
            </div>
          )}
          <input
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleBrochureChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
          {brochure && (
            <p className="text-xs text-gray-500 mt-1">
              New file selected: {brochure.name}
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
                <option key={uni.id} value={uni.id.toString()}>
                  {uni.name}
                </option>
              ))
            )}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl (Cmd on Mac) to select multiple universities
          </p>
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

        {/* Featured (Checkbox) */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="featured"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label
            htmlFor="featured"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Mark as Featured
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.push("/programs")}
            className="flex-1 bg-gray-500 text-white font-semibold py-2 rounded-md hover:bg-gray-600 transition"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white font-semibold py-2 rounded-md hover:bg-blue-700 transition disabled:bg-blue-400"
            disabled={submitting}
          >
            {submitting ? "Updating..." : "Update Program"}
          </button>
        </div>
      </form>
    </main>
  );
}
