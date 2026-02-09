import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, AlertCircle, Users, BookOpen, BarChart3, GraduationCap } from 'lucide-react';

export default function LoginPage() {
  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(matricule, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Matricule ou mot de passe incorrect');
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-background text-foreground bg-mesh overflow-hidden flex items-center justify-center relative font-sans selection:bg-primary/30 selection:text-primary-foreground">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] animate-glow"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] animate-glow [animation-delay:2s]"></div>

      {/* Top Center Logo - All Screens */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 animate-fade-in">
        <div className="relative group inline-block">
          {/* Logo Glow Effect */}
          <div className="absolute -inset-3 bg-gradient-to-r from-primary via-blue-500 to-purple-500 rounded-2xl blur-xl opacity-30 group-hover:opacity-60 transition duration-700 animate-glow"></div>

          {/* Logo Component with animations */}
          <div className="relative transform transition-all duration-500 group-hover:scale-110">
            <Logo size="lg" showText={true} />
          </div>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12 mt-24">
        {/* Left Section: Branding & Features */}
        <div className="flex-1 space-y-10 hidden md:block animate-fade-in">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 mb-2 animate-fade-in stagger-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Institutional Platform</span>
            </div>

            <h1 className="text-5xl font-black tracking-tight leading-[1.15] animate-fade-up stagger-2">
              Maîtrisez vos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-purple-400 animate-pulse-subtle">Résultats</span>
            </h1>
            <p className="text-lg text-muted-foreground font-medium max-w-md leading-relaxed animate-fade-up stagger-3">
              La plateforme Evalia centralise le suivi académique de l'ENSPD avec précision et élégance.
            </p>
          </div>

          <div className="space-y-4 max-w-sm animate-fade-up stagger-4">
            <CompactFeatureItem
              icon={<Users className="w-5 h-5" />}
              text="Gestion multi-rôles sécurisée"
            />
            <CompactFeatureItem
              icon={<BookOpen className="w-5 h-5" />}
              text="Calcul automatique des moyennes"
            />
            <CompactFeatureItem
              icon={<BarChart3 className="w-5 h-5" />}
              text="Analyses de performance en temps réel"
            />
          </div>
        </div>

        {/* Right Section: Login Card */}
        <div className="w-full max-w-[420px] animate-fade-in stagger-2">
          <div className="relative group">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

            <Card className="relative border-white/10 bg-card/60 backdrop-blur-2xl shadow-2xl overflow-hidden rounded-[2.5rem]">
              <CardHeader className="space-y-1 pb-6 pt-8 text-center md:text-left">
                <CardTitle className="text-3xl font-black tracking-tight">Bienvenue</CardTitle>
                <CardDescription className="text-muted-foreground font-medium italic">Connectez-vous pour accéder à votre espace</CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-2xl animate-shake">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="font-semibold">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2 group">
                    <Label htmlFor="matricule" className="text-sm font-bold ml-1 transition-colors group-focus-within:text-primary">Matricule</Label>
                    <Input
                      id="matricule"
                      type="text"
                      placeholder="votre.matricule"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      required
                      className="h-12 border-white/10 bg-white/5 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="space-y-2 group">
                    <Label htmlFor="password" title="password" className="text-sm font-bold ml-1 transition-colors group-focus-within:text-primary">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-12 border-white/10 bg-white/5 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-300 placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-2 group"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Authentification...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Se connecter</span>
                        <LogIn className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <p className="text-center mt-8 text-xs text-muted-foreground/60 font-medium uppercase tracking-[0.2em]">
            Official Academic system — ENSPD
          </p>
        </div>
      </div>
    </div>
  );
}

function CompactFeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 shadow-sm hover:bg-white/10 transition-all cursor-default group">
      <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary rounded-xl shadow-inner group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <span className="text-sm font-bold">{text}</span>
    </div>
  );
}

