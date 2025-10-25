// FAYL: /app/profil/edit/[id]/edit/action.js

"use server";
import { createClient } from "../../../../lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateListing(formData) {
  const listingId = formData.get("listingId");

  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData?.user) {
      console.error(
        "Authentication Error:",
        authError?.message || "User not authenticated"
      );
      redirect("/login");
    }
    const user = authData.user;

    if (!listingId) {
      console.error("Error: Listing ID not found in formData");
      throw new Error("listing_id_not_found");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const { data: listing } = await supabase
      .from("listings")
      .select("user_id, image_urls, status")
      .eq("id", listingId)
      .single();

    if (!listing) {
      throw new Error("listing_not_found");
    }

    const isAdmin = profile?.role === "admin";
    const isOwner = listing?.user_id === user.id;

    if (!isAdmin && !isOwner) {
      throw new Error("unauthorized_operation");
    }

    console.log("Form Data Values:", {
      brand: formData.get("brand"),
      model: formData.get("model"), // Log the model value
      year: formData.get("year"),
      price: formData.get("price"),
      mileage: formData.get("mileage"),
      engine_volume: formData.get("engine_volume"),
      color: formData.get("color"),
      description: formData.get("description"),
      city: formData.get("city"),
      status: formData.get("status"),
    });

    const updatedData = {
      brand: formData.get("brand") || null,
      model: formData.get("model") || null,
      year: parseInt(formData.get("year"), 10) || null,
      price: parseInt(formData.get("price"), 10) || null,
      mileage: parseInt(formData.get("mileage"), 10) || null,
      engine_volume: parseFloat(formData.get("engine_volume")) || null,
      color: formData.get("color") || null,
      description: formData.get("description") || null,
      city: formData.get("city") || null,
      status: isAdmin ? formData.get("status") : listing.status,
    };
    const equipmentFields = [
      "has_alloy_wheels",
      "has_abs",
      "has_sunroof",
      "has_rain_sensor",
      "has_central_locking",
      "has_park_assist",
      "has_ac",
      "has_heated_seats",
      "has_leather_seats",
      "has_xenon_lights",
      "has_360_camera",
      "has_rear_camera",
      "has_side_curtains",
      "has_ventilated_seats",
    ];

    equipmentFields.forEach((field) => {
      updatedData[field] = formData.get(field) === "on"; // checkbox dəyərlərini boolean olaraq alır
    });

    // Fallback: if brand comes as ID, convert to name
    if (updatedData.brand && /^\d+$/.test(String(updatedData.brand))) {
      const { data: brandRow, error: brandErr } = await supabase
        .from("brands")
        .select("name")
        .eq("id", Number(updatedData.brand))
        .single();
      if (!brandErr && brandRow?.name) {
        updatedData.brand = brandRow.name;
      }
    }

    const newImages = formData.getAll("new_images").filter((f) => f.size > 0);
    if (newImages.length > 0) {
      const newImageUrls = [];
      for (const image of newImages) {
        const fileName = `${user.id}/${Date.now()}-${image.name}`;

        const { error: uploadError } = await supabase.storage
          .from("listings-images")
          .upload(fileName, image);
        if (uploadError) {
          console.error("Supabase Storage Upload Error:", uploadError);
          throw new Error("image_upload_failed");
        }

        const { data: urlData } = supabase.storage
          .from("listings-images")
          .getPublicUrl(fileName);
        if (!urlData?.publicUrl) {
          throw new Error("image_url_fetch_failed");
        }
        newImageUrls.push(urlData.publicUrl);
      }
      updatedData.image_urls = [...(listing.image_urls || []), ...newImageUrls];
    }

    const missingFields = [];
    if (!updatedData.model) missingFields.push("model");
    if (!updatedData.year) missingFields.push("year");
    if (!updatedData.price) missingFields.push("price");

    if (missingFields.length > 0) {
      console.error(
        "Validation Error: Missing required fields in updatedData",
        {
          missingFields,
          updatedData,
        }
      );
      throw new Error(
        `validation_failed: Missing fields - ${missingFields.join(", ")}`
      );
    }

    const { error: updateError } = await supabase
      .from("listings")
      .update(updatedData)
      .eq("id", listingId);
    if (updateError) {
      console.error("Supabase Database Update Error:", updateError.message, {
        listingId,
        updatedData,
        context: "updateListing function",
      });
      throw new Error("db_update_failed");
    }
  } catch (error) {
    console.error("Server Action Xətası:", error.message);
    const errorMessage = error.message; // No need for encodeURIComponent now
    redirect(`/create/${listingId}/edit?message=${errorMessage}`);
  }

  revalidatePath(`/create/${listingId}/edit`);
  revalidatePath(`/profil`);
  redirect(`/profil?message=update_success`);
}

export async function deleteImage(formData) {
  const listingId = formData.get("listingId");
  const imageUrlToDelete = formData.get("imageUrl");

  try {
    if (!listingId || !imageUrlToDelete) {
      console.error("Error: Missing parameters for image deletion");
      throw new Error("delete_params_missing");
    }

    const supabase = await createClient();
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      console.error("Error: User not authenticated");
      redirect("/login");
    }
    const user = authData.user;

    const { data: listing } = await supabase
      .from("listings")
      .select("user_id, image_urls")
      .eq("id", listingId)
      .single();
    if (!listing) {
      console.error("Error: Listing not found");
      throw new Error("listing_not_found");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    const isAdmin = profile?.role === "admin";
    const isOwner = listing.user_id === user.id;

    if (!isAdmin && !isOwner) {
      console.error("Error: Unauthorized operation");
      throw new Error("unauthorized_operation");
    }

    try {
      const imagePath = new URL(imageUrlToDelete).pathname.split(
        "/listings-images/"
      )[1];
      if (imagePath)
        await supabase.storage.from("listings-images").remove([imagePath]);
    } catch (e) {
      console.error("Storage-dən silərkən xəta (URL parse):", e.message);
    }

    const newImageUrls = listing.image_urls.filter(
      (url) => url !== imageUrlToDelete
    );
    const { error: dbError } = await supabase
      .from("listings")
      .update({ image_urls: newImageUrls })
      .eq("id", listingId);

    if (dbError) {
      console.error("Database Error while deleting image URL:", dbError);
      throw new Error("db_image_delete_failed");
    }
  } catch (error) {
    console.error("Şəkil silmə xətası:", error.message);
    const errorMessage = error.message;
    redirect(`/create/${listingId}/edit?message=${errorMessage}`);
  }

  redirect(`/create/${listingId}/edit?message=delete_success`);
  revalidatePath(`/create/${listingId}/edit`);
}
