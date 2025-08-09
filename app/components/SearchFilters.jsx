// FAYL: /app/components/SearchFilters.jsx (DÜZƏLDİLMİŞ)
"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import CustomSelect from "./CustomSelect.jsx";

const equipmentList = [
  { key: "has_alloy_wheels", label: "Yüngül lehimli disklər" },
  { key: "has_abs", label: "ABS" },
  { key: "has_sunroof", label: "Lyuk" },
  { key: "has_rain_sensor", label: "Yağış sensoru" },
  { key: "has_central_locking", label: "Mərkəzi qapanma" },
  { key: "has_park_assist", label: "Park radarı" },
  { key: "has_ac", label: "Kondisioner" },
  { key: "has_heated_seats", label: "Oturacaqların isidilməsi" },
  { key: "has_leather_seats", label: "Dəri salon" },
  { key: "has_xenon_lights", label: "Ksenon lampalar" },
  { key: "has_360_camera", label: "360° kamera" },
  { key: "has_rear_camera", label: "Arxa görüntü kamerası" },
  { key: "has_side_curtains", label: "Yan pərdələr" },
  { key: "has_ventilated_seats", label: "Oturacaqların ventilyasiyası" },
];
const ToggleButton = ({ isActive, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 px-2 py-1.5 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-[#4F39F6] text-white shadow"
        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
    }`}
  >
    {children}
  </button>
);

export default function SearchFilters({ filterOptions, newTodayCount }) {
  const router = useRouter();

  const [brandId, setBrandId] = useState("");
  const [model, setModel] = useState("");
  const [city, setCity] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [bodyType, setBodyType] = useState("");
  const [color, setColor] = useState("");
  const [credit, setCredit] = useState(false);
  const [barter, setBarter] = useState(false);
  const [equipment, setEquipment] = useState({});

  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [condition, setCondition] = useState("Hamısı");

  useEffect(() => {
    const fetchModels = async () => {
      if (!brandId) {
        setModels([]);
        setModel("");
        return;
      }
      setIsLoadingModels(true);
      try {
        const response = await fetch(`/api/models?brand_id=${brandId}`);
        const data = await response.json();
        setModels(data || []);
      } catch (error) {
        console.error("Modelləri çəkmək mümkün olmadı:", error);
        setModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, [brandId]);

  const handleEquipmentChange = (key) => {
    setEquipment((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleNumericInputChange = (value, setter) => {
    const numericRegex = /^\d*$/;
    if (numericRegex.test(value)) {
      setter(value);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    const selectedBrand = filterOptions.brands.find(
      (b) => b.id === parseInt(brandId, 10)
    );
    if (selectedBrand) params.set("brand", selectedBrand.name);
    if (model) params.set("model", model);
    if (city) params.set("city", city);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (minYear) params.set("minYear", minYear);
    if (maxYear) params.set("maxYear", maxYear);
    if (bodyType) params.set("bodyType", bodyType);
    if (color) params.set("color", color);
    if (credit) params.set("credit", "true");
    if (barter) params.set("barter", "true");
    if (condition === "Yeni") params.set("condition", "new");
    if (condition === "Sürülmüş") params.set("condition", "used");
    Object.keys(equipment).forEach((key) => {
      if (equipment[key]) {
        params.set(key, "true");
      }
    });
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const clearFilters = () => {
    setBrandId("");
    setModel("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    setMinYear("");
    setMaxYear("");
    setBodyType("");
    setColor("");
    setCredit(false);
    setBarter(false);
    setEquipment({});
    setCondition("Hamısı");
    setModels([]); 

    router.push("/", { scroll: false });
  };

  const brandOptions = filterOptions.brands.map((b) => ({
    value: b.id,
    label: b.name,
  }));
  const modelOptions = models.map((m) => ({ value: m.name, label: m.name }));
  const cityOptions = filterOptions.cities.map((c) => ({ value: c, label: c }));
  const bodyTypeOptions = filterOptions.bodyTypes.map((bt) => ({
    value: bt,
    label: bt,
  }));
  const colorOptions = filterOptions.colors.map((c) => ({
    value: c.name,
    label: c.name,
    hex: c.hex_code,
  }));

  return (
    <div className="glass gradient-border p-4 rounded-xl shadow-2xl border border-white/20 fade-in-up">
      <form onSubmit={handleSearch} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <CustomSelect
            options={brandOptions}
            value={brandId}
            onChange={setBrandId}
            placeholder="Marka"
          />
          <CustomSelect
            options={modelOptions}
            value={model}
            onChange={setModel}
            placeholder={isLoadingModels ? "Yüklənir..." : "Model"}
            disabled={!brandId || isLoadingModels}
          />
          <div className="bg-gray-100 border border-gray-200 rounded-md flex items-center p-1">
            <ToggleButton
              isActive={condition === "Hamısı"}
              onClick={() => setCondition("Hamısı")}
            >
              Hamısı
            </ToggleButton>
            <ToggleButton
              isActive={condition === "Yeni"}
              onClick={() => setCondition("Yeni")}
            >
              Yeni
            </ToggleButton>
            <ToggleButton
              isActive={condition === "Sürülmüş"}
              onClick={() => setCondition("Sürülmüş")}
            >
              Sürülmüş
            </ToggleButton>
          </div>
          <CustomSelect
            options={cityOptions}
            value={city}
            onChange={setCity}
            placeholder="Şəhər"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="9"
              value={minPrice}
              onChange={(e) =>
                handleNumericInputChange(e.target.value, setMinPrice)
              }
              className="w-full px-3 py-2 text-gray-900 bg-gray-100 border border-gray-200 rounded-md"
              placeholder="Qiymət, min."
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="9"
              value={maxPrice}
              onChange={(e) =>
                handleNumericInputChange(e.target.value, setMaxPrice)
              }
              className="w-full px-3 py-2 text-gray-900 bg-gray-100 border border-gray-200 rounded-md"
              placeholder="maks."
            />
          </div>
          <div className="flex items-center justify-around p-2 border border-gray-200 rounded-md bg-gray-100 h-full">
            <span className="text-sm font-semibold text-gray-700">AZN</span>
            <div className="border-l border-gray-300 h-full mx-2"></div>
            <label className="flex items-center text-sm cursor-pointer text-gray-700">
              <input
                type="checkbox"
                checked={credit}
                onChange={(e) => setCredit(e.target.checked)}
                className="mr-1.5 h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
              />
              Kredit
            </label>
            <div className="border-l border-gray-300 h-full mx-2"></div>
            <label className="flex items-center text-sm cursor-pointer text-gray-700">
              <input
                type="checkbox"
                checked={barter}
                onChange={(e) => setBarter(e.target.checked)}
                className="mr-1.5 h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
              />
              Barter
            </label>
          </div>
          <CustomSelect
            options={bodyTypeOptions}
            value={bodyType}
            onChange={setBodyType}
            placeholder="Ban növü"
          />
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="4"
              value={minYear}
              onChange={(e) =>
                handleNumericInputChange(e.target.value, setMinYear)
              }
              className="w-full px-3 py-2 text-gray-900 bg-gray-100 border border-gray-200 rounded-md"
              placeholder="İl, min."
            />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength="4"
              value={maxYear}
              onChange={(e) =>
                handleNumericInputChange(e.target.value, setMaxYear)
              }
              className="w-full px-3 py-2 text-gray-900 bg-gray-100 border border-gray-200 rounded-md"
              placeholder="maks."
            />
          </div>
        </div>

        {showMore && (
          <div className="border-t border-gray-200 pt-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <CustomSelect
                options={colorOptions}
                value={color}
                onChange={setColor}
                placeholder="Rəng"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                Avtomobilin təchizatı
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {equipmentList.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center text-sm text-gray-700 cursor-pointer p-2 rounded-md hover:bg-gray-100"
                  >
                    <input
                      type="checkbox"
                      checked={!!equipment[item.key]}
                      onChange={() => handleEquipmentChange(item.key)}
                      className="h-4 w-4 rounded border-gray-300 text-[#4F39F6] focus:ring-[#4F39F6]"
                    />
                    <span className="ml-2">{item.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row justify-between items-center pt-2">
          <span className="text-sm text-gray-500">
            Bu gün:{" "}
            <span className="font-semibold text-gray-700">
              {newTodayCount} yeni elan
            </span>
          </span>
          <div className="flex flex-col mb-4 sm:flex-row  items-center gap-4">
            <button
              type="button"
              onClick={clearFilters}
              className="text-sm text-gray-600 hover:text-red-600 font-medium hover-lift"
            >
              Sıfırla
            </button>
            <button
              type="button"
              onClick={() => setShowMore(!showMore)}
              className="text-sm font-medium text-[#4F39F6] hover:underline hover-lift"
            >
              {showMore ? "Daha az filtr" : "Daha çox filtr"}
            </button>
            <button
              type="submit"
              style={{ backgroundColor: "#4F39F6" }}
              className="px-8 py-2.5 text-sm font-semibold text-white rounded-md hover:opacity-90 transition-opacity btn-3d"
            >
              Elanları göstər
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
