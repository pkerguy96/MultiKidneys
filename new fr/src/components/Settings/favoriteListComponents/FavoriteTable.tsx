import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import React from "react";

type Props<T> = {
  data: T[];
  getId: (row: T) => string | number;
  getTitle: (row: T) => React.ReactNode;
  getSubItems: (row: T) => React.ReactNode[];
  onDelete: (id: number | string) => void;
  titleColumnLabel?: string;
  subItemsColumnLabel?: string;
};

const ReusableTable = <T,>({
  data,
  getId,
  getTitle,
  getSubItems,
  onDelete,
  titleColumnLabel,
  subItemsColumnLabel,
}: Props<T>) => {
  return (
    <TableContainer className="w-full max-h-[400px] flex-wrap overflow-auto border border-gray-300">
      <Table aria-label="simple table">
        <TableHead>
          <TableRow className="bg-gray-300 !rounded-2xl sticky top-0 z-10">
            <TableCell>
              <strong>{titleColumnLabel || "Nom de la liste"}</strong>
            </TableCell>
            <TableCell>
              <strong>{subItemsColumnLabel || "La liste d’analyses"}</strong>
            </TableCell>
            <TableCell className="w-20" />
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => {
            const id = getId(row);
            return (
              <TableRow key={id}>
                <TableCell>{getTitle(row)}</TableCell>
                <TableCell>
                  {getSubItems(row).map((item, i) => (
                    <div key={i}>{item}</div>
                  ))}
                </TableCell>
                <TableCell className="w-20">
                  <Button
                    onClick={() => onDelete(id)}
                    className="w-max mx-auto"
                    variant="outlined"
                    color="error"
                    disabled={id === undefined}
                  >
                    <DeleteOutlineIcon />
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default ReusableTable;
