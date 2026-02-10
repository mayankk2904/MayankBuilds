import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Trophy, Ribbon, ShieldCheck } from "lucide-react"
import { AnimatedSection } from "@/components/animated-section"
import { getCredentialsInfo } from "@/lib/data"

export function CredentialsSection() {
  const credentialsInfo = getCredentialsInfo()

  return (
    <Card className="bg-card border-border backdrop-blur-sm">
      <CardContent className="p-4 sm:p-6">
        <div className="flex items-center mb-4 sm:mb-6">
          <Ribbon className="w-5 h-5 mr-2" style={{ color: "hsl(var(--accent))" }} />
          <h3 className="text-lg font-medium cursor-target">Credentials</h3>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* Professional Certifications */}
          <AnimatedSection animation="fade-up" delay={100}>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center border-b border-border pb-2">
                <ShieldCheck className="w-4 h-4 mr-2" style={{ color: "hsl(var(--accent))" }} />
                Professional Certifications
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {credentialsInfo.certifications.map((cert, index) => (
                  <div
                    key={index}
                    className="flex items-start bg-muted/60 p-3 rounded-lg"
                  >
                    {cert.logo && (
                      <div className="relative w-10 h-10 mr-3 rounded-md overflow-hidden bg-background border border-border">
                        <Image
                          src={cert.logo || "/placeholder.svg"}
                          alt={cert.issuer}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    )}
                    <div>
                      <h5 className="text-sm font-medium">{cert.name}</h5>
                      <p className="text-xs text-muted-foreground">
                        {cert.issuer} • {cert.date}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Education */}
          <AnimatedSection animation="fade-up" delay={200}>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center border-b border-border pb-2">
                <GraduationCap className="w-4 h-4 mr-2" style={{ color: "hsl(var(--accent))" }} />
                Education
              </h4>

              <div className="space-y-3 sm:space-y-4">
                {credentialsInfo.education.map((edu, index) => (
                  <div
                    key={index}
                    className="flex items-start bg-muted/60 p-3 rounded-lg"
                  >
                    {edu.logo && (
                      <div className="relative w-10 h-10 mr-3 rounded-md overflow-hidden bg-background border border-border flex-shrink-0">
                        <Image
                          src={edu.logo || "/placeholder.svg"}
                          alt={edu.institution}
                          fill
                          className="object-contain p-1"
                        />
                      </div>
                    )}
                    <div>
                      <h5 className="text-sm font-medium">{edu.degree}</h5>
                      <p className="text-xs text-muted-foreground">
                        {edu.institution} • {edu.year}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Awards & Honors */}
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground flex items-center border-b border-border pb-2">
                <Trophy className="w-4 h-4 mr-2" style={{ color: "hsl(var(--accent))" }} />
                Awards & Honors
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                {credentialsInfo.awards.map((award, index) => (
                  <div
                    key={index}
                    className="flex items-start bg-muted/60 p-3 rounded-lg"
                  >
                    <div className="w-10 h-10 mr-3 rounded-md bg-background border border-border flex-shrink-0 grid place-items-center">
                      <Trophy className="w-5 h-5" style={{ color: "hsl(var(--accent))" }} />
                    </div>

                    <div>
                      <h5 className="text-sm font-medium">{award.title}</h5>
                      <p className="text-xs text-muted-foreground">
                        {award.issuer} • {award.date}
                      </p>
                      {award.description && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {award.description}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </CardContent>
    </Card>
  )
}
