import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { 
  MotionSection, 
  StaggerContainer, 
  MotionDiv,
  AnimatedCard,
  AnimatedIcon,
  AnimatedHeading,
  AnimatedButton
} from "@/components/animations";
import { 
  Wind, 
  Heart, 
  Globe2, 
  BarChart3, 
  Users, 
  Database,
  Mail,
  MapPin,
  Phone,
  Leaf,
  Activity,
  TrendingUp
} from "lucide-react";

const Index = () => {
  const prefersReducedMotion = useReducedMotion();

  const MotionWrapper = prefersReducedMotion ? 'div' : motion.div;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="landing" userRole="guest" />

      {/* Hero Section - 中国风格 */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Gradient background with Chinese-inspired colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-chinese-dai via-chinese-shi to-chinese-zhu opacity-95" />
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
            {/* Icon cluster */}
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
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-sm"
                >
                  <Icon className={`h-8 w-8 ${
                    index === 0 ? 'text-white' : 
                    index === 1 ? 'text-data-red' : 'text-nature-ice'
                  }`} />
                </motion.div>
              ))}
            </motion.div>

            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-white text-balance leading-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              Air Pollution & Public Health
              <motion.span 
                className="block text-2xl md:text-3xl font-normal text-white/80 mt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Global Data Explorer Platform
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              Explore the relationship between global air quality and health outcomes. Visualize data, compare regions, and discover insights.
            </motion.p>
            
            <motion.div 
              className="pt-4 max-w-xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
            >
              <SearchBar />
            </motion.div>

            {/* Quick action buttons */}
            <motion.div 
              className="flex flex-wrap justify-center gap-3 pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                  <Activity className="h-4 w-4 mr-2" />
                  Real-time Data
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trend Analysis
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Decorative wave */}
        <motion.div 
          className="absolute bottom-0 left-0 right-0"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(220, 20%, 95%)"/>
          </svg>
        </motion.div>
      </section>

      {/* Stats Section - 数据概览 */}
      <MotionSection className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6" staggerDelay={0.1}>
            {[
              { icon: Globe2, value: "195+", label: "Countries", color: "text-chinese-dai" },
              { icon: Database, value: "50+", label: "Years of Data", color: "text-chinese-shi" },
              { icon: Heart, value: "12+", label: "Health Metrics", color: "text-data-red" },
              { icon: Users, value: "10K+", label: "Active Users", color: "text-chinese-zhu" },
            ].map((stat, index) => (
              <MotionDiv key={index}>
                <AnimatedCard className="border-0 shadow-sm bg-card" hoverScale={1.03} hoverY={-6}>
                  <CardContent className="p-6 text-center">
                    <AnimatedIcon className="flex justify-center mb-3" delay={index * 0.1}>
                      <div className="p-3 rounded-xl bg-secondary">
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </AnimatedIcon>
                    <motion.div 
                      className="text-3xl font-bold text-foreground"
                      initial={{ opacity: 0, scale: 0.5 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ 
                        delay: 0.2 + index * 0.1,
                        type: 'spring',
                        stiffness: 200
                      }}
                    >
                      {stat.value}
                    </motion.div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </AnimatedCard>
              </MotionDiv>
            ))}
          </StaggerContainer>
        </div>
      </MotionSection>

      {/* About Section - 关于项目 */}
      <MotionSection id="about" className="py-20 bg-secondary/30" delay={0.1}>
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-3xl mx-auto text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chinese-dai/10 text-chinese-dai text-sm font-medium mb-4"
              whileHover={{ scale: 1.05 }}
            >
              <Leaf className="h-4 w-4" />
              About
            </motion.div>
            <AnimatedHeading className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Data-Driven Health Insights
            </AnimatedHeading>
            <motion.p 
              className="text-lg text-muted-foreground"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              Understanding the relationship between air pollution and public health is crucial for policy making and public awareness.
            </motion.p>
          </motion.div>

          <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto" staggerDelay={0.15}>
            {[
              {
                icon: BarChart3,
                title: "Data-Driven",
                description: "Access comprehensive datasets combining air quality measurements with health statistics from trusted global sources.",
                color: "bg-data-blue/10 text-data-blue",
              },
              {
                icon: Globe2,
                title: "Global Coverage",
                description: "Explore data from 195+ countries and regions, filterable by continent, income group, and more.",
                color: "bg-chinese-zhu/10 text-chinese-zhu",
              },
              {
                icon: Heart,
                title: "Health Metrics",
                description: "Analyze various health indicators including respiratory diseases, cardiovascular conditions, and mortality rates.",
                color: "bg-data-red/10 text-data-red",
              },
            ].map((feature, index) => (
              <MotionDiv key={index}>
                <AnimatedCard className="border-0 shadow-md bg-card group h-full" hoverScale={1.03} hoverY={-8}>
                  <CardContent className="p-6">
                    <motion.div 
                      className={`inline-flex p-3 rounded-xl ${feature.color} mb-4`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <feature.icon className="h-6 w-6" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                  </CardContent>
                </AnimatedCard>
              </MotionDiv>
            ))}
          </StaggerContainer>
        </div>
      </MotionSection>

      {/* Contact Section - 联系我们 */}
      <MotionSection id="contact" className="py-20 bg-background" delay={0.1}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <motion.div 
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <motion.div 
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chinese-shi/10 text-chinese-shi text-sm font-medium mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Mail className="h-4 w-4" />
                Contact Us
              </motion.div>
              <AnimatedHeading className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Have Questions or Feedback?
              </AnimatedHeading>
              <motion.p 
                className="text-lg text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                We'd love to hear from you
              </motion.p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <StaggerContainer className="space-y-4" staggerDelay={0.1}>
                {[
                  { icon: Mail, title: "Email", value: "contact@airhealth.org", color: "bg-chinese-dai/10 text-chinese-dai" },
                  { icon: MapPin, title: "Address", value: "Global Health Research Center", color: "bg-chinese-zhu/10 text-chinese-zhu" },
                  { icon: Phone, title: "Phone", value: "+1 (555) 123-4567", color: "bg-chinese-shi/10 text-chinese-shi" },
                ].map((info, index) => (
                  <MotionDiv key={index}>
                    <AnimatedCard className="border-0 shadow-sm" hoverScale={1.02} hoverY={-2}>
                      <CardContent className="p-5 flex items-center gap-4">
                        <motion.div 
                          className={`p-3 rounded-lg ${info.color}`}
                          whileHover={{ scale: 1.1, rotate: 5 }}
                        >
                          <info.icon className="h-5 w-5" />
                        </motion.div>
                        <div>
                          <h4 className="font-semibold text-foreground">{info.title}</h4>
                          <p className="text-muted-foreground text-sm">{info.value}</p>
                        </div>
                      </CardContent>
                    </AnimatedCard>
                  </MotionDiv>
                ))}
              </StaggerContainer>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                      >
                        <label className="text-sm font-medium text-foreground">First Name</label>
                        <Input placeholder="John" className="bg-secondary/50 transition-all focus:scale-[1.02]" />
                      </motion.div>
                      <motion.div 
                        className="space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.35 }}
                      >
                        <label className="text-sm font-medium text-foreground">Last Name</label>
                        <Input placeholder="Doe" className="bg-secondary/50 transition-all focus:scale-[1.02]" />
                      </motion.div>
                    </div>
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.4 }}
                    >
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input type="email" placeholder="john.doe@example.com" className="bg-secondary/50 transition-all focus:scale-[1.02]" />
                    </motion.div>
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.45 }}
                    >
                      <label className="text-sm font-medium text-foreground">Message</label>
                      <Textarea placeholder="Your message..." rows={4} className="bg-secondary/50 transition-all focus:scale-[1.02]" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      <AnimatedButton className="w-full bg-chinese-dai hover:bg-chinese-dai/90">
                        Send Message
                      </AnimatedButton>
                    </motion.div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </MotionSection>

      <Footer />
    </div>
  );
};

export default Index;
