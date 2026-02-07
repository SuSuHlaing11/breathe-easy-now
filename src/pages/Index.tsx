import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrganizationRequestForm from "@/components/OrganizationRequestForm";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { 
  MotionSection, 
  StaggerContainer, 
  MotionDiv,
  AnimatedCard,
  AnimatedHeading,
} from "@/components/animations";
import { 
  Wind, 
  Heart, 
  Globe2, 
  BarChart3, 
  Database,
  Megaphone,
  Shield,
  Upload,
  LineChart,
  AlertCircle,
  CheckCircle,
  Info,
  Building2
} from "lucide-react";
import { mockAnnouncements } from "@/data/mockData";

const Index = () => {
  const prefersReducedMotion = useReducedMotion();

  const features = [
    {
      icon: Globe2,
      title: "Global Coverage",
      description: "Access data from 195+ countries with comprehensive air quality and health metrics.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Powerful visualization tools to analyze trends and correlations in environmental health data.",
    },
    {
      icon: Shield,
      title: "Verified Data",
      description: "All data is verified from trusted sources including WHO, government agencies, and research institutions.",
    },
    {
      icon: Upload,
      title: "Easy Upload",
      description: "Approved organizations can easily upload and share their environmental and health data.",
    },
    {
      icon: LineChart,
      title: "Trend Prediction",
      description: "AI-powered predictions to forecast air quality and health impact trends.",
    },
    {
      icon: Database,
      title: "Data Export",
      description: "Download datasets in multiple formats for your own research and analysis.",
    },
  ];

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "warning": return AlertCircle;
      case "success": return CheckCircle;
      default: return Info;
    }
  };

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "warning": return "text-amber-600 bg-amber-100";
      case "success": return "text-emerald-600 bg-emerald-100";
      default: return "text-primary bg-primary/10";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="landing" userRole="guest" />

      {/* Hero Section */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/80" />
        <motion.div 
          className="absolute inset-0 opacity-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.1 }}
          transition={{ duration: 1.5 }}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            <motion.div 
              className="flex justify-center gap-4 mb-8"
              initial="hidden"
              animate="visible"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.15 }
                }
              }}
            >
              {[Wind, Heart, Globe2].map((Icon, index) => (
                <motion.div
                  key={index}
                  variants={{
                    hidden: { opacity: 0, scale: 0.5, y: 20 },
                    visible: { 
                      opacity: 1, 
                      scale: 1, 
                      y: 0,
                      transition: { 
                        type: 'spring',
                        stiffness: 200,
                        damping: 15
                      }
                    }
                  }}
                  whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 5 }}
                  className="p-3 rounded-xl bg-primary-foreground/10 backdrop-blur-sm"
                >
                  <Icon className="h-8 w-8 text-primary-foreground" />
                </motion.div>
              ))}
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-primary-foreground text-balance leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Air Pollution & Public Health
              <motion.span 
                className="block text-2xl md:text-3xl font-normal text-primary-foreground/80 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Global Data Explorer Platform
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-primary-foreground/75 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              A collaborative platform for organizations to share and analyze environmental health data. Join our network of research institutions, hospitals, and government agencies.
            </motion.p>
          </div>
        </div>

        <motion.div 
          className="absolute bottom-0 left-0 right-0"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </motion.div>
      </section>

      {/* Announcements Section */}
      <MotionSection id="announcements" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Megaphone className="h-4 w-4" />
              Announcements
            </motion.div>
            <AnimatedHeading className="text-3xl md:text-4xl font-bold text-foreground">
              Latest Updates
            </AnimatedHeading>
          </motion.div>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={0.1}>
            {mockAnnouncements.map((announcement, index) => {
              const Icon = getAnnouncementIcon(announcement.type);
              const colorClass = getAnnouncementColor(announcement.type);
              
              return (
                <MotionDiv key={announcement.id}>
                  <AnimatedCard className="border shadow-sm h-full" hoverScale={1.02} hoverY={-4}>
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${colorClass}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            {new Date(announcement.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground">{announcement.content}</p>
                    </CardContent>
                  </AnimatedCard>
                </MotionDiv>
              );
            })}
          </StaggerContainer>
        </div>
      </MotionSection>

      {/* Features Section */}
      <MotionSection id="features" className="py-20 bg-secondary/30" delay={0.1}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <BarChart3 className="h-4 w-4" />
              Features
            </motion.div>
            <AnimatedHeading className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Platform Capabilities
            </AnimatedHeading>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Everything you need to analyze, share, and understand environmental health data
            </motion.p>
          </motion.div>

          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto" staggerDelay={0.1}>
            {features.map((feature, index) => (
              <MotionDiv key={index}>
                <AnimatedCard className="border-0 shadow-md bg-card h-full" hoverScale={1.03} hoverY={-6}>
                  <CardContent className="p-6">
                    <motion.div 
                      className="inline-flex p-3 rounded-xl bg-primary/10 text-primary mb-4"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground text-sm">{feature.description}</p>
                  </CardContent>
                </AnimatedCard>
              </MotionDiv>
            ))}
          </StaggerContainer>
        </div>
      </MotionSection>

      {/* Organization Registration Section */}
      <MotionSection id="register" className="py-20 bg-background" delay={0.1}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Building2 className="h-4 w-4" />
              Join Us
            </motion.div>
            <AnimatedHeading className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Register Your Organization
            </AnimatedHeading>
            <motion.p 
              className="text-lg text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              Submit your organization details to gain access to our data platform
            </motion.p>
          </motion.div>

          <div className="max-w-2xl mx-auto">
            <OrganizationRequestForm />
          </div>
        </div>
      </MotionSection>

      <Footer />
    </div>
  );
};

export default Index;
