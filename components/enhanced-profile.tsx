// components/EnhancedProfile.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, MapPin, Mail, Languages, Clock, Briefcase } from "lucide-react";
import { getPersonalInfo, getAboutInfo } from "@/lib/data";
import { LanguageCard } from "./LanguageCard";
import TrueFocus from "@/components/TrueFocus";

export function EnhancedProfile() {
  const [activeTab, setActiveTab] = useState("about");

  const personalInfo = getPersonalInfo();
  const aboutInfo = getAboutInfo();

  return (
    <Card className="bg-card border-border col-span-1 flex flex-col overflow-hidden">
      <CardContent className="p-0">
        {/* Profile Header without Particles */}
        <div className="relative bg-gradient-to-b from-muted to-muted px-6 py-4 sm:px-10 sm:py-6 border-b border-border">
          {/* Content */}
          <div className="mx-auto flex flex-col items-center w-full max-w-xs sm:max-w-sm">
            <div
              className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mb-4 border-2 ring-4 ring-muted bg-muted"
              style={{ borderColor: "hsl(var(--accent) / 0.3)" }}
            >
              <Image
                src={personalInfo.avatar || "/placeholder.svg"}
                alt={personalInfo.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-bold text-foreground cursor-target">
                {personalInfo.name}
              </h2>
              <p
                className="text-sm font-medium mb-1"
                style={{ color: "hsl(var(--accent))" }}
              >
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
              <Badge key={index} variant="outline" className="bg-background hover:bg-accent border-border">
                {badge}
              </Badge>
            ))}
          </div>

          <div className="mt-7 mb-5 sm:mt-5 sm:mb-6 flex justify-center">
            <TrueFocus
              sentence="Building AI | for Good."
              separator="|"
              manualMode={false}
              blurAmount={4}
              borderColor="hsl(var(--accent))"
              glowColor="hsl(var(--accent) / 0.6)"
              animationDuration={0.5}
              pauseBetweenAnimations={1}
            />
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="about" className="w-full" onValueChange={setActiveTab}>
          <div className="border-b border-border">
            <TabsList className="w-full bg-transparent border-b border-border rounded-none h-auto p-0">
              <TabsTrigger
                value="about"
                className="flex-1 rounded-none border-b-2 px-2 sm:px-4 py-2 text-xs sm:text-sm"
                style={{
                  borderBottomColor: activeTab === "about" ? "hsl(var(--accent))" : undefined,
                  color: activeTab === "about" ? "hsl(var(--accent))" : undefined,
                }}
              >
                <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                About
              </TabsTrigger>

              <TabsTrigger
                value="contact"
                className="flex-1 rounded-none border-b-2 px-2 sm:px-4 py-2 text-xs sm:text-sm"
                style={{
                  borderBottomColor: activeTab === "contact" ? "hsl(var(--accent))" : undefined,
                  color: activeTab === "contact" ? "hsl(var(--accent))" : undefined,
                }}
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
                <User className="w-4 h-4 mr-2" style={{ color: "hsl(var(--accent))" }} />
                About Me
              </h3>
              <p className="text-sm text-foreground">{aboutInfo.bio}</p>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Briefcase className="w-4 h-4 mr-2" style={{ color: "hsl(var(--accent))" }} />
                Professional Focus
              </h3>

              <div className="space-y-2">
                {aboutInfo.focus.map((item, index) => (
                  <div key={index} className="flex items-start">
                    <span style={{ color: "hsl(var(--accent))" }} className="mr-2">
                      •
                    </span>
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center">
                <Languages className="w-4 h-4 mr-2" style={{ color: "hsl(var(--accent))" }} />
                Languages
              </h3>

              <LanguageCard languages={aboutInfo.languages} />
            </div>
          </TabsContent>

          {/* CONTACT TAB */}
          <TabsContent value="contact" className="p-4 sm:p-6 space-y-4 focus:outline-none">
            <div className="space-y-4">
              <div className="flex items-start">
                <Mail className="w-5 h-5 mr-3" style={{ color: "hsl(var(--accent))" }} />
                <div>
                  <h4 className="font-medium text-foreground">Email</h4>
                  <a
                    href={`mailto:${personalInfo.email}`}
                    className="text-sm text-muted-foreground transition-colors break-all hover:text-[hsl(var(--accent))]"
                  >
                    {personalInfo.email}
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="w-5 h-5 mr-3" style={{ color: "hsl(var(--accent))" }} />
                <div>
                  <h4 className="font-medium text-foreground">Location</h4>
                  <p className="text-sm text-muted-foreground">{personalInfo.location}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Clock className="w-5 h-5 mr-3" style={{ color: "hsl(var(--accent))" }} />
                <div>
                  <h4 className="font-medium text-foreground">Working Hours</h4>
                  <p className="text-sm text-muted-foreground">{personalInfo.workingHours}</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border flex items-center justify-center">
          <div className="flex items-center">
            <span
              className={`w-2 h-2 ${personalInfo.availableForWork ? "bg-green-500" : "bg-red-500"} rounded-full mr-2`}
            />
            <span className="text-xs text-muted-foreground">
              {personalInfo.availableForWork ? "Available for new projects" : "Not available for new projects"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}