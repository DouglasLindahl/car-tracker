"use client";

import { useState } from "react";

export default function Home() {
  const [vin, setVin] = useState("");
  const [vehicle, setVehicle] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  {
    /* 
  car
year make model owner vin

owner
full name
phone number
address
email

YT9NN1U17MA007500
  */
  }

  async function decodeVin() {
    if (vin.length !== 17) {
      setError("VIN must be 17 characters");
      return;
    }

    setLoading(true);
    setError(null);
    setVehicle(null);

    try {
      const res = await fetch(
        `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValuesExtended/${vin}?format=json`,
      );
      const data = await res.json();
      console.log(data);
      setVehicle(data.Results[0]);
    } catch (err) {
      setError("Failed to fetch VIN data");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <input
        type="text"
        value={vin}
        onChange={(e) => setVin(e.target.value.toUpperCase())}
        placeholder="..."
        className="border p-2 w-full"
        maxLength={17}
      />

      <button
        onClick={decodeVin}
        className="bg-black text-white px-4 py-2"
        disabled={loading}
      >
        {loading ? "Decoding..." : "test"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {vehicle && (
        <div className="border p-4 space-y-1">
          <p>
            <strong>Year:</strong> {vehicle.ModelYear}
          </p>
          <p>
            <strong>Make:</strong> {vehicle.Make}
          </p>
          <p>
            <strong>Model:</strong> {vehicle.Model}
          </p>
          <p>
            <strong>Trim:</strong> {vehicle.Trim}
          </p>
          <p>
            <strong>Body:</strong> {vehicle.BodyClass}
          </p>
          <p>
            <strong>Engine:</strong> {vehicle.EngineCylinders} cyl
          </p>
          <p>
            <strong>Fuel:</strong> {vehicle.FuelTypePrimary}
          </p>
          <p>
            <strong>Plant:</strong> {vehicle.PlantCountry}
          </p>
        </div>
      )}
    </div>
  );
}
