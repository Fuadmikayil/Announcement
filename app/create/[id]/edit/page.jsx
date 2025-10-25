// FAYL: /app/profil/edit/[id]/edit/page.js

"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useSearchParams, useParams, notFound } from "next/navigation";
import { createClient } from "../../../../lib/supabase/client";
import Image from "next/image";
import CustomSelect from "../../../components/CustomSelect.jsx";
import { updateListing, deleteImage } from "./actions";

// --- SVG Icons ---
const Trash2 = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);
const UploadCloud = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
    <path d="M12 12v9" />
    <path d="m16 16-4-4-4 4" />
  </svg>
);
const X = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

export default function EditListingPage() {
  const params = useParams();
  const supabase = createClient();
  const searchParams = useSearchParams();

  const [listing, setListing] = useState(null);
  const [formData, setFormData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState(searchParams.get("message") || "");
  const [newImages, setNewImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [formOptions, setFormOptions] = useState({
    brands: [],
    cities: [],
    bodyTypes: [],
    colors: [],
  });
  const [models, setModels] = useState([]); // Ensure models is initialized as an array
  const [isLoadingModels, setIsLoadingModels] = useState(false);
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

  // NEW: signed URLs for existing images (preview only)
  const [signedExistingImages, setSignedExistingImages] = useState([]);

  // NEW: external delete form refs (avoid nested forms)
  const deleteFormRef = useRef(null);
  const deleteListingIdRef = useRef(null);
  const deleteImageUrlRef = useRef(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        console.error(
          "Authentication Error:",
          authError?.message || "User not authenticated"
        );
        window.location.href = "/login";
        return;
      }

      const listingId = params.id;
      if (!listingId) {
        notFound();
        return;
      }

      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();
      if (listingError || !listingData) {
        console.error(
          "Error fetching listing data:",
          listingError?.message || "Listing not found"
        );
        notFound();
        return;
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      const isUserAdmin = profileData?.role === "admin";
      const isUserOwner = listingData.user_id === user.id;

      if (!isUserAdmin && !isUserOwner) {
        setAuthError("Sizin bu əməliyyatı yerinə yetirməyə icazəniz yoxdur.");
        setLoading(false);
        return;
      }

      const [brandsRes, citiesRes, bodyTypesRes, colorsRes] = await Promise.all(
        [
          supabase
            .from("brands")
            .select("id, name")
            .order("name", { ascending: true }),
          supabase
            .from("cities")
            .select("name")
            .order("name", { ascending: true }),
          supabase
            .from("body_types")
            .select("name")
            .order("name", { ascending: true }),
          supabase.from("colors").select("name, hex_code").order("id"),
        ]
      );

      setFormOptions({
        brands: brandsRes.data || [],
        cities: citiesRes.data?.map((c) => c.name) || [],
        bodyTypes: bodyTypesRes.data?.map((bt) => bt.name) || [],
        colors: colorsRes.data || [],
      });

      setListing(listingData);
      setFormData({
        ...listingData,
        brand:
          brandsRes.data.find((b) => b.name === listingData.brand)?.id || "",
      });

      // NEW: sign existing image URLs for preview
      if (
        Array.isArray(listingData.image_urls) &&
        listingData.image_urls.length > 0
      ) {
        try {
          const signed = await Promise.all(
            listingData.image_urls.map(async (u) => {
              try {
                const path = new URL(u).pathname.split("/listings-images/")[1];
                if (!path) return u;
                const { data: signed } = await supabase.storage
                  .from("listings-images")
                  .createSignedUrl(path, 3600);
                return signed?.signedUrl || u;
              } catch {
                return u;
              }
            })
          );
          setSignedExistingImages(signed);
        } catch {
          setSignedExistingImages(listingData.image_urls);
        }
      } else {
        setSignedExistingImages([]);
      }

      setIsAdmin(isUserAdmin);
      setLoading(false);
    };

    fetchInitialData();
  }, [params.id, supabase]);

  useEffect(() => {
    const fetchModels = async () => {
      if (!formData?.brand) {
        setModels([]); // Reset models to an empty array if no brand is selected
        return;
      }
      setIsLoadingModels(true);
      try {
        const response = await fetch(`/api/models?brand_id=${formData.brand}`);
        const data = await response.json();
        setModels(Array.isArray(data) ? data : []); // Ensure data is an array
      } catch (error) {
        console.error("Error fetching models:", error.message);
        setModels([]); // Reset models to an empty array on error
      } finally {
        setIsLoadingModels(false);
      }
    };
    fetchModels();
  }, [formData?.brand]);

  useEffect(() => {
    return () => previews.forEach((url) => URL.revokeObjectURL(url));
  }, [previews]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
      if (name === "model") {
        console.log("Model updated in formData:", updatedFormData.model); // Log the updated model value
      }
      return updatedFormData;
    });
  };

  const handleModelChange = (value) => {
    setFormData((prev) => {
      console.log("Model selected:", value); // Log the selected model value
      return { ...prev, model: value };
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const handleRemoveNewImage = (index) => {
    setNewImages((current) => current.filter((_, i) => i !== index));
    setPreviews((current) => current.filter((_, i) => i !== index));
  };

  // NEW: submit delete via external hidden form
  const handleClickDeleteImage = (imageUrl) => {
    if (!deleteFormRef.current) return;
    if (deleteListingIdRef.current)
      deleteListingIdRef.current.value = listing.id;
    if (deleteImageUrlRef.current) deleteImageUrlRef.current.value = imageUrl;
    if (typeof deleteFormRef.current.requestSubmit === "function") {
      deleteFormRef.current.requestSubmit();
    } else {
      deleteFormRef.current.submit();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const submissionFormData = new FormData(event.currentTarget);

    // Ensure fields from CustomSelects are submitted
    const selectedBrandName =
      formOptions.brands.find((b) => b.id === formData.brand)?.name || "";

    submissionFormData.set("brand", selectedBrandName);
    submissionFormData.set("model", formData.model || "");
    submissionFormData.set("body_type", formData.body_type || "");
    submissionFormData.set("color", formData.color || "");
    submissionFormData.set("city", formData.city || "");

    newImages.forEach((file) => {
      submissionFormData.append("new_images", file);
    });
    startTransition(async () => {
      const { error } = await updateListing(submissionFormData);
      if (!error) {
        setMessage("Dəyişikliklər uğurla yadda saxlanıldı.");
        setNewImages([]);
        setPreviews([]);
      } else {
        console.error("Error updating listing:", error.message);
        setMessage("Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.");
      }
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4 text-center text-gray-600">
        Yüklənir...
      </div>
    );
  }

  if (authError) {
    return (
      <div className="container mx-auto max-w-4xl py-12 px-4 text-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative"
          role="alert"
        >
          <strong className="font-bold">Xəta! </strong>
          <span className="block sm:inline">{authError}</span>
        </div>
      </div>
    );
  }

  if (!listing || !formData) {
    return null;
  }

  const brandOptions = formOptions.brands.map((b) => ({
    value: b.id,
    label: b.name,
  }));
  const modelOptions = models.map((m) => ({ value: m.name, label: m.name }));
  const cityOptions = formOptions.cities.map((c) => ({ value: c, label: c }));
  const bodyTypeOptions = formOptions.bodyTypes.map((bt) => ({
    value: bt,
    label: bt,
  }));
  const colorOptions = formOptions.colors.map((c) => ({
    value: c.name,
    label: c.name,
    hex: c.hex_code,
  }));

  return (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          Elanı Redaktə Et
        </h1>

        {message && (
          <p className="mb-4 text-center p-2 rounded-md bg-gray-100 text-gray-700">
            {message}
          </p>
        )}

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <input type="hidden" name="listingId" value={listing.id} />
          {/* Hidden inputs to ensure CustomSelect values are included in FormData */}
          <input
            type="hidden"
            name="brand"
            value={
              formOptions.brands.find((b) => b.id === formData.brand)?.name ||
              ""
            }
          />
          <input type="hidden" name="model" value={formData.model || ""} />
          <input
            type="hidden"
            name="body_type"
            value={formData.body_type || ""}
          />
          <input type="hidden" name="color" value={formData.color || ""} />
          <input type="hidden" name="city" value={formData.city || ""} />

          {/* Mövcud şəkillər */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Mövcud Şəkillər
            </label>
            {Array.isArray(listing.image_urls) &&
            listing.image_urls.length > 0 ? (
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {listing.image_urls.map((url, i) => (
                  <div key={i} className="relative group">
                    <Image
                      src={signedExistingImages[i] || url}
                      alt={`Image ${i + 1}`}
                      width={150}
                      height={150}
                      className="rounded-md object-cover w-full h-28"
                    />
                    {/* REPLACED nested form with a button that submits external form */}
                    {/* Keep original URL for delete action */}
                    <button
                      type="button"
                      onClick={() => handleClickDeleteImage(url)}
                      title="Sil"
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 width="16" height="16" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">Mövcud şəkil yoxdur.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Marka
            </label>
            <CustomSelect
              options={brandOptions}
              value={formData.brand}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, brand: value, model: "" }))
              }
              placeholder="Marka seçin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Model
            </label>
            <CustomSelect
              options={modelOptions}
              value={formData.model}
              onChange={handleModelChange}
              placeholder={isLoadingModels ? "Yüklənir..." : "Model seçin"}
              disabled={!formData.brand || isLoadingModels}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Ban növü
            </label>
            <CustomSelect
              options={bodyTypeOptions}
              value={formData.body_type}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, body_type: value }))
              }
              placeholder="Ban növü seçin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Rəng
            </label>
            <CustomSelect
              options={colorOptions}
              value={formData.color}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, color: value }))
              }
              placeholder="Rəng seçin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Şəhər
            </label>
            <CustomSelect
              options={cityOptions}
              value={formData.city}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, city: value }))
              }
              placeholder="Şəhər seçin"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Qiymət
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Yürüş
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Mühərrik həcmi
            </label>
            <input
              type="number"
              name="engine_volume"
              value={formData.engine_volume}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Buraxılış ili
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Əlavə Məlumat
            </label>
            <textarea
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <h3 className="text-lg font-medium mb-2 text-gray-700">
              Avtomobilin Əlavə Xüsusiyyətləri
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {equipmentList.map((item) => (
                <label key={item.key} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name={item.key}
                    checked={!!formData[item.key]} // mövcud məlumatları göstərmək üçün
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        [item.key]: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                  />
                  <span className="text-gray-700 text-sm">{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">
              Yeni Şəkillər Əlavə Et
            </label>
            <label
              htmlFor="new_images_input"
              className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <UploadCloud className="w-8 h-8 text-gray-400 mb-2" />
              <span className="text-sm font-semibold text-gray-600">
                Şəkil seçin
              </span>
              <input
                type="file"
                name="new_images_input"
                id="new_images_input"
                multiple
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="sr-only"
              />
            </label>
            {previews.length > 0 && (
              <div className="mt-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {previews.map((src, i) => (
                  <div key={i} className="relative group">
                    <Image
                      src={src}
                      alt={`Preview ${i}`}
                      width={150}
                      height={150}
                      className="rounded-md object-cover w-full h-28"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(i)}
                      className="absolute top-1 right-1 bg-black bg-opacity-60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="md:col-span-2">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700"
              >
                Elanın Statusu (Admin)
              </label>
              <select
                name="status"
                id="status"
                required
                value={formData.status}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm text-gray-900"
              >
                <option value="pending">Gözləmədə</option>
                <option value="approved">Təsdiqlənib</option>
                <option value="rejected">Rədd edilib</option>
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={isPending}
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isPending ? "Yadda saxlanılır..." : "Dəyişiklikləri Yadda Saxla"}
            </button>
          </div>
        </form>

        {/* NEW: Hidden external form for deleteImage to avoid nested forms */}
        <form action={deleteImage} ref={deleteFormRef} className="hidden">
          <input type="hidden" name="listingId" ref={deleteListingIdRef} />
          <input type="hidden" name="imageUrl" ref={deleteImageUrlRef} />
        </form>
      </div>
    </div>
  );
}
