import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header variant="landing" userRole="guest" />

      {/* Hero Section - 中国风格 */}
      <section className="relative py-20 md:py-28 overflow-hidden">
        {/* Gradient background with Chinese-inspired colors */}
        <div className="absolute inset-0 bg-gradient-to-br from-chinese-dai via-chinese-shi to-chinese-zhu opacity-95" />
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Icon cluster */}
            <div className="flex justify-center gap-4 mb-8">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm animate-fade-in">
                <Wind className="h-8 w-8 text-white" />
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <Heart className="h-8 w-8 text-data-red" />
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <Globe2 className="h-8 w-8 text-nature-ice" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white text-balance leading-tight">
              Air Pollution & Public Health
              <span className="block text-2xl md:text-3xl font-normal text-white/80 mt-4">
                Global Data Explorer Platform
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto leading-relaxed">
              Explore the relationship between global air quality and health outcomes. Visualize data, compare regions, and discover insights.
            </p>
            
            <div className="pt-4 max-w-xl mx-auto">
              <SearchBar />
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                <Activity className="h-4 w-4 mr-2" />
                Real-time Data
              </Button>
              <Button variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 backdrop-blur-sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Trend Analysis
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(220, 20%, 95%)"/>
          </svg>
        </div>
      </section>

      {/* Stats Section - 数据概览 */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Globe2, value: "195+", label: "Countries", color: "text-chinese-dai" },
              { icon: Database, value: "50+", label: "Years of Data", color: "text-chinese-shi" },
              { icon: Heart, value: "12+", label: "Health Metrics", color: "text-data-red" },
              { icon: Users, value: "10K+", label: "Active Users", color: "text-chinese-zhu" },
            ].map((stat, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow bg-card">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-3">
                    <div className="p-3 rounded-xl bg-secondary">
                      <stat.icon className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section - 关于项目 */}
      <section id="about" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chinese-dai/10 text-chinese-dai text-sm font-medium mb-4">
              <Leaf className="h-4 w-4" />
              About
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Data-Driven Health Insights
            </h2>
            <p className="text-lg text-muted-foreground">
              Understanding the relationship between air pollution and public health is crucial for policy making and public awareness.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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
              <Card key={index} className="border-0 shadow-md hover:shadow-lg transition-shadow bg-card group">
                <CardContent className="p-6">
                  <div className={`inline-flex p-3 rounded-xl ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - 联系我们 */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-chinese-shi/10 text-chinese-shi text-sm font-medium mb-4">
                <Mail className="h-4 w-4" />
                Contact Us
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Have Questions or Feedback?
              </h2>
              <p className="text-lg text-muted-foreground">
                We'd love to hear from you
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Info */}
              <div className="space-y-4">
                {[
                  { icon: Mail, title: "Email", value: "contact@airhealth.org", color: "bg-chinese-dai/10 text-chinese-dai" },
                  { icon: MapPin, title: "Address", value: "Global Health Research Center", color: "bg-chinese-zhu/10 text-chinese-zhu" },
                  { icon: Phone, title: "Phone", value: "+1 (555) 123-4567", color: "bg-chinese-shi/10 text-chinese-shi" },
                ].map((info, index) => (
                  <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center gap-4">
                      <div className={`p-3 rounded-lg ${info.color}`}>
                        <info.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">{info.title}</h4>
                        <p className="text-muted-foreground text-sm">{info.value}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Contact Form */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">First Name</label>
                      <Input placeholder="John" className="bg-secondary/50" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Last Name</label>
                      <Input placeholder="Doe" className="bg-secondary/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Email</label>
                    <Input type="email" placeholder="john.doe@example.com" className="bg-secondary/50" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Message</label>
                    <Textarea placeholder="Your message..." rows={4} className="bg-secondary/50" />
                  </div>
                  <Button className="w-full bg-chinese-dai hover:bg-chinese-dai/90">Send Message</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
