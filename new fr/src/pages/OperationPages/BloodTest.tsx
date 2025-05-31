import {
  Paper,
  Box,
  Typography,
  FormControl,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  FormControlLabel,
  Switch,
  Autocomplete,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  CACHE_KEY_getFavoriteBloodTests,
  CACHE_KEY_OperationBloodTest,
} from "../../constants";
import addGlobal from "../../hooks/addGlobal";
import {
  bloodTestApiClient,
  BloodTestProps,
  editBloodTestOperation,
} from "../../services/BloodTest";
import { useLocation, useNavigate } from "react-router";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import LoadingSpinner from "../../components/LoadingSpinner";
import usePrint from "../PrintGlobal";
import { CliniquerensignementProps } from "../OperationPagesUpdated/Cliniquerensignement";
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";
import getGlobalById from "../../hooks/getGlobalById";
import {
  deletebloodtestApiClient,
  fetchBloodTestOperation,
} from "../../services/XrayService";
import CheckAction from "../../components/CheckAction";
import deleteItem from "../../hooks/deleteItem";
import { useQueryClient } from "@tanstack/react-query";
import { useSnackbarStore } from "../../zustand/useSnackbarStore";
import BloodTestSearchAutocomplete from "../../components/BloodTestSearchAutocomplete";
import getGlobal from "../../hooks/getGlobal";
import {
  favoriteBloodTests,
  FavoriteListResponse,
  getFavoriteBloodTestsApiClient,
} from "../../services/FavoriteExams";

interface Props {
  blood_test: string[];
}
interface BloodTestItem {
  code: string;
  title: string;
  price?: number;
  delai?: string | null;
}
const BloodTest: React.FC<CliniquerensignementProps> = ({ onNext, onBack }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [show, setShow] = useState(false);
  const [analyse, setAnalyse] = useState<any>(NaN);
  const [fields, setFields] = useState<BloodTestItem[]>([]);
  const [favorite, setFavorite] = useState("");
  const queryParams = new URLSearchParams(location.search);
  const patient_id = queryParams.get("id");
  const operationId = queryParams.get("operation_id");
  const [row, setRow] = useState<any>();
  const { handleSubmit } = useForm<Props>();
  const { print, Printable } = usePrint();
  const queryClient = useQueryClient();
  const { showSnackbar } = useSnackbarStore();
  const addMutation = addGlobal({} as BloodTestProps, bloodTestApiClient);
  const updateMutation = addGlobal(
    {} as BloodTestProps,
    editBloodTestOperation
  );
  const { data: bloodTests, isLoading: isLoading2 } = getGlobal(
    {} as FavoriteListResponse,
    CACHE_KEY_getFavoriteBloodTests,
    getFavoriteBloodTestsApiClient,
    undefined
  );
  const { data: BloodTestHistory, isLoading } = operationId
    ? getGlobalById(
        {} as any,
        CACHE_KEY_OperationBloodTest,
        fetchBloodTestOperation,
        { refetchOnWindowFocus: false },
        parseInt(operationId!)
      )
    : { data: [], isLoading: false };
  if (!patient_id) {
    return (
      <Typography variant="h6" color="error" align="center">
        Quelque chose s'est mal passé, veuillez refaire les étapes, si cela ne
        fonctionne pas, signalez ce bug au développeur.
      </Typography>
    );
  }

  const handleAddRow = () => {
    if (Number.isNaN(analyse)) return;
    setFields((old) => [...old, analyse]);
    setAnalyse(NaN);
  };

  const handleRemoveRow = (index: any) => {
    setFields((old) => old.filter((_current, _index) => _index !== index));
  };
  const handleAddFavorite = () => {
    if (!favorite) return;
    const dt = bloodTests.find((e) => e.title === favorite);
    console.log(dt, "dt");

    dt?.blood_tests.forEach((e) => {
      setFields((old) => [
        ...old,
        {
          code: e.code ?? "",
          title: e.title ?? "",
          price: e.price ?? undefined,
          delai: e.delai ?? null,
        },
      ]);
    });
    setFavorite("");
  };
  const onSubmit = async () => {
    const formatedData: any = {
      patient_id: patient_id,
      operation_id: operationId ? parseInt(operationId) : null,
      blood_test: fields,
    };

    try {
      if (create) {
        if (!fields.length) {
          showSnackbar("Veuillez choisir une analyse", "error");
          return;
        }
        addMutation.mutateAsync(formatedData, {
          onSuccess: (data: any) => {
            queryClient.invalidateQueries(CACHE_KEY_OperationBloodTest);

            setRow(data.data);
          },
          onError: (error) => {
            console.log(error);
          },
        });
      } else {
        if (!fields.length) {
          await deleteItem(parseInt(operationId!), deletebloodtestApiClient);
          queryClient.invalidateQueries(CACHE_KEY_OperationBloodTest);
          onNext();
          return;
        }

        updateMutation.mutateAsync(formatedData, {
          onSuccess: (data: any) => {
            queryClient.invalidateQueries(CACHE_KEY_OperationBloodTest);

            setRow(data.data);
          },
          onError: (error) => {
            console.log(error);
          },
        });
      }
    } catch (error) {}
  };

  useEffect(() => {
    if (!row) return;
    print(() => {
      onNext();
    });
  }, [row]);

  const create = CheckAction(() => {
    setFields(
      BloodTestHistory.map((bloodTest: any) => ({
        delai: bloodTest.delai ?? "",
        code: bloodTest.code ?? "",
        price: bloodTest.price ?? "",
        title: bloodTest.title ?? "",
      }))
    );
  }, BloodTestHistory);

  if (isLoading || isLoading2) return <LoadingSpinner />;
  return (
    <Paper className="!p-6 w-full flex flex-col gap-4">
      <Box
        component="form"
        noValidate
        autoComplete="off"
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-6 flex-col relative"
      >
        <Tooltip title="Retour">
          <IconButton className="!absolute -top-1 left-0" onClick={onBack}>
            <KeyboardBackspaceOutlinedIcon
              color="primary"
              className="pointer-events-none"
              fill="currentColor"
            />
          </IconButton>
        </Tooltip>
        <Box className="flex justify-center">
          <Typography
            id="modal-modal-title"
            component="h2"
            className="text-center !text-2xl font-bold"
          >
            Sélection d'analyses
          </Typography>
        </Box>
        <Box className="flex gap-4 flex-col">
          <Box className="w-full flex flex-wrap items-center gap-4">
            {show ? (
              <>
                <FormControl className="flex-1">
                  <Autocomplete
                    className="w-full"
                    id="demo-autocomplete-favorite"
                    options={bloodTests.map((item) => item.title)}
                    value={favorite ? favorite : null}
                    onChange={(event, newValue) => {
                      if (newValue) {
                        setFavorite(newValue);
                      }
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Favorite"
                        variant="outlined"
                        placeholder="Choisissez un favorite"
                      />
                    )}
                    noOptionsText={
                      <div>
                        <div style={{ padding: "8px 16px" }}>
                          Aucune donnée disponible
                        </div>
                        <div
                          style={{
                            color: "blue",
                            cursor: "pointer",
                            padding: "8px 16px",
                          }}
                          onClick={() => navigate("/Settings/favoris")}
                        >
                          Ajouter des données
                        </div>
                      </div>
                    }
                  />
                </FormControl>
                <Button
                  className="!px-4 !py-2 !min-w-max !rounded-full"
                  variant="outlined"
                  onClick={handleAddFavorite}
                >
                  <AddIcon />
                </Button>
              </>
            ) : (
              <>
                <FormControl className="flex-1">
                  <BloodTestSearchAutocomplete
                    showExternalLabel={false}
                    setBloodTest={(value) => {
                      setAnalyse(value);
                    }}
                  />
                </FormControl>
                <Button
                  className="!px-4 !py-2 !min-w-max !rounded-full"
                  variant="outlined"
                  onClick={handleAddRow}
                >
                  <AddIcon />
                </Button>
              </>
            )}

            <FormControlLabel
              control={<Switch onChange={() => setShow(!show)} />}
              label={"Voir " + (show ? "examens" : "bilans")}
            />
          </Box>
        </Box>
        <Box className="w-full flex flex-col gap-2">
          <TableContainer
            component={Paper}
            elevation={0}
            className="border border-gray-300"
          >
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead className="bg-gray-200">
                <TableRow>
                  <TableCell width={100}>Code</TableCell>
                  <TableCell>Analyse</TableCell>
                  <TableCell width={200}>Prix</TableCell>
                  <TableCell width={200}>Délai</TableCell>
                  <TableCell width={60} align="center">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {fields.length ? (
                  fields.map((carry, index) => (
                    <TableRow key={index} className="border-t border-gray-300">
                      <TableCell>{carry.code}</TableCell>
                      <TableCell>{carry.title}</TableCell>
                      <TableCell>
                        {carry.price} {carry.price ? "MAD" : "n/a"}
                      </TableCell>
                      <TableCell>
                        {carry.delai === null || carry.delai === ""
                          ? "n/a"
                          : carry.delai}
                      </TableCell>

                      <TableCell>
                        <IconButton onClick={() => handleRemoveRow(index)}>
                          <DeleteOutlineIcon
                            color="error"
                            className="pointer-events-none"
                            fill="currentColor"
                          />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow className="border-t border-gray-300">
                    <TableCell
                      colSpan={5}
                      align="center"
                      className="!text-gray-600 p-4"
                    >
                      <p className="text-lg">
                        Désolé, aucun analyse pour le moment.
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
        <Box className="flex justify-between flex-row content-center">
          <Button
            className="w-full md:w-max !px-10 !py-3 rounded-lg "
            variant="outlined"
            onClick={() => {
              onNext();
            }}
          >
            <p className="text-sm ">Passer</p>
          </Button>
          <Button
            type="submit"
            variant="contained"
            className="w-full md:w-max !px-10 !py-3 rounded-lg !ms-auto"
          >
            Enregistrer
          </Button>
        </Box>
      </Box>
      <Printable
        name={row?.nom + " " + row?.prenom}
        items={fields as never[]}
        render={(item, index) => (
          <div key={index}>
            <h3 className="font-bold">
              {index + 1}- {item.title} {"  "} ({item.code})
            </h3>
          </div>
        )}
      />
    </Paper>
  );
};

export default BloodTest;
