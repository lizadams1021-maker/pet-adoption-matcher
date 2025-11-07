"use client";

import type React from "react";

import { US_STATES } from "@/lib/us-states-cities";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
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

export default function AddPetPage() {
  const { user, loading } = useAuthClient();
  const { addPet } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "dog",
    breed: "",
    ageGroup: "adult",
    weightRange: "medium",
    energyLevel: "moderate",
    size: "medium",
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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      console.log("[v0] Starting image upload:", file.name);
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });

      console.log("[v0] Upload response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to upload image";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
          console.log("[v0] Upload error:", error);
        } catch (e) {
          // Response is not JSON, try to get text
          const text = await response.text();
          console.log("[v0] Non-JSON error response:", text);
          errorMessage = text || errorMessage;
        }
        alert(errorMessage);
        return;
      }

      const data = await response.json();
      console.log(
        "[v0] Upload successful, imageUrl length:",
        data.imageUrl?.length
      );
      setFormData((prev) => ({ ...prev, imageUrl: data.imageUrl }));
    } catch (error) {
      console.error("[v0] Image upload error:", error);
      alert("Failed to upload image: " + String(error));
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
    };

    console.log("New pet", newPet);

    await addPet(newPet);
    router.push("/my-pets");
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

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
              <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
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
                  JPEG or PNG, max 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Pet Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dog</SelectItem>
                  <SelectItem value="cat">Cat</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Breed *</Label>
              <Input
                id="breed"
                value={formData.breed}
                onChange={(e) => handleChange("breed", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ageGroup">Age Group *</Label>
              <Select
                value={formData.ageGroup}
                onValueChange={(value) => handleChange("ageGroup", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="puppy">Puppy/Kitten (0-1 year)</SelectItem>
                  <SelectItem value="young">Young (1-3 years)</SelectItem>
                  <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                  <SelectItem value="senior">Senior (7+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weightRange">Weight Range *</Label>
              <Select
                value={formData.weightRange}
                onValueChange={(value) => handleChange("weightRange", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (0-25 lbs)</SelectItem>
                  <SelectItem value="medium">Medium (25-60 lbs)</SelectItem>
                  <SelectItem value="large">Large (60+ lbs)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Size *</Label>
              <Select
                value={formData.size}
                onValueChange={(value) => handleChange("size", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="energyLevel">Energy Level *</Label>
              <Select
                value={formData.energyLevel}
                onValueChange={(value) => handleChange("energyLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
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
                  <SelectValue placeholder="Select one or more" />
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
                  <SelectItem value="0-8">0–8 hours</SelectItem>
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
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="adoptableOutOfState"
                checked={formData.adoptableOutOfState}
                onCheckedChange={(checked) =>
                  handleChange("adoptableOutOfState", checked)
                }
              />
              <Label>Can this pet be adopted out of state?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="onlyPet"
                checked={formData.onlyPet}
                onCheckedChange={(checked) => handleChange("onlyPet", checked)}
              />
              <Label>Does this pet need to be the only pet?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="requiresFencedYard"
                checked={formData.requiresFencedYard}
                onCheckedChange={(checked) =>
                  handleChange("requiresFencedYard", checked)
                }
              />
              <Label>Does this pet require a fenced yard?</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="needsCompany"
                checked={formData.needsCompany}
                onCheckedChange={(checked) =>
                  handleChange("needsCompany", checked)
                }
              />
              <Label>Does this pet need someone home often?</Label>
            </div>

            <Label>Compatibility</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goodWithKids"
                  checked={formData.goodWithKids}
                  onCheckedChange={(checked) =>
                    handleChange("goodWithKids", checked)
                  }
                />
                <label
                  htmlFor="goodWithKids"
                  className="text-sm cursor-pointer"
                >
                  Good with kids
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goodWithCats"
                  checked={formData.goodWithCats}
                  onCheckedChange={(checked) =>
                    handleChange("goodWithCats", checked)
                  }
                />
                <label
                  htmlFor="goodWithCats"
                  className="text-sm cursor-pointer"
                >
                  Good with cats
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="goodWithDogs"
                  checked={formData.goodWithDogs}
                  onCheckedChange={(checked) =>
                    handleChange("goodWithDogs", checked)
                  }
                />
                <label
                  htmlFor="goodWithDogs"
                  className="text-sm cursor-pointer"
                >
                  Good with dogs
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="houseTrained"
                  checked={formData.houseTrained}
                  onCheckedChange={(checked) =>
                    handleChange("houseTrained", checked)
                  }
                />
                <label
                  htmlFor="houseTrained"
                  className="text-sm cursor-pointer"
                >
                  House trained
                </label>
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
              className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Tell us about this pet's personality, habits, and special needs..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit">Add Pet</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/my-pets")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
