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

  const demoCredentials = [
    { role: 'Admin', matricule: 'admin@univ.edu', password: 'admin123' },
    { role: 'Enseignant', matricule: 'prof.benali@univ.edu', password: 'prof123' },
    { role: 'Étudiant', matricule: 'etudiant1@univ.edu', password: 'etud123' },
  ];

  const fillCredentials = (matricule: string, password: string) => {
    setMatricule(matricule);
    setPassword(password);
    setError('');
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden flex items-center justify-center">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-accent/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-secondary/20 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="container relative z-10 mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-center mb-12 animate-fade-in-up">
          <Logo size="lg" />
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left side - Features */}
          <div className="hidden lg:block space-y-8 animate-fade-in-up stagger-1">
            <div>
              <h1 className="text-5xl font-extrabold text-primary mb-6 tracking-tight">
                Plateforme de Gestion <br />
                <span className="text-accent underline decoration-primary/10 underline-offset-8">des Notes Académiques</span>
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-lg">
                Une solution institutionnelle premium pour le suivi complet de la réussite académique au sein de votre département.
              </p>
            </div>

            <div className="space-y-6">
              <FeatureItem
                icon={<Users className="h-6 w-6" />}
                title="Gestion Multi-Rôles"
                description="Administration, enseignants et étudiants avec des accès personnalisés et sécurisés"
                delay="stagger-1"
              />
              <FeatureItem
                icon={<BookOpen className="h-6 w-6" />}
                title="Suivi Académique Complet"
                description="CC (30%), Session Normale (70%), Rattrapage avec calcul automatique intelligent"
                delay="stagger-2"
              />
              <FeatureItem
                icon={<BarChart3 className="h-6 w-6" />}
                title="Tableaux de Bord Dynamiques"
                description="Visualisation en temps réel des performances et génération instantanée de relevés"
                delay="stagger-3"
              />
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full max-w-md mx-auto animate-fade-in-up stagger-2">
            <Card className="glass shadow-institutional border-white/40 ring-1 ring-black/5">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-3xl font-bold tracking-tight text-primary">Connexion</CardTitle>
                <CardDescription className="text-base">
                  Authentification sécurisée requise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="matricule">Matricule</Label>
                    <Input
                      id="matricule"
                      type="text"
                      placeholder="votre.matricule"
                      value={matricule}
                      onChange={(e) => setMatricule(e.target.value)}
                      required
                      autoComplete="matricule"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-institutional text-accent"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      <>
                        <LogIn className="mr-2 h-4 w-4" />
                        Se connecter
                      </>
                    )}
                  </Button>
                </form>

                {/* Demo Credentials */}
                <div className="mt-6 pt-6 border-t">
                  <p className="text-sm text-muted-foreground text-center mb-3">
                    Comptes de démonstration
                  </p>
                  <div className="space-y-2">
                    {demoCredentials.map((cred) => (
                      <button
                        key={cred.matricule}
                        type="button"
                        onClick={() => fillCredentials(cred.matricule, cred.password)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <span className="font-medium text-primary">{cred.role}:</span>{' '}
                        <span className="text-muted-foreground">{cred.matricule}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({
  icon,
  title,
  description,
  delay
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: string;
}) {
  return (
    <div className={`flex gap-5 items-start p-4 rounded-xl transition-all duration-300 hover:bg-white/40 hover:shadow-sm group animate-fade-in-up ${delay}`}>
      <div className="p-3 rounded-xl bg-primary text-accent shadow-lg group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-lg text-primary group-hover:text-accent-foreground transition-colors">{title}</h3>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
