import { useState, useEffect, useMemo } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { downloadPVPDF, getPVFilters } from '@/api/grade';
import { FileDown, Loader, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Filiere {
  id: number;
  code: string;
  nom: string;
}

interface Niveau {
  code: string;
  label: string;
}

interface Combinaison {
  filiere_id: string;
  niveau: string;
}

interface GeneratePVDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  evaluationType?: 'CC' | 'SN' | 'RA' | 'Final';
}

export function GeneratePVDialog({
  open,
  onOpenChange,
  evaluationType = 'CC',
}: GeneratePVDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [filieres, setFilieres] = useState<Filiere[]>([]);
  const [niveaux, setNiveaux] = useState<Niveau[]>([]);
  const [combinaisons, setCominaisons] = useState<Combinaison[]>([]);
  const [selectedFiliere, setSelectedFiliere] = useState<string>('');
  const [selectedNiveau, setSelectedNiveau] = useState<string>('');
  const [isLoadingFilters, setIsLoadingFilters] = useState(false);

  // Charger les filtres lors de l'ouverture du dialogue
  useEffect(() => {
    if (open) {
      loadFilters();
    }
  }, [open]);

  const loadFilters = async () => {
    try {
      setIsLoadingFilters(true);
      const data = await getPVFilters();
      setFilieres(data.filieres || []);
      setNiveaux(data.niveaux || []);
      setCominaisons(data.combinaisons || []);
    } catch (error) {
      console.error('Erreur lors du chargement des filtres:', error);
      toast.error('Erreur lors du chargement des options');
    } finally {
      setIsLoadingFilters(false);
    }
  };

  // Calculer les niveaux valides pour la filière sélectionnée
  const niveauxValides = useMemo(() => {
    if (!selectedFiliere) return niveaux;
    return niveaux.filter(n =>
      combinaisons.some(c => c.filiere_id === selectedFiliere && c.niveau === n.code)
    );
  }, [selectedFiliere, niveaux, combinaisons]);

  // Calculer les filières valides pour le niveau sélectionné
  const filieresValides = useMemo(() => {
    if (!selectedNiveau) return filieres;
    return filieres.filter(f =>
      combinaisons.some(c => c.filiere_id === String(f.id) && c.niveau === selectedNiveau)
    );
  }, [selectedNiveau, filieres, combinaisons]);

  // Vérifier si la combinaison sélectionnée est valide
  const combinaisonValide = useMemo(() => {
    if (!selectedFiliere || !selectedNiveau) return true;
    return combinaisons.some(
      c => c.filiere_id === selectedFiliere && c.niveau === selectedNiveau
    );
  }, [selectedFiliere, selectedNiveau, combinaisons]);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      // Envoyer les filtres pour tous les types de PV
      const options = (selectedFiliere || selectedNiveau) 
        ? { 
            filiere_id: selectedFiliere || undefined, 
            niveau: selectedNiveau || undefined 
          }
        : undefined;
      await downloadPVPDF(evaluationType, options);
      toast.success(`PV ${evaluationType} téléchargé avec succès`);
      onOpenChange(false);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error(`Erreur lors de la génération du PV ${evaluationType}`);
    } finally {
      setIsLoading(false);
    }
  };

  const evaluationNames: Record<string, string> = {
    CC: 'Contrôle Continu',
    SN: 'Session Normale',
    RA: 'Rattrapage',
    Final: 'Final',
  };

  const hasData = filieres.length > 0 && niveaux.length > 0;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Générer le PV</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir générer le Procès-Verbal pour{' '}
            <span className="font-semibold">{evaluationNames[evaluationType]}</span> ?
            <br />
            <span className="text-xs text-muted-foreground mt-2 inline-block">
              Un fichier PDF sera téléchargé avec les notes de tous les étudiants.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Filtres pour tous les types de PV */}
        <div className="space-y-4 py-4">
          {!hasData && !isLoadingFilters && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p>Aucune classe avec données d'évaluation disponible</p>
            </div>
          )}

          {isLoadingFilters ? (
            <div className="flex items-center justify-center py-8">
              <Loader className="h-5 w-5 animate-spin text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Chargement des options...</span>
            </div>
          ) : hasData ? (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Filière {filieresValides.length === 0 && selectedNiveau && '(aucune disponible)'}
                </label>
                <Select 
                  value={selectedFiliere} 
                  onValueChange={(value) => {
                    setSelectedFiliere(value);
                    // Réinitialiser le niveau si la nouvelle filière n'a pas ce niveau
                    if (value && selectedNiveau) {
                      const isValid = combinaisons.some(
                        c => c.filiere_id === value && c.niveau === selectedNiveau
                      );
                      if (!isValid) setSelectedNiveau('');
                    }
                  }}
                  disabled={isLoadingFilters || filieresValides.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Toutes les filières" />
                  </SelectTrigger>
                  <SelectContent>
                    {filieresValides.map((filiere) => (
                      <SelectItem key={filiere.id} value={String(filiere.id)}>
                        {filiere.nom} ({filiere.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Niveau {niveauxValides.length === 0 && selectedFiliere && '(aucun disponible)'}
                </label>
                <Select 
                  value={selectedNiveau} 
                  onValueChange={(value) => {
                    setSelectedNiveau(value);
                    // Réinitialiser la filière si le nouveau niveau n'a pas cette filière
                    if (value && selectedFiliere) {
                      const isValid = combinaisons.some(
                        c => c.filiere_id === selectedFiliere && c.niveau === value
                      );
                      if (!isValid) setSelectedFiliere('');
                    }
                  }}
                  disabled={isLoadingFilters || niveauxValides.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tous les niveaux" />
                  </SelectTrigger>
                  <SelectContent>
                    {niveauxValides.map((niveau) => (
                      <SelectItem key={niveau.code} value={niveau.code}>
                        {niveau.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFiliere && selectedNiveau && !combinaisonValide && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p>Cette combinaison n'existe pas ou n'a pas de données</p>
                </div>
              )}
            </>
          ) : null}
        </div>

        <div className="flex gap-3 justify-end">
          <AlertDialogCancel disabled={isLoading || isLoadingFilters}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDownload}
            disabled={
              isLoading || 
              isLoadingFilters || 
              (!hasData) ||
              (selectedFiliere && selectedNiveau && !combinaisonValide)
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                Télécharger
              </>
            )}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
