import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import type { Activite } from "@shared/types";
import { useBooking } from "@/contexts/BookingContext";
interface ActiviteFormProps {
    activite?: Activite;
    onSubmit: (data: any) => Promise<void>;
    loading: boolean;
    isEdit?: boolean;
}

const categories = [
    "Nature",
    "Aventure",
    "Culture",
    "Détente",
    "Observation",
    "Sport",
];

const locations = [
    "Andasibe",
    "Mantadia",
    "Nosy Be",
    "Sainte-Marie",
    "Isalo",
    "Tsingy",
    "Morondava",
    "Diego Suarez",
];

const difficulties = ["facile", "modéré", "difficile"];

const seasons = ["Été", "Hiver", "Saison sèche", "Saison des pluies"];

const ActiviteForm: React.FC<ActiviteFormProps> = ({
    activite,
    onSubmit,
    loading,
    isEdit = false,
}) => {
    const { state } = useBooking();
    const [formData, setFormData] = useState({
        name: activite?.name || "",
        category: activite?.category || categories[0],
        location: activite?.location || locations[0],
        duration: activite?.duration || "",
        difficulty: activite?.difficulty || "facile",
        priceAdult: activite?.priceAdult || 50000,
        priceChild: activite?.priceChild || 1000,
        groupSizeMin: activite?.groupSizeMin || 1,
        groupSizeMax: activite?.groupSizeMax,
        description: activite?.description || "",
        includes: activite?.includes || [],
        requirements: activite?.requirements || [],
        guideRequired: activite?.guideRequired || false,
        guideName: activite?.guideName || "",
        guidePhone: activite?.guidePhone || "",
        rating: activite?.rating || 5,
        reviews: activite?.reviews || 0,
        seasons: activite?.seasons || [],
        favorite: activite?.favorite || false,
        popularity: activite?.popularity || 0,
        startDate: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const handleArrayChange = (
        field: "includes" | "requirements" | "seasons",
        value: string,
    ) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value ? value.split(",").map((item) => item.trim()) : [],
        }));
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>
                    {isEdit ? "Modifier l'activité" : "Nouvelle activité"}
                </DialogTitle>
                <DialogDescription>
                    {isEdit
                        ? "Modifiez les informations de l'activité"
                        : "Créez une nouvelle activité avec ses détails"}
                </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700">date d'activité</label>
                        <Input
                            type="date"
                            value={formData.startDate}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                            }
                            min={state.client?.dateTravel?.toString()}
                            max={state.client?.dateReturn?.toString()}
                            className="mt-1 block w-65"
                            />
                    </div>

                </div>

                <div className="grid grid-cols-2 gap-4">

                    <div className="space-y-2">
                        <Label htmlFor="name">Nom de l'activité</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, name: e.target.value }))
                            }
                            placeholder="Observation des lémuriens"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="type">Catégorie</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, type: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                        {category}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="location">Localisation</Label>
                        <Select
                            value={formData.location}
                            onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, location: value }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {locations.map((location) => (
                                    <SelectItem key={location} value={location}>
                                        {location}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="duration">Durée</Label>
                        <Input
                            id="duration"
                            value={formData.duration}
                            onChange={(e) =>
                                setFormData((prev) => ({ ...prev, duration: e.target.value }))
                            }
                            placeholder="3h"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="difficulty">Difficulté</Label>
                        <Select
                            value={formData.difficulty}
                            onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, difficulty: value as any }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {difficulties.map((difficulty) => (
                                    <SelectItem key={difficulty} value={difficulty}>
                                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priceAdult">Prix adulte (Ar)</Label>
                        <Input
                            id="priceAdult"
                            type="number"
                            value={formData.priceAdult}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    priceAdult: parseInt(e.target.value) || 0,
                                }))
                            }
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="priceChild">Prix enfant (Ar)</Label>
                        <Input
                            id="priceChild"
                            type="number"
                            value={formData.priceChild}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    priceChild: parseInt(e.target.value) || 0,
                                }))
                            }
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="groupSizeMin">Taille groupe min</Label>
                        <Input
                            id="groupSizeMin"
                            type="number"
                            min="1"
                            value={formData.groupSizeMin}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    groupSizeMin: parseInt(e.target.value),

                                }))
                            }
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="groupSizeMax">Taille groupe max</Label>
                        <Input
                            id="groupSizeMax"
                            type="number"
                            min="1"
                            value={formData.groupSizeMax}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    groupSizeMax: parseInt(e.target.value),

                                }))
                            }
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                            setFormData((prev) => ({ ...prev, description: e.target.value }))
                        }
                        placeholder="Une expérience unique pour observer les lémuriens dans leur habitat naturel..."
                        rows={3}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="includes">Inclus (séparé par des virgules)</Label>
                    <Textarea
                        id="includes"
                        value={formData.includes.join(", ")}
                        onChange={(e) => handleArrayChange("includes", e.target.value)}
                        placeholder="Guide expert, Transport, Équipement d'observation"
                        rows={2}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="requirements">Prérequis (séparé par des virgules)</Label>
                    <Textarea
                        id="requirements"
                        value={formData.requirements.join(", ")}
                        onChange={(e) => handleArrayChange("requirements", e.target.value)}
                        placeholder="Bonne condition physique, Chaussures de marche"
                        rows={2}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="seasons">Saisons recommandées (séparé par des virgules)</Label>
                    <Textarea
                        id="seasons"
                        value={formData.seasons.join(", ")}
                        onChange={(e) => handleArrayChange("seasons", e.target.value)}
                        placeholder="Saison sèche, Été"
                        rows={1}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="guideRequired"
                            checked={formData.guideRequired}
                            onCheckedChange={(checked) =>
                                setFormData((prev) => ({ ...prev, guideRequired: !!checked }))
                            }
                        />
                        <Label htmlFor="guideRequired">Guide requis</Label>
                    </div>

                    {formData.guideRequired && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="guideName">Nom du guide</Label>
                                <Input
                                    id="guideName"
                                    value={formData.guideName}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, guideName: e.target.value }))
                                    }
                                    placeholder="Rakoto Andry"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guidePhone">Téléphone du guide</Label>
                                <Input
                                    id="guidePhone"
                                    value={formData.guidePhone}
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, guidePhone: e.target.value }))
                                    }
                                    placeholder="+261 34 12 345 67"
                                />
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="rating">Note (1-5)</Label>
                        <Select
                            value={formData.rating.toString()}
                            onValueChange={(value) =>
                                setFormData((prev) => ({ ...prev, rating: parseInt(value) }))
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[1, 2, 3, 4, 5].map((rating) => (
                                    <SelectItem key={rating} value={rating.toString()}>
                                        {rating} étoile{rating > 1 ? "s" : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="reviews">Nombre d'avis</Label>
                        <Input
                            id="reviews"
                            type="number"
                            value={formData.reviews}
                            onChange={(e) =>
                                setFormData((prev) => ({
                                    ...prev,
                                    reviews: parseInt(e.target.value) || 0,
                                }))
                            }
                        />
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="favorite"
                        checked={formData.favorite}
                        onCheckedChange={(checked) =>
                            setFormData((prev) => ({ ...prev, favorite: !!checked }))
                        }
                    />
                    <Label htmlFor="favorite">Activité favorite</Label>
                </div>

                <DialogFooter>
                    <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "En cours..." : isEdit ? "Modifier" : "Créer"}
                    </Button>
                </DialogFooter>
            </form>
        </>
    );
};

export default ActiviteForm;
