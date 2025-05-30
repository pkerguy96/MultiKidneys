import { Box, TextField, Button, Chip, Autocomplete } from "@mui/material";
import { useRef, useState } from "react";
import { useSnackbarStore } from "../../../zustand/useSnackbarStore";
import addGlobal from "../../../hooks/addGlobal";
import {
  deleteFavoriteBloodTestsApiClient,
  deleteFavoriteExamenApiClient,
  favoriteBloodTests,
  favoriteExams,
  FavoriteListResponse,
  getFavoriteBloodTestsApiClient,
  getFavoriteExamsApiClient,
} from "../../../services/FavoriteExams";
import getGlobal from "../../../hooks/getGlobal";
import {
  CACHE_KEY_ExamenWithCategoryAndId,
  CACHE_KEY_getFavoriteBloodTests,
  CACHE_KEY_getFavoriteExams,
} from "../../../constants";
import LoadingSpinner from "../../LoadingSpinner";
import deleteItem from "../../../hooks/deleteItem";
import ReusableTable from "./FavoriteTable";
import { ExamenPreferencewithCategoriesAndIdsApiClient } from "../../../services/ExamenService";

type GroupedExamOption = {
  id: number;
  label: string;
  group: string;
};

type BloodTest = {
  title: string;
};

type FavoriteListRow = {
  id: number;
  title: string;
  blood_tests?: BloodTest[];
  Examens_test?: BloodTest[];
};

const ExamensFavorite = () => {
  const [selectedExam, setSelectedExam] = useState<GroupedExamOption | null>(
    null
  );
  const [examens, setExamens] = useState<GroupedExamOption[]>([]);
  const { showSnackbar } = useSnackbarStore();
  const titleRef = useRef<HTMLInputElement>(null);

  const addMutation = addGlobal({} as any, favoriteExams);

  const { data, isLoading, refetch } = getGlobal(
    {} as FavoriteListResponse,
    CACHE_KEY_getFavoriteExams,
    getFavoriteExamsApiClient,
    undefined
  );

  const { data: printables } = getGlobal(
    {},
    CACHE_KEY_ExamenWithCategoryAndId,
    ExamenPreferencewithCategoriesAndIdsApiClient,
    undefined
  );
  console.log(examens);

  const handleDelete = (idToDelete: number) => {
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

    const ids = examens.map((examen) => examen.id);

    try {
      await addMutation.mutateAsync({ title, ids });
      showSnackbar("Liste ajoutée avec succès.", "success");
      refetch();
      titleRef.current.value = "";
      setExamens([]);
    } catch {
      showSnackbar("Erreur lors de l'ajout de la liste.", "error");
    }
  };

  const onDelete = async (key: number) => {
    const response = await deleteItem(key, deleteFavoriteExamenApiClient);
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
    row.Examens_test.map((test) => test.title);

  const handleTableDelete = (id: number | string) => {
    onDelete(Number(id));
  };

  if (isLoading) return <LoadingSpinner />;

  const options: GroupedExamOption[] = Object.entries(printables || {}).flatMap(
    ([group, exams]: [string, { id: number; title: string }[]]) =>
      exams.map((exam) => ({
        id: exam.id,
        label: exam.title,
        group,
      }))
  );

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
          <Autocomplete
            className="w-full md:flex-1"
            id="autocomplete-examens"
            options={options}
            groupBy={(option) => option.group}
            getOptionLabel={(option) => option.label}
            value={selectedExam}
            onChange={(event, newValue) => {
              if (newValue) {
                const exists = examens.some((e) => e.id === newValue.id);
                if (exists) {
                  showSnackbar("Cet examen est déjà ajouté.", "warning");
                  return;
                }
                setExamens((prev) => [...prev, newValue]);
                setSelectedExam(null);
              }
            }}
            isOptionEqualToValue={(option, value) =>
              option.label === value.label
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Examen"
                variant="outlined"
                placeholder="Choisissez un examen"
              />
            )}
          />
        </Box>

        <Box className="w-full flex flex-wrap gap-2">
          {examens.map((examen) => (
            <Chip
              key={examen.id}
              label={examen.label}
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

export default ExamensFavorite;
