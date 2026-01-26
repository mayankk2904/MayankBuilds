import type React from "react"
import { FolderOpen, FileCode, BriefcaseBusiness } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ProjectCard } from "@/components/project-card"
import { getAllProjects } from "@/lib/data"
import { ExperienceCard } from "@/components/experience-card"
import { EnhancedScrollIndicator } from "@/components/enhanced-scroll-indicator"
import { AnimatedSection } from "@/components/animated-section"
import { EnhancedProfile } from "@/components/enhanced-profile"
import { CredentialsSection } from "@/components/credentials-section"
import { PortfolioHeader } from "@/components/portfolio-header"
import { getExperienceInfo, getTechnicalSkillsInfo } from "@/lib/data"
import Image from "next/image"

type Skill = {
  name: string
  logo: string
}

const SkillTagComponent = ({ skill }: { skill: Skill }) => {
  return (
<div
  className="
    group relative flex items-center gap-2
    px-3 py-1.5 rounded-full
    bg-muted text-xs font-medium text-muted-foreground
    transition-all duration-200
    hover:bg-accent
  "
>

      {/* Logo (hidden by default) */}
      <span
        className="
          absolute left-2
          opacity-0 scale-90
          group-hover:opacity-100 group-hover:scale-100
          transition-all duration-200
        "
      >
        <Image
          src={skill.logo}
          alt={skill.name}
          width={14}
          height={14}
        />
      </span>

      {/* Text */}
      <span className="pl-0 group-hover:pl-5 transition-all duration-200">
        {skill.name}
      </span>
    </div>
  )
}


export default function Home() {
  const projects = getAllProjects()
  const experienceInfo = getExperienceInfo()
  const technicalSkills = getTechnicalSkillsInfo()

  return (
    <main className="min-h-screen bg-background text-foreground">

      {/* Background Grid Pattern */}
      <div className="
  fixed inset-0 z-0
  bg-[radial-gradient(hsl(var(--border))_1px,transparent_1px)]
  [background-size:20px_20px]
  opacity-30
"></div>


      {/* Header */}
      <PortfolioHeader />

      <div className="relative z-10 container mx-auto p-3 sm:p-4 pt-20 sm:pt-24 pb-6 sm:pb-8">
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Enhanced Profile Section */}
          <div className="md:sticky md:top-24 self-start">
            <AnimatedSection animation="slide-right">
              <EnhancedProfile />
            </AnimatedSection>
          </div>

          <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-4 sm:space-y-6">
            {/* Experience Section - Expanded */}
            <AnimatedSection animation="fade-up" id="experience">
              <Card className="bg-card border-border backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-4 sm:mb-6">
                    <BriefcaseBusiness className="w-5 h-5 mr-2 text-brand" />
                    <h3 className="text-lg font-medium">Experience</h3>
                  </div>

                  <div className="space-y-6 sm:space-y-8">
                    {experienceInfo.map((experience, index) => (
                      <AnimatedSection key={index} animation="fade-up" delay={100 * (index + 1)}>
                        <ExperienceCard 
                          title={experience.title}
                          company={experience.company}
                          period={experience.period}
                          description={experience.description}
                          achievements={experience.achievements}
                          technologies={experience.technologies}
                          logo={experience.logo} // Add this
                        />
                      </AnimatedSection>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Credentials Section */}
            <AnimatedSection animation="fade-up" id="credentials">
              <CredentialsSection />
            </AnimatedSection>

            {/* Skills Section */}
            <AnimatedSection animation="fade-up" id="skills">
              <Card className="bg-card border-border backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center mb-4">
                    <FileCode className="w-5 h-5 mr-2 text-brand" />
                    <h3 className="text-lg font-medium">Technical Skills</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <AnimatedSection animation="slide-right" delay={100}>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-400">AI and Data Science</h4>
                        <div className="flex flex-wrap gap-2">
                          {technicalSkills.aiml.map((skill, index) => (
                            <SkillTagComponent key={index} skill={skill} />
                          ))}
                        </div>
                      </div>
                    </AnimatedSection>

                    <AnimatedSection animation="slide-left" delay={200}>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-400">Development</h4>
                        <div className="flex flex-wrap gap-2">
                          {technicalSkills.development.map((skill, index) => (
                            <SkillTagComponent key={index} skill={skill} />
                          ))}
                        </div>
                      </div>
                    </AnimatedSection>

                    <AnimatedSection animation="slide-right" delay={100}>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-400">Backend and Databases</h4>
                        <div className="flex flex-wrap gap-2">
                          {technicalSkills.backdb.map((skill, index) => (
                            <SkillTagComponent key={index} skill={skill} />
                          ))}
                        </div>
                      </div>
                    </AnimatedSection>

                    <AnimatedSection animation="slide-left" delay={400}>
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-zinc-800 dark:text-zinc-400">Soft Skills</h4>
                        <div className="flex flex-wrap gap-2">
                          {technicalSkills.softSkills.map((skill, index) => (
                            <div
                              key={index}
                              className="px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground"
                            >
                              {skill}
                            </div>
                          ))}
                        </div>
                      </div>
                    </AnimatedSection>
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>

            {/* Projects Section */}
            <AnimatedSection animation="fade-up" id="projects">
              <Card className="bg-card border-border backdrop-blur-sm">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="flex items-center">
                      <FolderOpen className="w-5 h-5 mr-2 text-brand" />
                      <h3 className="text-lg font-medium">Recent Projects</h3>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                    {projects.map((project, index) => (
                      <AnimatedSection key={project.id} animation="zoom-in" delay={100 * (index + 1)}>
                        <ProjectCard
                          title={project.title}
                          category={project.category}
                          image={project.thumbnailImage}
                          slug={project.slug}
                        />
                      </AnimatedSection>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>
        </div>

        {/* Footer */}
        <AnimatedSection
          animation="fade-in"
          delay={500}
          className="mt-4 sm:mt-6 py-3 sm:py-4 text-center text-xs sm:text-sm text-zinc-500"
        >
          <p>© {new Date().getFullYear()} Made with Dedication by Mayank Kulkarni</p>
        </AnimatedSection>
      </div>

      {/* Scroll to Top Button */}
      <EnhancedScrollIndicator />
    </main>
  )
}
