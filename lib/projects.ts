export interface ProjectGalleryImage {
  url: string
  caption?: string
}

export interface RelatedProject {
  slug: string
  title: string
  category: string
  image: string
}

export interface Project {
  id: number
  slug: string
  title: string
  category: string
  shortDescription: string
  description: string[]
  features: string[]
  technologies: string[]
  coverImage: string
  thumbnailImage: string
  gallery?: ProjectGalleryImage[]
  client?: string
  timeline: string
  role: string
  liveUrl?: string
  githubUrl?: string
  relatedProjects?: RelatedProject[]
}

const projects: Project[] = [
  {
    id: 1,
    slug: "phish-guard",
    title: "PhishGuard AI - Phishing URL Detector",
    category: "Mobile and Web App",
    shortDescription: "An ML + LLM based phishing URL detector.",
    description: [
      "Phishing attacks remain one of the most prevalent cybersecurity threats, often leading to data breaches and financial losses. PhishGuard AI is a cutting-edge mobile and web application designed to empower users to identify and mitigate phishing threats in real-time using advanced machine learning and large language models.",
      "The first phase uses lightweight ML models to analyze URLs for common phishing indicators such as suspicious domain names, URL length, and the presence of certain keywords. This allows for quick initial screening of links.",
      "The second phase is powered by Gemma 2 (2B IT) operating on a Kaggle server, which provides comprehensive semantic analysis of webpage HTML and reveals brand impersonation or malicious intent.",
    ],
    features: [
      "Lightweight ML model for rapid URL screening",
      "Gemma 2 powered semantic analysis for in-depth phishing detection",
      "Gives explanations for why a URL is flagged as phishing",
      "Checks subdomains and URL obfuscation techniques",
      "Gives final verdict with confidence score",
      "Obtained high accuracy of around 96% on benchmark phishing datasets",
    ],
    technologies: ["HTML/CSS", "Huggingface Spaces", "FastAPI", "Kaggle", "LLM"],
    coverImage: "/proj1-1.png",
    thumbnailImage: "/proj1.png",
    gallery: [
      { url: "/proj1-2.png", caption: "img1-2" },
      { url: "/proj1-3.png", caption: "img1-3" },
      { url: "/proj1-4.png", caption: "img1-4" },
      { url: "/proj1-5.png", caption: "img1-5" },
    ],
    timeline: "5 months",
    role: "Lead AI Developer and UX Designer",
    liveUrl: "https://huggingface.co/spaces/MortalMax/PhishGuard",
    relatedProjects: [
      {
        slug: "part-number",
        title: "Part Number Recognition System",
        category: "Web Application",
        image: "/project2.png",
      },
      {
        slug: "yogar",
        title: "YogAR - Augmented Reality Yoga App",
        category: "Mobile App",
        image: "/proj3.png",
      },
    ],
  },
  {
    id: 2,
    slug: "part-number",
    title: "Part Number Recognition System",
    category: "Web Application",
    shortDescription:
      "A machine vision system to identify and catalog industrial part numbers from images using AI.",
    description: [
      "The Part Number Prediction & Training Tool is designed to streamline the identification of components within a manufacturing or plant environment using computer vision. By leveraging a Vision Transformer (ViT) model feedback, the tool provides accurate and real-time part number predictions from images captured via camera or uploaded by the user.",
      "In addition to prediction, the tool enables continuous model improvement through a structured image upload and training interface.",
      "This tool operates entirely in a local deployment mode, ensuring data security, low latency, and seamless offline functionality",
    ],
    features: [
      "Automates part number identification using image inputs.",
      "Allows users to contribute to and manage training data for improved model accuracy.",
      "Enables version-controlled model selection and comparison.",
      "Maintains historical training datafor traceability and auditing.",
    ],
    technologies: ["Next.js", "TypeScript", "Tailwind CSS", "PostgreSQL", "Vision Transformers", "PyTorch", "FastAPI"],
    coverImage: "/project2-1.png",
    thumbnailImage: "/project2.png",
    gallery: [
      { url: "/project2-2.png", caption: "img2-2" },
      { url: "/project2-3.png", caption: "img2-3" },
      { url: "/project2-4.png", caption: "img2-4" },
    ],
    client: "TE Connectivity",
    timeline: "6 months",
    role: "Frontend Developer, Model Trainer, Database Creator",
    relatedProjects: [
      {
        slug: "phish-guard",
        title: "PhishGuard AI - Phishing URL Detector",
        category: "Mobile and Web App",
        image: "/proj1.png",
      },
      {
        slug: "yogar",
        title: "YogAR - Augmented Reality Yoga App",
        category: "Mobile App",
        image: "/proj3.png",
      },
    ],
  },
  {
    id: 3,
    slug: "yogar",
    title: "YogAR - AR based Yoga App",
    category: "Mobile App",
    shortDescription:
      "A Yoga learning app that uses Augmented Reality to guide users through yoga poses in their own environment.",
    description: [
      "This project uses 3D yogasana models which can be projected into the user's real-world environment using AR technology. Users can view the poses from different angles, helping them understand the correct form and alignment.",
      "The models have been optimized for mobile performance, ensuring smooth interaction and rendering on a variety of devices and have been developed using SketchFab and integrated into a React Native app using Google AR for AR functionality.",
      "The AR feature also allows the users to listen to real-time audio instructions and tips while performing the poses, enhancing the learning experience.",
    ],
    features: [
      "Easy to follow AR yoga instructions",
      "Attractive and seamless AR experience",
      "Smooth UI/UX design for effortless navigation",
      "Lightweight 3D models for optimal performance",
      "App size optimized for mobile devices",
    ],
    technologies: ["Figma", "React Native", "JavaScript", "Supabase", "Google AR", "SketchFab", "Blender"],
    coverImage: "/proj3-1.png",
    thumbnailImage: "/proj3.png",
    gallery: [
      { url: "/proj3-2.png", caption: "img3-2" },
      { url: "/proj3-3.png", caption: "img3-3" },
      { url: "/proj3-4.png", caption: "img3-4" },
      { url: "/proj3-5.png", caption: "img3-5" },
    ],
    client: "Personal Project",
    timeline: "6 months",
    role: "UI and Database Developer",
    relatedProjects: [
      {
        slug: "phish-guard",
        title: "PhishGuard AI - Phishing URL Detector",
        category: "Mobile and Web App",
        image: "/proj1.png",
      },
      {
        slug: "part-number",
        title: "Part Number Recognition System",
        category: "Web Application",
        image: "/project2.png",
      },
    ],
  },
]

export { projects }

// Add these functions after the projects array export

export function getAllProjects(): Project[] {
  return projects
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug)
}

export function getRelatedProjects(currentSlug: string, limit = 2): RelatedProject[] {
  const currentProject = getProjectBySlug(currentSlug)
  if (!currentProject || !currentProject.relatedProjects) {
    // If no related projects defined, return random projects
    return projects
      .filter((project) => project.slug !== currentSlug)
      .slice(0, limit)
      .map((project) => ({
        slug: project.slug,
        title: project.title,
        category: project.category,
        image: project.thumbnailImage,
      }))
  }

  return currentProject.relatedProjects.slice(0, limit)
}
