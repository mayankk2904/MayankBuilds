"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { SocialLinks } from "@/components/social-links"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, MapPin, Mail, Languages, Clock, Briefcase } from "lucide-react"
import { getPersonalInfo, getAboutInfo } from "@/lib/data"
import ParticlesBackground from "@/components/particles-background"

export function EnhancedProfile() {
  const [activeTab, setActiveTab] = useState("about")

  const personalInfo = getPersonalInfo()
  const aboutInfo = getAboutInfo()

  return (
    <Card className="bg-card border-border backdrop-blur-sm col-span-1 flex flex-col overflow-hidden">
      <CardContent className="p-0">
      {/* Profile Header */}
      <div className="relative bg-gradient-to-b from-muted via-muted/90 to-muted px-6 py-4 sm:px-10 sm:py-6 border-b border-border overflow-hidden">
        
        {/* Particles only for header */}
        <ParticlesBackground
          height="100%"
          zIndex={0}
          countDesktop={120}
          countTablet={90}
          countMobile={60}
          size={2.8}
          colors={["#ff223e", "#ff5f1f", "#ff7300"]}
        />
  <div className="relative z-10 mx-auto flex flex-col items-center w-full max-w-xs sm:max-w-sm">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 
  border-2 border-brand/30 ring-4 ring-muted bg-muted">
              <Image
                src={personalInfo.avatar || "/placeholder.svg"}
                alt={personalInfo.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold">
                {personalInfo.name}
              </h2>
              <p className="text-sm text-brand mb-1">
                {personalInfo.title}
              </p>

              <div className="flex items-center justify-center text-xs text-muted-foreground mb-3">
                <MapPin className="w-3 h-3 mr-1" />
                <span>{personalInfo.location}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-4">
            {personalInfo.badges.map((badge, index) => (
              <Badge
                key={index}
                variant="outline"
                className="bg-background hover:bg-accent"
              >
                {badge}
              </Badge>
            ))}
          </div>

          <SocialLinks socialLinks={personalInfo.social} />
</div> {/* content wrapper */}


        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full" onValueChange={setActiveTab}>
          <div className="border-b border-border">
            <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto p-0">
              <TabsTrigger
                value="about"
                className={`flex-1 rounded-none border-b-2 px-2 sm:px-4 py-2 text-xs sm:text-sm ${
                  activeTab === "about"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                About
              </TabsTrigger>

              <TabsTrigger
                value="contact"
                className={`flex-1 rounded-none border-b-2 px-2 sm:px-4 py-2 text-xs sm:text-sm ${
                  activeTab === "contact"
                    ? "border-brand text-brand"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                Contact
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ABOUT TAB */}
          <TabsContent value="about" className="p-4 sm:p-6 space-y-6 focus:outline-none">
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <User className="w-4 h-4 mr-2 text-brand" />
                About Me
              </h3>
              <p className="text-sm">{aboutInfo.bio}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Briefcase className="w-4 h-4 mr-2 text-brand" />
                Professional Focus
              </h3>

              <div className="space-y-2">
                {aboutInfo.focus.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span className="text-brand mr-2">•</span>
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Languages className="w-4 h-4 mr-2 text-brand" />
                Languages
              </h3>

              <div className="space-y-3">
                {aboutInfo.languages.map((language, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{language.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {language.proficiency}
                      </span>
                    </div>

                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand to-orange-500 rounded-full"
                        style={{ width: `${language.level}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* CONTACT TAB */}
          <TabsContent value="contact" className="p-4 sm:p-6 space-y-4 focus:outline-none">
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 mr-3 text-brand mt-0.5" />
                <div>
                  <h4 className="font-medium">Email</h4>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="text-sm text-muted-foreground hover:text-brand transition-colors break-all"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3 text-brand mt-0.5" />
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p className="text-sm text-muted-foreground">
                    {personalInfo.location}
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="w-5 h-5 mr-3 text-brand mt-0.5" />
                <div>
                  <h4 className="font-medium">Working Hours</h4>
                  <p className="text-sm text-muted-foreground">
                    {personalInfo.workingHours}
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border flex items-center justify-center">
          <div className="flex items-center">
            <span
              className={`w-2 h-2 ${
                personalInfo.availableForWork ? "bg-green-500" : "bg-red-500"
              } rounded-full mr-2`}
            />
            <span className="text-xs text-muted-foreground">
              {personalInfo.availableForWork
                ? "Available for new projects"
                : "Not available for new projects"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
