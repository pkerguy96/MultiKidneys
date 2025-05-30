<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FavoriteList extends Model
{
    use HasFactory;
    protected $fillable = [
        'doctor_id',
        'title',
    ];
    public function bloodTests()
    {
        return $this->morphedByMany(BloodTestPreference::class, 'testable', 'favorite_list_items');
    }

    public function xrays()
    {
        return $this->morphedByMany(XrayPreference::class, 'testable', 'favorite_list_items');
    }

    public function examens()
    {
        return $this->morphedByMany(Examenpreferences::class, 'testable', 'favorite_list_items');
    }
}
