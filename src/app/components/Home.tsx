import { useState, useEffect } from "react";
import { Link } from "react-router";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  year: number;
  createdAt: string;
}

export default function Home() {
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [years, setYears] = useState<number[]>([]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchYears();
  }, []);

  useEffect(() => {
    if (selectedYear) {
      fetchArtworks(selectedYear);
    }
  }, [selectedYear]);

  const fetchYears = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81a36db4/years`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setYears(data);
      }
    } catch (error) {
      console.error("Failed to fetch years:", error);
    }
  };

  const fetchArtworks = async (year: number) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81a36db4/artworks/${year}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setArtworks(data);
      }
    } catch (error) {
      console.error("Failed to fetch artworks:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-b border-gray-200">
      {!selectedYear ? (
        // Year Filter - Center below header
        <div className="flex justify-center py-8">
          <div className="flex gap-12">
            {years.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className="text-xl text-gray-400 hover:text-black transition"
              >
                {year}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="flex gap-8">
          {/* Year Filter - Left Sidebar */}
          <div className="w-32 flex-shrink-0">
            <div className="sticky top-12 flex flex-col gap-3">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`text-left px-3 py-2 transition ${
                    selectedYear === year
                      ? "text-black"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="text-center text-gray-400 py-20">
                로딩 중...
              </div>
            ) : artworks.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                작품이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {artworks.map((artwork) => (
                  <Link
                    key={artwork.id}
                    to={`/artwork/${artwork.id}`}
                    className="group"
                  >
                    <div className="aspect-square overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={artwork.imageUrl}
                        alt={artwork.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-1">{artwork.title}</h3>
                    <p className="text-sm text-gray-500">
                      {artwork.year}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {/* Version Display */}
      <div className="fixed bottom-4 left-4 text-[10px] text-gray-300 pointer-events-none">
        v1.0.3
      </div>
    </div>
  );
}