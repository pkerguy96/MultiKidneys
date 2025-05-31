<?php

namespace App\Http\Resources\Favorite;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class FavoriteParaclinique extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'Examens_test' => $this->xrays->map(fn($test) => [
                'title' => $test->xray_type,
                'id' => $test->id,
                'type' => $test->xray_category->name
            ]),
        ];
    }
}
