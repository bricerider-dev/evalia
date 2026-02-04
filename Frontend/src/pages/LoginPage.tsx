import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, LogIn, AlertCircle, Users, BookOpen, BarChart3 } from 'lucide-react';

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
    <div className="h-screen w-full bg-slate-50 overflow-hidden flex items-center justify-center relative font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px] animate-pulse [animation-delay:2s]"></div>

      <div className="container max-w-6xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
        {/* Left Section: Branding & Features */}
        <div className="flex-1 space-y-10 animate-in fade-in slide-in-from-left duration-1000 hidden md:block">
          <div className="space-y-6">
            <div className="inline-block p-4 bg-white/60 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-xl shadow-primary/5 animate-float">
              <Logo size="lg" />
            </div>
            <h1 className="text-5xl font-black text-primary tracking-tight leading-[1.15] animate-in fade-in slide-in-from-bottom-6 duration-1000 [animation-delay:300ms]">
              Maîtrisez vos <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent animate-pulse-subtle">Résultats</span>
            </h1>
            <p className="text-lg text-slate-600 font-medium max-w-md leading-relaxed animate-in fade-in duration-1000 [animation-delay:500ms]">
              La plateforme Evalia centralise le suivi académique de l'ENSPD avec précision et élégance.
            </p>
          </div>

          <div className="space-y-4 max-w-sm">
            <CompactFeatureItem
              icon={<Users className="w-5 h-5" />}
              text="Gestion multi-rôles sécurisée"
              delay="[animation-delay:700ms]"
            />
            <CompactFeatureItem
              icon={<BookOpen className="w-5 h-5" />}
              text="Calcul automatique des moyennes"
              delay="[animation-delay:900ms]"
            />
            <CompactFeatureItem
              icon={<BarChart3 className="w-5 h-5" />}
              text="Analyses de performance en temps réel"
              delay="[animation-delay:1100ms]"
            />
          </div>
        </div>

        {/* Right Section: Login Card */}
        <div className="w-full max-w-[420px] animate-in fade-in slide-in-from-right zoom-in-95 duration-1000">
          <Card className="border-white/50 bg-white/70 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden rounded-[2rem]">
            <CardHeader className="space-y-1 pb-6 pt-8 text-center md:text-left">
              <div className="md:hidden flex justify-center mb-4">
                <Logo size="sm" />
              </div>
              <CardTitle className="text-3xl font-black text-primary tracking-tight">Bienvenue</CardTitle>
              <CardDescription className="text-slate-500 font-medium">Connectez-vous pour accéder à votre espace</CardDescription>
            </CardHeader>
            <CardContent className="pb-8">
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <Alert variant="destructive" className="bg-destructive/10 border-destructive/20 text-destructive rounded-2xl animate-in shake-1">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-semibold">{error}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2 group">
                  <Label htmlFor="matricule" className="text-sm font-bold text-slate-700 ml-1 transition-colors group-focus-within:text-primary">Matricule</Label>
                  <Input
                    id="matricule"
                    type="text"
                    placeholder="votre.matricule"
                    value={matricule}
                    onChange={(e) => setMatricule(e.target.value)}
                    required
                    className="h-12 border-slate-200/60 bg-white/50 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-300"
                  />
                </div>

                <div className="space-y-2 group">
                  <Label htmlFor="password" title="password" className="text-sm font-bold text-slate-700 ml-1 transition-colors group-focus-within:text-primary">Mot de passe</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 border-slate-200/60 bg-white/50 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all duration-300"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-2xl shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] mt-2"
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
                      <LogIn className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center mt-6 text-sm text-slate-400 font-medium animate-in fade-in duration-1000 [animation-delay:800ms]">
            Système de Gestion Académique Officiel — ENSPD
          </p>
        </div>
      </div>
    </div>
  );
}

function CompactFeatureItem({ icon, text, delay }: { icon: React.ReactNode, text: string, delay: string }) {
  return (
    <div className={`flex items-center gap-4 p-3 rounded-2xl bg-white/40 border border-white/60 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-700 ${delay} hover:bg-white/60 transition-colors cursor-default`}>
      <div className="w-10 h-10 flex items-center justify-center bg-primary text-white rounded-xl shadow-md shrink-0">
        {icon}
      </div>
      <span className="text-sm font-bold text-slate-700">{text}</span>
    </div>
  );
}

