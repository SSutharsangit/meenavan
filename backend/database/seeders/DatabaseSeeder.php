<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Settings
        \DB::table('settings')->insert([
            ['key_name' => 'business_name', 'value' => 'Commerce Admin Demo', 'type' => 'string', 'group_name' => 'business', 'is_public' => true],
            ['key_name' => 'business_phone', 'value' => '0712341017', 'type' => 'string', 'group_name' => 'business', 'is_public' => true],
            ['key_name' => 'business_email', 'value' => 'info@example.com', 'type' => 'string', 'group_name' => 'business', 'is_public' => true],
            ['key_name' => 'whatsapp_number', 'value' => '94712341017', 'type' => 'string', 'group_name' => 'whatsapp', 'is_public' => true],
            ['key_name' => 'min_order_amount', 'value' => '500', 'type' => 'number', 'group_name' => 'order', 'is_public' => true],
            ['key_name' => 'free_delivery_above', 'value' => '2000', 'type' => 'number', 'group_name' => 'delivery', 'is_public' => true],
            ['key_name' => 'currency_symbol', 'value' => '$', 'type' => 'string', 'group_name' => 'business', 'is_public' => true],
        ]);

        // Cutting Options
        \DB::table('cutting_options')->insert([
            ['name_en' => 'Whole', 'name_ta' => 'முழுமையாக', 'code' => 'whole', 'display_order' => 1],
            ['name_en' => 'Curry Cut', 'name_ta' => 'குழம்பு வெட்டு', 'code' => 'curry_cut', 'display_order' => 2],
            ['name_en' => 'Fry Cut', 'name_ta' => 'பொரியல் வெட்டு', 'code' => 'fry_cut', 'display_order' => 3],
            ['name_en' => 'Cleaned', 'name_ta' => 'சுத்தம் செய்யப்பட்ட', 'code' => 'cleaned', 'display_order' => 4],
            ['name_en' => 'Skin Removed', 'name_ta' => 'தோல் நீக்கப்பட்ட', 'code' => 'skin_removed', 'display_order' => 5],
        ]);

        // Delivery Areas
        \DB::table('delivery_areas')->insert([
            ['id' => 1, 'name_en' => 'Jaffna Town', 'name_ta' => 'யாழ்ப்பாணம் நகரம்', 'delivery_time_min' => 20, 'delivery_time_max' => 40],
            ['id' => 2, 'name_en' => 'Nallur', 'name_ta' => 'நல்லூர்', 'delivery_time_min' => 25, 'delivery_time_max' => 45],
            ['id' => 3, 'name_en' => 'Chunnakam', 'name_ta' => 'சுன்னாகம்', 'delivery_time_min' => 30, 'delivery_time_max' => 50],
            ['id' => 4, 'name_en' => 'Kokuvil', 'name_ta' => 'கொக்குவில்', 'delivery_time_min' => 35, 'delivery_time_max' => 55],
        ]);

        // Delivery Charges
        \DB::table('delivery_charges')->insert([
            ['delivery_area_id' => 1, 'charge_amount' => 100, 'is_free_above_amount' => 2000],
            ['delivery_area_id' => 2, 'charge_amount' => 150, 'is_free_above_amount' => 2500],
            ['delivery_area_id' => 3, 'charge_amount' => 200, 'is_free_above_amount' => 3000],
            ['delivery_area_id' => 4, 'charge_amount' => 200, 'is_free_above_amount' => 3000],
        ]);

        // Super Admin
        \DB::table('users')->insert([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}
