import { useState } from "react";
import { Link } from "react-router";
import { sampleArtworks } from "../data/sampleData";

export default function Home() {
  const [selectedYear, setSelectedYear] = useState<
    number | null
  >(null);

  const years = Array.from(
    new Set(sampleArtworks.map((a) => a.year)),
  ).sort((a, b) => b - a);

  const filteredArtworks = selectedYear
    ? sampleArtworks.filter((a) => a.year === selectedYear)
    : [];

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
            {filteredArtworks.length === 0 ? (
              <div className="text-center text-gray-400 py-20">
                작품이 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredArtworks.map((artwork) => (
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
    </div>
  );
}