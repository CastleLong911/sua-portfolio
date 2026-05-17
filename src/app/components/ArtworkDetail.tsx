import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { ArrowLeft } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface Artwork {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  year: number;
  createdAt: string;
}

export default function ArtworkDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [relatedArtworks, setRelatedArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchArtwork(id);
    }
  }, [id]);

  const fetchArtwork = async (artworkId: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81a36db4/artwork/${artworkId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      const data = await response.json();
      if (response.ok) {
        setArtwork(data);
        fetchRelatedArtworks(data.year);
      }
    } catch (error) {
      console.error("Failed to fetch artwork:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedArtworks = async (year: number) => {
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
        setRelatedArtworks(data.filter((a: Artwork) => a.id !== id).slice(0, 3));
      }
    } catch (error) {
      console.error("Failed to fetch related artworks:", error);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!artwork) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-8">작품을 찾을 수 없습니다.</p>
        <Link to="/" className="text-black hover:underline">
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-black transition mb-8"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Image */}
        <div className="aspect-square bg-gray-100 overflow-hidden">
          <img
            src={artwork.imageUrl}
            alt={artwork.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="space-y-6 pt-8">
          <div>
            <h1 className="text-4xl mb-4">{artwork.title}</h1>
            <p className="text-gray-500">{artwork.year}</p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <p className="text-gray-700 leading-relaxed">{artwork.description}</p>
          </div>

          <div className="border-t border-gray-200 pt-6 text-sm text-gray-500">
            <p>작성일: {new Date(artwork.createdAt).toLocaleDateString('ko-KR')}</p>
          </div>
        </div>
      </div>

      {/* Related Artworks */}
      {relatedArtworks.length > 0 && (
        <div className="mt-20 border-t border-gray-200 pt-12">
          <h2 className="text-2xl mb-8">Other Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArtworks.map((relatedArtwork) => (
              <Link
                key={relatedArtwork.id}
                to={`/artwork/${relatedArtwork.id}`}
                className="group"
              >
                <div className="aspect-square overflow-hidden bg-gray-100 mb-4">
                  <img
                    src={relatedArtwork.imageUrl}
                    alt={relatedArtwork.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <h3 className="mb-1">{relatedArtwork.title}</h3>
                <p className="text-sm text-gray-500">{relatedArtwork.year}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
