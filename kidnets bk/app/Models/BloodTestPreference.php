<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class BloodTestPreference extends Model
{
    use SoftDeletes;

    protected $guarded = [];
    use HasFactory;
    public function favoriteLists()
    {
        return $this->morphToMany(FavoriteList::class, 'testable', 'favorite_list_items');
    }
}
