"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { AppLayout } from "@/components/app-layout";
import Image from "next/image";
import { Upload } from "lucide-react";
import { US_STATES, getCitiesForState } from "@/lib/us-states-cities";
import {
  validateProfileForm,
  type ProfileFormData,
} from "@/lib/profile-validation";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileImage, setProfileImage] = useState<string>("");
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState<Partial<ProfileFormData>>({
    firstName: "",
    lastName: "",
    email: "",
    homePhone: "",
    cellPhone: "",
    gender: "",
    birthday: "",
    addressLine: "",
    city: "",
    state: "",
    zipCode: "",
    willingOutOfState: false,
    hasPets: false,
    petsTypes: [],
    petsGoodWithOthers: false,
    hasFencedYard: false,
    homeType: "",
    landlordAllowsPets: false,
    landlordPhone: "",
    landlordEmail: "",
    associationRestrictions: false,
    worksOutsideHome: false,
    hoursHomeAlone: "",
    wherePetsWhenAway: "",
    hasChildren: false,
    childrenCount: 0,
    childrenAges: "",
    adultsInHome: 1,
    homeActivityLevel: "",
    petLiveLocation: "",
    adoptionTimeline: "",
    preferredDogBreed: "",
    preferredCatType: "",
    preferredAge: "",
    preferredWeight: "",
    preferredTemperamentDetailed: [],
    preferredEnergy: "",
    undesiredCharacteristics: [],
    takePetsToVet: false,
    vetName: "",
    vetPhone: "",
    vetEmail: "",
    reference1Name: "",
    reference1Phone: "",
    reference1Email: "",
    reference2Name: "",
    reference2Phone: "",
    reference2Email: "",
    adoptedBefore: false,
    ownedPetBefore: false,
    spayedNeutered: false,
    vaccinated: false,
    hadPetsNoLongerHave: "",
    willingBehaviorTraining: false,
    reasonsGiveUp: "",
    planForVetCosts: "",
    additionalComments: "",
  });

  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [customCity, setCustomCity] = useState("");

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Load user profile data
    const loadProfile = async () => {
      try {
        const response = await fetch(`/api/user/profile?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          const userData = data.user;

          console.log("[v0] User Data", userData);

          setFormData({
            firstName: userData.first_name || "",
            lastName: userData.last_name || "",
            email: userData.email || user.email,
            homePhone: userData.home_phone || "",
            cellPhone: userData.cell_phone || "",
            gender: userData.gender || "",
            birthday: userData.birthday || "",
            addressLine: userData.address_line || "",
            city: userData.city || "",
            state: userData.state || "",
            zipCode: userData.zip_code || "",
            willingOutOfState: userData.willing_out_of_state || false,
            hasPets: userData.has_pets || false,
            petsTypes: userData.pets_types || [],
            petsGoodWithOthers: userData.pets_good_with_others || false,
            hasFencedYard: userData.has_fenced_yard || false,
            homeType: userData.home_type || "",
            landlordAllowsPets: userData.landlord_allows_pets || false,
            landlordPhone: userData.landlord_phone || "",
            landlordEmail: userData.landlord_email || "",
            associationRestrictions: userData.association_restrictions || false,
            worksOutsideHome: userData.works_outside_home || false,
            hoursHomeAlone: userData.hours_home_alone || "",
            wherePetsWhenAway: userData.where_pets_when_away || "",
            hasChildren: userData.has_children || false,
            childrenCount: userData.children_count || 0,
            childrenAges: userData.children_ages || "",
            adultsInHome: userData.adults_in_home || 1,
            homeActivityLevel: userData.home_activity_level || "",
            petLiveLocation: userData.pet_live_location || "",
            adoptionTimeline: userData.adoption_timeline || "",
            preferredDogBreed: userData.preferred_dog_breed || "",
            preferredCatType: userData.preferred_cat_type || "",
            preferredAge: userData.preferred_age || "",
            preferredWeight: userData.preferred_weight || "",
            preferredTemperamentDetailed:
              userData.preferred_temperament_detailed || [],
            preferredEnergy: userData.preferred_energy || "",
            undesiredCharacteristics: userData.undesired_characteristics || [],
            takePetsToVet: userData.take_pets_to_vet || false,
            vetName: userData.vet_name || "",
            vetPhone: userData.vet_phone || "",
            vetEmail: userData.vet_email || "",
            reference1Name: userData.reference1_name || "",
            reference1Phone: userData.reference1_phone || "",
            reference1Email: userData.reference1_email || "",
            reference2Name: userData.reference2_name || "",
            reference2Phone: userData.reference2_phone || "",
            reference2Email: userData.reference2_email || "",
            adoptedBefore: userData.adopted_before || false,
            ownedPetBefore: userData.owned_pet_before || false,
            spayedNeutered: userData.spayed_neutered || false,
            vaccinated: userData.vaccinated || false,
            hadPetsNoLongerHave: userData.had_pets_no_longer_have || "",
            willingBehaviorTraining:
              userData.willing_behavior_training || false,
            reasonsGiveUp: userData.reasons_give_up || "",
            planForVetCosts: userData.plan_for_vet_costs || "",
            additionalComments: userData.additional_comments || "",
          });

          setProfileImage(userData.image_url || "");

          // Load cities for selected state
          if (userData.state) {
            setAvailableCities(getCitiesForState(userData.state));
          }
        }
      } catch (error) {
        console.error("[v0] Load profile error:", error);
      }
    };

    loadProfile();
  }, [user, router]);

  useEffect(() => {
    if (formData.state) {
      const cities = getCitiesForState(formData.state);
      setAvailableCities(cities);
      // Reset city if it's not in the new state's list
      if (formData.city && !cities.includes(formData.city)) {
        setFormData((prev) => ({ ...prev, city: "" }));
      }
    }
  }, [formData.state]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = "Failed to upload image";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
        } catch (e) {
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        alert(errorMessage);
        return;
      }

      const data = await response.json();
      setProfileImage(data.imageUrl);
    } catch (error) {
      console.error("[v0] Image upload error:", error);
      alert("Failed to upload image: " + String(error));
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    console.log("[v0] Starting profile save...");

    // Validate form
    const validationErrors = validateProfileForm(formData);
    if (validationErrors.length > 0) {
      console.log("[v0] Validation failed:", validationErrors);
      const errorMap: Record<string, string> = {};
      validationErrors.forEach((err) => {
        errorMap[err.field] = err.message;
      });
      setErrors(errorMap);
      alert("Please fix the validation errors before saving");
      return;
    }

    setSaving(true);
    setErrors({});

    try {
      console.log("[v0] Sending profile update request...");
      console.log("[v0] form data", formData);

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id,
          ...formData,
          imageUrl: profileImage,
        }),
      });

      console.log("[v0] Response status:", response.status);
      console.log("[v0] Full response", response);

      if (response.ok) {
        const data = await response.json();
        console.log("[v0] Profile saved successfully");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        const reloadResponse = await fetch(
          `/api/user/profile?userId=${user?.id}`
        );
        if (reloadResponse.ok) {
          const reloadData = await reloadResponse.json();
          console.log(
            "[v0] Profile reloaded successfully, data persisted:",
            !!reloadData.user
          );
        }
      } else {
        const error = await response.json();
        console.log("[v0] Save failed:", error);
        if (error.errors) {
          const errorMap: Record<string, string> = {};
          error.errors.forEach((err: any) => {
            errorMap[err.field] = err.message;
          });
          setErrors(errorMap);
        }
        alert("Failed to save profile: " + (error.error || "Unknown error"));
      }
    } catch (error) {
      console.error("[v0] Save profile error:", error);
      alert("Failed to save profile: " + String(error));
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: keyof ProfileFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleArrayField = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => {
      const currentArray = (prev[field] as string[]) || [];
      const newArray = currentArray.includes(value)
        ? currentArray.filter((v) => v !== value)
        : [...currentArray, value];
      return { ...prev, [field]: newArray };
    });
  };

  if (!user) {
    return null;
  }

  const isRenting = formData.homeType?.includes("Rent");
  const isOwnCondo = formData.homeType === "Own Condo";

  return (
    <AppLayout>
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Complete your adoption application profile
          </p>
        </div>

        <div className="bg-card rounded-lg border p-6 space-y-8">
          {/* Profile Photo */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Profile Photo</h2>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-muted flex-shrink-0">
                {profileImage ? (
                  <Image
                    src={profileImage || "/placeholder.svg"}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="profile-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 w-fit">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </div>
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  JPEG or PNG, max 5MB
                </p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Personal Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-sm text-red-500">{errors.firstName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-sm text-red-500">{errors.lastName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-sm text-red-500">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="cellPhone">
                  Cell Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cellPhone"
                  type="tel"
                  value={formData.cellPhone}
                  onChange={(e) => updateField("cellPhone", e.target.value)}
                  className={errors.cellPhone ? "border-red-500" : ""}
                />
                {errors.cellPhone && (
                  <p className="text-sm text-red-500">{errors.cellPhone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="homePhone">Home Phone</Label>
                <Input
                  id="homePhone"
                  type="tel"
                  value={formData.homePhone}
                  onChange={(e) => updateField("homePhone", e.target.value)}
                  className={errors.homePhone ? "border-red-500" : ""}
                />
                {errors.homePhone && (
                  <p className="text-sm text-red-500">{errors.homePhone}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthday">
                  Birthday <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => updateField("birthday", e.target.value)}
                  className={errors.birthday ? "border-red-500" : ""}
                />
                {errors.birthday && (
                  <p className="text-sm text-red-500">{errors.birthday}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(v) => updateField("gender", v)}
                >
                  <SelectTrigger id="gender">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Male</SelectItem>
                    <SelectItem value="F">Female</SelectItem>
                    <SelectItem value="Prefer not to answer">
                      Prefer not to answer
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Address</h2>
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addressLine">
                  Street Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="addressLine"
                  value={formData.addressLine}
                  onChange={(e) => updateField("addressLine", e.target.value)}
                  className={errors.addressLine ? "border-red-500" : ""}
                />
                {errors.addressLine && (
                  <p className="text-sm text-red-500">{errors.addressLine}</p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">
                    State <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.state}
                    onValueChange={(v) => updateField("state", v)}
                  >
                    <SelectTrigger
                      id="state"
                      className={errors.state ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((state) => (
                        <SelectItem key={state.code} value={state.code}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.state && (
                    <p className="text-sm text-red-500">{errors.state}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">
                    City <span className="text-red-500">*</span>
                  </Label>
                  {availableCities.length > 0 ? (
                    <Select
                      value={formData.city}
                      onValueChange={(v) => {
                        if (v === "other") {
                          updateField("city", customCity);
                        } else {
                          updateField("city", v);
                        }
                      }}
                    >
                      <SelectTrigger
                        id="city"
                        className={errors.city ? "border-red-500" : ""}
                      >
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCities.map((city) => (
                          <SelectItem key={city} value={city}>
                            {city}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">
                          Other (type below)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="city"
                      value={formData.city}
                      onChange={(e) => updateField("city", e.target.value)}
                      placeholder="Enter city"
                      className={errors.city ? "border-red-500" : ""}
                    />
                  )}
                  {errors.city && (
                    <p className="text-sm text-red-500">{errors.city}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">
                    ZIP Code <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => updateField("zipCode", e.target.value)}
                    className={errors.zipCode ? "border-red-500" : ""}
                  />
                  {errors.zipCode && (
                    <p className="text-sm text-red-500">{errors.zipCode}</p>
                  )}
                </div>
              </div>
              {availableCities.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="customCity">
                    If your city is not listed, enter it here
                  </Label>
                  <Input
                    id="customCity"
                    value={customCity}
                    onChange={(e) => {
                      setCustomCity(e.target.value);
                      updateField("city", e.target.value);
                    }}
                    placeholder="Enter city name"
                  />
                </div>
              )}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willingOutOfState"
                  checked={formData.willingOutOfState}
                  onCheckedChange={(checked) =>
                    updateField("willingOutOfState", !!checked)
                  }
                />
                <Label htmlFor="willingOutOfState" className="cursor-pointer">
                  Willing to adopt from out of state
                </Label>
              </div>
            </div>
          </div>

          {/* Housing Information */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Housing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeType">Home Type</Label>
                <Select
                  value={formData.homeType}
                  onValueChange={(v) => updateField("homeType", v)}
                >
                  <SelectTrigger id="homeType">
                    <SelectValue placeholder="Select home type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rent House">Rent House</SelectItem>
                    <SelectItem value="Rent Apartment">
                      Rent Apartment
                    </SelectItem>
                    <SelectItem value="Own House">Own House</SelectItem>
                    <SelectItem value="Own Apartment">Own Apartment</SelectItem>
                    <SelectItem value="Own Condo">Own Condo</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-8">
                <Checkbox
                  id="hasFencedYard"
                  checked={formData.hasFencedYard}
                  onCheckedChange={(checked) =>
                    updateField("hasFencedYard", !!checked)
                  }
                />
                <Label htmlFor="hasFencedYard" className="cursor-pointer">
                  I have a fenced yard
                </Label>
              </div>
            </div>

            {isRenting && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="col-span-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="landlordAllowsPets"
                      checked={formData.landlordAllowsPets}
                      onCheckedChange={(checked) =>
                        updateField("landlordAllowsPets", !!checked)
                      }
                    />
                    <Label
                      htmlFor="landlordAllowsPets"
                      className="cursor-pointer"
                    >
                      Landlord allows pets
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landlordPhone">Landlord Phone</Label>
                  <Input
                    id="landlordPhone"
                    type="tel"
                    value={formData.landlordPhone}
                    onChange={(e) =>
                      updateField("landlordPhone", e.target.value)
                    }
                    className={errors.landlordPhone ? "border-red-500" : ""}
                  />
                  {errors.landlordPhone && (
                    <p className="text-sm text-red-500">
                      {errors.landlordPhone}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="landlordEmail">Landlord Email</Label>
                  <Input
                    id="landlordEmail"
                    type="email"
                    value={formData.landlordEmail}
                    onChange={(e) =>
                      updateField("landlordEmail", e.target.value)
                    }
                    className={errors.landlordEmail ? "border-red-500" : ""}
                  />
                  {errors.landlordEmail && (
                    <p className="text-sm text-red-500">
                      {errors.landlordEmail}
                    </p>
                  )}
                </div>
              </div>
            )}

            {isOwnCondo && (
              <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg">
                <Checkbox
                  id="associationRestrictions"
                  checked={formData.associationRestrictions}
                  onCheckedChange={(checked) =>
                    updateField("associationRestrictions", !!checked)
                  }
                />
                <Label
                  htmlFor="associationRestrictions"
                  className="cursor-pointer"
                >
                  HOA/Condo association has pet restrictions
                </Label>
              </div>
            )}
          </div>

          {/* Current Pets */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Current Pets</h2>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hasPets"
                checked={formData.hasPets}
                onCheckedChange={(checked) => updateField("hasPets", !!checked)}
              />
              <Label htmlFor="hasPets" className="cursor-pointer">
                I currently have pets
              </Label>
            </div>

            {formData.hasPets && (
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-3">
                  <Label>What types of pets do you have?</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["Dog", "Cat", "Bird", "Fish", "Reptile", "Other"].map(
                      (type) => (
                        <div key={type} className="flex items-center space-x-2">
                          <Checkbox
                            id={`pet-type-${type}`}
                            checked={formData.petsTypes?.includes(type)}
                            onCheckedChange={() =>
                              toggleArrayField("petsTypes", type)
                            }
                          />
                          <Label
                            htmlFor={`pet-type-${type}`}
                            className="cursor-pointer"
                          >
                            {type}
                          </Label>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="petsGoodWithOthers"
                    checked={formData.petsGoodWithOthers}
                    onCheckedChange={(checked) =>
                      updateField("petsGoodWithOthers", !!checked)
                    }
                  />
                  <Label
                    htmlFor="petsGoodWithOthers"
                    className="cursor-pointer"
                  >
                    My pets are good with other animals
                  </Label>
                </div>
              </div>
            )}
          </div>

          {/* Work & Pet Care */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Work & Pet Care</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="worksOutsideHome"
                  checked={formData.worksOutsideHome}
                  onCheckedChange={(checked) =>
                    updateField("worksOutsideHome", !!checked)
                  }
                />
                <Label htmlFor="worksOutsideHome" className="cursor-pointer">
                  I work outside the home
                </Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hoursHomeAlone">
                  Hours pet would be home alone
                </Label>
                <Select
                  value={formData.hoursHomeAlone}
                  onValueChange={(v) => updateField("hoursHomeAlone", v)}
                >
                  <SelectTrigger id="hoursHomeAlone">
                    <SelectValue placeholder="Select hours" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-4">0-4 hours</SelectItem>
                    <SelectItem value="4-8">4-8 hours</SelectItem>
                    <SelectItem value="8-12">8-12 hours</SelectItem>
                    <SelectItem value="12+">12+ hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="wherePetsWhenAway">
                  Where will pets stay when you're away?
                </Label>
                <Select
                  value={formData.wherePetsWhenAway}
                  onValueChange={(v) => updateField("wherePetsWhenAway", v)}
                >
                  <SelectTrigger id="wherePetsWhenAway">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inside">Inside</SelectItem>
                    <SelectItem value="Inside crated">Inside crated</SelectItem>
                    <SelectItem value="Outside">Outside</SelectItem>
                    <SelectItem value="Kennel/Boarding">
                      Kennel/Boarding
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Family Information */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Family Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasChildren"
                  checked={formData.hasChildren}
                  onCheckedChange={(checked) =>
                    updateField("hasChildren", !!checked)
                  }
                />
                <Label htmlFor="hasChildren" className="cursor-pointer">
                  I have children at home
                </Label>
              </div>

              {formData.hasChildren && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="childrenCount">Number of children</Label>
                    <Input
                      id="childrenCount"
                      type="number"
                      min="0"
                      value={formData.childrenCount}
                      onChange={(e) =>
                        updateField(
                          "childrenCount",
                          Number.parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="childrenAges">
                      Children's ages (e.g., "3, 7, 12")
                    </Label>
                    <Input
                      id="childrenAges"
                      value={formData.childrenAges}
                      onChange={(e) =>
                        updateField("childrenAges", e.target.value)
                      }
                      placeholder="Enter ages separated by commas"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="adultsInHome">Number of adults in home</Label>
                <Input
                  id="adultsInHome"
                  type="number"
                  min="1"
                  value={formData.adultsInHome}
                  onChange={(e) =>
                    updateField(
                      "adultsInHome",
                      Number.parseInt(e.target.value) || 1
                    )
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="homeActivityLevel">Home activity level</Label>
                <Select
                  value={formData.homeActivityLevel}
                  onValueChange={(v) => updateField("homeActivityLevel", v)}
                >
                  <SelectTrigger id="homeActivityLevel">
                    <SelectValue placeholder="Select activity level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Quiet">Quiet</SelectItem>
                    <SelectItem value="Average">Average</SelectItem>
                    <SelectItem value="Busy">Busy</SelectItem>
                    <SelectItem value="Any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Pet Preferences */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Pet Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petLiveLocation">Where will pet live?</Label>
                <Select
                  value={formData.petLiveLocation}
                  onValueChange={(v) => updateField("petLiveLocation", v)}
                >
                  <SelectTrigger id="petLiveLocation">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inside">Inside only</SelectItem>
                    <SelectItem value="Outside">Outside only</SelectItem>
                    <SelectItem value="Indoor and Outdoor">
                      Indoor and Outdoor
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="adoptionTimeline">Adoption timeline</Label>
                <Select
                  value={formData.adoptionTimeline}
                  onValueChange={(v) => updateField("adoptionTimeline", v)}
                >
                  <SelectTrigger id="adoptionTimeline">
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Immediately">Immediately</SelectItem>
                    <SelectItem value="1-3 months">1-3 months</SelectItem>
                    <SelectItem value="3-6 months">3-6 months</SelectItem>
                    <SelectItem value="6-12 months">6-12 months</SelectItem>
                    <SelectItem value="1 year+">1 year+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredDogBreed">
                  Preferred dog breed (if any)
                </Label>
                <Input
                  id="preferredDogBreed"
                  value={formData.preferredDogBreed}
                  onChange={(e) =>
                    updateField("preferredDogBreed", e.target.value)
                  }
                  placeholder="e.g., Golden Retriever, Mixed"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredCatType">
                  Preferred cat type (if any)
                </Label>
                <Input
                  id="preferredCatType"
                  value={formData.preferredCatType}
                  onChange={(e) =>
                    updateField("preferredCatType", e.target.value)
                  }
                  placeholder="e.g., Tabby, Siamese"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredAge">Preferred age</Label>
                <Select
                  value={formData.preferredAge}
                  onValueChange={(v) => updateField("preferredAge", v)}
                >
                  <SelectTrigger id="preferredAge">
                    <SelectValue placeholder="Select age" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under 2">Under 2 years</SelectItem>
                    <SelectItem value="2-5">2-5 years</SelectItem>
                    <SelectItem value="5-7">5-7 years</SelectItem>
                    <SelectItem value="7-10">7-10 years</SelectItem>
                    <SelectItem value="senior">Senior (10+ years)</SelectItem>
                    <SelectItem value="any">Any age</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredWeight">Preferred weight</Label>
                <Select
                  value={formData.preferredWeight}
                  onValueChange={(v) => updateField("preferredWeight", v)}
                >
                  <SelectTrigger id="preferredWeight">
                    <SelectValue placeholder="Select weight" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="under 25">Under 25 lbs</SelectItem>
                    <SelectItem value="25-45">25-45 lbs</SelectItem>
                    <SelectItem value="45-65">45-65 lbs</SelectItem>
                    <SelectItem value="65+">65+ lbs</SelectItem>
                    <SelectItem value="any">Any weight</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="preferredEnergy">Preferred energy level</Label>
                <Select
                  value={formData.preferredEnergy}
                  onValueChange={(v) => updateField("preferredEnergy", v)}
                >
                  <SelectTrigger id="preferredEnergy">
                    <SelectValue placeholder="Select energy level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="any">Any</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Preferred temperament (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Friendly",
                  "Energetic",
                  "Playful",
                  "Calm",
                  "Independent",
                  "Affectionate",
                  "Loyal",
                  "Protective",
                  "Intelligent",
                  "Gentle",
                ].map((temp) => (
                  <div key={temp} className="flex items-center space-x-2">
                    <Checkbox
                      id={`temp-${temp}`}
                      checked={formData.preferredTemperamentDetailed?.includes(
                        temp
                      )}
                      onCheckedChange={() =>
                        toggleArrayField("preferredTemperamentDetailed", temp)
                      }
                    />
                    <Label htmlFor={`temp-${temp}`} className="cursor-pointer">
                      {temp}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Undesired characteristics (select all that apply)</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "Aggressive",
                  "Excessive barking",
                  "High maintenance",
                  "Not house trained",
                  "Destructive",
                  "Shy",
                ].map((char) => (
                  <div key={char} className="flex items-center space-x-2">
                    <Checkbox
                      id={`undesired-${char}`}
                      checked={formData.undesiredCharacteristics?.includes(
                        char
                      )}
                      onCheckedChange={() =>
                        toggleArrayField("undesiredCharacteristics", char)
                      }
                    />
                    <Label
                      htmlFor={`undesired-${char}`}
                      className="cursor-pointer"
                    >
                      {char}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Veterinary Care */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Veterinary Care</h2>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="takePetsToVet"
                checked={formData.takePetsToVet}
                onCheckedChange={(checked) =>
                  updateField("takePetsToVet", !!checked)
                }
              />
              <Label htmlFor="takePetsToVet" className="cursor-pointer">
                I take my pets to the vet regularly
              </Label>
            </div>

            {formData.takePetsToVet && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
                <div className="space-y-2">
                  <Label htmlFor="vetName">Veterinarian name</Label>
                  <Input
                    id="vetName"
                    value={formData.vetName}
                    onChange={(e) => updateField("vetName", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vetPhone">Veterinarian phone</Label>
                  <Input
                    id="vetPhone"
                    type="tel"
                    value={formData.vetPhone}
                    onChange={(e) => updateField("vetPhone", e.target.value)}
                    className={errors.vetPhone ? "border-red-500" : ""}
                  />
                  {errors.vetPhone && (
                    <p className="text-sm text-red-500">{errors.vetPhone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vetEmail">Veterinarian email</Label>
                  <Input
                    id="vetEmail"
                    type="email"
                    value={formData.vetEmail}
                    onChange={(e) => updateField("vetEmail", e.target.value)}
                    className={errors.vetEmail ? "border-red-500" : ""}
                  />
                  {errors.vetEmail && (
                    <p className="text-sm text-red-500">{errors.vetEmail}</p>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="planForVetCosts">
                How do you plan to pay for veterinary costs?
              </Label>
              <Select
                value={formData.planForVetCosts}
                onValueChange={(v) => updateField("planForVetCosts", v)}
              >
                <SelectTrigger id="planForVetCosts">
                  <SelectValue placeholder="Select payment plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Savings">Savings</SelectItem>
                  <SelectItem value="Pet Insurance">Pet Insurance</SelectItem>
                  <SelectItem value="Care Credit">Care Credit</SelectItem>
                  <SelectItem value="Payment Plan">Payment Plan</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* References */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">References</h2>
            <p className="text-sm text-muted-foreground">
              Please provide two personal references
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <h3 className="font-semibold">Reference 1</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference1Name">Name</Label>
                    <Input
                      id="reference1Name"
                      value={formData.reference1Name}
                      onChange={(e) =>
                        updateField("reference1Name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference1Phone">Phone</Label>
                    <Input
                      id="reference1Phone"
                      type="tel"
                      value={formData.reference1Phone}
                      onChange={(e) =>
                        updateField("reference1Phone", e.target.value)
                      }
                      className={errors.reference1Phone ? "border-red-500" : ""}
                    />
                    {errors.reference1Phone && (
                      <p className="text-sm text-red-500">
                        {errors.reference1Phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference1Email">Email</Label>
                    <Input
                      id="reference1Email"
                      type="email"
                      value={formData.reference1Email}
                      onChange={(e) =>
                        updateField("reference1Email", e.target.value)
                      }
                      className={errors.reference1Email ? "border-red-500" : ""}
                    />
                    {errors.reference1Email && (
                      <p className="text-sm text-red-500">
                        {errors.reference1Email}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-muted/50 rounded-lg space-y-4">
                <h3 className="font-semibold">Reference 2</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="reference2Name">Name</Label>
                    <Input
                      id="reference2Name"
                      value={formData.reference2Name}
                      onChange={(e) =>
                        updateField("reference2Name", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference2Phone">Phone</Label>
                    <Input
                      id="reference2Phone"
                      type="tel"
                      value={formData.reference2Phone}
                      onChange={(e) =>
                        updateField("reference2Phone", e.target.value)
                      }
                      className={errors.reference2Phone ? "border-red-500" : ""}
                    />
                    {errors.reference2Phone && (
                      <p className="text-sm text-red-500">
                        {errors.reference2Phone}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reference2Email">Email</Label>
                    <Input
                      id="reference2Email"
                      type="email"
                      value={formData.reference2Email}
                      onChange={(e) =>
                        updateField("reference2Email", e.target.value)
                      }
                      className={errors.reference2Email ? "border-red-500" : ""}
                    />
                    {errors.reference2Email && (
                      <p className="text-sm text-red-500">
                        {errors.reference2Email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Pet Ownership History */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Pet Ownership History</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="adoptedBefore"
                  checked={formData.adoptedBefore}
                  onCheckedChange={(checked) =>
                    updateField("adoptedBefore", !!checked)
                  }
                />
                <Label htmlFor="adoptedBefore" className="cursor-pointer">
                  I have adopted a pet before
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ownedPetBefore"
                  checked={formData.ownedPetBefore}
                  onCheckedChange={(checked) =>
                    updateField("ownedPetBefore", !!checked)
                  }
                />
                <Label htmlFor="ownedPetBefore" className="cursor-pointer">
                  I have owned a pet before
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="spayedNeutered"
                  checked={formData.spayedNeutered}
                  onCheckedChange={(checked) =>
                    updateField("spayedNeutered", !!checked)
                  }
                />
                <Label htmlFor="spayedNeutered" className="cursor-pointer">
                  My previous pets were spayed/neutered
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vaccinated"
                  checked={formData.vaccinated}
                  onCheckedChange={(checked) =>
                    updateField("vaccinated", !!checked)
                  }
                />
                <Label htmlFor="vaccinated" className="cursor-pointer">
                  My previous pets were vaccinated
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="willingBehaviorTraining"
                  checked={formData.willingBehaviorTraining}
                  onCheckedChange={(checked) =>
                    updateField("willingBehaviorTraining", !!checked)
                  }
                />
                <Label
                  htmlFor="willingBehaviorTraining"
                  className="cursor-pointer"
                >
                  Willing to attend behavior training
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="hadPetsNoLongerHave">
                If you had pets you no longer have, what happened to them?
              </Label>
              <Textarea
                id="hadPetsNoLongerHave"
                value={formData.hadPetsNoLongerHave}
                onChange={(e) =>
                  updateField("hadPetsNoLongerHave", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reasonsGiveUp">
                Under what circumstances would you give up a pet?
              </Label>
              <Textarea
                id="reasonsGiveUp"
                value={formData.reasonsGiveUp}
                onChange={(e) => updateField("reasonsGiveUp", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Additional Comments */}
          <div className="border-t pt-6 space-y-4">
            <h2 className="text-xl font-semibold">Additional Information</h2>
            <div className="space-y-2">
              <Label htmlFor="additionalComments">
                Is there anything else you'd like us to know about you or your
                home?
              </Label>
              <Textarea
                id="additionalComments"
                value={formData.additionalComments}
                onChange={(e) =>
                  updateField("additionalComments", e.target.value)
                }
                rows={4}
                placeholder="Tell us more about yourself, your lifestyle, or why you want to adopt..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1" disabled={saving}>
              {saving ? "Saving..." : saved ? "Saved!" : "Save Profile"}
            </Button>
            <Button variant="outline" onClick={() => router.push("/matches")}>
              View Matches
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <Button
            variant="ghost"
            onClick={logout}
            className="text-destructive hover:text-destructive"
          >
            Sign Out
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
