<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SpecificationAttribute extends Model
{
    use HasFactory;

    protected $fillable = ['specification_group_id', 'name', 'unit', 'sort_order'];

    public function group()
    {
        return $this->belongsTo(SpecificationGroup::class, 'specification_group_id');
    }

    public function categories()
    {
        return $this->belongsToMany(Category::class, 'category_specification_attributes');
    }
}
