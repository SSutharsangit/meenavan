<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProductGroup extends Model
{
    protected $guarded = [];

    public function products()
    {
        return $this->belongsToMany(Product::class)
            ->withPivot('sort_order')
            ->withTimestamps()
            ->orderBy('product_group_product.sort_order');
    }
}
