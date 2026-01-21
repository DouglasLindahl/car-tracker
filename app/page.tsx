"use client";

import { useEffect, useState } from "react";
import supabase from "@/supabase";
type Owner = {
  id: string;
  first_name: string;
  last_name: string;
};

//YT9NN1U17MA007500
export default function Home() {
  const [mode, setMode] = useState<"add" | "find">("add");

  // car form
  const [year, setYear] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [vin, setVin] = useState("");

  // owners
  const [owners, setOwners] = useState<Owner[]>([]);
  const [ownerId, setOwnerId] = useState("");

  // ui state
  const [loadingVin, setLoadingVin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // find mode
  const [findMake, setFindMake] = useState("");
  const [findModel, setFindModel] = useState("");
  const [findYear, setFindYear] = useState("");

  const [results, setResults] = useState<any[]>([]);

  /* -------------------- LOAD OWNERS -------------------- */
  useEffect(() => {
    async function loadOwners() {
      const { data } = await supabase.from("owners").select("*");

      console.log(data);
      if (data) setOwners(data);
    }

    loadOwners();
  }, []);

  /* -------------------- VIN LOOKUP -------------------- */
  async function decodeVin() {
    if (vin.length !== 17) {
      setError("VIN must be 17 characters");
      return;
    }

    setLoadingVin(true);
    setError(null);

    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`,
      );
      const data = await res.json();
      const v = data.Results[0];

      setYear(v.ModelYear || "");
      setMake(v.Make || "");
      setModel(v.Model || "");
    } catch {
      setError("Failed to decode VIN");
    } finally {
      setLoadingVin(false);
    }
  }

  /* -------------------- SAVE CAR -------------------- */
  async function addCar() {
    if (!vin || !year || !make || !model || !ownerId) {
      setError("All fields are required");
      return;
    }

    setSaving(true);
    setError(null);

    const { error } = await supabase.from("cars").insert({
      year: Number(year),
      make,
      model,
      vin,
      owner_id: ownerId,
    });

    if (error) {
      setError(error.message);
    } else {
      setYear("");
      setMake("");
      setModel("");
      setVin("");
      setOwnerId("");
      alert("Car added");
    }

    setSaving(false);
  }

  /* -------------------- FIND CARS -------------------- */
  async function searchCars() {
    let query = supabase.from("cars").select(`
    *,
    owners:owner_id (
      *
    )
  `);

    if (findMake) {
      query = query.ilike("make", `%${findMake}%`);
    }

    if (findModel) {
      query = query.ilike("model", `%${findModel}%`);
    }

    if (findYear) {
      query = query.eq("year", Number(findYear));
    }

    const { data, error } = await query;

    if (error) {
      setError(error.message);
    } else {
      setResults(data ?? []);
    }
  }

  /* ==================== UI ==================== */
  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* MODE SWITCH */}
      <div className="flex gap-2">
        <button
          onClick={() => setMode("add")}
          className={`px-4 py-2 border ${
            mode === "add" ? "bg-black text-white" : ""
          }`}
        >
          Add
        </button>
        <button
          onClick={() => setMode("find")}
          className={`px-4 py-2 border ${
            mode === "find" ? "bg-black text-white" : ""
          }`}
        >
          Find
        </button>
      </div>

      {/* ================= ADD ================= */}
      {mode === "add" && (
        <div className="space-y-4 border p-4">
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border p-2"
            />
            <input
              placeholder="Make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="border p-2"
            />
            <input
              placeholder="Model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="border p-2 col-span-2"
            />
          </div>

          {/* VIN + LOOKUP */}
          <div className="flex gap-2">
            <input
              placeholder="VIN"
              value={vin}
              onChange={(e) => setVin(e.target.value.toUpperCase())}
              maxLength={17}
              className="border p-2 flex-1"
            />
            <button
              onClick={decodeVin}
              disabled={loadingVin}
              className="border px-4"
            >
              {loadingVin ? "Searching..." : "Search"}
            </button>
          </div>

          {/* OWNER DROPDOWN */}
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            className="border p-2 w-full"
          >
            <option value="">Select owner</option>
            {owners.map((o) => (
              <option key={o.id} value={o.id}>
                {o.first_name} {o.last_name}
              </option>
            ))}
          </select>

          {error && <p className="text-red-600">{error}</p>}

          <button
            onClick={addCar}
            disabled={saving}
            className="bg-black text-white px-4 py-2 w-full"
          >
            {saving ? "Saving..." : "Add to Database"}
          </button>
        </div>
      )}

      {/* ================= FIND ================= */}
      {mode === "find" && (
        <div className="space-y-4 border p-4">
          <div className="flex gap-2">
            <input
              placeholder="Make"
              value={findMake}
              onChange={(e) => setFindMake(e.target.value)}
              className="border p-2 flex-1"
            />
            <input
              placeholder="Model"
              value={findModel}
              onChange={(e) => setFindModel(e.target.value)}
              className="border p-2 flex-1"
            />
            <input
              placeholder="Year"
              value={findYear}
              onChange={(e) => setFindYear(e.target.value)}
              className="border p-2 flex-1"
            />
            <button onClick={searchCars} className="border px-4">
              Search
            </button>
          </div>

          <div className="space-y-2">
            {results.map((c) => (
              <div key={c.id} className="border p-2">
                <p>
                  {c.year} {c.make} {c.model}
                </p>
                <p className="text-sm text-gray-600">{c.vin}</p>
                <p className="text-sm">
                  Owner: {c.owners?.first_name} {c.owners?.last_name}
                </p>
                <p className="text-sm">Address: {c.owners?.address}</p>
                <p className="text-sm">City: {c.owners?.city}</p>
                <p className="text-sm">State: {c.owners?.state}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
