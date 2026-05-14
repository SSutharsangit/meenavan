<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Faker\Factory as Faker;
use Illuminate\Support\Str;
use Carbon\Carbon;

class FakeDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create('en_US');
        
        // 1. Customers
        $customerIds = [];
        for ($i = 0; $i < 15; $i++) {
            $customerIds[] = DB::table('customers')->insertGetId([
                'name' => $faker->name,
                'phone' => '07' . $faker->numerify('########'),
                'email' => $faker->unique()->safeEmail,
                'default_address' => $faker->address,
                'landmark' => 'Near ' . $faker->company,
                'delivery_area_id' => $faker->numberBetween(1, 4),
                'total_orders' => $faker->numberBetween(1, 20),
                'total_spent' => $faker->randomFloat(2, 1000, 50000),
                'last_order_at' => Carbon::now()->subDays($faker->numberBetween(1, 30)),
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // 2. Categories
        $categories = [
            ['Fish', 'மீன்', '🐟', 'fish.jpg'],
            ['Shellfish', 'நண்டு / இறால்', '🦐', 'shellfish.jpg'],
            ['Cephalopod', 'கணவாய்', '🦑', 'cephalopod.jpg'],
            ['Dried Fish', 'கருவாடு', '🐠', 'dried.jpg'],
            ['Spices', 'மசாலா', '🌶️', 'spices.jpg'],
        ];

        $categoryIds = [];
        $order = 1;
        foreach ($categories as $cat) {
            $categoryIds[] = DB::table('categories')->insertGetId([
                'name_en' => $cat[0],
                'name_ta' => $cat[1],
                'slug' => Str::slug($cat[0]),
                'description' => $faker->sentence,
                'icon' => $cat[2],
                'image_url' => 'categories/' . $cat[3],
                'display_order' => $order++,
                'is_active' => true,
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // 3. Products
        $productNames = [
            'Yellow Fin Tuna', 'Seer Fish', 'Parrot Fish', 'Red Snapper', 
            'Tiger Prawns', 'White Prawns', 'Mud Crab', 'Cuttlefish',
            'Squid', 'Anchovy', 'Sardine', 'Mackerel'
        ];

        $productIds = [];
        foreach ($productNames as $name) {
            $price = $faker->numberBetween(800, 3500);
            $discount = $faker->randomElement([0, 0, 5, 10, 15]);
            
            $productIds[] = DB::table('products')->insertGetId([
                'category_id' => $faker->randomElement($categoryIds),
                'name_en' => $name,
                'name_ta' => $name . ' (Tamil)',
                'slug' => Str::slug($name),
                'description_en' => $faker->paragraph,
                'description_ta' => $faker->paragraph,
                'price_per_kg' => $price,
                'discount_percentage' => $discount,
                'sku' => 'SKU-' . strtoupper(Str::random(6)),
                'freshness_tag' => $faker->randomElement(['Caught Today', 'Fresh Arrival', null]),
                'primary_image' => 'products/' . Str::slug($name) . '.jpg',
                'is_available' => true,
                'stock_quantity' => $faker->randomFloat(2, 5, 100),
                'min_order_quantity' => 0.5,
                'max_order_quantity' => 10,
                'rating_average' => $faker->randomFloat(2, 3.5, 5),
                'rating_count' => $faker->numberBetween(0, 100),
                'is_featured' => $faker->boolean(20),
                'is_bestseller' => $faker->boolean(30),
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ]);
        }

        // 4. Stocks (History)
        foreach ($productIds as $pid) {
            for ($i = 0; $i < 3; $i++) {
                $type = $faker->randomElement(['in', 'out']);
                $qty = $faker->randomFloat(2, 1, 20);
                DB::table('stocks')->insert([
                    'product_id' => $pid,
                    'quantity_kg' => $qty,
                    'type' => $type,
                    'reason' => $type === 'in' ? 'New Catch' : 'Order Allocation',
                    'created_by' => 1,
                    'created_at' => Carbon::now()->subDays($faker->numberBetween(1, 10)),
                ]);
            }
        }

        // 5. Orders & Order Items
        $statuses = ['pending', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];
        $cuttingOptions = [1, 2, 3, 4, 5];

        for ($i = 0; $i < 20; $i++) {
            $customer = DB::table('customers')->where('id', $faker->randomElement($customerIds))->first();
            $area = DB::table('delivery_areas')->where('id', $customer->delivery_area_id)->first();
            
            $subtotal = 0;
            $orderId = DB::table('orders')->insertGetId([
                'order_number' => 'ORD-' . date('Ymd') . '-' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_phone' => $customer->phone,
                'delivery_address' => $customer->default_address,
                'delivery_area_id' => $area->id,
                'delivery_area_name' => $area->name_en,
                'subtotal' => 0, // Will update after items
                'delivery_charge' => 150,
                'total_amount' => 0, // Will update
                'status' => $faker->randomElement($statuses),
                'payment_method' => $faker->randomElement(['cod', 'online']),
                'created_at' => Carbon::now()->subDays($faker->numberBetween(0, 10)),
                'updated_at' => Carbon::now(),
            ]);

            // Add 1-3 items per order
            $numItems = $faker->numberBetween(1, 3);
            for ($j = 0; $j < $numItems; $j++) {
                $productId = $faker->randomElement($productIds);
                $product = DB::table('products')->where('id', $productId)->first();
                $weight = $faker->randomElement([0.5, 1, 1.5, 2]);
                $itemSubtotal = ($product->price_per_kg * (1 - $product->discount_percentage/100)) * $weight;
                
                DB::table('order_items')->insert([
                    'order_id' => $orderId,
                    'product_id' => $product->id,
                    'product_name_en' => $product->name_en,
                    'product_name_ta' => $product->name_ta,
                    'weight_kg' => $weight,
                    'cutting_option_id' => $faker->randomElement($cuttingOptions),
                    'unit_price' => $product->price_per_kg,
                    'discount_percentage' => $product->discount_percentage,
                    'subtotal' => $itemSubtotal,
                    'created_at' => Carbon::now(),
                ]);
                
                $subtotal += $itemSubtotal;
            }

            DB::table('orders')->where('id', $orderId)->update([
                'subtotal' => $subtotal,
                'total_amount' => $subtotal + 150,
            ]);
        }
    }
}
