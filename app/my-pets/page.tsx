"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { AppLayout } from "@/components/app-layout";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
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
import { Pencil, Trash2, X, Upload } from "lucide-react";

export default function MyPetsPage() {
  const { user, getUserPets, deletePet, updatePet } = useAuth();
  const router = useRouter();
  const [userPets, setUserPets] = useState<any[]>([]);
  const [editingPet, setEditingPet] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState({
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
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const fetchPets = async () => {
      const pets = await getUserPets();
      setUserPets(pets || []);
    };
    fetchPets();
  }, [user, router, getUserPets]);

  const handleDelete = async (petId: string) => {
    if (confirm("Are you sure you want to delete this pet?")) {
      await deletePet(petId);
      const pets = await getUserPets();
      setUserPets(pets || []);
    }
  };

  const handleEdit = (pet: any) => {
    setEditingPet(pet);
    setEditFormData({
      name: pet.name || "",
      type: pet.type || "dog",
      breed: pet.breed || "",
      ageGroup: pet.age_group || "adult",
      weightRange: pet.weight_range || "medium",
      energyLevel: pet.energy_level || "moderate",
      size: pet.size || "medium",
      goodWithKids: pet.good_with_children || false,
      goodWithCats: pet.good_with_pets || false,
      goodWithDogs: pet.good_with_pets || false,
      houseTrained: pet.house_trained || false,
      specialNeeds: pet.special_needs || "",
      description: pet.description || "",
      imageUrl: pet.image_url || "",
      // New fields:
      state: pet.state || "",
      adoptableOutOfState: pet.adoptableOutOfState || false,
      onlyPet: pet.only_pet || false,
      okWithAnimals: pet.ok_with_animals || [], // ["dog", "cat"]
      requiresFencedYard: pet.requires_fenced_yard || false,
      needsCompany: pet.needs_company || false,
      comfortableHoursAlone: pet.comfortable_hours_alone || "",
      ownerExperienceRequired: pet.owner_experience_required || "",
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      console.log("[v0] Starting pet image upload:", file.name);
      const formDataObj = new FormData();
      formDataObj.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataObj,
      });

      console.log("[v0] Pet upload response status:", response.status);

      if (!response.ok) {
        let errorMessage = "Failed to upload image";
        try {
          const error = await response.json();
          errorMessage = error.error || errorMessage;
          console.log("[v0] Pet upload error:", error);
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
        "[v0] Pet upload successful, imageUrl length:",
        data.imageUrl?.length
      );
      setEditFormData((prev: any) => ({ ...prev, imageUrl: data.imageUrl }));
    } catch (error) {
      console.error("[v0] Image upload error:", error);
      alert("Failed to upload image: " + String(error));
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (editingPet) {
      const updates = {
        name: editFormData.name,
        type: editFormData.type,
        breed: editFormData.breed,
        ageGroup: editFormData.ageGroup,
        weightRange: editFormData.weightRange,
        energyLevel: editFormData.energyLevel,
        size: editFormData.size,
        temperament: [],
        goodWithChildren: editFormData.goodWithKids,
        goodWithPets: editFormData.goodWithCats || editFormData.goodWithDogs,
        houseTrained: editFormData.houseTrained,
        specialNeeds: editFormData.specialNeeds || null,
        description: editFormData.description || null,
        imageUrl: editFormData.imageUrl || null,
        state: editFormData.state || null,
        adoptable_out_of_state: editFormData.adoptableOutOfState || false,
        only_pet: editFormData.onlyPet || false,
        ok_with_animals: editFormData.okWithAnimals?.length
          ? editFormData.okWithAnimals
          : null,
        requires_fenced_yard: editFormData.requiresFencedYard || false,
        needs_company: editFormData.needsCompany || false,
        comfortable_hours_alone: editFormData.comfortableHoursAlone || null,
        owner_experience_required: editFormData.ownerExperienceRequired || null,
      };

      await updatePet(editingPet.id, updates);
      const pets = await getUserPets();
      setUserPets(pets || []);
      setEditingPet(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingPet(null);
    setEditFormData({});
  };

  const handleChange = (field: string, value: any) => {
    setEditFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!user) {
    return null;
  }

  return (
    <AppLayout>
      <div className="max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Pets</h1>
          <p className="text-muted-foreground">
            Manage your pets and their adoption status
          </p>
        </div>

        {userPets.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <p className="text-muted-foreground mb-4">
              You don't have any pets yet.
            </p>
            <Button onClick={() => router.push("/add-pet")}>
              Add Your First Pet
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {userPets.map((pet) => (
              <div key={pet.id}>
                {editingPet?.id === pet.id ? (
                  <div className="bg-card rounded-lg border p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold">Edit Pet</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleCancelEdit}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-4">
                        <Label>Pet Photo</Label>
                        <div className="flex items-center gap-6">
                          <div className="relative h-32 w-32 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                            {editFormData.imageUrl ? (
                              <Image
                                src={
                                  editFormData.imageUrl || "/placeholder.svg"
                                }
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
                            <Label
                              htmlFor="edit-pet-image"
                              className="cursor-pointer"
                            >
                              <div className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 w-fit">
                                <Upload className="h-4 w-4" />
                                {uploading ? "Uploading..." : "Upload Photo"}
                              </div>
                              <input
                                id="edit-pet-image"
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
                          <Label htmlFor="edit-name">Pet Name *</Label>
                          <Input
                            id="edit-name"
                            value={editFormData.name}
                            onChange={(e) =>
                              handleChange("name", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-type">Type *</Label>
                          <Select
                            value={editFormData.type}
                            onValueChange={(value) =>
                              handleChange("type", value)
                            }
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
                          <Label htmlFor="edit-breed">Breed *</Label>
                          <Input
                            id="edit-breed"
                            value={editFormData.breed}
                            onChange={(e) =>
                              handleChange("breed", e.target.value)
                            }
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-ageGroup">Age Group *</Label>
                          <Select
                            value={editFormData.ageGroup}
                            onValueChange={(value) =>
                              handleChange("ageGroup", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="puppy">
                                Puppy/Kitten (0-1 year)
                              </SelectItem>
                              <SelectItem value="young">
                                Young (1-3 years)
                              </SelectItem>
                              <SelectItem value="adult">
                                Adult (3-7 years)
                              </SelectItem>
                              <SelectItem value="senior">
                                Senior (7+ years)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-weightRange">
                            Weight Range *
                          </Label>
                          <Select
                            value={editFormData.weightRange}
                            onValueChange={(value) =>
                              handleChange("weightRange", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="small">
                                Small (0-25 lbs)
                              </SelectItem>
                              <SelectItem value="medium">
                                Medium (25-60 lbs)
                              </SelectItem>
                              <SelectItem value="large">
                                Large (60+ lbs)
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="edit-size">Size *</Label>
                          <Select
                            value={editFormData.size}
                            onValueChange={(value) =>
                              handleChange("size", value)
                            }
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
                          <Label htmlFor="edit-energyLevel">
                            Energy Level *
                          </Label>
                          <Select
                            value={editFormData.energyLevel}
                            onValueChange={(value) =>
                              handleChange("energyLevel", value)
                            }
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
                            value={editFormData.okWithAnimals.join(",")}
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
                          <Label>
                            How many hours can this pet be home alone?
                          </Label>
                          <Select
                            value={editFormData.comfortableHoursAlone}
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
                          <Label>
                            Does this pet require an experienced owner?
                          </Label>
                          <Select
                            value={editFormData.ownerExperienceRequired}
                            onValueChange={(value) =>
                              handleChange("ownerExperienceRequired", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                No special experience
                              </SelectItem>
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
                          <Input
                            id="state"
                            placeholder="e.g., Texas"
                            value={editFormData.state}
                            onChange={(e) =>
                              handleChange("state", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="adoptableOutOfState"
                            checked={editFormData.adoptableOutOfState}
                            onCheckedChange={(checked) =>
                              handleChange("adoptableOutOfState", checked)
                            }
                          />
                          <Label>Can this pet be adopted out of state?</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="onlyPet"
                            checked={editFormData.onlyPet}
                            onCheckedChange={(checked) =>
                              handleChange("onlyPet", checked)
                            }
                          />
                          <Label>Does this pet need to be the only pet?</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="requiresFencedYard"
                            checked={editFormData.requiresFencedYard}
                            onCheckedChange={(checked) =>
                              handleChange("requiresFencedYard", checked)
                            }
                          />
                          <Label>Does this pet require a fenced yard?</Label>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="needsCompany"
                            checked={editFormData.needsCompany}
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
                              id="edit-goodWithKids"
                              checked={editFormData.goodWithKids}
                              onCheckedChange={(checked) =>
                                handleChange("goodWithKids", checked)
                              }
                            />
                            <label
                              htmlFor="edit-goodWithKids"
                              className="text-sm cursor-pointer"
                            >
                              Good with kids
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-goodWithCats"
                              checked={editFormData.goodWithCats}
                              onCheckedChange={(checked) =>
                                handleChange("goodWithCats", checked)
                              }
                            />
                            <label
                              htmlFor="edit-goodWithCats"
                              className="text-sm cursor-pointer"
                            >
                              Good with cats
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-goodWithDogs"
                              checked={editFormData.goodWithDogs}
                              onCheckedChange={(checked) =>
                                handleChange("goodWithDogs", checked)
                              }
                            />
                            <label
                              htmlFor="edit-goodWithDogs"
                              className="text-sm cursor-pointer"
                            >
                              Good with dogs
                            </label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="edit-houseTrained"
                              checked={editFormData.houseTrained}
                              onCheckedChange={(checked) =>
                                handleChange("houseTrained", checked)
                              }
                            />
                            <label
                              htmlFor="edit-houseTrained"
                              className="text-sm cursor-pointer"
                            >
                              House trained
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-specialNeeds">Special Needs</Label>
                        <Input
                          id="edit-specialNeeds"
                          placeholder="Any medical conditions or special requirements"
                          value={editFormData.specialNeeds}
                          onChange={(e) =>
                            handleChange("specialNeeds", e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <textarea
                          id="edit-description"
                          className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background"
                          value={editFormData.description}
                          onChange={(e) =>
                            handleChange("description", e.target.value)
                          }
                          placeholder="Tell us about this pet's personality, habits, and special needs..."
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button onClick={handleSaveEdit}>Save Changes</Button>
                        <Button variant="outline" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-card rounded-lg border p-6 flex gap-6">
                    <div className="relative h-32 w-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={pet.image_url || "/placeholder.svg"}
                        alt={pet.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-2xl font-bold mb-1">
                            {pet.name}
                          </h3>
                          <p className="text-muted-foreground">
                            {pet.breed} • {pet.age_group} • {pet.type}
                          </p>
                        </div>
                        <Badge className="bg-green-100 text-green-700 border-green-200 capitalize">
                          {pet.status}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {pet.temperament?.map((trait: string) => (
                          <Badge
                            key={trait}
                            variant="secondary"
                            className="capitalize"
                          >
                            {trait}
                          </Badge>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="text-muted-foreground">Energy:</span>
                          <span className="ml-2 font-medium capitalize">
                            {pet.energy_level}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Size:</span>
                          <span className="ml-2 font-medium capitalize">
                            {pet.size}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Good with kids:
                          </span>
                          <span className="ml-2 font-medium">
                            {pet.good_with_children ? "Yes" : "No"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            Good with pets:
                          </span>
                          <span className="ml-2 font-medium">
                            {pet.good_with_pets ? "Yes" : "No"}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button onClick={() => router.push(`/pet/${pet.id}`)}>
                          View Details
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(pet)}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit Pet
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(pet.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
