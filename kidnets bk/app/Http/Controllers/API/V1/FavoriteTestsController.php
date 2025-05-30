<?php

namespace App\Http\Controllers\API\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\Favorite\FavoriteExamensList;
use App\Http\Resources\Favorite\FavoriteListResource;
use App\Models\FavoriteList;
use App\Models\FavoriteTest;
use App\Traits\HttpResponses;
use Illuminate\Http\Request;
use App\Traits\UserRoleCheck;
use Illuminate\Support\Facades\DB;

class FavoriteTestsController extends Controller
{

    use HttpResponses;
    use UserRoleCheck;
    public function insertFavoriteBloodTests(Request $request)
    {
        try {
            $doctorId = $this->checkUserRole();
            $title = $request->input('title');
            $ids = $request->input('ids');


            $favorite = FavoriteList::create([
                'doctor_id' => $doctorId,
                'title' => $title,
            ]);


            foreach ($ids as $id) {
                $alreadyAttached = $favorite->bloodTests()
                    ->wherePivot('testable_id', $id)
                    ->wherePivot('testable_type', \App\Models\BloodTestPreference::class)
                    ->exists();

                if (!$alreadyAttached) {
                    $favorite->bloodTests()->attach($id, [
                        'testable_type' => \App\Models\BloodTestPreference::class
                    ]);
                }
            }

            return $this->success(null, 'success', 200);
        } catch (\Throwable $th) {
            return $this->error($th->getMessage(), 'Something went wrong', 500);
        }
    }
    public function getFavoriteBloodTests()
    {
        try {
            $doctorId = $this->checkUserRole();

            $favorites = FavoriteList::with('bloodTests')
                ->where('doctor_id', $doctorId)
                ->whereHas('bloodTests')
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->success(FavoriteListResource::collection($favorites), 'Fetched successfully', 200);
        } catch (\Throwable $th) {
            return $this->error($th->getMessage(), 'Something went wrong', 500);
        }
    }
    public function destroyFavoriteBloodTests($id)
    {
        FavoriteList::where('id', $id)->delete();
        return response()->json(['message' => 'Deleted successfully'], 200);
    }

    /* examens */

    public function insertFavoriteExamens(Request $request)
    {
        try {
            $doctorId = $this->checkUserRole();
            $title = $request->input('title');
            $ids = $request->input('ids');

            if (!$title || !is_array($ids) || empty($ids)) {
                return $this->error('Titre ou liste d’examens invalide.', 'Invalid input', 422);
            }

            $favorite = FavoriteList::create([
                'doctor_id' => $doctorId,
                'title' => $title,
            ]);

            foreach ($ids as $id) {
                $alreadyAttached = $favorite->examens()
                    ->wherePivot('testable_id', $id)
                    ->wherePivot('testable_type', \App\Models\Examenpreferences::class)
                    ->exists();

                if (!$alreadyAttached) {
                    $favorite->examens()->attach($id, [
                        'testable_type' => \App\Models\Examenpreferences::class,
                    ]);
                }
            }

            return $this->success(null, 'Liste d’examens ajoutée avec succès.', 200);
        } catch (\Throwable $th) {
            return $this->error($th->getMessage(), 'Erreur lors de l’ajout.', 500);
        }
    }
    public function getFavoriteexams()
    {
        try {
            $doctorId = $this->checkUserRole();

            $favorites = FavoriteList::with('examens')
                ->where('doctor_id', $doctorId)
                ->whereHas('examens')
                ->orderBy('created_at', 'desc')
                ->get();

            return $this->success(FavoriteExamensList::collection($favorites), 'Fetched successfully', 200);
        } catch (\Throwable $th) {
            return $this->error($th->getMessage(), 'Something went wrong', 500);
        }
    }
    public function destroyFavoriteExamens($id)
    {
        FavoriteList::where('id', $id)->delete();
        return response()->json(['message' => 'Deleted successfully'], 200);
    }
    /* examens */


    /* ordonances */

    public function insertFavoriteOrdonnances(Request $request)
    {
        try {
            $doctorId = $this->checkUserRole();
            $title = $request->input('title');
            $examens = $request->input('examens'); // this is your JSON array

            if (!$title || !is_array($examens) || empty($examens)) {
                return $this->error('Titre ou liste de médicaments invalide.', 'Invalid input', 422);
            }

            $favorite = FavoriteList::create([
                'doctor_id' => $doctorId,
                'title' => $title,
            ]);

            $data = json_encode($examens);
            DB::table('favorite_list_items')->insert([
                'favorite_list_id' => $favorite->id,
                'testable_type' => 'ORDONNANCE',
                'testable_id' => null,
                'custom_data' => json_encode($examens),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            return $this->success(null, 'Liste d’ordonnances ajoutée avec succès.', 200);
        } catch (\Throwable $th) {
            return $this->error($th->getMessage(), 'Erreur lors de l’ajout.', 500);
        }
    }
    public function getFavoriteOrdonnances()
    {
        try {
            $doctorId = $this->checkUserRole();

            // Manually join favorite_lists and favorite_list_items to get only ORDONNANCE entries
            $rawItems = DB::table('favorite_lists')
                ->join('favorite_list_items', 'favorite_lists.id', '=', 'favorite_list_items.favorite_list_id')
                ->where('favorite_lists.doctor_id', $doctorId)
                ->where('favorite_list_items.testable_type', 'ORDONNANCE')
                ->select('favorite_lists.id as list_id', 'favorite_lists.title', 'favorite_list_items.custom_data')
                ->orderBy('favorite_lists.created_at', 'desc')
                ->get();

            // Group them by favorite_list_id
            $grouped = [];

            foreach ($rawItems as $item) {
                $listId = $item->list_id;

                if (!isset($grouped[$listId])) {
                    $grouped[$listId] = [
                        'id' => $listId,
                        'title' => $item->title,
                        'medicines' => []
                    ];
                }

                $decoded = json_decode($item->custom_data, true);
                if (is_array($decoded)) {
                    $grouped[$listId]['medicines'] = array_merge($grouped[$listId]['medicines'], $decoded);
                }
            }

            return $this->success(array_values($grouped), 'Fetched successfully', 200);
        } catch (\Throwable $th) {
            return $this->error($th->getMessage(), 'Something went wrong', 500);
        }
    }
    public function destroyFavoriteMedicins($id)
    {
        FavoriteList::where('id', $id)->delete();
        return response()->json(['message' => 'Deleted successfully'], 200);
    }

    /* ordonances */
}
