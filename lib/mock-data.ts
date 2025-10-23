export interface User {
  id: string
  email: string
  password: string
  name: string
  preferences: {
    experienceLevel: "first-time" | "experienced" | "expert"
    housingType: "apartment" | "house-no-yard" | "house-with-yard" | "farm"
    hasChildren: boolean
    activityLevel: "low" | "moderate" | "high"
    petSizePreference: "small" | "medium" | "large" | "any"
    temperamentPreference: string[]
  }
}

export interface Pet {
  id: string
  name: string
  species: "dog" | "cat"
  breed: string
  age: number
  gender: "male" | "female"
  size: "small" | "medium" | "large"
  energyLevel: "low" | "moderate" | "high"
  temperament: string[]
  goodWithKids: boolean
  requiresExperience: boolean
  spaceNeeds: "apartment-ok" | "house-preferred" | "yard-required"
  description: string
  imageUrl: string
  adoptionFee: number
}

export interface Adopter {
  id: string
  name: string
  matchRank: number
  matchScore: number
  verified: boolean
  imageUrl: string
  location: string
  housing: string
  experience: string
  family: string
  appliedDate: string
  daysAgo: number
  status: string
  whyMatch: string[]
  petIds: string[] // Which pets this adopter has applied for
}

export const mockUsers: User[] = [
  {
    id: "1",
    email: "laura@example.com",
    password: "password123",
    name: "Laura Martinez",
    preferences: {
      experienceLevel: "experienced",
      housingType: "house-with-yard",
      hasChildren: true,
      activityLevel: "high",
      petSizePreference: "medium",
      temperamentPreference: ["friendly", "energetic", "playful"],
    },
  },
  {
    id: "2",
    email: "daniel@example.com",
    password: "password123",
    name: "Daniel Chen",
    preferences: {
      experienceLevel: "first-time",
      housingType: "apartment",
      hasChildren: false,
      activityLevel: "low",
      petSizePreference: "small",
      temperamentPreference: ["calm", "independent", "affectionate"],
    },
  },
]

export const mockPets: Pet[] = [
  {
    id: "1",
    name: "Luna",
    species: "dog",
    breed: "Border Collie Mix",
    age: 2,
    gender: "female",
    size: "medium",
    energyLevel: "high",
    temperament: ["intelligent", "energetic", "friendly", "playful"],
    goodWithKids: true,
    requiresExperience: false,
    spaceNeeds: "yard-required",
    description: "Luna is a smart and energetic Border Collie mix who loves to play fetch and learn new tricks.",
    imageUrl: "/border-collie.png",
    adoptionFee: 250,
  },
  {
    id: "2",
    name: "Milo",
    species: "cat",
    breed: "Domestic Shorthair",
    age: 4,
    gender: "male",
    size: "small",
    energyLevel: "low",
    temperament: ["calm", "independent", "affectionate", "quiet"],
    goodWithKids: true,
    requiresExperience: false,
    spaceNeeds: "apartment-ok",
    description: "Milo is a laid-back cat who enjoys lounging in sunny spots and gentle pets.",
    imageUrl: "/orange-tabby-cat.png",
    adoptionFee: 150,
  },
  {
    id: "3",
    name: "Max",
    species: "dog",
    breed: "German Shepherd",
    age: 3,
    gender: "male",
    size: "large",
    energyLevel: "high",
    temperament: ["loyal", "protective", "intelligent", "energetic"],
    goodWithKids: true,
    requiresExperience: true,
    spaceNeeds: "yard-required",
    description: "Max is a loyal German Shepherd who needs an experienced owner and plenty of space to run.",
    imageUrl: "/german-shepherd.png",
    adoptionFee: 300,
  },
  {
    id: "4",
    name: "Bella",
    species: "dog",
    breed: "Labrador Retriever",
    age: 1,
    gender: "female",
    size: "large",
    energyLevel: "high",
    temperament: ["friendly", "playful", "gentle", "energetic"],
    goodWithKids: true,
    requiresExperience: false,
    spaceNeeds: "house-preferred",
    description: "Bella is a sweet and playful Lab puppy who loves everyone she meets.",
    imageUrl: "/yellow-labrador-retriever.jpg",
    adoptionFee: 275,
  },
  {
    id: "5",
    name: "Whiskers",
    species: "cat",
    breed: "Maine Coon",
    age: 5,
    gender: "male",
    size: "large",
    energyLevel: "moderate",
    temperament: ["gentle", "sociable", "playful", "affectionate"],
    goodWithKids: true,
    requiresExperience: false,
    spaceNeeds: "house-preferred",
    description: "Whiskers is a gentle giant who loves attention and playing with feather toys.",
    imageUrl: "/maine-coon-cat.png",
    adoptionFee: 200,
  },
]

export const mockAdopters: Adopter[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    matchRank: 1,
    matchScore: 90,
    verified: true,
    imageUrl: "https://i.pravatar.cc/150?img=1",
    location: "Austin, TX (0 mi)",
    housing: "House with fenced yard",
    experience: "10+ years with large dogs",
    family: "2 adults, no children",
    appliedDate: "Oct 10, 2025",
    daysAgo: 5,
    status: "Pending Review",
    whyMatch: [
      "Very close proximity - can visit anytime",
      "Has required experience with large breeds",
      "Active lifestyle matches pet's energy needs",
      "Proven track record - adopted before successfully",
    ],
    petIds: ["3"], // Max
  },
  {
    id: "2",
    name: "Alicia Smith",
    matchRank: 2,
    matchScore: 75,
    verified: true,
    imageUrl: "https://i.pravatar.cc/150?img=5",
    location: "Austin, TX (5 mi)",
    housing: "House with yard",
    experience: "5+ years with dogs",
    family: "1 adult, 1 child",
    appliedDate: "Oct 12, 2025",
    daysAgo: 3,
    status: "Pending Review",
    whyMatch: [
      "Good proximity for visits",
      "Suitable housing for large dogs",
      "Experience with similar breeds",
      "Family-friendly environment",
    ],
    petIds: ["3"], // Max
  },
  {
    id: "3",
    name: "Michael Rodriguez",
    matchRank: 1,
    matchScore: 88,
    verified: true,
    imageUrl: "https://i.pravatar.cc/150?img=12",
    location: "Austin, TX (2 mi)",
    housing: "House with large yard",
    experience: "First-time dog owner, completed training course",
    family: "2 adults, 2 children",
    appliedDate: "Oct 8, 2025",
    daysAgo: 7,
    status: "Pending Review",
    whyMatch: [
      "Perfect family environment for friendly dogs",
      "Completed pre-adoption training course",
      "Large yard for active play",
      "Children match well with kid-friendly pets",
    ],
    petIds: ["1", "4"], // Luna, Bella
  },
  {
    id: "4",
    name: "Emily Chen",
    matchRank: 1,
    matchScore: 92,
    verified: true,
    imageUrl: "https://i.pravatar.cc/150?img=9",
    location: "Austin, TX (1 mi)",
    housing: "Apartment with pet amenities",
    experience: "15+ years with cats",
    family: "1 adult, no children",
    appliedDate: "Oct 11, 2025",
    daysAgo: 4,
    status: "Pending Review",
    whyMatch: [
      "Extensive experience with cats",
      "Quiet apartment perfect for calm pets",
      "Works from home - constant companionship",
      "Previous cat lived to 18 years old",
    ],
    petIds: ["2", "5"], // Milo, Whiskers
  },
  {
    id: "5",
    name: "David Thompson",
    matchRank: 2,
    matchScore: 82,
    verified: true,
    imageUrl: "https://i.pravatar.cc/150?img=13",
    location: "Austin, TX (8 mi)",
    housing: "House with fenced yard",
    experience: "8+ years with active breeds",
    family: "2 adults, no children",
    appliedDate: "Oct 9, 2025",
    daysAgo: 6,
    status: "Pending Review",
    whyMatch: [
      "Active lifestyle with daily runs",
      "Experience with high-energy breeds",
      "Secure fenced yard for exercise",
      "Both adults work flexible schedules",
    ],
    petIds: ["1", "3"], // Luna, Max
  },
  {
    id: "6",
    name: "Jessica Martinez",
    matchRank: 2,
    matchScore: 78,
    verified: false,
    imageUrl: "https://i.pravatar.cc/150?img=20",
    location: "Austin, TX (12 mi)",
    housing: "House with small yard",
    experience: "3+ years with medium dogs",
    family: "1 adult, no children",
    appliedDate: "Oct 13, 2025",
    daysAgo: 2,
    status: "Pending Review",
    whyMatch: [
      "Suitable housing for medium-sized pets",
      "Good experience level",
      "Flexible work schedule for pet care",
      "References from previous adoption",
    ],
    petIds: ["4"], // Bella
  },
  {
    id: "7",
    name: "Robert Kim",
    matchRank: 3,
    matchScore: 70,
    verified: true,
    imageUrl: "https://i.pravatar.cc/150?img=15",
    location: "Austin, TX (15 mi)",
    housing: "Large house with acreage",
    experience: "20+ years with multiple pets",
    family: "2 adults, 3 children",
    appliedDate: "Oct 7, 2025",
    daysAgo: 8,
    status: "Pending Review",
    whyMatch: [
      "Extensive property for pets to roam",
      "Decades of pet ownership experience",
      "Large family provides socialization",
      "Currently has other pets - good integration",
    ],
    petIds: ["5"], // Whiskers
  },
]
