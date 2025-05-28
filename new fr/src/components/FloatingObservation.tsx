import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import RichTextEditor from "./RichTextEditor";
import NoteAltOutlinedIcon from "@mui/icons-material/NoteAltOutlined";
import getGlobalById from "../hooks/getGlobalById";
import CheckAction from "./CheckAction";
import LoadingSpinner from "./LoadingSpinner";
import updateItem from "../hooks/updateItem";
import { useQueryClient } from "@tanstack/react-query";
import {
  noteoperationApiClient,
  operationNoteApiClient,
} from "../services/OperationService";
import { editnoteApiclient } from "../services/XrayService";
import { CACHE_KEY_Opnote } from "../constants";
import Tooltip from "@mui/material/Tooltip";

const FloatingObservation = () => {
  const [content, setContent] = useState("");
  const [action, setAction] = useState({
    show: false,
    class: "pointer-events-none",
  });

  const queryParams = useMemo(() => new URLSearchParams(location.search), []);
  const patient_id = queryParams.get("id");
  const operation_id = queryParams.get("operation_id");
  const queryClient = useQueryClient();

  const debounceDelay = 2000;
  const saveTimeoutRef = useRef(null);

  const { data, isLoading } = patient_id
    ? getGlobalById(
        {} as any,
        [CACHE_KEY_Opnote, patient_id],
        operationNoteApiClient,
        undefined,
        parseInt(operation_id!)
      )
    : { data: {}, isLoading: false };

  const addMutation = updateItem({}, noteoperationApiClient);
  const editMutation = updateItem({}, editnoteApiclient);

  const create = CheckAction(() => {
    setContent(data?.note || "");
  }, data);
  const onSubmit = useCallback(async () => {
    try {
      if (create) {
        await addMutation.mutateAsync(
          {
            data: { note: content, operation: operation_id },
            id: parseInt(patient_id),
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries([CACHE_KEY_Opnote, patient_id]);
              queryClient.invalidateQueries({
                queryKey: ["Waitinglist"],
                exact: false,
              });
            },
            onError: () => {
              console.log("errorrrr");
            },
          }
        );
      } else {
        await editMutation.mutateAsync(
          {
            data: {
              note: content,
              operation_id: operation_id,
            },
            id: parseInt(patient_id),
          },
          {
            onSuccess: () => {
              queryClient.invalidateQueries({
                queryKey: ["Waitinglist"],
                exact: false,
              });
            },
            onError: () => {
              console.log("errorrrr");
            },
          }
        );
      }
    } catch (error) {
      console.error(error);
    }
  }, [content, operation_id, patient_id, create]);
  const handleBlur = (e) => {
    setContent(e);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(onSubmit, debounceDelay);
  };

  // Handle keydown: Clear the debounce timer to prevent premature saving
  const handleKeyDown = () => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }
  };
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);
  if (isLoading) {
    return (
      <div className="fixed inset-0 w-full h-full z-50 flex items-end justify-end flex-col p-10 pointer-events-none">
        <Tooltip title="Chargement..." arrow>
          <span>
            <button
              className="w-10 h-10 flex items-center justify-center shadow-xl bg-gray-400 rounded-full animate-pulse"
              disabled
            >
              <NoteAltOutlinedIcon color="inherit" />
            </button>
          </span>
        </Tooltip>
      </div>
    );
  }

  return (
    <div
      className={`fixed inset-0 w-full h-full z-50 flex items-end justify-end flex-col p-10 ${action.class}`}
      onClick={() =>
        action.show && setAction({ show: false, class: "pointer-events-none" })
      }
    >
      {action.show && (
        <div
          className="shadow-xl w-5/12 mb-6 pointer-events-auto border border-gray-400"
          onClick={(e) => e.stopPropagation()}
        >
          <RichTextEditor value={content} onBlur={handleBlur} />
        </div>
      )}
      <Tooltip title="Ouvrir Renseignement clinique" arrow>
        <button
          onClick={() =>
            setAction((old) => ({
              show: !old.show,
              class: old.show ? "pointer-events-none" : "",
            }))
          }
          className="w-10 h-10 flex items-center text-white justify-center shadow-xl bg-[#4f9590] rounded-full pointer-events-auto"
        >
          <NoteAltOutlinedIcon color="inherit" />
        </button>
      </Tooltip>
    </div>
  );
};

export default FloatingObservation;
