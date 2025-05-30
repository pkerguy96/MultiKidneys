import { Box, TextField, Button, Chip } from "@mui/material";
import { useRef, useState } from "react";
import { useSnackbarStore } from "../../../zustand/useSnackbarStore";
import addGlobal from "../../../hooks/addGlobal";
import {
  deleteFavoriteExamenApiClient,
  deleteFavoriteMedicinApiClient,
  favoriteExams,
  FavoriteListResponse,
  favoriteOrdonances,
  getFavoriteExamsApiClient,
  getFavoriteMedicinsApiClient,
} from "../../../services/FavoriteExams";
import getGlobal from "../../../hooks/getGlobal";
import {
  CACHE_KEY_getFavoriteExams,
  CACHE_KEY_getFavoriteMedicins,
} from "../../../constants";
import LoadingSpinner from "../../LoadingSpinner";
import deleteItem from "../../../hooks/deleteItem";
import ReusableTable from "./FavoriteTable";

import { items } from "../../../services/Medicines.json";

type GroupedExamOption = {
  id: string;
  name: string;
  type?: string;
  price?: string;
};

type Medicines = {
  name: string;
  type: string;
  price: string;
};

type FavoriteListRow = {
  id: number;
  title: string;
  medicines?: Medicines[];
};

const OrdonanceFavorite = () => {
  const [selectedExamName, setSelectedExamName] = useState<string>("");
  const [examens, setExamens] = useState<GroupedExamOption[]>([]);
  const { showSnackbar } = useSnackbarStore();
  const titleRef = useRef<HTMLInputElement>(null);

  const addMutation = addGlobal({} as any, favoriteOrdonances);

  const { data, isLoading, refetch } = getGlobal(
    {} as FavoriteListResponse,
    CACHE_KEY_getFavoriteMedicins,
    getFavoriteMedicinsApiClient,
    undefined
  );

  console.log(examens);

  const handleDelete = (idToDelete: string) => {
    setExamens((prev) => prev.filter((examen) => examen.id !== idToDelete));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = titleRef.current?.value?.trim();

    if (!title) {
      return showSnackbar("Veuillez entrer un nom pour la liste.", "warning");
    }

    if (examens.length === 0) {
      return showSnackbar("Veuillez ajouter au moins un examen.", "warning");
    }

    const payload = {
      title,
      examens: examens.map(({ id, ...rest }) => rest),
    };

    try {
      await addMutation.mutateAsync(payload);
      showSnackbar("Liste ajoutée avec succès.", "success");
      refetch();
      titleRef.current.value = "";
      setExamens([]);
    } catch {
      showSnackbar("Erreur lors de l'ajout de la liste.", "error");
    }
  };

  const onDelete = async (key: number) => {
    const response = await deleteItem(key, deleteFavoriteMedicinApiClient);
    if (response) {
      refetch();
      showSnackbar("La suppression a réussi", "success");
    } else {
      showSnackbar("La suppression a échoué", "error");
    }
  };

  const getId = (row: FavoriteListRow) => row.id;
  const getTitle = (row: FavoriteListRow) => row.title;
  const getSubItems = (row: FavoriteListRow) =>
    row.medicines.map((test) => test.name);

  const handleTableDelete = (id: number | string) => {
    onDelete(Number(id));
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <Box
      className="flex flex-col w-full h-full p-4 gap-4"
      component="form"
      onSubmit={onSubmit}
    >
      <p className="font-light text-gray-600 text-md md:text-xl text-center">
        Créer une liste d’examens
      </p>
      <p className="text-start font-thin text-sm md:text-lg">
        Entrez les informations des examens à sauvegarder.
      </p>

      <Box className="flex flex-col md:flex-row gap-4 flex-wrap">
        <Box className="w-full flex flex-col gap-2 md:flex-row items-center">
          <label htmlFor="title" className="w-full md:w-[160px]">
            Nom de la liste d’examens:
          </label>
          <TextField
            id="title"
            inputRef={titleRef}
            label="Titre"
            className="w-full md:flex-1"
          />
        </Box>

        <Box className="w-full flex flex-col gap-2 md:flex-row items-center">
          <label htmlFor="exam" className="w-full md:w-[160px]">
            Nom de l’examen:
          </label>

          <TextField
            className="w-full md:flex-1"
            id="outlined-basic"
            label="Médicament"
            variant="outlined"
            value={selectedExamName}
            inputProps={{ list: "browsers" }}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedExamName(value);

              const trimmed = value.trim();
              const foundMedicine = items.find((item) => item.name === trimmed);

              if (foundMedicine) {
                const alreadyExists = examens.some(
                  (med) => med.name === trimmed
                );
                if (alreadyExists) {
                  showSnackbar("Ce médicament est déjà ajouté.", "warning");
                  return;
                }

                const uniqueId =
                  Date.now().toString() +
                  Math.random().toString(36).substring(2);
                const medicineWithId = { ...foundMedicine, id: uniqueId };

                setExamens((prev) => [...prev, medicineWithId]);
                setSelectedExamName("");
              }
            }}
          />
          <datalist id="browsers">
            {items.map((e, i) => (
              <option key={i} value={e.name} />
            ))}
          </datalist>
        </Box>

        <Box className="w-full flex flex-wrap gap-2">
          {examens.map((examen) => (
            <Chip
              key={examen.id}
              label={examen.name}
              onDelete={() => handleDelete(examen.id)}
            />
          ))}
        </Box>

        <Box className="flex ml-auto mt-4">
          <Button
            type="submit"
            variant="contained"
            className="w-full md:w-max !px-8 !py-2 rounded-lg"
          >
            Ajouter
          </Button>
        </Box>
      </Box>

      <ReusableTable<FavoriteListRow>
        data={data}
        getId={getId}
        getTitle={getTitle}
        getSubItems={getSubItems}
        onDelete={handleTableDelete}
        subItemsColumnLabel="La liste d’examens"
      />
    </Box>
  );
};

export default OrdonanceFavorite;
