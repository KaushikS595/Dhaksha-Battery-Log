// src/component/AdminDashboard/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";

function AdminDashboard() {
  const navigate = useNavigate();
  const { token, role, signOut } = useAuth();

  const [batteryId, setBatteryId] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const tokenNow = token || localStorage.getItem("bl_token");
    const roleNow = role || localStorage.getItem("bl_role");

    if (!tokenNow) {
      navigate("/");
      return;
    }
    if (roleNow !== "admin") {
      navigate("/");
      return;
    }
  }, [navigate, token, role]);

  const showToast = (text, ms = 2500) => {
    setToast(text);
    setTimeout(() => setToast(null), ms);
  };

  const handleSearch = async () => {
    if (!batteryId.trim()) {
      showToast("Please enter a Battery ID");
      return;
    }

    setLoading(true);
    try {
      const res = await api.get(`/admin/rows/search`, {
        params: { batteryId: batteryId.trim() },
      });

      const rows = Array.isArray(res.data) ? res.data : [];
      setData(rows);
      if (!rows.length) showToast("No data found for that Battery ID");
    } catch (err) {
      console.error("Admin search error:", err?.response?.data || err.message);
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        showToast("Session expired. Redirecting to login...");
        setTimeout(() => {
          signOut?.();
          navigate("/");
        }, 900);
      } else {
        showToast("Error fetching data");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!batteryId.trim()) {
      showToast("Enter a Battery ID before downloading");
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(`/admin/rows/export`, {
        params: { batteryId: batteryId.trim() },
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `battery_${batteryId.trim()}_export.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast("CSV downloaded successfully");
    } catch (err) {
      console.error("Download error:", err?.response?.data || err.message);
      showToast("Error downloading CSV");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    if (signOut) signOut();
    else {
      localStorage.removeItem("bl_token");
      localStorage.removeItem("bl_role");
    }
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-6xl bg-white p-4 sm:p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center mb-4">
          Hey Admin 👋 — enter the Battery ID
        </h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-6 justify-center w-full">
          <input
            type="text"
            value={batteryId}
            onChange={(e) => setBatteryId(e.target.value)}
            placeholder="Enter Battery ID"
            className="border border-gray-300 rounded px-4 py-2 w-full sm:w-64"
          />

          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="bg-yellow-500 text-white px-5 py-2 rounded hover:bg-yellow-600 disabled:opacity-60"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            <button
              onClick={handleDownload}
              disabled={loading}
              className="bg-slate-500 text-white px-5 py-2 rounded hover:bg-slate-700 disabled:opacity-60"
            >
              {loading ? "Downloading..." : "Download CSV"}
            </button>

            <button
              onClick={handleLogout}
              className="bg-black text-white px-5 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {data.length > 0 ? (
            <table className="min-w-full text-sm border border-gray-300">
              <thead className="bg-gray-100 text-gray-700">
                <tr>
                  {Object.keys(data[0]).map((key) => (
                    <th key={key} className="px-3 py-2 border text-left font-semibold whitespace-nowrap">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i} className="odd:bg-white even:bg-gray-50">
                    {Object.keys(data[0]).map((k) => (
                      <td key={k} className="px-3 py-2 border whitespace-nowrap">
                        {row[k] ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">No data to display.</p>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow">
          {toast}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;