import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Search,
  Star,
  TreePine,
  Mountain,
  Waves,
  Camera,
  Compass,
  Clock,
  Users,
  Calendar,
  Heart,
} from "lucide-react";

interface Destination {
  id: string;
  name: string;
  region: string;
  type: "Nature" | "Culture" | "Plage" | "Aventure" | "Observation";
  description: string;
  highlights: string[];
  bestSeason: string;
  duration: string;
  difficulty: "Facile" | "Modéré" | "Difficile";
  rating: number;
  image?: string;
  activities: string[];
  popular: boolean;
}

const destinations: Destination[] = [
  {
    id: "1",
    name: "Parc National d'Andasibe-Mantadia",
    region: "Région Alaotra-Mangoro",
    type: "Nature",
    description:
      "Découvrez la forêt humide primaire et écoutez le chant mystique des lémuriens Indri-Indri, les plus grands lémuriens de Madagascar.",
    highlights: [
      "Lémuriens Indri-Indri",
      "Forêt primaire",
      "Chutes de Vakona",
      "Réserve de Vakona",
    ],
    bestSeason: "Avril - Décembre",
    duration: "2-3 jours",
    difficulty: "Facile",
    rating: 4.8,
    activities: ["Randonnée", "Observation de la faune", "Photographie"],
    popular: true,
  },
  {
    id: "2",
    name: "Tsingy de Bemaraha",
    region: "Région Melaky",
    type: "Aventure",
    description:
      "Explorez ces formations calcaires spectaculaires, véritables cathédrales de pierre où la nature a sculpté un labyrinthe unique au monde.",
    highlights: [
      "Formations calcaires",
      "Pont suspendu",
      "Grottes",
      "Faune endémique",
    ],
    bestSeason: "Avril - Novembre",
    duration: "3-4 jours",
    difficulty: "Difficile",
    rating: 4.9,
    activities: ["Escalade", "Via ferrata", "Spéléologie", "Randonnée"],
    popular: true,
  },
  {
    id: "3",
    name: "Nosy Be",
    region: "Province de Diego Suarez",
    type: "Plage",
    description:
      "L'île aux parfums vous accueille avec ses plages de sable blanc, ses plantations d'ylang-ylang et sa culture créole authentique.",
    highlights: [
      "Plages paradisiaques",
      "Réserve de Lokobe",
      "Distillerie d'ylang-ylang",
      "Marché de Hell-Ville",
    ],
    bestSeason: "Avril - Décembre",
    duration: "4-7 jours",
    difficulty: "Facile",
    rating: 4.6,
    activities: ["Farniente", "Plongée", "Snorkeling", "Visite culturelle"],
    popular: true,
  },
  {
    id: "4",
    name: "Allée des Baobabs",
    region: "Région Menabe",
    type: "Nature",
    description:
      "Admirez ces géants centenaires au coucher du soleil, dans l'un des paysages les plus emblématiques de Madagascar.",
    highlights: [
      "Baobabs centenaires",
      "Coucher de soleil",
      "Photographie",
      "Baobab amoureux",
    ],
    bestSeason: "Mars - Novembre",
    duration: "1 jour",
    difficulty: "Facile",
    rating: 4.7,
    activities: ["Photographie", "Observation", "Promenade"],
    popular: true,
  },
  {
    id: "5",
    name: "Parc National de l'Isalo",
    region: "Région Ihorombe",
    type: "Aventure",
    description:
      "Paysages lunaires, canyons profonds, oasis naturelles et piscines d'émeraude vous attendent dans ce parc spectaculaire.",
    highlights: [
      "Canyons",
      "Piscine naturelle",
      "Coucher de soleil",
      "Faune endémique",
    ],
    bestSeason: "Mars - Novembre",
    duration: "2-3 jours",
    difficulty: "Modéré",
    rating: 4.5,
    activities: ["Randonnée", "Baignade", "Observation", "Camping"],
    popular: false,
  },
  {
    id: "6",
    name: "Sainte-Marie (Nosy Boraha)",
    region: "Région Analanjirofo",
    type: "Plage",
    description:
      "Cette île paradisiaque est réputée pour l'observation des baleines à bosse et ses plages de rêve bordées de cocotiers.",
    highlights: [
      "Observation des baleines",
      "Île aux Nattes",
      "Cimetière des pirates",
      "Plages vierges",
    ],
    bestSeason: "Juillet - Septembre (baleines)",
    duration: "3-5 jours",
    difficulty: "Facile",
    rating: 4.4,
    activities: ["Observation baleines", "Plongée", "Détente", "Histoire"],
    popular: false,
  },
  {
    id: "7",
    name: "Diego Suarez (Antsiranana)",
    region: "Province de Diego Suarez",
    type: "Culture",
    description:
      "Ville historique au nord de Madagascar, porte d'entrée vers les Tsingy rouges et la Montagne d'Ambre.",
    highlights: [
      "Architecture coloniale",
      "Tsingy rouge",
      "Montagne d'Ambre",
      "Mer d'Émeraude",
    ],
    bestSeason: "Avril - Décembre",
    duration: "2-4 jours",
    difficulty: "Facile",
    rating: 4.2,
    activities: ["Visite culturelle", "Randonnée", "Observation", "Histoire"],
    popular: false,
  },
  {
    id: "8",
    name: "Morondava",
    region: "Région Menabe",
    type: "Nature",
    description:
      "Point de départ vers l'Allée des Baobabs et la Réserve de Kirindy, riche en faune nocturne endémique.",
    highlights: [
      "Réserve de Kirindy",
      "Faune nocturne",
      "Plage de Morondava",
      "Culture Sakalava",
    ],
    bestSeason: "Avril - Novembre",
    duration: "2-3 jours",
    difficulty: "Facile",
    rating: 4.3,
    activities: ["Safari nocturne", "Observation", "Culture", "Détente"],
    popular: false,
  },
];

const typeIcons = {
  Nature: TreePine,
  Culture: Compass,
  Plage: Waves,
  Aventure: Mountain,
  Observation: Camera,
};

const typeColors = {
  Nature: "bg-green-100 text-green-800",
  Culture: "bg-purple-100 text-purple-800",
  Plage: "bg-blue-100 text-blue-800",
  Aventure: "bg-orange-100 text-orange-800",
  Observation: "bg-yellow-100 text-yellow-800",
};

const difficultyColors = {
  Facile: "bg-green-100 text-green-800",
  Modéré: "bg-yellow-100 text-yellow-800",
  Difficile: "bg-red-100 text-red-800",
};

export default function Destinations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [showPopularOnly, setShowPopularOnly] = useState(false);

  const regions = [...new Set(destinations.map((d) => d.region))];
  const types = [...new Set(destinations.map((d) => d.type))];
  const difficulties = [...new Set(destinations.map((d) => d.difficulty))];

  const filteredDestinations = destinations.filter((destination) => {
    const matchesSearch =
      destination.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      destination.description
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      destination.region.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === "all" || destination.type === filterType;
    const matchesRegion =
      filterRegion === "all" || destination.region === filterRegion;
    const matchesDifficulty =
      filterDifficulty === "all" || destination.difficulty === filterDifficulty;
    const matchesPopular = !showPopularOnly || destination.popular;

    return (
      matchesSearch &&
      matchesType &&
      matchesRegion &&
      matchesDifficulty &&
      matchesPopular
    );
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-madagascar-900">
            🏝️ Destinations Madagascar
          </h1>
          <p className="text-muted-foreground">
            Découvrez les merveilles de la Grande Île
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className="text-madagascar-700 border-madagascar-200"
          >
            {filteredDestinations.length} destinations
          </Badge>
          <Badge className="bg-madagascar-100 text-madagascar-800">
            {destinations.filter((d) => d.popular).length} populaires
          </Badge>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5" />
            Recherche et Filtres
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher une destination..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRegion} onValueChange={setFilterRegion}>
              <SelectTrigger>
                <SelectValue placeholder="Région" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les régions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={filterDifficulty}
              onValueChange={setFilterDifficulty}
            >
              <SelectTrigger>
                <SelectValue placeholder="Difficulté" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes difficultés</SelectItem>
                {difficulties.map((difficulty) => (
                  <SelectItem key={difficulty} value={difficulty}>
                    {difficulty}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={showPopularOnly ? "default" : "outline"}
              onClick={() => setShowPopularOnly(!showPopularOnly)}
              className="w-full"
            >
              <Heart
                className={`w-4 h-4 mr-2 ${showPopularOnly ? "fill-current" : ""}`}
              />
              Populaires
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Destinations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredDestinations.map((destination) => {
          const TypeIcon = typeIcons[destination.type];

          return (
            <Card
              key={destination.id}
              className="border-0 shadow-md hover:shadow-lg transition-shadow bg-gradient-to-br from-white to-madagascar-50"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg text-madagascar-900 flex items-center gap-2">
                      <TypeIcon className="w-5 h-5" />
                      {destination.name}
                      {destination.popular && (
                        <Heart className="w-4 h-4 text-red-500 fill-current" />
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={typeColors[destination.type]}>
                        {destination.type}
                      </Badge>
                      <Badge
                        className={difficultyColors[destination.difficulty]}
                      >
                        {destination.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1">
                        {renderStars(destination.rating)}
                        <span className="text-xs text-muted-foreground ml-1">
                          ({destination.rating})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{destination.region}</span>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {destination.description}
                  </p>

                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-madagascar-600" />
                      <span>{destination.bestSeason}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-madagascar-600" />
                      <span>{destination.duration}</span>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Points forts :
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {destination.highlights
                        .slice(0, 3)
                        .map((highlight, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {highlight}
                          </Badge>
                        ))}
                      {destination.highlights.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{destination.highlights.length - 3} autres
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      Activités :
                    </h4>
                    <div className="flex flex-wrap gap-1">
                      {destination.activities.map((activity, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs border-madagascar-200 text-madagascar-700"
                        >
                          {activity}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Button className="w-full bg-madagascar-600 hover:bg-madagascar-700">
                    <Users className="w-4 h-4 mr-2" />
                    Planifier un voyage
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No Results */}
      {filteredDestinations.length === 0 && (
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-muted-foreground/50" />
          <h3 className="mt-2 text-sm font-medium text-foreground">
            Aucune destination trouvée
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez de modifier vos critères de recherche
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setFilterType("all");
              setFilterRegion("all");
              setFilterDifficulty("all");
              setShowPopularOnly(false);
            }}
            className="mt-3"
          >
            Réinitialiser les filtres
          </Button>
        </div>
      )}
    </div>
  );
}
