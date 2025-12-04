"use client";

import type React from "react";

import { US_STATES } from "@/lib/us-states-cities";
import { DOG_BREEDS, CAT_BREEDS } from "@/lib/breeds";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import { AppLayout } from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import Image from "next/image";
import { Upload } from "lucide-react";
import { useAuthClient } from "@/lib/useAuthClient";
import {
  IMAGE_SIZE_LIMIT_MESSAGE,
  MAX_IMAGE_SIZE_BYTES,
  MAX_IMAGE_SIZE_MB,
} from "@/lib/constants";

export default function AddPetPage() {
  const { user, loading } = useAuthClient();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmiting] = useState(false);
  type AnimalType = "dog" | "cat" | "other";
  type WeightOption = { value: string; label: string };
  type PetFormData = {
    name: string;
    type: AnimalType | "";
    breed: string;
    ageGroup: string;
    weightRange: string;
    energyLevel: string;
    size: string;
    goodWithKids: boolean;
    goodWithCats: boolean;
    goodWithDogs: boolean;
    houseTrained: boolean;
    specialNeeds: string;
    description: string;
    imageUrl: string;
    state: string;
    adoptableOutOfState: boolean;
    onlyPet: boolean;
    okWithAnimals: string[];
    requiresFencedYard: boolean;
    needsCompany: boolean;
    comfortableHoursAlone: string;
    ownerExperienceRequired: string;
  };

  type PetFormErrors = {
    name: string;
    type: string;
    breed: string;
    ageGroup: string;
    weightRange: string;
    energyLevel: string;
  };

  const weightOptions: Record<AnimalType, WeightOption[]> = {
    dog: [
      { value: "small", label: "Small (0-25 lbs)" },
      { value: "medium", label: "Medium (25-60 lbs)" },
      { value: "large", label: "Large (60+ lbs)" },
    ],
    cat: [
      { value: "small", label: "Small (0-10 lbs)" },
      { value: "medium", label: "Medium (10-20 lbs)" },
      { value: "large", label: "Large (20+ lbs)" },
    ],
    other: [
      { value: "small", label: "Small" },
      { value: "medium", label: "Medium" },
      { value: "large", label: "Large" },
    ],
  };

  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    type: "",
    breed: "",
    ageGroup: "",
    weightRange: "",
    energyLevel: "",
    size: "",
    goodWithKids: false,
    goodWithCats: false,
    goodWithDogs: false,
    houseTrained: false,
    specialNeeds: "",
    description: "",
    imageUrl: "",

    // New fields:
    state: "",
    adoptableOutOfState: false,
    onlyPet: false,
    okWithAnimals: [], // ["dog", "cat"]
    requiresFencedYard: false,
    needsCompany: false,
    comfortableHoursAlone: "",
    ownerExperienceRequired: "",
  });
  const [errors, setErrors] = useState<PetFormErrors>({
    name: "",
    type: "",
    breed: "",
    ageGroup: "",
    weightRange: "",
    energyLevel: "",
  });

  const availableWeightOptions = useMemo(() => {
    if (!formData.type) return [] as WeightOption[];
    return weightOptions[formData.type as AnimalType];
  }, [formData.type]);
  const breedOptions =
    formData.type === "dog"
      ? DOG_BREEDS
      : formData.type === "cat"
      ? CAT_BREEDS
      : ["Other / Not applicable"];

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      Swal.fire({
        icon: "warning",
        title: "Image Too Large",
        text: IMAGE_SIZE_LIMIT_MESSAGE,
      });
      e.target.value = "";
      return;
    }

    setUploading(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });

      if (!response.ok) {
        let errorMessage = "Failed to upload image";
        const raw = await response.text().catch(() => "");
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            errorMessage = parsed.error || parsed.message || errorMessage;
          } catch {
            errorMessage = raw;
          }
        }

        if (
          response.status === 400 &&
          errorMessage.toLowerCase().includes("exceeds")
        ) {
          errorMessage = IMAGE_SIZE_LIMIT_MESSAGE;
        }

        // Mostrar error con SweetAlert2
        Swal.fire({
          icon: "error",
          title: "Upload Error",
          text: errorMessage,
        });
        e.target.value = "";

        return;
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
    } catch (error) {
      console.error("[v0] Image upload error:", error);
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: "Failed to upload image: " + String(error),
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmiting(true);

    const newErrors: any = {};

    if (!formData.name) newErrors.name = "This field is required";
    if (!formData.type) newErrors.type = "This field is required";
    if (!formData.breed) newErrors.breed = "This field is required";
    if (!formData.ageGroup) newErrors.ageGroup = "This field is required";
    if (!formData.weightRange) newErrors.weightRange = "This field is required";
    if (!formData.energyLevel) newErrors.energyLevel = "This field is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setSubmiting(false);
      return;
    }

    if (!user || loading) return;

    const newPet = {
      name: formData.name,
      type: formData.type,
      breed: formData.breed,
      ageGroup: formData.ageGroup,
      weightRange: formData.weightRange,
      energyLevel: formData.energyLevel,
      size: formData.size,
      temperament: [],
      goodWithChildren: formData.goodWithKids,
      goodWithPets: formData.goodWithCats || formData.goodWithDogs,
      houseTrained: formData.houseTrained,
      state: formData.state || null,
      adoptable_out_of_state: formData.adoptableOutOfState || false,
      only_pet: formData.onlyPet || false,
      ok_with_animals: formData.okWithAnimals?.length
        ? formData.okWithAnimals
        : null,
      requires_fenced_yard: formData.requiresFencedYard || false,
      needs_company: formData.needsCompany || false,
      comfortable_hours_alone: formData.comfortableHoursAlone || null,
      owner_experience_required: formData.ownerExperienceRequired || null,
      specialNeeds: formData.specialNeeds || null,
      description: formData.description || null,
      imageUrl: formData.imageUrl || null,
      ownerId: user.id,
    };

    try {
      const res = await fetch("/api/pets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPet),
      });

      if (!res.ok) {
        console.error("Error creating pet");
        return;
      }

      await res.json();
      router.push("/my-pets");
    } catch (error) {
      console.error("Error sending form:", error);
    } finally {
      setSubmiting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    setFormData((prev) => ({ ...prev, weightRange: "" }));
  }, [formData.type]);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/login");
      return;
    }
  }, [user, router, loading]);

  return (
    <AppLayout>
      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Add New Pet</h1>
          <p className="text-muted-foreground">
            Fill in the details to add a new pet to your rescue
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-card rounded-lg border p-6"
        >
          <div className="space-y-4">
            <Label>Pet Photo</Label>
            <div className="flex items-center gap-6">
              <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-muted shrink-0">
                {formData.imageUrl ? (
                  <Image
                    src={formData.imageUrl || "/placeholder.svg"}
                    alt="Pet preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm text-center p-2">
                    No photo
                  </div>
                )}
              </div>
              <div className="flex-1">
                <Label htmlFor="pet-image" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 w-fit">
                    <Upload className="h-4 w-4" />
                    {uploading ? "Uploading..." : "Upload Photo"}
                  </div>
                  <input
                    id="pet-image"
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </Label>
                <p className="text-sm text-muted-foreground mt-2">
                  JPEG or PNG, max {MAX_IMAGE_SIZE_MB}MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">
                Pet Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">
                Breed <span className="text-red-500">*</span>
              </Label>

              <Select
                value={formData.breed}
                onValueChange={(value) => handleChange("breed", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {breedOptions.map((breed) => (
                    <SelectItem key={breed} value={breed}>
                      {breed}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.breed && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageGroup">
                Age Group <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.ageGroup}
                onValueChange={(value) => handleChange("ageGroup", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="puppy">Puppy/Kitten (0-1 year)</SelectItem>
                  <SelectItem value="young">Young (1-3 years)</SelectItem>
                  <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                  <SelectItem value="senior">Senior (7+ years)</SelectItem>
                </SelectContent>
              </Select>
              {errors.ageGroup && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightRange">
                Weight Range <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.weightRange}
                onValueChange={(value) => handleChange("weightRange", value)}
                disabled={!formData.type} // opcional: deshabilitar si no se selecciona tipo
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {availableWeightOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.weightRange && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="energyLevel">
                Energy Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.energyLevel}
                onValueChange={(value) => handleChange("energyLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.energyLevel && (
                <p className="text-sm text-red-500">{errors.type}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Is this pet okay with other animals?</Label>
              <Select
                value={formData.okWithAnimals.join(",")}
                onValueChange={(value) =>
                  handleChange("okWithAnimals", value.split(","))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dogs</SelectItem>
                  <SelectItem value="cat">Cats</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>How many hours can this pet be home alone?</Label>
              <Select
                value={formData.comfortableHoursAlone}
                onValueChange={(value) =>
                  handleChange("comfortableHoursAlone", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-4">0–8 hours</SelectItem>
                  <SelectItem value="4-8">4–8 hours</SelectItem>
                  <SelectItem value="8-12">8–12 hours</SelectItem>
                  <SelectItem value="12+">12+ hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Does this pet require an experienced owner?</Label>
              <Select
                value={formData.ownerExperienceRequired}
                onValueChange={(value) =>
                  handleChange("ownerExperienceRequired", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No special experience</SelectItem>
                  <SelectItem value="some experience">
                    Some experience
                  </SelectItem>
                  <SelectItem value="special needs">
                    Experience with special needs
                  </SelectItem>
                  <SelectItem value="behavior modification">
                    Experience with behavior modification
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select
                value={formData.state}
                onValueChange={(v) => handleChange("state", v)}
              >
                <SelectTrigger id="state">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {US_STATES.map((state) => (
                    <SelectItem key={state.code} value={state.code}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-base font-semibold">Additional Information</p>

            <div className="flex items-center space-x-2 mt-2">
              <Checkbox
                id="adoptableOutOfState"
                checked={formData.adoptableOutOfState}
                onCheckedChange={(checked) =>
                  handleChange("adoptableOutOfState", checked)
                }
              />
              <Label>This pet can be adopted out of state.</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyPet"
                checked={formData.onlyPet}
                onCheckedChange={(checked) => handleChange("onlyPet", checked)}
              />
              <Label>Needs to be the only pet.</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresFencedYard"
                checked={formData.requiresFencedYard}
                onCheckedChange={(checked) =>
                  handleChange("requiresFencedYard", checked)
                }
              />
              <Label>This pet requires a fenced yard.</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="needsCompany"
                checked={formData.needsCompany}
                onCheckedChange={(checked) =>
                  handleChange("needsCompany", checked)
                }
              />
              <Label>
                This pet needs someone who is home more often than not.
              </Label>
            </div>

            <p className="text-base font-semibold">Compatibility</p>
            <div className="space-y-3 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goodWithKids"
                  checked={formData.goodWithKids}
                  onCheckedChange={(checked) =>
                    handleChange("goodWithKids", checked)
                  }
                />
                <Label>Good with kids</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goodWithCats"
                  checked={formData.goodWithCats}
                  onCheckedChange={(checked) =>
                    handleChange("goodWithCats", checked)
                  }
                />
                <Label>Good with cats</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goodWithDogs"
                  checked={formData.goodWithDogs}
                  onCheckedChange={(checked) =>
                    handleChange("goodWithDogs", checked)
                  }
                />
                <Label>Good with dogs</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="houseTrained"
                  checked={formData.houseTrained}
                  onCheckedChange={(checked) =>
                    handleChange("houseTrained", checked)
                  }
                />
                <Label>House trained</Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNeeds">Special Needs</Label>
            <Input
              id="specialNeeds"
              placeholder="Any medical conditions or special requirements"
              value={formData.specialNeeds}
              onChange={(e) => handleChange("specialNeeds", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm placeholder:text-sm"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tell us about this pet's personality, habits, and special needs..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Adding..." : "Add Pet"}
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/my-pets")}
            >
              Cancel
            </Button>
          </div>
          {Object.values(errors).some((e) => e) && (
            <p className="text-sm text-red-500 mt-2">
              Please fill all required fields before submitting.
            </p>
          )}
        </form>
      </div>
    </AppLayout>
  );
}
