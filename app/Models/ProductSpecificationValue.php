<?php

namespace App\Models;

use App\Traits\SanitizesUtf8;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductSpecificationValue extends Model
{
    use HasFactory, SanitizesUtf8;

    protected $fillable = ['product_id', 'specification_attribute_id', 'value'];

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function attribute()
    {
        return $this->belongsTo(SpecificationAttribute::class, 'specification_attribute_id');
    }
}
