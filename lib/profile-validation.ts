// Validation utilities for profile form

export interface ValidationError {
  field: string
  message: string
}

export interface ProfileFormData {
  // Personal Information
  firstName: string
  lastName: string
  email: string
  homePhone?: string
  cellPhone: string
  gender?: string
  birthday: string

  // Address
  addressLine: string
  city: string
  state: string
  zipCode: string
  willingOutOfState: boolean

  // Current Pets
  hasPets: boolean
  petsTypes?: string[]
  petsGoodWithOthers?: boolean

  // Housing
  hasFencedYard?: boolean
  homeType?: string
  landlordAllowsPets?: boolean
  landlordPhone?: string
  landlordEmail?: string
  associationRestrictions?: boolean

  // Work & Pet Care
  worksOutsideHome?: boolean
  hoursHomeAlone?: string
  wherePetsWhenAway?: string

  // Family
  hasChildren: boolean
  childrenCount?: number
  childrenAges?: string
  adultsInHome?: number
  homeActivityLevel?: string

  // Pet Preferences
  petLiveLocation?: string
  adoptionTimeline?: string
  preferredDogBreed?: string
  preferredCatType?: string
  preferredAge?: string
  preferredWeight?: string
  preferredTemperamentDetailed?: string[]
  preferredEnergy?: string
  undesiredCharacteristics?: string[]

  // Veterinary
  takePetsToVet?: boolean
  vetName?: string
  vetPhone?: string
  vetEmail?: string

  // References
  reference1Name?: string
  reference1Phone?: string
  reference1Email?: string
  reference2Name?: string
  reference2Phone?: string
  reference2Email?: string

  // Pet Ownership History
  adoptedBefore?: boolean
  ownedPetBefore?: boolean
  spayedNeutered?: boolean
  vaccinated?: boolean
  hadPetsNoLongerHave?: string
  willingBehaviorTraining?: boolean
  reasonsGiveUp?: string

  // Financial
  planForVetCosts?: string

  // Additional
  additionalComments?: string
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePhone(phone: string): boolean {
  // Simple phone validation - allows various formats
  const phoneRegex = /^[\d\s\-$$$$.]+$/
  return phone.length >= 10 && phoneRegex.test(phone)
}

export function validateZipCode(zip: string): boolean {
  // US ZIP code validation (5 digits or 5+4 format)
  const zipRegex = /^\d{5}(-\d{4})?$/
  return zipRegex.test(zip)
}

export function validateProfileForm(data: Partial<ProfileFormData>): ValidationError[] {
  const errors: ValidationError[] = []

  // Required fields
  if (!data.firstName?.trim()) {
    errors.push({ field: "firstName", message: "First name is required" })
  }
  if (!data.lastName?.trim()) {
    errors.push({ field: "lastName", message: "Last name is required" })
  }
  if (!data.email?.trim()) {
    errors.push({ field: "email", message: "Email is required" })
  } else if (!validateEmail(data.email)) {
    errors.push({ field: "email", message: "Invalid email format" })
  }
  if (!data.cellPhone?.trim()) {
    errors.push({ field: "cellPhone", message: "Cell phone is required" })
  } else if (!validatePhone(data.cellPhone)) {
    errors.push({ field: "cellPhone", message: "Invalid phone number format" })
  }
  if (!data.birthday) {
    errors.push({ field: "birthday", message: "Birthday is required" })
  }
  if (!data.addressLine?.trim()) {
    errors.push({ field: "addressLine", message: "Address is required" })
  }
  if (!data.city?.trim()) {
    errors.push({ field: "city", message: "City is required" })
  }
  if (!data.state?.trim()) {
    errors.push({ field: "state", message: "State is required" })
  }
  if (!data.zipCode?.trim()) {
    errors.push({ field: "zipCode", message: "ZIP code is required" })
  } else if (!validateZipCode(data.zipCode)) {
    errors.push({ field: "zipCode", message: "Invalid ZIP code format" })
  }

  // Conditional validations
  if (data.homePhone && !validatePhone(data.homePhone)) {
    errors.push({ field: "homePhone", message: "Invalid phone number format" })
  }

  if (data.landlordEmail && !validateEmail(data.landlordEmail)) {
    errors.push({ field: "landlordEmail", message: "Invalid email format" })
  }

  if (data.landlordPhone && !validatePhone(data.landlordPhone)) {
    errors.push({ field: "landlordPhone", message: "Invalid phone number format" })
  }

  if (data.vetEmail && !validateEmail(data.vetEmail)) {
    errors.push({ field: "vetEmail", message: "Invalid email format" })
  }

  if (data.vetPhone && !validatePhone(data.vetPhone)) {
    errors.push({ field: "vetPhone", message: "Invalid phone number format" })
  }

  if (data.reference1Email && !validateEmail(data.reference1Email)) {
    errors.push({ field: "reference1Email", message: "Invalid email format" })
  }

  if (data.reference1Phone && !validatePhone(data.reference1Phone)) {
    errors.push({ field: "reference1Phone", message: "Invalid phone number format" })
  }

  if (data.reference2Email && !validateEmail(data.reference2Email)) {
    errors.push({ field: "reference2Email", message: "Invalid email format" })
  }

  if (data.reference2Phone && !validatePhone(data.reference2Phone)) {
    errors.push({ field: "reference2Phone", message: "Invalid phone number format" })
  }

  return errors
}
