<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Examenpreferences extends Model
{
    use SoftDeletes;
    protected $guarded = [];
    use HasFactory;
    public function examen_category()
    {
        return $this->belongsTo(Examen::class, 'Examen_category_id');
    }
    public function favoriteLists()
    {
        return $this->morphToMany(FavoriteList::class, 'testable', 'favorite_list_items');
    }
}
