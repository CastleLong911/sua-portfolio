import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router";
import { projectId, publicAnonKey } from "/utils/supabase/info";

interface OutletContext {
  setIsLoggedIn: (value: boolean) => void;
}

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setIsLoggedIn } = useOutletContext<OutletContext>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-81a36db4/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ username, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "로그인에 실패했습니다.");
        setLoading(false);
        return;
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("isLoggedIn", "true");
      setIsLoggedIn(true);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-3xl mb-8">Login</h1>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="username" className="block text-sm mb-2 text-gray-700">
            아이디
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition"
            required
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm mb-2 text-gray-700">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:border-black transition"
            required
            disabled={loading}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? "로그인 중..." : "Login"}
        </button>
      </form>
    </div>
  );
}
