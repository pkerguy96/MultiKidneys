import { Box, Button, IconButton, Tooltip } from "@mui/material";
import React, { useState } from "react";
import BloodtypeOutlinedIcon from "@mui/icons-material/BloodtypeOutlined";
import BloodTestFavorite from "./favoriteListComponents/BloodTestFavorite";
import ExamensFavorite from "./favoriteListComponents/ExamensFavorite";
import OrdonanceFavorite from "./favoriteListComponents/OrdonanceFavorite";
import ParacliniqueFavorite from "./favoriteListComponents/ParacliniqueFavorite";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import LocalHospitalOutlinedIcon from "@mui/icons-material/LocalHospitalOutlined";
import PhotoCameraBackOutlinedIcon from "@mui/icons-material/PhotoCameraBackOutlined";
import KeyboardBackspaceOutlinedIcon from "@mui/icons-material/KeyboardBackspaceOutlined";

type CategoryItem = {
  label: string;
  description: string;
  icon: JSX.Element;
  component: JSX.Element;
};

const categoryComponents: Record<string, CategoryItem> = {
  blood: {
    label: "Analyse de sang",
    description: "Tests sanguins et biologiques",
    icon: <BloodtypeOutlinedIcon fontSize="medium" color="primary" />,
    component: <BloodTestFavorite />,
  },
  examens: {
    label: "Examens",
    description: "Examens cliniques généraux",
    icon: <PhotoCameraBackOutlinedIcon fontSize="medium" color="primary" />,
    component: <ExamensFavorite />,
  },
  ordonnance: {
    label: "Ordonnance",
    description: "Prescriptions médicales",
    icon: <AssignmentOutlinedIcon fontSize="medium" color="primary" />,
    component: <OrdonanceFavorite />,
  },
  paraclinique: {
    label: "Paraclinique",
    description: "Explorations et examens complémentaires",
    icon: <LocalHospitalOutlinedIcon fontSize="medium" color="primary" />,
    component: <ParacliniqueFavorite />,
  },
};
const FavoriteList = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  console.log(selectedCategory);

  return (
    <Box className="flex flex-col w-full h-full p-4 gap-4">
      {!selectedCategory && (
        <>
          <p className="font-light text-gray-600 text-md md:text-xl text-center">
            Sélectionner une catégorie
          </p>

          <Box className=" grid grid-cols-1 sm:grid-cols-2 w-full gap-6 flex-wrap hover:cursor-pointer ">
            {Object.entries(categoryComponents).map(
              ([key, category], index) => {
                return (
                  <Box
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className="flex items-center  border gap-2 p-4 rounded-lg shadow-md transition-transform duration-300 hover:scale-[1.03] hover:shadow-lg hover:border-blue-500"
                  >
                    <Box className="flex items-center justify-center w-6 h-6 mt-1">
                      {category.icon}
                    </Box>
                    <Box className="flex flex-col w-full ">
                      <p className="font-medium text-black ">
                        {" "}
                        {category.label}
                      </p>
                      <p className="font-normal text-gray-600 ">
                        {category.description}
                      </p>
                    </Box>
                  </Box>
                );
              }
            )}
          </Box>
        </>
      )}
      {/* IF A CATEGORY IS SELECTED: show its component */}
      {selectedCategory && (
        <>
          <Tooltip title="Retour">
            <IconButton
              className="w-10 h-10"
              onClick={() => setSelectedCategory(null)}
            >
              <KeyboardBackspaceOutlinedIcon
                color="primary"
                className="pointer-events-none"
                fill="currentColor"
              />
            </IconButton>
          </Tooltip>
          <Box className="-mt-8">
            {categoryComponents[selectedCategory].component}
          </Box>
        </>
      )}
    </Box>
  );
};

export default FavoriteList;
