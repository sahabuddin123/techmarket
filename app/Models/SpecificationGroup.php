<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpecificationGroup extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'sort_order'];

    public function attributes()
    {
        return $this->hasMany(SpecificationAttribute::class)->orderBy('sort_order', 'asc');
    }
}
