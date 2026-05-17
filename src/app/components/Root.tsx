import { Outlet, Link, useNavigate } from "react-router";
import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { projectId, publicAnonKey } from "/utils/supabase/info";

export default function Root() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = localStorage.getItem("isLoggedIn") === "true";
    setIsLoggedIn(loggedIn);
  }, []);

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (accessToken) {
        await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-81a36db4/logout`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("isLoggedIn");
      setIsLoggedIn(false);
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-center items-center relative">
            <Link to="/" className="text-2xl tracking-tight">
              My Portfolio
            </Link>
            <nav className="absolute right-0 flex items-center gap-6">
              {isLoggedIn ? (
                <>
                  <Link to="/upload" className="text-gray-600 hover:text-black transition">
                    Upload
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-gray-600 hover:text-black transition"
                  >
                    <LogOut size={18} />
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="text-gray-600 hover:text-black transition">
                  Login
                </Link>
              )}
            </nav>
          </div>
        </div>
      </header>
      <main>
        <Outlet context={{ isLoggedIn, setIsLoggedIn }} />
      </main>
    </div>
  );
}
