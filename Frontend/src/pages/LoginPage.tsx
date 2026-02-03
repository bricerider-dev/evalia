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
  const [email, setEmail] = useState('');
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
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch {
      setError('Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@univ.edu', password: 'admin123' },
    { role: 'Enseignant', email: 'prof.benali@univ.edu', password: 'prof123' },
    { role: 'Étudiant', email: 'etudiant1@univ.edu', password: 'etud123' },
  ];

  const fillCredentials = (email: string, password: string) => {
    setEmail(email);
    setPassword(password);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-center mb-12 pt-8">
          <Logo size="lg" />
        </header>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left side - Features */}
          <div className="hidden lg:block space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-primary mb-4">
                Plateforme de Gestion des Notes Académiques
              </h1>
              <p className="text-lg text-muted-foreground">
                Une solution complète pour la gestion des notes, évaluations et résultats académiques de votre département universitaire.
              </p>
            </div>

            <div className="space-y-4">
              <FeatureItem
                icon={<Users className="h-6 w-6" />}
                title="Gestion Multi-Rôles"
                description="Administration, enseignants et étudiants avec des accès personnalisés"
              />
              <FeatureItem
                icon={<BookOpen className="h-6 w-6" />}
                title="Suivi Académique Complet"
                description="CC, Session Normale, Rattrapage avec calcul automatique"
              />
              <FeatureItem
                icon={<BarChart3 className="h-6 w-6" />}
                title="Statistiques & Rapports"
                description="Visualisation des performances et génération de relevés"
              />
            </div>
          </div>

          {/* Right side - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <Card className="shadow-institutional border-0">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl">Connexion</CardTitle>
                <CardDescription>
                  Accédez à votre espace personnel
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
                    <Label htmlFor="email">Adresse email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@univ.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
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
                        key={cred.email}
                        type="button"
                        onClick={() => fillCredentials(cred.email, cred.password)}
                        className="w-full text-left px-3 py-2 rounded-md text-sm bg-secondary/50 hover:bg-secondary transition-colors"
                      >
                        <span className="font-medium text-primary">{cred.role}:</span>{' '}
                        <span className="text-muted-foreground">{cred.email}</span>
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
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="p-2 rounded-lg bg-accent/20 text-accent shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
