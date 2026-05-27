<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $guarded = [];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function groups()
    {
        return $this->belongsToMany(ProductGroup::class)
            ->withPivot('sort_order')
            ->withTimestamps();
    }
}
