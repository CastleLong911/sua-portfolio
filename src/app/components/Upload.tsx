import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Upload as UploadIcon } from "lucide-react";

export default function Upload() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [navigate]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 샘플 업로드 (실제로는 백엔드에 저장 필요)
    alert("작품이 업로드되었습니다! (샘플 모드)");
    navigate("/");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl mb-8">Upload Artwork</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Image Upload */}
        <div>
          <label className="block text-sm mb-3 text-gray-700">Image</label>
          {imagePreview ? (
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => setImagePreview(null)}
                className="absolute top-4 right-4 bg-white px-4 py-2 text-sm hover:bg-gray-100 transition"
              >
                Change
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-gray-300 cursor-pointer hover:border-gray-400 transition">
              <UploadIcon size={48} className="text-gray-400 mb-4" />
              <span className="text-gray-500">Click to upload image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                required
              />
            </label>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm mb-3 text-gray-700">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm mb-3 text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition resize-none"
            required
          />
        </div>

        {/* Year */}
        <div>
          <label htmlFor="year" className="block text-sm mb-3 text-gray-700">
            Year
          </label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            min={1900}
            max={2100}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-black text-white py-3 hover:bg-gray-800 transition"
          >
            Upload
          </button>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-8 py-3 border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
