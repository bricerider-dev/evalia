import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-background text-foreground bg-mesh selection:bg-primary/30 selection:text-primary-foreground">
      {/* Decorative Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-glow" />
        <div className="absolute top-[20%] -right-[10%] w-[30%] h-[50%] bg-purple-500/10 rounded-full blur-[100px] animate-glow" style={{ animationDelay: '-2s' }} />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <GraduationCap className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">Evalia</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-sm font-medium hover:bg-white/5">Sign In</Button>
            </Link>
            <Link to="/login">
              <Button className="text-sm font-medium shadow-[0_0_15px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] transition-all">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-8 animate-fade-in stagger-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-xs font-medium text-primary">Now Live: Version 2.0</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 animate-fade-up stagger-2">
            Elevate University <br />
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">Management</span> Experience
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-up stagger-3">
            Streamline grades, student records, and institutional reporting with our high-performance evaluation platform.
          </p>
          <div className="flex flex-wrap justify-center gap-4 animate-fade-up stagger-4">
            <Link to="/login">
              <Button size="lg" className="h-12 px-8 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                Launch Platform <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Bento Grid */}
        <section className="container mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-up" style={{ animationDelay: '0.6s' }}>
          <div className="tech-card p-8 md:col-span-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
              <Zap className="text-primary w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Real-time Evaluations</h3>
            <p className="text-muted-foreground">Instant grade entries and automatic calculation of weighted averages across all departments.</p>
          </div>

          <div className="tech-card p-8">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
              <ShieldCheck className="text-purple-500 w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Secure Records</h3>
            <p className="text-muted-foreground">Blockchain-grade data integrity for transcript and degree verification.</p>
          </div>

          <div className="tech-card p-8">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center mb-6">
              <BookOpen className="text-cyan-500 w-6 h-6" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Modular Subjects</h3>
            <p className="text-muted-foreground">Flexible curriculum management adaptable to any academic system.</p>
          </div>

          <div className="tech-card p-8 md:col-span-2">
            <div className="flex items-center gap-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-3">Analytics Dashboard</h3>
                <p className="text-muted-foreground">Visual insights into student performance trends and institutional efficiency metrics.</p>
              </div>
              <div className="hidden md:block w-40 h-24 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 px-6 relative z-10">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="text-primary w-6 h-6" />
            <span className="font-bold">Evalia</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2026 Evalia. All rights reserved.</p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
