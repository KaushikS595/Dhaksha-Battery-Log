import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import NoAutoFillInput from "../common/NoAutoFillInput";

const initialForm = {
  id: "",
  date: "",
  chargingCycle: "",
  chargeCurrent: "",
  battVoltInitial: "",
  battVoltFinal: "",
  chargeTimeInitial: "",
  chargeTimeFinal: "",
  duration: "",
  capacity: "",
  temp: "",
  deformation: "",
  others: "",
  uin: "",
  name: "",
  // photo removed
};

function UserDashboard() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});

  // Calculate duration when times change
  useEffect(() => {
    const start = form.chargeTimeInitial;
    const end = form.chargeTimeFinal;

    if (start && end) {
      const dur = calculateDuration(start, end);
      setForm((s) => ({ ...s, duration: dur }));
      setErrors((prev) => {
        const next = { ...prev };
        // revalidate duration-related errors if any
        if (next.duration) delete next.duration;
        return next;
      });
    } else {
      // if either time missing, clear duration
      setForm((s) => ({ ...s, duration: "" }));
    }
  }, [form.chargeTimeInitial, form.chargeTimeFinal]);

  // 🧠 Function to calculate duration between hh:mm strings
  const calculateDuration = (startStr, endStr) => {
    // Expecting "HH:MM" (24-hour) format from inputs
    try {
      const [sh, sm] = startStr.split(":").map(Number);
      const [eh, em] = endStr.split(":").map(Number);

      // create Date objects on same day
      const start = new Date(1970, 0, 1, sh, sm, 0);
      let end = new Date(1970, 0, 1, eh, em, 0);

      // if end is earlier than start, assume next day
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }

      const diffMs = end - start;
      const totalMinutes = Math.round(diffMs / (1000 * 60));
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;

      if (hours === 0 && minutes === 0) return "0 mins";
      if (minutes === 0) return `${hours} hours`;
      if (hours === 0) return `${minutes} mins`;
      return `${hours} hours ${minutes} mins`;
    } catch (err) {
      console.error("Error calculating duration:", err);
      return "";
    }
  };

  // Validate all fields
  function validateAll(values) {
    const e = {};
    Object.entries(values).forEach(([key, val]) => {
      if (["others"].includes(key)) return;
      if (!val || String(val).trim() === "") {
        e[key] = "This field is required";
      }
    });

    // Extra numeric validation
    ["chargeCurrent", "battVoltInitial", "battVoltFinal"].forEach((key) => {
      if (values[key] && isNaN(Number(values[key]))) {
        e[key] = "Must be a number";
      }
    }); 

    return e;
  }

  const isValid = () => Object.keys(validateAll(form)).length === 0;

  const showToast = (text, ms = 2500) => {
    setToast(text);
    setTimeout(() => setToast(null), ms);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => {
      const next = { ...s, [name]: value };
      setErrors(validateAll(next));
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateAll(form);
    setErrors(validation);
    if (Object.keys(validation).length) {
      const firstField = Object.keys(validation)[0];
      const el = document.querySelector(`[name="${firstField}"]`);
      if (el) el.focus();
      return;
    }

    try {
      setLoading(true);
      const payload = { ...form }; // no photo field

      await api.post("/rows", payload);
      showToast("Submitted successfully");
      setForm(initialForm);
      setErrors({});
    } catch (err) {
      console.error(err);
      showToast(err?.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field) =>
    `mt-1 block w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 ${
      errors[field]
        ? "border-red-500 ring-red-200 focus:ring-red-400"
        : "border-gray-200"
    }`;

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-center mb-6">
          Battery Charging Log
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
          noValidate
          autoComplete="off"
        >
          {/* Battery ID and Date */}
          <div className="grid grid-cols-2 gap-4">
            <NoAutoFillInput
              label="Battery ID"
              name="id"
              value={form.id}
              onChange={handleChange}
              className={inputCls("id")}
              required
            />
            <NoAutoFillInput
              label="Date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className={inputCls("date")}
              required
            />
          </div>

          {/* Charging Cycle / Charge Current */}
          <div className="grid grid-cols-2 gap-4">
            <NoAutoFillInput
              label="Charging Cycle"
              name="chargingCycle"
              value={form.chargingCycle}
              onChange={handleChange}
              className={inputCls("chargingCycle")}
              required
            />
            <NoAutoFillInput
              label="Charge Current (A)"
              name="chargeCurrent"
              value={form.chargeCurrent}
              onChange={handleChange}
              className={inputCls("chargeCurrent")}
              required
            />
          </div>

          {/* Battery Voltage */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Battery Voltage (V) *
            </div>
            <div className="grid grid-cols-2 gap-4">
              <NoAutoFillInput
                label="Initial"
                name="battVoltInitial"
                value={form.battVoltInitial}
                onChange={handleChange}
                className={inputCls("battVoltInitial")}
                required
              />
              <NoAutoFillInput
                label="Final"
                name="battVoltFinal"
                value={form.battVoltFinal}
                onChange={handleChange}
                className={inputCls("battVoltFinal")}
                required
              />
            </div>
          </div>

          {/* Charge Times */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Charging Time (HH:MM) *
            </div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              [Please enter time in 24-hour format]
            </div>
            <div className="grid grid-cols-3 gap-4">
              <NoAutoFillInput
                label="Initial"
                name="chargeTimeInitial"
                value={form.chargeTimeInitial}
                onChange={handleChange}
                className={inputCls("chargeTimeInitial")}
                required
              />
              <NoAutoFillInput
                label="Final"
                name="chargeTimeFinal"
                value={form.chargeTimeFinal}
                onChange={handleChange}
                className={inputCls("chargeTimeFinal")}
                required
              />
              <NoAutoFillInput
                label="Duration"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className={inputCls("duration")}
                readOnly
              />
            </div>
          </div>

          {/* Drone number, UIN, Name */}
          <div className="grid grid-cols-3 gap-4">
            <NoAutoFillInput
              label="Drone number"
              name="droneno"
              value={form.capacity}
              onChange={handleChange}
              className={inputCls("droneno")}
            />
            <NoAutoFillInput
              label="UIN of UAS"
              name="uin"
              value={form.uin}
              onChange={handleChange}
              className={inputCls("uin")}
            />
            <NoAutoFillInput
              label="Responsible Person (Name)"
              name="name"
              value={form.name}
              onChange={handleChange}
              className={inputCls("name")}
              required
            />
          </div>

          {/* Physical Status */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-2">
              Physical Status *
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div classNmae="flex flex-col">
                <span className="text-base font-semibold text-black mt-1">
                  Temperature *
                </span>
                <select
                  name="temp"
                  value={form.temp}
                  onChange={handleChange}
                  className={inputCls("temp")}
                  required
                >
                  <option value="">Select Temperature</option>
                  <option value="Normal">Normal</option>
                  <option value="Overheat">Overheat</option>
                </select>
                {errors.temp && (
                  <p className="text-red-500 text-xs mt-1">{errors.temp}</p>
                )}
              </div>

              <div className="flex flex-col">
                <span className="text-base font-semibold text-black mt-1">
                  Deformation *
                </span>
                <select
                  name="deformation"
                  value={form.deformation}
                  onChange={handleChange}
                  className={inputCls("deformation")}
                  required
                >
                  <option value="">Select deformation</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                {errors.deformation && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.deformation}
                  </p>
                )}
              </div>

              <NoAutoFillInput
                label="Others (if any)"
                name="others"
                value={form.others}
                onChange={handleChange}
                className={inputCls("others")}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading || !isValid()}
              className={`flex-1 py-2 rounded text-black ${
                loading || !isValid()
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-[#dee11e] hover:bg-slate-500"
              }`}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>

            <button
              type="button"
              onClick={() => {
                signOut();
                navigate("/");
              }}
              className="flex-1 py-2 bg-[#dee11e] text-black rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </form>
      </div>

      {/* Toast popup */}
      {toast && (
        <div className="fixed left-1/2 transform -translate-x-1/2 bottom-8 z-50">
          <div className="bg-black text-white px-4 py-2 rounded shadow">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;

//KAUSHIK.S
