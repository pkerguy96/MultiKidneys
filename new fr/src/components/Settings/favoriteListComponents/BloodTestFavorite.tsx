import { Box, TextField, Button, Chip } from "@mui/material";
import { useRef, useState } from "react";
import BloodTestSearchAutocomplete from "../../BloodTestSearchAutocomplete";
import { useSnackbarStore } from "../../../zustand/useSnackbarStore";
import addGlobal from "../../../hooks/addGlobal";
import {
  deleteFavoriteBloodTestsApiClient,
  favoriteBloodTests,
  FavoriteListResponse,
  getFavoriteBloodTestsApiClient,
} from "../../../services/FavoriteExams";
import getGlobal from "../../../hooks/getGlobal";
import { CACHE_KEY_getFavoriteBloodTests } from "../../../constants";
import LoadingSpinner from "../../LoadingSpinner";
import deleteItem from "../../../hooks/deleteItem";
import ReusableTable from "./FavoriteTable";

type BloodTest = {
  title: string;
};

type FavoriteListRow = {
  id: number;
  title: string;
  blood_tests: BloodTest[];
};

const BloodTestFavorite = () => {
  const [analyses, setAnalyses] = useState<any>([]);
  const { showSnackbar } = useSnackbarStore();
  const titleRef = useRef<HTMLInputElement>(null);
  const addMutation = addGlobal({} as any, favoriteBloodTests);
  const { data, isLoading, refetch } = getGlobal(
    {} as FavoriteListResponse,
    CACHE_KEY_getFavoriteBloodTests,
    getFavoriteBloodTestsApiClient,
    undefined
  );

  const handleDelete = (idToDelete: string | number) => {
    setAnalyses((prev: any[]) =>
      prev.filter((analyze) => analyze.id !== idToDelete)
    );
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const title = titleRef.current?.value?.trim();

    if (!title) {
      return showSnackbar("Veuillez entrer un nom pour la liste.", "warning");
    }

    if (analyses.length === 0) {
      return showSnackbar("Veuillez ajouter au moins une analyse.", "warning");
    }

    const ids = analyses.map((analyse) => analyse.id);

    const data = { title, ids };

    try {
      await addMutation.mutateAsync(data);
      showSnackbar("Liste ajoutée avec succès.", "success");
      refetch();
      titleRef.current.value = "";
      setAnalyses([]);
    } catch (error) {
      showSnackbar("Erreur lors de l'ajout de la liste.", "error");
    }
  };
  const onDelete = async (key: number) => {
    const response = await deleteItem(key, deleteFavoriteBloodTestsApiClient);

    if (response) {
      refetch();
      showSnackbar("La suppression de la Radiographie a réussi", "success");
    } else {
      showSnackbar("La suppression de la Radiographie a échoué", "error");
    }
  };
  const getId = (row: FavoriteListRow) => row.id;

  const getTitle = (row: FavoriteListRow) => row.title;

  const getSubItems = (row: FavoriteListRow) =>
    row.blood_tests.map((test) => test.title);
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
        Créer une liste d’analyses
      </p>
      <p className=" text-start font-thin  text-sm md:text-lg">
        Entrez les informations des analyses.
      </p>
      <Box className=" flex flex-col md:flex-row gap-4 flex-wrap ">
        <Box className="w-full flex flex-col gap-2 md:flex-row md:flex-wrap items-center ">
          <label htmlFor="nom" className="w-full md:w-[160px]">
            Nom de la liste d’analyses:
          </label>

          <TextField
            id="title"
            inputRef={titleRef}
            label="Titre"
            className="w-full md:flex-1"
          />
        </Box>
        <Box className="w-full flex flex-col gap-2 md:flex-row md:flex-wrap items-center ">
          <label htmlFor="nom" className="w-full md:w-[160px]">
            Nom de l’analyse:
          </label>

          <BloodTestSearchAutocomplete
            showExternalLabel={false}
            setBloodTest={(value) => {
              if (value && typeof value === "object") {
                setAnalyses((prev: any[]) => {
                  const alreadyExists = prev.some(
                    (item) => item.id === value.id
                  );
                  if (alreadyExists) {
                    showSnackbar(
                      "Cette analyse est déjà ajoutée à la liste.",
                      "warning"
                    );
                    return prev;
                  }
                  return alreadyExists ? prev : [...prev, value];
                });
              }
            }}
          />
        </Box>
        <Box className="w-full flex flex-col gap-2 md:flex-row md:flex-wrap items-center ">
          {analyses.map((analyse, index) => (
            <Chip
              key={analyse.id || index}
              label={analyse.title}
              onDelete={() => handleDelete(analyse.id)}
            />
          ))}
        </Box>

        <Box className="flex ml-auto mt-4">
          <Button
            type="submit"
            variant="contained"
            className="w-full md:w-max !px-8 !py-2 rounded-lg "
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
      />
    </Box>
  );
};

export default BloodTestFavorite;
