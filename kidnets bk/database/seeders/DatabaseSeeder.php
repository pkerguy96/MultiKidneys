<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
          \App\Models\User::factory(1)->create();
        $this->call([
           // BloodTests::class,
            ExamenSeeder::class,
            XraySeeder::class,
            // BloodTestPreferenceSeeder::class 
        ]);
    }
}
