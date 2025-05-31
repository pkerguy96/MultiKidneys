import { APIClient } from "./Http";
export const favoriteBloodTests = new APIClient<any>(
  "/insertFavoriteBloodTests"
);
export const favoriteExams = new APIClient<any>("/insertFavoriteExamens");
export const favoriteXrays = new APIClient<any>("/insertFavoriteXrays");
export const favoriteOrdonances = new APIClient<any>(
  "/insertFavoriteOrdonnances"
);

export interface BloodTest {
  title: string;
}

export interface FavoriteList {
  id: number;
  title: string;
  blood_tests: BloodTest[];
}

export interface FavoriteListResponse {
  status: string;
  message: string;
  data: FavoriteList[];
}

export const getFavoriteBloodTestsApiClient =
  new APIClient<FavoriteListResponse>("/getFavoriteBloodTests");
export const deleteFavoriteBloodTestsApiClient =
  new APIClient<FavoriteListResponse>("/destroyFavoriteBloodTests");

export interface FavoriteExam {
  id: number;
  title: string;
  Examens_test: {
    title: string;
  }[];
}
export interface FavoriteExamResponse {
  status: string;
  message: string;
  data: FavoriteExam[];
}
export const getFavoriteExamsApiClient = new APIClient<FavoriteListResponse>(
  "/getFavoriteexams"
);

export const deleteFavoriteExamenApiClient =
  new APIClient<FavoriteListResponse>("/destroyFavoriteExamens");
export const deleteFavoriteXrayApiClient =
  new APIClient<FavoriteListResponse>("/destroyFavoriteXrays");

type OrdonnanceItem = {
  name: string;
  type: string;
  price: string | null;
};

type OrdonnanceList = {
  id: number;
  title: string;
  medicines: OrdonnanceItem[];
};

type OrdonnanceApiResponse = {
  status: string;
  message: string;
  data: OrdonnanceList[];
};
export const getFavoriteMedicinsApiClient =
  new APIClient<OrdonnanceApiResponse>("/getFavoriteOrdonnances");
export const deleteFavoriteMedicinApiClient =
  new APIClient<FavoriteListResponse>("/destroyFavoriteMedicins");
