<?php

namespace App\Models;

use App\Traits\SanitizesUtf8;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class Category extends Model
{
    use HasFactory, SanitizesUtf8;

    protected $fillable = [
        'name',
        'slug',
        'page_title',
        'subtitle',
        'seo_title',
        'meta_description',
        'meta_keywords',
        'seo_intro',
        'sidebar_visible',
        'default_sort',
        'filter_config',
        'icon',
        'parent_id',
        'is_featured',
        'is_nav_visible',
        'sort_order',
        'image',
        'mega_menu_enabled',
        'mega_menu_type',
        'mega_menu_layout',
        'mega_menu_config',
    ];

    protected $casts = [
        'is_featured' => 'boolean',
        'is_nav_visible' => 'boolean',
        'sidebar_visible' => 'boolean',
        'mega_menu_enabled' => 'boolean',
        'mega_menu_config' => 'array',
        'filter_config' => 'array',
        'sort_order' => 'integer',
    ];

    protected static function booted()
    {
        static::saved(function () {
            Cache::forget('navigation.categories');
        });

        static::deleted(function () {
            Cache::forget('navigation.categories');
        });
    }

    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')->orderBy('sort_order');
    }

    public function subcategories()
    {
        return $this->children()->with('children');
    }

    public function products()
    {
        return $this->hasMany(Product::class);
    }

    public function contentSections()
    {
        return $this->hasMany(CategoryContentSection::class)->orderBy('sort_order');
    }

    public function faqs()
    {
        return $this->hasMany(CategoryFaq::class)->orderBy('sort_order');
    }

    public function priceTables()
    {
        return $this->hasMany(CategoryPriceTable::class)->orderBy('sort_order');
    }

    public function specificationAttributes()
    {
        return $this->belongsToMany(SpecificationAttribute::class, 'category_specification_attributes')
            ->withPivot('is_filterable');
    }

    /**
     * Recursively collect all subcategory IDs including this category ID
     */
    public function getAllChildrenIds(): array
    {
        $ids = [$this->id];
        foreach ($this->children as $child) {
            $ids = array_merge($ids, $child->getAllChildrenIds());
        }
        return array_unique($ids);
    }
}
